// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import openai from "@/lib/openai"
import { checkPlanLimits, incrementUsage } from "@/lib/planLimits"
import { generateEnhancedPrompt } from "@/lib/enhancedAIAnalysis"

export async function POST(req: NextRequest) {
  console.log("API /api/analyze にリクエストが来ました")
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.error("認証が必要です")
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const planCheck = await checkPlanLimits(session.user.email, "aiAnalysis")
    
    if (!planCheck.hasAccess) {
      console.error("プラン制限:", planCheck.error)
      return NextResponse.json(
        { 
          error: planCheck.error,
          limit: planCheck.usage?.limit,
          current: planCheck.usage?.current,
          planName: planCheck.usage?.planName
        },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        storeName: true,
        storeType: true,
        averageSpend: true,
        seats: true,
        businessHours: true,
        challenges: true
      }
    })

    const storeContext = {
      storeName: user?.storeName || undefined,
      storeType: user?.storeType || undefined,
      averageSpend: user?.averageSpend || undefined,
      seats: user?.seats || undefined,
      businessHours: user?.businessHours || undefined,
      challenges: (user?.challenges as string[]) || []
    }

    const { prompt, analysisData, csvData } = await req.json()
    
    const enhancedPrompt = analysisData && csvData 
      ? generateEnhancedPrompt(analysisData, csvData, storeContext)
      : prompt 

    if (!enhancedPrompt) {
      console.error("プロンプトが提供されていません")
      return NextResponse.json(
        { error: "分析用のプロンプトが必要です" },
        { status: 400 }
      )
    }

    console.log("AI分析を開始します...")
    console.log("店舗コンテキスト:", storeContext)
    console.log("現在の使用量:", planCheck.usage?.current, "/", planCheck.usage?.limit)

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "あなたは経験豊富な飲食店経営コンサルタントです。店舗の特性と課題を理解し、データに基づいた具体的で実践可能な改善提案を提供してください。" 
        },
        { role: "user", content: enhancedPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500, 
    })

    const result = response.choices[0].message?.content || "分析結果が見つかりませんでした"

    await incrementUsage(session.user.email)

    const updatedPlanCheck = await checkPlanLimits(session.user.email, "aiAnalysis")

    console.log("AI分析が完了しました")
    console.log("使用量を更新しました:", updatedPlanCheck.usage?.current, "/", updatedPlanCheck.usage?.limit)

    return NextResponse.json({ 
      result,
      usage: updatedPlanCheck.usage,
      storeContext, 
      success: true
    })

  } catch (error) {
    console.error("AI分析エラー:", error)
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: "OpenAI APIの利用制限に達しました。しばらく時間をおいてから再試行してください。" },
          { status: 429 }
        )
      }
      
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: "OpenAI APIの利用枠を超過しました。管理者にお問い合わせください。" },
          { status: 402 }
        )
      }
    }

    return NextResponse.json(
      { error: "AI分析中にエラーが発生しました。しばらく時間をおいてから再試行してください。" },
      { status: 500 }
    )
  }
}