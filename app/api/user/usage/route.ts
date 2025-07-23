// app/api/user/usage/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// プラン設定（スキーマのデフォルトに合わせて修正）
const PLAN_LIMITS = {
  free: 5,
  basic: 50,  // スキーマのデフォルト
  pro: 200
}

// 現在の月の開始日を取得
function getCurrentMonthStart(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        planId: true,
        monthlyConsultations: true,
        lastConsultationReset: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      )
    }

    // 現在の月の相談回数をチェック
    const currentMonthStart = getCurrentMonthStart()
    const needsReset = !user.lastConsultationReset || 
                      new Date(user.lastConsultationReset) < currentMonthStart

    let currentConsultations = user.monthlyConsultations || 0
    
    // 月が変わっている場合はリセット
    if (needsReset) {
      currentConsultations = 0
      
      // データベースをリセット
      await prisma.user.update({
        where: { id: user.id },
        data: {
          monthlyConsultations: 0,
          lastConsultationReset: currentMonthStart
        }
      })
    }

    // プラン制限を取得（スキーマのデフォルトに合わせる）
    const userPlan = user.planId || 'basic'  // デフォルトをbasicに変更
    const monthlyLimit = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.basic

    return NextResponse.json({
      success: true,
      data: {
        monthlyConsultations: currentConsultations,
        consultationLimit: monthlyLimit,
        remaining: monthlyLimit - currentConsultations,
        planId: userPlan,
        resetDate: currentMonthStart.toISOString()
      }
    })

  } catch (error) {
    console.error("使用量取得エラー:", error)
    return NextResponse.json(
      { error: "使用量の取得に失敗しました" },
      { status: 500 }
    )
  }
}