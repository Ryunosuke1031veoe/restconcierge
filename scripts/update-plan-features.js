// scripts/update-plan-features.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updatePlanFeatures() {
  try {
    console.log('🔧 プラン機能設定を更新中...')

    // フリープラン
    await prisma.plan.updateMany({
      where: { name: 'free' },
      data: {
        features: {
          aiAnalysis: false,
          csvUpload: true,
          basicCharts: true,
          abcAnalysis: false,
          combinationAnalysis: false,
          seasonalAnalysis: false,
          prediction: false,
          exportData: false,
          advancedReports: false
        }
      }
    })
    console.log('✅ フリープラン更新完了')

    // ベーシックプラン
    await prisma.plan.updateMany({
      where: { name: 'basic' },
      data: {
        features: {
          aiAnalysis: true,
          csvUpload: true,
          basicCharts: true,
          abcAnalysis: false,
          combinationAnalysis: false,
          seasonalAnalysis: false,
          prediction: false,
          exportData: false,
          advancedReports: false
        }
      }
    })
    console.log('✅ ベーシックプラン更新完了')

    // プロプラン
    await prisma.plan.updateMany({
      where: { name: 'pro' },
      data: {
        features: {
          aiAnalysis: true,
          csvUpload: true,
          basicCharts: true,
          abcAnalysis: true,
          combinationAnalysis: true,
          seasonalAnalysis: true,
          prediction: true,
          exportData: true,
          advancedReports: false
        }
      }
    })
    console.log('✅ プロプラン更新完了')

    // 結果確認
    const plans = await prisma.plan.findMany({
      select: {
        name: true,
        displayName: true,
        features: true
      },
      orderBy: { sortOrder: 'asc' }
    })

    console.log('📋 更新結果:')
    plans.forEach(plan => {
      console.log(`${plan.displayName} (${plan.name}):`, plan.features)
    })

    console.log('🎉 プラン機能設定の更新が完了しました！')

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePlanFeatures()