// app/api/analyze/history/route.ts - 分析履歴取得API（修正版）

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const sortBy = searchParams.get('sortBy') || 'date-desc'

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    const whereConditions: any = {
      userId: user.id
    }

    if (search) {
      whereConditions.fileName = {
        contains: search,
        mode: 'insensitive'
      }
    }

    if (status !== 'all') {
      whereConditions.aiAnalysisStatus = status
    }

    let orderBy: any = {}
    switch (sortBy) {
      case 'date-desc':
        orderBy = { createdAt: 'desc' }
        break
      case 'date-asc':
        orderBy = { createdAt: 'asc' }
        break
      case 'sales-desc':
        orderBy = { totalSales: 'desc' }
        break
      case 'sales-asc':
        orderBy = { totalSales: 'asc' }
        break
      case 'name-asc':
        orderBy = { fileName: 'asc' }
        break
      case 'name-desc':
        orderBy = { fileName: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    const skip = (page - 1) * limit

    const [analysisResults, totalCount] = await Promise.all([
      prisma.analyticsResult.findMany({
        where: whereConditions,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          fileName: true,
          createdAt: true,
          recordCount: true,
          totalSales: true,
          averageSpend: true,
          totalOrders: true,
          aiAnalysisStatus: true,
          aiAnalysis: true,
          dailySales: true,
          menuSales: true,
          weatherSales: true,
          dailyMenuBreakdown: true,
          startDate: true,
          endDate: true
        }
      }),
      prisma.analyticsResult.count({
        where: whereConditions
      })
    ])

    const formattedResults = analysisResults.map(result => ({
      id: result.id,
      fileName: result.fileName || 'unknown.csv',
      uploadDate: result.createdAt.toISOString(),
      dataCount: result.recordCount,
      totalSales: result.totalSales,
      averageSpend: result.averageSpend,
      totalOrders: result.totalOrders,
      status: getStatusFromAIAnalysisStatus(result.aiAnalysisStatus),
      analysisData: {
        dailySales: result.dailySales as any[],
        menuSales: result.menuSales as any[],
        weatherSales: result.weatherSales as any[],
        dailyMenuBreakdown: result.dailyMenuBreakdown as any[]
      },
      aiAnalysis: result.aiAnalysis,
      period: {
        startDate: result.startDate?.toISOString(),
        endDate: result.endDate?.toISOString()
      }
    }))

    const completedResults = analysisResults.filter(r => r.aiAnalysisStatus === 'completed')
    const stats = {
      totalAnalyses: totalCount,
      completedAnalyses: completedResults.length,
      totalSales: completedResults.reduce((sum, r) => sum + r.totalSales, 0),
      averageSpend: completedResults.length > 0 
        ? completedResults.reduce((sum, r) => sum + r.averageSpend, 0) / completedResults.length
        : 0
    }

    return NextResponse.json({
      success: true,
      data: formattedResults,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      },
      stats,
      filters: {
        search,
        status,
        sortBy
      }
    })

  } catch (error) {
    console.error('分析履歴取得エラー:', error)
    return NextResponse.json(
      { error: '分析履歴の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const analysisId = searchParams.get('id')

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

    const analysisResult = await prisma.analyticsResult.findFirst({
      where: {
        id: analysisId,
        userId: user.id
      }
    })

    if (!analysisResult) {
      return NextResponse.json(
        { error: '分析結果が見つからないか、アクセス権限がありません' },
        { status: 404 }
      )
    }

    await prisma.$transaction(async (tx) => {
      await tx.salesRecord.deleteMany({
        where: { analyticsResultId: analysisId }
      })

      await tx.analyticsResult.delete({
        where: { id: analysisId }
      })
    })

    console.log('✅ 分析結果を削除しました:', {
      analysisId,
      userId: user.id,
      fileName: analysisResult.fileName
    })

    return NextResponse.json({
      success: true,
      message: '分析結果を削除しました'
    })

  } catch (error) {
    console.error('分析結果削除エラー:', error)
    return NextResponse.json(
      { error: '分析結果の削除に失敗しました' },
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