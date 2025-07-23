// // app/api/create-subscription/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { stripe, getStripePriceId } from '@/lib/stripe'
// import { prisma } from '@/lib/prisma'

// export async function POST(req: NextRequest) {
//   try {
//     // 1. 認証チェック
//     const session = await getServerSession(authOptions)
    
//     if (!session?.user?.email) {
//       return NextResponse.json(
//         { error: '認証が必要です' },
//         { status: 401 }
//       )
//     }

//     // 2. リクエストボディの取得
//     const { planName } = await req.json()
    
//     if (!planName) {
//       return NextResponse.json(
//         { error: 'プラン名が必要です' },
//         { status: 400 }
//       )
//     }

//     // 3. Price IDの取得
//     const priceId = getStripePriceId(planName)
    
//     if (!priceId) {
//       return NextResponse.json(
//         { error: '無効なプランです' },
//         { status: 400 }
//       )
//     }

//     // 4. ユーザー情報取得
//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         stripeCustomerId: true, // Stripe顧客IDを保存するフィールド
//       }
//     })

//     if (!user) {
//       return NextResponse.json(
//         { error: 'ユーザーが見つかりません' },
//         { status: 404 }
//       )
//     }

//     // 5. Stripe顧客の作成または取得
//     let customerId = user.stripeCustomerId

//     if (!customerId) {
//       // 新規Stripe顧客を作成
//       const customer = await stripe.customers.create({
//         email: user.email!,
//         name: user.name || undefined,
//         metadata: {
//           userId: user.id,
//         },
//       })
      
//       customerId = customer.id

//       // データベースに顧客IDを保存
//       await prisma.user.update({
//         where: { id: user.id },
//         data: { stripeCustomerId: customerId }
//       })
//     }

//     // 6. Checkout Sessionを作成
//     const checkoutSession = await stripe.checkout.sessions.create({
//       customer: customerId,
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price: priceId,
//           quantity: 1,
//         },
//       ],
//       mode: 'subscription',
//       success_url: `${req.headers.get('origin')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${req.headers.get('origin')}/profile`,
//       metadata: {
//         userId: user.id,
//         planName: planName,
//       },
//     })

//     console.log('✅ Checkout Session作成成功:', {
//       sessionId: checkoutSession.id,
//       customerId,
//       planName,
//       priceId
//     })

//     return NextResponse.json({
//       sessionId: checkoutSession.id,
//       url: checkoutSession.url,
//     })

//   } catch (error) {
//     console.error('❌ サブスクリプション作成エラー:', error)
    
//     if (error instanceof Error) {
//       return NextResponse.json(
//         { error: `決済処理中にエラーが発生しました: ${error.message}` },
//         { status: 500 }
//       )
//     }

//     return NextResponse.json(
//       { error: '決済処理中にエラーが発生しました' },
//       { status: 500 }
//     )
//   }
// }

// app/api/create-subscription/route.ts (強化版)
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, getStripePriceId, validateStripePriceId } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  console.log('=== /api/create-subscription 開始 ===')
  
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

    // 2. リクエストボディの取得
    const { planName } = await req.json()
    
    console.log('📋 受信データ:', { planName })
    
    if (!planName) {
      console.error('❌ プラン名が未定義')
      return NextResponse.json(
        { error: 'プラン名が必要です' },
        { status: 400 }
      )
    }

    // 3. Price IDの取得
    console.log('🔍 価格ID取得中...')
    const priceId = getStripePriceId(planName)
    
    console.log('📋 取得された価格ID:', { planName, priceId })
    
    if (!priceId) {
      console.error('❌ 価格ID取得失敗:', planName)
      return NextResponse.json(
        { error: `無効なプランです: ${planName}` },
        { status: 400 }
      )
    }

    // 4. 価格IDの検証（Stripeで実際に存在するかチェック）
    console.log('🔍 Stripe価格ID検証中...')
    const isValidPriceId = await validateStripePriceId(priceId)
    
    if (!isValidPriceId) {
      console.error('❌ Stripe価格ID検証失敗:', priceId)
      return NextResponse.json(
        { error: `Stripeで価格IDが見つかりません: ${priceId}` },
        { status: 400 }
      )
    }

    console.log('✅ 価格ID検証成功:', priceId)

    // 5. ユーザー情報取得
    console.log('👤 ユーザー情報取得中...')
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
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

    console.log('✅ ユーザー情報取得成功:', {
      userId: user.id,
      email: user.email,
      hasStripeCustomerId: !!user.stripeCustomerId
    })

    // 6. Stripe顧客の作成または取得
    let customerId = user.stripeCustomerId

    if (!customerId) {
      console.log('🆕 新規Stripe顧客作成中...')
      
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      })
      
      customerId = customer.id
      console.log('✅ Stripe顧客作成成功:', customerId)

      // データベースに顧客IDを保存
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      })
      
      console.log('✅ 顧客ID保存完了')
    } else {
      console.log('♻️ 既存Stripe顧客ID使用:', customerId)
    }

    // 7. Checkout Sessionを作成
    console.log('🛒 Checkout Session作成中...')
    console.log('作成パラメータ:', {
      customer: customerId,
      priceId: priceId,
      planName: planName
    })

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/profile`,
      metadata: {
        userId: user.id,
        planName: planName,
      },
    })

    console.log('✅ Checkout Session作成成功:', {
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      customerId,
      planName,
      priceId
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })

  } catch (error) {
    console.error('❌ サブスクリプション作成エラー:', error)
    
    // Stripeエラーの詳細ログ
    if (error && typeof error === 'object' && 'type' in error) {
      console.error('Stripeエラー詳細:', {
        type: error.type,
        code: (error as any).code,
        message: (error as any).message,
        param: (error as any).param
      })
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `決済処理中にエラーが発生しました: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: '決済処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}