import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
})

export function getStripePriceId(planName: string): string | null {
  console.log('🔍 価格ID取得開始 - プラン名:', planName)
  
  const priceIds: Record<string, string> = {
    
    
    'basic': 'price_1RnFK4CdQAFUslLlbBkubFsG', 
    'pro': 'price_1RnFNBCdQAFUslLlZhjVjpub',     
    'free': '', 
  }
  
  const priceId = priceIds[planName] || null
  
  console.log('📋 価格ID設定一覧:', priceIds)
  console.log('🎯 選択された価格ID:', { planName, priceId })
  
  
  if (priceId && (priceId.includes('yyyyy') || priceId.includes('zzzzz') || priceId.includes('1234567890'))) {
    console.error('❌ テンプレート価格IDが使用されています:', priceId)
    console.error('Stripeダッシュボードから実際の価格IDを取得して設定してください')
    return null
  }
  
  return priceId || null
}


export function debugPriceIds() {
  console.log('=== 現在の価格ID設定 ===')
  const plans = ['free', 'basic', 'pro']
  plans.forEach(plan => {
    const priceId = getStripePriceId(plan)
    console.log(`${plan}: ${priceId || 'null'}`)
  })
  console.log('========================')
}


export async function validateStripePriceId(priceId: string): Promise<boolean> {
  try {
    console.log('🔍 Stripe価格ID検証中:', priceId)
    const price = await stripe.prices.retrieve(priceId)
    console.log('✅ 価格ID検証成功:', {
      id: price.id,
      amount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval
    })
    return true
  } catch (error) {
    console.error('❌ 価格ID検証失敗:', {
      priceId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return false
  }
}