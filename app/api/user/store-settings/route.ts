// app/api/user/store-settings/route.ts - プラン情報を含む完全版

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

interface StoreSettingsData {
  storeName: string
  storeType: string
  averageSpend: number
  seats: number
  businessHours: string
  challenges: string[]
}

// JSON型の安全なヘルパー関数
function safeJsonValue(value: string[]): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue
}

function parseJsonArray(jsonValue: unknown): string[] {
  if (!jsonValue) return []
  
  if (Array.isArray(jsonValue)) {
    return jsonValue.filter((item): item is string => typeof item === 'string')
  }
  
  if (typeof jsonValue === 'string') {
    try {
      const parsed = JSON.parse(jsonValue)
      return Array.isArray(parsed) 
        ? parsed.filter((item): item is string => typeof item === 'string')
        : []
    } catch {
      return []
    }
  }
  
  return []
}

// GET: 店舗設定とプラン情報を取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // ユーザー情報とプラン情報を同時に取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        
        // プラン関連
        planId: true,
        planStartDate: true,
        planEndDate: true,
        isActive: true,
        monthlyConsultations: true,
        lastConsultationReset: true,
        
        // 店舗設定
        storeName: true,
        storeType: true,
        averageSpend: true,
        seats: true,
        businessHours: true,
        challenges: true,
        storeSettingsUpdatedAt: true,
        
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // プラン情報を取得
    const plan = await prisma.plan.findUnique({
      where: { name: user.planId },
      select: {
        id: true,
        name: true,
        displayName: true,
        price: true,
        consultationLimit: true,
        features: true,
        isActive: true,
        sortOrder: true
      }
    })

    // デフォルトプランの定義（Plan テーブルに存在しない場合のフォールバック）
    const defaultPlan = {
      id: 'free',
      name: 'free',
      displayName: 'フリー',
      price: 0,
      consultationLimit: 5,
      features: ['AI相談 5回/月', '基本的な売上分析', 'メール支援'],
      isActive: true,
      sortOrder: 1
    }

    // プラン情報（見つからない場合はデフォルト）
    const currentPlan = plan ? {
      id: plan.id,
      name: plan.name,
      displayName: plan.displayName,
      price: plan.price,
      consultationLimit: plan.consultationLimit,
      features: parseJsonArray(plan.features),
      isActive: plan.isActive,
      sortOrder: plan.sortOrder
    } : defaultPlan

    // challengesの安全な処理
    const challenges = parseJsonArray(user.challenges)

    // 月間リセット処理
    const now = new Date()
    const lastReset = new Date(user.lastConsultationReset)
    const shouldResetConsultations = 
      now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()

    let monthlyConsultations = user.monthlyConsultations

    // 月が変わっていたら相談回数をリセット
    if (shouldResetConsultations) {
      monthlyConsultations = 0
      await prisma.user.update({
        where: { id: user.id },
        data: {
          monthlyConsultations: 0,
          lastConsultationReset: now
        }
      })
    }

    // 次回更新日の計算（翌月の1日）
    const nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    return NextResponse.json({
      success: true,
      data: {
        // ユーザー基本情報
        user: {
          id: user.id,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          createdAt: user.createdAt.toISOString()
        },
        
        // プラン情報
        currentPlan,
        
        // 使用状況
        usage: {
          monthlyConsultations,
          consultationLimit: currentPlan.consultationLimit,
          nextBillingDate: nextBillingDate.toISOString()
        },
        
        // 店舗設定
        storeSettings: {
          storeName: user.storeName || '',
          storeType: user.storeType || '',
          averageSpend: user.averageSpend || 0,
          seats: user.seats || 0,
          businessHours: user.businessHours || '',
          challenges: challenges,
          lastUpdated: user.storeSettingsUpdatedAt,
          isFirstTime: !user.storeSettingsUpdatedAt
        }
      }
    })

  } catch (error) {
    console.error('ユーザー情報取得エラー:', error)
    return NextResponse.json(
      { error: 'ユーザー情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 店舗設定を保存・更新（既存のまま）
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
    
    // バリデーション
    const { storeName, storeType, averageSpend, seats, businessHours, challenges }: StoreSettingsData = body

    if (!storeName || typeof storeName !== 'string' || !storeName.trim()) {
      return NextResponse.json(
        { error: '店舗名は必須です' },
        { status: 400 }
      )
    }

    if (!storeType || typeof storeType !== 'string') {
      return NextResponse.json(
        { error: '店舗の種類は必須です' },
        { status: 400 }
      )
    }

    if (typeof averageSpend !== 'number' || averageSpend < 0) {
      return NextResponse.json(
        { error: '客単価は0以上の数値で入力してください' },
        { status: 400 }
      )
    }

    if (typeof seats !== 'number' || seats < 0) {
      return NextResponse.json(
        { error: '席数は0以上の数値で入力してください' },
        { status: 400 }
      )
    }

    if (!Array.isArray(challenges)) {
      return NextResponse.json(
        { error: '課題は配列形式で送信してください' },
        { status: 400 }
      )
    }

    // ユーザー存在確認
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // 型安全な更新データを準備
    const updateData: Prisma.UserUpdateInput = {
      storeName: storeName.trim(),
      storeType: storeType.trim(),
      averageSpend: Math.floor(averageSpend),
      seats: Math.floor(seats),
      businessHours: businessHours.trim(),
      challenges: safeJsonValue(challenges),
      storeSettingsUpdatedAt: new Date()
    }

    // 店舗設定を更新
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        storeName: true,
        storeType: true,
        averageSpend: true,
        seats: true,
        businessHours: true,
        challenges: true,
        storeSettingsUpdatedAt: true
      }
    })

    console.log('✅ 店舗設定を保存しました:', {
      userId: user.id,
      storeName: updatedUser.storeName,
      storeType: updatedUser.storeType
    })

    // レスポンス用にchallengesを安全に処理
    const responseChallenges = parseJsonArray(updatedUser.challenges)

    return NextResponse.json({
      success: true,
      message: '店舗設定を保存しました',
      data: {
        storeName: updatedUser.storeName || '',
        storeType: updatedUser.storeType || '',
        averageSpend: updatedUser.averageSpend || 0,
        seats: updatedUser.seats || 0,
        businessHours: updatedUser.businessHours || '',
        challenges: responseChallenges,
        lastUpdated: updatedUser.storeSettingsUpdatedAt
      }
    })

  } catch (error) {
    console.error('店舗設定保存エラー:', error)
    
    // Prismaエラーの詳細処理
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: '重複するデータが存在します' },
          { status: 409 }
        )
      }
      
      if (error.message.includes('Required')) {
        return NextResponse.json(
          { error: '必須フィールドが不足しています' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: '店舗設定の保存に失敗しました' },
      { status: 500 }
    )
  }
}

// 他のメソッド（DELETE, PATCH）は既存のまま...