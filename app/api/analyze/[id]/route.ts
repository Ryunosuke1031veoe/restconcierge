// app/api/analyze/[id]/route.ts - 分析詳細取得API（修正版）

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const analysisId = params.id

    if (!analysisId) {
      return NextResponse.json(
        { error: '分析IDが必要です' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // 分析結果の詳細を取得
    const analysisResult = await prisma.analyticsResult.findFirst({
      where: {
        id: analysisId,
        userId: user.id
      },
      include: {
        salesRecords: {
          orderBy: { date: 'asc' }
        }
      }
    })

    if (!analysisResult) {
      return NextResponse.json(
        { error: '分析結果が見つからないか、アクセス権限がありません' },
        { status: 404 }
      )
    }

    // レスポンス用にデータを整形
    const formattedResult = {
      id: analysisResult.id,
      fileName: analysisResult.fileName || 'unknown.csv',
      uploadDate: analysisResult.createdAt.toISOString(),
      dataCount: analysisResult.recordCount,
      totalSales: analysisResult.totalSales,
      averageSpend: analysisResult.averageSpend,
      totalOrders: analysisResult.totalOrders,
      totalDays: analysisResult.totalDays,
      status: getStatusFromAIAnalysisStatus(analysisResult.aiAnalysisStatus),
      period: {
        startDate: analysisResult.startDate?.toISOString() || null,
        endDate: analysisResult.endDate?.toISOString() || null
      },
      analysisData: {
        dailySales: safeParseJSON(analysisResult.dailySales, []),
        menuSales: safeParseJSON(analysisResult.menuSales, []),
        weatherSales: safeParseJSON(analysisResult.weatherSales, []),
        dailyMenuBreakdown: safeParseJSON(analysisResult.dailyMenuBreakdown, [])
      },
      aiAnalysis: analysisResult.aiAnalysis || null,
      csvData: analysisResult.salesRecords.map(record => ({
        date: record.date.toISOString().split('T')[0],
        menu: record.menuItem,
        quantity: record.quantity,
        amount: record.amount,
        weather: record.weather,
        unitPrice: record.unitPrice
      }))
    }

    return NextResponse.json({
      success: true,
      data: formattedResult
    })

  } catch (error) {
    console.error('分析詳細取得エラー:', error)
    return NextResponse.json(
      { 
        error: '分析詳細の取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function getStatusFromAIAnalysisStatus(aiAnalysisStatus: string): string {
  switch (aiAnalysisStatus) {
    case 'completed':
      return 'completed'
    case 'pending':
      return 'processing'
    case 'failed':
      return 'failed'
    default:
      return 'processing'
  }
}

function safeParseJSON(jsonValue: unknown, fallback: any): any {
  if (jsonValue === null || jsonValue === undefined) {
    return fallback
  }
  
  if (typeof jsonValue === 'object') {
    return jsonValue
  }
  
  if (typeof jsonValue === 'string') {
    try {
      return JSON.parse(jsonValue)
    } catch (error) {
      console.error('JSON parse error:', error)
      return fallback
    }
  }
  
  return fallback
}