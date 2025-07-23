import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface CSVData {
  date: string
  menu: string
  quantity: number
  amount: number
  weather: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
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

    const { records, aiAnalysis } = await request.json()

    if (!records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'レコードデータが必要です' },
        { status: 400 }
      )
    }

    const dates = records.map((record: CSVData) => record.date).sort()
    const startDate = new Date(dates[0])
    const endDate = new Date(dates[dates.length - 1])

    const totalSales = records.reduce((sum: number, record: CSVData) => sum + record.amount, 0)
    const totalOrders = records.reduce((sum: number, record: CSVData) => sum + record.quantity, 0)
    const averageSpend = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0

    const menuSalesMap = new Map<string, { quantity: number; amount: number }>()
    records.forEach((record: CSVData) => {
      const current = menuSalesMap.get(record.menu) || { quantity: 0, amount: 0 }
      menuSalesMap.set(record.menu, {
        quantity: current.quantity + record.quantity,
        amount: current.amount + record.amount,
      })
    })

    const menuSales = Array.from(menuSalesMap.entries()).map(([name, data]) => ({
      name,
      value: totalSales > 0 ? Math.round((data.amount / totalSales) * 100) : 0,
      amount: data.amount,
    }))

    const dailySalesMap = new Map<string, number>()
    records.forEach((record: CSVData) => {
      const current = dailySalesMap.get(record.date) || 0
      dailySalesMap.set(record.date, current + record.amount)
    })

    const dailySales = Array.from(dailySalesMap.entries())
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const weatherSalesMap = new Map<string, number>()
    records.forEach((record: CSVData) => {
      const current = weatherSalesMap.get(record.weather) || 0
      weatherSalesMap.set(record.weather, current + record.amount)
    })

    const weatherSales = Array.from(weatherSalesMap.entries()).map(([weather, sales]) => ({ weather, sales }))

    const dailyMenuMap = new Map<string, { [menu: string]: number }>()
    records.forEach((record: CSVData) => {
      if (!dailyMenuMap.has(record.date)) {
        dailyMenuMap.set(record.date, {})
      }
      const dayData = dailyMenuMap.get(record.date)!
      dayData[record.menu] = (dayData[record.menu] || 0) + record.amount
    })

    const dailyMenuBreakdown = Array.from(dailyMenuMap.entries())
      .map(([date, menuData]) => ({
        date,
        ...menuData,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const result = await prisma.$transaction(async (tx) => {
      const analysisResult = await tx.analyticsResult.create({
        data: {
          userId: user.id,
          startDate,
          endDate,
          totalSales,
          totalOrders,
          averageSpend,
          totalDays: dailySales.length,
          dailySales,
          menuSales,
          weatherSales,
          dailyMenuBreakdown,
          aiAnalysis: aiAnalysis || null,
          aiAnalysisStatus: aiAnalysis ? 'completed' : 'pending',
          fileName: 'uploaded_data.csv',
          recordCount: records.length,
        }
      })

      const salesRecords = await Promise.all(
        records.map((record: CSVData) =>
          tx.salesRecord.create({
            data: {
              userId: user.id,
              date: new Date(record.date),
              menuItem: record.menu,
              quantity: record.quantity,
              amount: record.amount,
              weather: record.weather,
              unitPrice: record.amount / record.quantity,
              analyticsResultId: analysisResult.id,
            }
          })
        )
      )

      return {
        analysisResult,
        salesRecords: salesRecords.length
      }
    })

    console.log('✅ データ保存完了:', {
      analysisId: result.analysisResult.id,
      recordCount: result.salesRecords
    })

    return NextResponse.json({
      success: true,
      message: 'データが正常に保存されました',
      data: {
        analysisId: result.analysisResult.id,
        recordCount: result.salesRecords,
        totalSales,
        totalOrders,
        averageSpend
      }
    })

  } catch (error) {
    console.error('データ保存エラー:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: '重複するデータが存在します' },
          { status: 409 }
        )
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'データの関連性に問題があります' },
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
      { error: 'データの保存に失敗しました' },
      { status: 500 }
    )
  }
}