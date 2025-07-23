// app/api/user/consultation/increment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        planHistory: {
          where: { status: 'active' },
          include: { plan: true },
          orderBy: { startDate: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    const currentPlan = user.planHistory[0]?.plan
    if (!currentPlan) {
      return NextResponse.json(
        { error: 'アクティブなプランが見つかりません' },
        { status: 404 }
      )
    }

    // 月初リセット処理
    const now = new Date()
    const lastReset = new Date(user.lastConsultationReset)
    const shouldReset = now.getMonth() !== lastReset.getMonth() || 
                       now.getFullYear() !== lastReset.getFullYear()

    let currentConsultations = user.monthlyConsultations
    if (shouldReset) {
      currentConsultations = 0
    }

    // 制限チェック
    if (currentConsultations >= currentPlan.consultationLimit) {
      return NextResponse.json(
        { error: '月間相談回数の制限に達しています' },
        { status: 403 }
      )
    }

    // 相談回数を増加
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        monthlyConsultations: currentConsultations + 1,
        lastConsultationReset: shouldReset ? now : user.lastConsultationReset
      }
    })

    return NextResponse.json({
      message: '相談回数が記録されました',
      monthlyConsultations: updatedUser.monthlyConsultations,
      limit: currentPlan.consultationLimit,
      remaining: currentPlan.consultationLimit - updatedUser.monthlyConsultations
    })

  } catch (error) {
    console.error('相談回数更新エラー:', error)
    return NextResponse.json(
      { error: '相談回数の更新に失敗しました' },
      { status: 500 }
    )
  }
}