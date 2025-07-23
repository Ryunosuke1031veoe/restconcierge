// app/api/analyze/[id]/export/route.ts - エクスポートAPI（修正版）

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
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
    let requestBody: { format: 'csv' | 'json' }

    try {
      requestBody = await req.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'リクエストボディの解析に失敗しました' },
        { status: 400 }
      )
    }

    const { format } = requestBody

    if (!format || !['csv', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'サポートされていない形式です。csvまたはjsonを指定してください。' },
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

    // 分析結果を取得
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

    let exportData: string
    let contentType: string
    let fileName: string

    try {
      switch (format) {
        case 'csv':
          exportData = generateCSVExport(analysisResult)
          contentType = 'text/csv; charset=utf-8'
          fileName = `analysis_${analysisId}_${getCurrentDateString()}.csv`
          break
        
        case 'json':
          exportData = generateJSONExport(analysisResult)
          contentType = 'application/json; charset=utf-8'
          fileName = `analysis_${analysisId}_${getCurrentDateString()}.json`
          break
        
        default:
          return NextResponse.json(
            { error: 'サポートされていない形式です' },
            { status: 400 }
          )
      }
    } catch (error) {
      console.error('エクスポートデータ生成エラー:', error)
      return NextResponse.json(
        { error: 'エクスポートデータの生成に失敗しました' },
        { status: 500 }
      )
    }

    // ファイルダウンロード用のレスポンス
    return new NextResponse(exportData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': Buffer.byteLength(exportData, 'utf8').toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('エクスポートAPI エラー:', error)
    return NextResponse.json(
      { 
        error: 'エクスポート処理中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generateCSVExport(analysisResult: any): string {
  try {
    const BOM = '\uFEFF'
    const headers = ['日付', 'メニュー', '数量', '金額', '天気', '単価']
    const csvRows = [headers.join(',')]
    
    analysisResult.salesRecords.forEach((record: any) => {
      const row = [
        record.date.toISOString().split('T')[0],
        escapeCSVValue(record.menuItem),
        record.quantity.toString(),
        record.amount.toString(),
        escapeCSVValue(record.weather),
        record.unitPrice.toString()
      ]
      csvRows.push(row.join(','))
    })

    return BOM + csvRows.join('\n')
  } catch (error) {
    console.error('CSV生成エラー:', error)
    throw new Error('CSV形式でのエクスポートに失敗しました')
  }
}

function generateJSONExport(analysisResult: any): string {
  try {
    const exportData = {
      metadata: {
        fileName: analysisResult.fileName || 'unknown.csv',
        exportDate: new Date().toISOString(),
        analysisId: analysisResult.id,
        period: {
          startDate: analysisResult.startDate?.toISOString() || null,
          endDate: analysisResult.endDate?.toISOString() || null
        }
      },
      summary: {
        totalSales: analysisResult.totalSales,
        totalOrders: analysisResult.totalOrders,
        averageSpend: analysisResult.averageSpend,
        totalDays: analysisResult.totalDays,
        recordCount: analysisResult.recordCount
      },
      analysisData: {
        dailySales: safeParseJSON(analysisResult.dailySales, []),
        menuSales: safeParseJSON(analysisResult.menuSales, []),
        weatherSales: safeParseJSON(analysisResult.weatherSales, []),
        dailyMenuBreakdown: safeParseJSON(analysisResult.dailyMenuBreakdown, [])
      },
      aiAnalysis: analysisResult.aiAnalysis || null,
      rawData: analysisResult.salesRecords.map((record: any) => ({
        date: record.date.toISOString().split('T')[0],
        menu: record.menuItem,
        quantity: record.quantity,
        amount: record.amount,
        weather: record.weather,
        unitPrice: record.unitPrice
      }))
    }

    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    console.error('JSON生成エラー:', error)
    throw new Error('JSON形式でのエクスポートに失敗しました')
  }
}

function escapeCSVValue(value: string): string {
  if (!value) return ''
  
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    const escapedValue = value.replace(/"/g, '""')
    return `"${escapedValue}"`
  }
  
  return value
}

function getCurrentDateString(): string {
  return new Date().toISOString().split('T')[0]
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