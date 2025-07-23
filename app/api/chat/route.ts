
// // app/api/chat/route.ts
// import { NextRequest, NextResponse } from "next/server"
// import { getServerSession } from "next-auth"
// import { authOptions } from "@/lib/auth"
// import { StoreProfile } from "@/types/store-settings"

// // OpenAI APIの設定
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// // 店舗情報をシステムプロンプトに変換
// function createSystemPrompt(storeProfile: StoreProfile): string {
//   let profileInfo = `
// あなたは飲食店経営の専門AIコンサルタントです。以下の店舗情報を基に、具体的で実践的なアドバイスを提供してください。

// 【店舗情報】
// 店舗名: ${storeProfile.name}
// 業態: ${storeProfile.type}
// ${storeProfile.seats ? `席数: ${storeProfile.seats}席` : ''}
// ${storeProfile.averageSpend ? `平均客単価: ${storeProfile.averageSpend.toLocaleString()}円` : ''}
// ${storeProfile.openingHours ? `営業時間: ${storeProfile.openingHours}` : ''}
// ${storeProfile.challenges ? `現在の課題: ${storeProfile.challenges}` : ''}

// 【回答の指針】
// 1. 上記の店舗情報を考慮した具体的なアドバイスを提供する
// 2. 業態や規模に適した実践的な提案をする
// 3. 数字や具体例を含む説得力のある回答を心がける
// 4. 段階的な実施プランを提示する
// 5. 日本の飲食業界の現状を踏まえた現実的な提案をする
// 6. 簡潔で分かりやすい表現を使用する

// ユーザーからの質問に対して、この店舗の特性を活かした専門的なアドバイスを提供してください。`

//   return profileInfo
// }

// // デフォルトのシステムプロンプト（店舗情報がない場合）
// function createDefaultSystemPrompt(): string {
//   return `
// あなたは飲食店経営の専門AIコンサルタントです。
// 飲食店の経営に関する質問に対して、専門的で実践的なアドバイスを提供してください。

// 【回答の指針】
// 1. 日本の飲食業界の現状を踏まえた現実的な提案をする
// 2. 具体的な数字や事例を含む説得力のある回答を心がける
// 3. 段階的な実施プランを提示する
// 4. 業態や規模に応じたカスタマイズされた提案をする
// 5. 簡潔で分かりやすい表現を使用する

// より具体的なアドバイスを提供するため、店舗の詳細情報（業態、規模、課題など）があれば積極的に質問してください。`
// }

// export async function POST(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)
    
//     if (!session?.user?.email) {
//       return NextResponse.json(
//         { error: "認証が必要です" },
//         { status: 401 }
//       )
//     }

//     const { messages, storeProfile } = await request.json()

//     if (!messages || !Array.isArray(messages)) {
//       return NextResponse.json(
//         { error: "メッセージが無効です" },
//         { status: 400 }
//       )
//     }

//     // システムプロンプトを生成
//     let systemPrompt
//     if (storeProfile && storeProfile.name !== "店舗名未設定") {
//       systemPrompt = createSystemPrompt(storeProfile)
//     } else {
//       systemPrompt = createDefaultSystemPrompt()
//     }

//     // OpenAI API呼び出し
//     if (!OPENAI_API_KEY) {
//       return NextResponse.json(
//         { error: "OpenAI APIキーが設定されていません" },
//         { status: 500 }
//       )
//     }

//     const openaiMessages = [
//       { role: "system", content: systemPrompt },
//       ...messages
//     ]

//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${OPENAI_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "gpt-4o-mini", // または "gpt-3.5-turbo"
//         messages: openaiMessages,
//         max_tokens: 1000,
//         temperature: 0.7,
//         top_p: 1,
//         frequency_penalty: 0,
//         presence_penalty: 0,
//       }),
//     })

//     if (!response.ok) {
//       const errorData = await response.json()
//       console.error("OpenAI APIエラー:", errorData)
//       return NextResponse.json(
//         { error: "AI応答の生成に失敗しました" },
//         { status: 500 }
//       )
//     }

//     const data = await response.json()
//     const aiResponse = data.choices[0]?.message?.content

//     if (!aiResponse) {
//       return NextResponse.json(
//         { error: "AIからの応答が空です" },
//         { status: 500 }
//       )
//     }

//     return NextResponse.json({ response: aiResponse })

