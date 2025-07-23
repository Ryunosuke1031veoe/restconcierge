
import { prisma } from "@/lib/prisma"

export interface PlanInfo {
  id: string
  name: string
  displayName: string
  features: Record<string, boolean>
  consultationLimit: number
}

export interface UsageInfo {
  current: number
  limit: number
  remaining: number
  planName: string
}

export interface PlanLimitsResult {
  hasAccess: boolean
  plan: PlanInfo
  usage: UsageInfo
  error?: string
}


const DEFAULT_PLAN_FEATURES: Record<string, Record<string, boolean>> = {
  'free': {
    'aiAnalysis': false,
    'csvUpload': true,
    'basicCharts': true,
    'abcAnalysis': false,
    'combinationAnalysis': false,
    'seasonalAnalysis': false,
    'prediction': false,
    'exportData': false,
    'advancedReports': false
  },
  'basic': {
    'aiAnalysis': true,
    'csvUpload': true,
    'basicCharts': true,
    'abcAnalysis': false,
    'combinationAnalysis': false,
    'seasonalAnalysis': false,
    'prediction': false,
    'exportData': false,
    'advancedReports': false
  },
  'pro': {
    'aiAnalysis': true,
    'csvUpload': true,
    'basicCharts': true,
    'abcAnalysis': true,
    'combinationAnalysis': true,
    'seasonalAnalysis': true,
    'prediction': true,
    'exportData': true,
    'advancedReports': false
  }
}

/**
 * @param userEmail ユーザーのメールアドレス
 * @param requiredFeature 必要な機能名（オプション）
 * @returns プラン制限チェック結果
 */
export async function checkPlanLimits(
  userEmail: string,
  requiredFeature?: string
): Promise<PlanLimitsResult> {
  try {
    console.log("🔍 プラン制限チェック開始:", { userEmail, requiredFeature })

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        planHistory: {
          where: { status: 'active' },
          include: { plan: true },
          orderBy: { startDate: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      console.error("❌ ユーザーが見つかりません:", userEmail)
      return {
        hasAccess: false,
        plan: null as any,
        usage: null as any,
        error: "ユーザーが見つかりません"
      }
    }

    console.log("✅ ユーザー情報取得成功:", {
      userId: user.id,
      planId: user.planId,
      planHistoryCount: user.planHistory.length
    })

    let currentPlan = user.planHistory[0]?.plan
    
    if (!currentPlan && user.planId) {
      console.log("⚠️ PlanHistoryにアクティブプランなし、planIdから取得:", user.planId)
      const foundPlan = await prisma.plan.findUnique({
        where: { name: user.planId }
      })
      
      if (foundPlan) {
        currentPlan = foundPlan
      }
    }

    if (!currentPlan) {
      console.error("❌ アクティブなプランが見つかりません")
      return {
        hasAccess: false,
        plan: null as any,
        usage: null as any,
        error: "アクティブなプランが見つかりません"
      }
    }

    console.log("✅ プラン情報取得成功:", {
      planId: currentPlan.id,
      planName: currentPlan.name,
      displayName: currentPlan.displayName,
      features: currentPlan.features
    })

    const now = new Date()
    const lastReset = new Date(user.lastConsultationReset)
    const shouldReset = now.getMonth() !== lastReset.getMonth() || 
                       now.getFullYear() !== lastReset.getFullYear()

    let currentConsultations = user.monthlyConsultations
    if (shouldReset) {
      currentConsultations = 0
      await prisma.user.update({
        where: { id: user.id },
        data: {
          monthlyConsultations: 0,
          lastConsultationReset: now
        }
      })
      console.log('✅ 月初リセットを実行しました:', userEmail)
    }

    const remaining = currentPlan.consultationLimit === -1 
      ? 999999 
      : currentPlan.consultationLimit - currentConsultations
    const hasUsageLimit = currentPlan.consultationLimit !== -1 && remaining <= 0

    let planFeatures: Record<string, boolean> = {}
    
    try {
      planFeatures = currentPlan.features as Record<string, boolean> || {}
      console.log("📋 DB取得features:", planFeatures)
    } catch (error) {
      console.warn("⚠️ DB features取得失敗、デフォルト使用")
      planFeatures = {}
    }

    if (!planFeatures || Object.keys(planFeatures).length === 0) {
      console.log("🔄 デフォルトproperties設定に移行:", currentPlan.name)
      planFeatures = DEFAULT_PLAN_FEATURES[currentPlan.name] || {}
    }

    console.log("🎯 最終機能設定:", { planName: currentPlan.name, features: planFeatures })

    const hasFeatureAccess = requiredFeature ? 
      planFeatures[requiredFeature] === true : true

    console.log("🔑 機能アクセスチェック:", {
      requiredFeature,
      hasAccess: hasFeatureAccess,
      featureValue: planFeatures[requiredFeature || '']
    })

    const plan: PlanInfo = {
      id: currentPlan.id,
      name: currentPlan.name,
      displayName: currentPlan.displayName,
      features: planFeatures,
      consultationLimit: currentPlan.consultationLimit
    }

    const usage: UsageInfo = {
      current: currentConsultations,
      limit: currentPlan.consultationLimit,
      remaining: remaining,
      planName: currentPlan.displayName
    }

    const hasAccess = !hasUsageLimit && hasFeatureAccess

    let error: string | undefined
    if (hasUsageLimit) {
      error = `月間相談回数の制限に達しています (${currentConsultations}/${currentPlan.consultationLimit})`
    } else if (!hasFeatureAccess) {
      error = `この機能「${requiredFeature}」は現在のプラン「${currentPlan.displayName}」では利用できません`
    }

    console.log("✅ プラン制限チェック完了:", {
      hasAccess,
      hasUsageLimit,
      hasFeatureAccess,
      error
    })

    return {
      hasAccess,
      plan,
      usage,
      error
    }

  } catch (error) {
    console.error("❌ プラン制限チェックエラー:", error)
    return {
      hasAccess: false,
      plan: null as any,
      usage: null as any,
      error: "プラン制限の確認に失敗しました"
    }
  }
}

/**
 * ユーザーの使用量を1増加させる
 * @param userEmail ユーザーのメールアドレス
 */
export async function incrementUsage(userEmail: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          monthlyConsultations: user.monthlyConsultations + 1
        }
      })
      console.log('✅ 使用量を増加しました:', userEmail, user.monthlyConsultations + 1)
    }
  } catch (error) {
    console.error("❌ 使用量増加エラー:", error)
    throw error
  }
}

