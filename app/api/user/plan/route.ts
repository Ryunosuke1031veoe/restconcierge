// app/api/user/plan/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST: プラン変更
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { planId } = body

    if (!planId || typeof planId !== 'string') {
      return NextResponse.json(
        { error: 'プランIDが必要です' },
        { status: 400 }
      )
    }

    // ユーザー取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        planId: true,
        planStartDate: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // 変更先のプランが存在するかチェック
    const targetPlan = await prisma.plan.findUnique({
      where: { name: planId },
      select: {
        id: true,
        name: true,
        displayName: true,
        price: true,
        consultationLimit: true,
        isActive: true
      }
    })

    // Plan テーブルに存在しない場合は、有効なプランIDかチェック
    const validPlanIds = ['free', 'basic', 'pro']
    if (!targetPlan && !validPlanIds.includes(planId)) {
      return NextResponse.json(
        { error: '無効なプランIDです' },
        { status: 400 }
      )
    }

    // 同じプランの場合はエラー
    if (user.planId === planId) {
      return NextResponse.json(
        { error: '既に同じプランを使用中です' },
        { status: 400 }
      )
    }

    const now = new Date()

    // トランザクション処理
    const result = await prisma.$transaction(async (tx) => {
      // 現在のプランの履歴を終了
      if (user.planId) {
        // PlanHistory テーブルに現在のプランの終了記録を追加
        const currentPlanRecord = await tx.plan.findUnique({
          where: { name: user.planId }
        })

        if (currentPlanRecord) {
          await tx.planHistory.updateMany({
            where: {
              userId: user.id,
              planId: currentPlanRecord.id,
              status: 'active'
            },
            data: {
              endDate: now,
              status: 'cancelled'
            }
          })
        }
      }

      // ユーザーのプランを更新
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          planId: planId,
          planStartDate: now,
          planEndDate: null, // 月額プランなので終了日はnull
          monthlyConsultations: 0, // プラン変更時に相談回数をリセット
          lastConsultationReset: now
        },
        select: {
          id: true,
          planId: true,
          planStartDate: true,
          monthlyConsultations: true
        }
      })

      // 新しいプランの履歴を作成
      if (targetPlan) {
        await tx.planHistory.create({
          data: {
            userId: user.id,
            planId: targetPlan.id,
            startDate: now,
            price: targetPlan.price,
            status: 'active'
          }
        })
      }

      return updatedUser
    })

    console.log(`✅ プラン変更完了: ${user.planId} → ${planId} (ユーザー: ${user.id})`)

    return NextResponse.json({
      success: true,
      message: `${targetPlan?.displayName || planId}プランに変更されました`,
      data: {
        userId: result.id,
        newPlanId: result.planId,
        planStartDate: result.planStartDate,
        monthlyConsultations: result.monthlyConsultations
      }
    })

  } catch (error) {
    console.error('プラン変更エラー:', error)
    
    if (error instanceof Error) {
      // 具体的なエラーハンドリング
      if (error.message.includes('Foreign key')) {
        return NextResponse.json(
          { error: '無効なプランが指定されました' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Transaction')) {
        return NextResponse.json(
          { error: 'プラン変更処理中にエラーが発生しました' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'プランの変更に失敗しました' },
      { status: 500 }
    )
  }
}

// GET: 利用可能なプラン一覧を取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // データベースからプラン一覧を取得
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        displayName: true,
        price: true,
        consultationLimit: true,
        features: true,
        sortOrder: true
      },
      orderBy: { sortOrder: 'asc' }
    })

    // デフォルトプラン（データベースに存在しない場合のフォールバック）
    const defaultPlans = [
      {
        id: 'free',
        name: 'free',
        displayName: 'フリー',
        price: 0,
        consultationLimit: 5,
        features: ['AI相談 5回/月', '基本的な売上分析', 'メール支援'],
        isActive: true,
        sortOrder: 1
      },
      {
        id: 'basic',
        name: 'basic',
        displayName: 'ベーシック',
        price: 1980,
        consultationLimit: 50,
        features: ['AI相談 50回/月', '詳細な売上分析', 'データエクスポート', '優先サポート'],
        isActive: true,
        sortOrder: 2
      },
      {
        id: 'pro',
        name: 'pro',
        displayName: 'プロ',
        price: 4980,
        consultationLimit: 200,
        features: ['AI相談 200回/月', '高度な分析機能', 'カスタムレポート', '専任サポート', 'API利用'],
        isActive: true,
        sortOrder: 3
      }
    ]

    // データベースからプランが取得できない場合はデフォルトを使用
    const allPlans = plans.length > 0 ? plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      displayName: plan.displayName,
      price: plan.price,
      consultationLimit: plan.consultationLimit,
      features: Array.isArray(plan.features) ? plan.features : [],
      isActive: true,
      sortOrder: plan.sortOrder
    })) : defaultPlans

    return NextResponse.json({
      success: true,
      data: allPlans
    })

  } catch (error) {
    console.error('プラン一覧取得エラー:', error)
    return NextResponse.json(
      { error: 'プラン一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}