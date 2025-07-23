// app/api/stripe/cancel-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  console.log('=== Stripeサブスクリプションキャンセル開始 ===')
  
  try {
    // 1. 認証チェック
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.error('❌ 認証エラー: セッションなし')
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    console.log('✅ 認証成功:', session.user.email)

    // 2. ユーザー情報とStripe顧客IDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
      }
    })

    if (!user) {
      console.error('❌ ユーザー未発見:', session.user.email)
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    if (!user.stripeCustomerId) {
      console.log('💡 Stripe顧客IDなし（既にフリープラン状態）')
      return NextResponse.json({
        success: true,
        message: 'Stripeサブスクリプションが存在しません（既にフリープラン状態）'
      })
    }

    console.log('✅ ユーザー情報取得成功:', {
      userId: user.id,
      email: user.email,
      stripeCustomerId: user.stripeCustomerId
    })

    // 3. アクティブなサブスクリプションを取得
    console.log('🔍 アクティブサブスクリプション検索中...')
    
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 100,
    })

    console.log('📋 サブスクリプション検索結果:', {
      customerId: user.stripeCustomerId,
      count: subscriptions.data.length,
      subscriptions: subscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        current_period_end: (sub as any).current_period_end || 'unknown',
        plan: sub.items.data[0]?.price.id || 'unknown'
      }))
    })

    if (subscriptions.data.length === 0) {
      console.log('💡 アクティブなサブスクリプションなし（既にフリープラン状態）')
      return NextResponse.json({
        success: true,
        message: 'アクティブなサブスクリプションが見つかりません（既にフリープラン状態）'
      })
    }

    // 4. すべてのアクティブサブスクリプションをキャンセル
    const cancelResults = []
    
    for (const subscription of subscriptions.data) {
      try {
        console.log('🚫 サブスクリプションキャンセル中:', {
          id: subscription.id,
          status: subscription.status,
          priceId: subscription.items.data[0]?.price.id || 'unknown'
        })
        
        // 即座にキャンセル
        const canceledSubscription = await stripe.subscriptions.cancel(subscription.id)
        
        console.log('✅ サブスクリプションキャンセル成功:', {
          id: canceledSubscription.id,
          status: canceledSubscription.status,
          canceled_at: (canceledSubscription as any).canceled_at || 'unknown'
        })
        
        cancelResults.push({
          id: subscription.id,
          status: 'canceled',
          success: true,
          canceled_at: (canceledSubscription as any).canceled_at || Math.floor(Date.now() / 1000)
        })
        
      } catch (error) {
        console.error('❌ サブスクリプションキャンセルエラー:', {
          subscriptionId: subscription.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        cancelResults.push({
          id: subscription.id,
          status: 'error',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // 5. キャンセル結果の集計
    const successfulCancellations = cancelResults.filter(result => result.success)
    const failedCancellations = cancelResults.filter(result => !result.success)

    console.log('📊 キャンセル結果サマリー:', {
      total: cancelResults.length,
      successful: successfulCancellations.length,
      failed: failedCancellations.length,
      results: cancelResults
    })

    // 6. レスポンス生成
    if (failedCancellations.length > 0) {
      console.error('⚠️ 一部のサブスクリプションキャンセルが失敗')
      return NextResponse.json({
        success: false,
        error: `${failedCancellations.length}件のサブスクリプションのキャンセルに失敗しました`,
        details: {
          successful: successfulCancellations,
          failed: failedCancellations
        }
      }, { status: 500 })
    }

    // 7. 全て成功した場合
    console.log('🎉 全てのサブスクリプションキャンセル成功')
    return NextResponse.json({
      success: true,
      message: `${successfulCancellations.length}件のサブスクリプションをキャンセルしました`,
      canceledSubscriptions: successfulCancellations.length,
      details: successfulCancellations
    })

  } catch (error) {
    console.error('❌ サブスクリプションキャンセル全体エラー:', error)
    
    // Stripeエラーの詳細ログ
    if (error && typeof error === 'object' && 'type' in error) {
      console.error('Stripeエラー詳細:', {
        type: error.type,
        code: (error as any).code,
        message: (error as any).message,
        param: (error as any).param
      })
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'キャンセル処理中にエラーが発生しました'
    }, { status: 500 })
  }
}