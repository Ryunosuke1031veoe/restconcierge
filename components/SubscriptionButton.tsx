import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SubscriptionButtonProps {
  planName: string
  planDisplayName: string
  price: number
  currentPlan: string | undefined
  stripePriceId: string | null 
}

export const SubscriptionButton = ({ 
  planName, 
  planDisplayName, 
  price, 
  currentPlan,
  stripePriceId 
}: SubscriptionButtonProps) => {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    console.log('=== 決済処理開始 ===')
    console.log('プラン名:', planName)
    console.log('現在のプラン:', currentPlan)

    if (currentPlan === planName) {
      toast.info('すでにこのプランをご利用中です')
      return
    }

    if (planName === 'free') {
      try {
        setLoading(true)
        const response = await fetch('/api/stripe/cancel-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          toast.success('フリープランに変更しました')
          window.location.reload()
        } else {
          throw new Error('プラン変更に失敗しました')
        }
      } catch (error) {
        toast.error('プラン変更に失敗しました')
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
      return
    }

    try {
      setLoading(true)
      
      console.log('🚀 サブスクリプション作成リクエスト送信')
      console.log('送信データ:', { planName })
      
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName: planName, 
        }),
      })

      console.log('API レスポンス状態:', response.status)
      const data = await response.json()
      console.log('API レスポンスデータ:', data)

      if (!response.ok) {
        throw new Error(data.error || '決済処理の開始に失敗しました')
      }

      if (data.url) {
        console.log('✅ Stripe URL取得成功:', data.url)
        window.location.href = data.url
      } else {
        throw new Error('決済URLの取得に失敗しました')
      }

    } catch (error) {
      console.error('❌ 決済エラー詳細:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        planName: planName
      })
      toast.error(`決済処理中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const getButtonText = () => {
    if (currentPlan === planName) return '現在のプラン'
    if (planName === 'free') return 'フリープランに変更'
    if (currentPlan === 'free') return `${planDisplayName}にアップグレード`
    return `${planDisplayName}に変更`
  }

  const isDisabled = currentPlan === planName || loading

  return (
    <Button
      onClick={handleSubscribe}
      disabled={isDisabled}
      className={`w-full ${
        currentPlan === planName 
          ? 'bg-gray-400 cursor-not-allowed' 
          : planName === 'free'
          ? 'bg-gray-600 hover:bg-gray-700'
          : 'bg-teal-600 hover:bg-teal-700'
      } text-white font-semibold py-2 px-4 rounded-lg transition-colors`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          処理中...
        </>
      ) : (
        <>
          {planName !== 'free' && <CreditCard className="w-4 h-4 mr-2" />}
          {getButtonText()}
        </>
      )}
    </Button>
  )
}