/**
 * 機能がプランで利用可能かチェック
 * @param planFeatures プランの機能設定
 * @param featureName チェックする機能名
 * @returns 利用可能かどうか
 */
export function hasFeatureAccess(
  planFeatures: Record<string, boolean>, 
  featureName: string
): boolean {
  return planFeatures[featureName] === true
}

/**
 * プラン階層レベルを取得
 * @param planName プラン名
 * @returns プラン階層レベル（数値が大きいほど上位）
 */
export function getPlanLevel(planName: string): number {
  const planLevels: Record<string, number> = {
    'free': 0,
    'basic': 1,
    'ベーシック': 1,
    'pro': 2,
    'プロ': 2,
    'enterprise': 3,
    'エンタープライズ': 3
  }
  
  return planLevels[planName.toLowerCase()] || 0
}

/**
 * @param featureName 
 * @returns 
 */
export function getRequiredPlanLevel(featureName: string): number {
  const featureRequirements: Record<string, number> = {
    'aiAnalysis': 1,           
    'csvUpload': 0,            
    'basicCharts': 0,          
    'abcAnalysis': 2,          
    'combinationAnalysis': 2,  
    'seasonalAnalysis': 2,     
    'prediction': 2,           
    'anomalyDetection': 3,     
    'exportData': 2,           
    'advancedReports': 3,      
  }
  
  return featureRequirements[featureName] || 999
}

/**
 * @param planName プラン名
 * @param featureName 機能名
 * @returns アクセス可能かどうか
 */
export function checkFeatureAccessByPlanName(
  planName: string, 
  featureName: string
): boolean {
  const currentLevel = getPlanLevel(planName)
  const requiredLevel = getRequiredPlanLevel(featureName)
  
  return currentLevel >= requiredLevel
}

/**
 * @param userEmail ユーザーのメールアドレス
 * @returns 使用量詳細情報
 */
export async function getUsageDetails(userEmail: string): Promise<{
  current: number
  limit: number
  remaining: number
  percentage: number
  isNearLimit: boolean
  nextResetDate: Date
} | null> {
  try {
    const planCheck = await checkPlanLimits(userEmail)
    
    if (!planCheck.hasAccess && !planCheck.usage) {
      return null
    }
    
    const { current, limit } = planCheck.usage
    const remaining = limit === -1 ? 999999 : limit - current
    const percentage = limit === -1 ? 0 : (current / limit) * 100
    const isNearLimit = percentage >= 80
    
    const now = new Date()
    const nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    
    return {
      current,
      limit,
      remaining,
      percentage,
      isNearLimit,
      nextResetDate
    }
    
  } catch (error) {
    console.error("❌ 使用量詳細取得エラー:", error)
    return null
  }
}