//   } catch (error) {
//     console.error("チャットAPIエラー:", error)
//     return NextResponse.json(
//       { error: "内部サーバーエラーが発生しました" },
//       { status: 500 }
//     )
//   }
// }


// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { StoreProfile } from "@/types/store-settings"
import { prisma } from "@/lib/prisma"

// OpenAI APIの設定
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// プラン設定
const PLAN_LIMITS = {
  free: 5,
  basic: 50,
  pro: 200
}

// 店舗情報をシステムプロンプトに変換
function createSystemPrompt(storeProfile: StoreProfile): string {
  let profileInfo = `
あなたは飲食店経営の専門AIコンサルタントです。以下の店舗情報を基に、具体的で実践的なアドバイスを提供してください。

【店舗情報】
店舗名: ${storeProfile.name}
業態: ${storeProfile.type}
${storeProfile.seats ? `席数: ${storeProfile.seats}席` : ''}
${storeProfile.averageSpend ? `平均客単価: ${storeProfile.averageSpend.toLocaleString()}円` : ''}
${storeProfile.openingHours ? `営業時間: ${storeProfile.openingHours}` : ''}
${storeProfile.challenges ? `現在の課題: ${storeProfile.challenges}` : ''}

【回答の指針】
1. 上記の店舗情報を考慮した具体的なアドバイスを提供する
2. 業態や規模に適した実践的な提案をする
3. 数字や具体例を含む説得力のある回答を心がける
4. 段階的な実施プランを提示する
5. 日本の飲食業界の現状を踏まえた現実的な提案をする
6. 簡潔で分かりやすい表現を使用する

ユーザーからの質問に対して、この店舗の特性を活かした専門的なアドバイスを提供してください。`

  return profileInfo
}

// デフォルトのシステムプロンプト（店舗情報がない場合）
function createDefaultSystemPrompt(): string {
  return `
あなたは飲食店経営の専門AIコンサルタントです。
飲食店の経営に関する質問に対して、専門的で実践的なアドバイスを提供してください。

【回答の指針】
1. 日本の飲食業界の現状を踏まえた現実的な提案をする
2. 具体的な数字や事例を含む説得力のある回答を心がける
3. 段階的な実施プランを提示する
4. 業態や規模に応じたカスタマイズされた提案をする
5. 簡潔で分かりやすい表現を使用する

より具体的なアドバイスを提供するため、店舗の詳細情報（業態、規模、課題など）があれば積極的に質問してください。`
}

// 現在の月の開始日を取得
function getCurrentMonthStart(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { messages, storeProfile } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "メッセージが無効です" },
        { status: 400 }
      )
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
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
    }

    // プラン制限を確認（デフォルトはフリープラン）
    const userPlan = user.planId || 'free'
    const monthlyLimit = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free

    // 利用制限チェック
    if (currentConsultations >= monthlyLimit) {
      return NextResponse.json(
        { 
          error: "今月の相談回数の上限に達しました。プランをアップグレードするか、来月までお待ちください。",
          limitReached: true,
          currentUsage: currentConsultations,
          monthlyLimit: monthlyLimit
        },
        { status: 429 }
      )
    }

    // システムプロンプトを生成
    let systemPrompt
    if (storeProfile && storeProfile.name !== "店舗名未設定") {
      systemPrompt = createSystemPrompt(storeProfile)
    } else {
      systemPrompt = createDefaultSystemPrompt()
    }

    // OpenAI API呼び出し
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI APIキーが設定されていません" },
        { status: 500 }
      )
    }

    const openaiMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ]

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: openaiMessages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("OpenAI APIエラー:", errorData)
      return NextResponse.json(
        { error: "AI応答の生成に失敗しました" },
        { status: 500 }
      )
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content

    if (!aiResponse) {
      return NextResponse.json(
        { error: "AIからの応答が空です" },
        { status: 500 }
      )
    }

    // 成功時：相談回数をインクリメント
    const newConsultationCount = currentConsultations + 1
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        monthlyConsultations: newConsultationCount,
        lastConsultationReset: needsReset ? currentMonthStart : user.lastConsultationReset
      }
    })

    return NextResponse.json({ 
      response: aiResponse,
      usage: {
        currentUsage: newConsultationCount,
        monthlyLimit: monthlyLimit,
        remaining: monthlyLimit - newConsultationCount
      }
    })

  } catch (error) {
    console.error("チャットAPIエラー:", error)
    return NextResponse.json(
      { error: "内部サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}