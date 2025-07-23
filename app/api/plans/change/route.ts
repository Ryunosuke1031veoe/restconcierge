
// app/api/plans/change/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json(
        { error: 'プランIDが必要です' },
        { status: 400 }
      )
    }

    // 新しいプランの存在確認
    const newPlan = await prisma.plan.findFirst({
      where: { 
        id: planId,
        isActive: true 
      }
    })

    if (!newPlan) {
      return NextResponse.json(
        { error: '指定されたプランが見つかりません' },
        { status: 404 }
      )
    }

    // ユーザー情報取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        planHistory: {
          where: { status: 'active' },
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

    const now = new Date()

    // トランザクションでプラン変更処理
    await prisma.$transaction(async (tx) => {
      // 現在のプランを終了
      if (user.planHistory.length > 0) {
        await tx.planHistory.update({
          where: { id: user.planHistory[0].id },
          data: { 
            endDate: now,
            status: 'cancelled'
          }
        })
      }

      // 新しいプランを開始
      await tx.planHistory.create({
        data: {
          userId: user.id,
          planId: newPlan.id,
          startDate: now,
          price: newPlan.price,
          status: 'active'
        }
      })

      // ユーザーの現在プラン情報を更新
      await tx.user.update({
        where: { id: user.id },
        data: {
          planId: newPlan.id,
          planStartDate: now,
          planEndDate: null, // 月額プランの場合
          monthlyConsultations: 0, // 相談回数リセット
          lastConsultationReset: now
        }
      })
    })

    return NextResponse.json({ 
      message: 'プランが正常に変更されました',
      plan: newPlan
    })

  } catch (error) {
    console.error('プラン変更エラー:', error)
    return NextResponse.json(
      { error: 'プランの変更に失敗しました' },
      { status: 500 }
    )
  }
}