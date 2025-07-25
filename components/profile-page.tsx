"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { 
  User, Edit, Save, X, LogOut, Crown, MessageCircle, Calendar, Check, Settings, AlertCircle, CreditCard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { SubscriptionButton } from '@/components/SubscriptionButton'

interface Plan {
  id: string
  name: string
  displayName: string
  price: number
  consultationLimit: number
  features: string[]
  isActive: boolean
  sortOrder: number
  stripePriceId: string | null
}

interface UserPlanData {
  user: {
    id: string
    name: string
    email: string
    phone: string
    address: string
    createdAt: string
  }
  currentPlan: Plan | null
  usage: {
    monthlyConsultations: number
    consultationLimit: number
    nextBillingDate: string
  }
}

const usageStats = {
  totalConsultations: 156,
  favoriteTopics: ["集客", "メニュー開発", "コスト削減"],
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [userPlanData, setUserPlanData] = useState<UserPlanData | null>(null)
  const [allPlans, setAllPlans] = useState<Plan[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserPlanData()
      fetchAllPlans()
    }
  }, [session])

  const fetchUserPlanData = async () => {
    try {
      const response = await fetch('/api/user/store-settings')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        const apiData = result.data
        
        const userData: UserPlanData = {
          user: {
            id: apiData.user.id,
            name: apiData.user.name,
            email: apiData.user.email,
            phone: apiData.user.phone,
            address: apiData.user.address,
            createdAt: apiData.user.createdAt,
          },
          currentPlan: apiData.currentPlan,
          usage: {
            monthlyConsultations: apiData.usage.monthlyConsultations,
            consultationLimit: apiData.usage.consultationLimit,
            nextBillingDate: apiData.usage.nextBillingDate,
          }
        }
        
        setUserPlanData(userData)
        setFormData({
          name: userData.user.name,
          email: userData.user.email,
          phone: userData.user.phone,
          address: userData.user.address
        })
        
        console.log('✅ ユーザーデータ取得成功:', {
          planId: apiData.currentPlan?.name,
          planDisplayName: apiData.currentPlan?.displayName,
          consultations: apiData.usage.monthlyConsultations
        })
        
      } else {
        throw new Error(result.error || 'データの取得に失敗しました')
      }
      
    } catch (error) {
      console.error('ユーザーデータ取得エラー:', error)
      toast.error('ユーザー情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllPlans = async () => {
    try {
      console.log('🔧 ハードコードプラン設定を開始...')
      
      const hardcodedPlans = [
        {
          id: 'free',
          name: 'free',
          displayName: 'フリー',
          price: 0,
          consultationLimit: 5,
          features: ['AI相談 5回/月', '基本的な売上分析', 'メール支援'],
          isActive: true,
          sortOrder: 1,
          stripePriceId: null
        },
        {
          id: 'basic',
          name: 'basic',
          displayName: 'ベーシック',
          price: 1980,
          consultationLimit: 50,
          features: ['AI相談 50回/月', '詳細な売上分析', 'データエクスポート', '優先サポート'],
          isActive: true,
          sortOrder: 2,
           stripePriceId:'price_1RnFK4CdQAFUslLlbBkubFsG'
        },
        {
          id: 'pro',
          name: 'pro',
          displayName: 'プロ',
          price: 4980,
          consultationLimit: 200,
          features: ['AI相談 200回/月', '高度な分析機能', 'カスタムレポート', '専任サポート', 'API利用'],
          isActive: true,
          sortOrder: 3,
           stripePriceId:'price_1RnFNBCdQAFUslLlZhjVjpub'
        }
      ]
      
      setAllPlans(hardcodedPlans)
      console.log('✅ ハードコードプラン設定完了:', hardcodedPlans.length, '件')
      
    } catch (error) {
      console.error('❌ プラン設定エラー:', error)
      setAllPlans([
        {
          id: 'free',
          name: 'free',
          displayName: 'フリー',
          price: 0,
          consultationLimit: 5,
          features: ['AI相談 5回/月', '基本的な売上分析', 'メール支援'],
          isActive: true,
          sortOrder: 1,
          stripePriceId: null
        },
        {
          id: 'basic',
          name: 'basic',
          displayName: 'ベーシック',
          price: 1980,
          consultationLimit: 50,
          features: ['AI相談 50回/月', '詳細な売上分析', 'データエクスポート', '優先サポート'],
          isActive: true,
          sortOrder: 2,
          stripePriceId:'price_1RnFK4CdQAFUslLlbBkubFsG'
        },
        {
          id: 'pro',
          name: 'pro',
          displayName: 'プロ',
          price: 4980,
          consultationLimit: 200,
          features: ['AI相談 200回/月', '高度な分析機能', 'カスタムレポート', '専任サポート', 'API利用'],
          isActive: true,
          sortOrder: 3,
          stripePriceId:'price_1RnFNBCdQAFUslLlZhjVjpub'
        }
      ])
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (!formData.name.trim()) {
        toast.error("名前は必須です")
        return
      }

      if (userPlanData) {
        const updatedData = {
          ...userPlanData,
          user: {
            ...userPlanData.user,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
          }
        }
        setUserPlanData(updatedData)
      }

      toast.success("プロフィールが更新されました")
      setIsEditing(false)
      
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      toast.error("プロフィールの更新に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (userPlanData) {
      setFormData({
        name: userPlanData.user.name || '',
        email: userPlanData.user.email || '',
        phone: userPlanData.user.phone || '',
        address: userPlanData.user.address || ''
      })
    }
    setIsEditing(false)
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  const formatCurrency = (amount: number | null | undefined) => {
    const safeAmount = Number(amount) || 0
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(safeAmount)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return "日付不明"
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    const safeCurrentNumber = Number(current) || 0
    const safeLimitNumber = Number(limit) || 1
    return Math.min((safeCurrentNumber / safeLimitNumber) * 100, 100)
  }

  const getRemainingUsage = (current: number, limit: number) => {
    const safeCurrentNumber = Number(current) || 0
    const safeLimitNumber = Number(limit) || 0
    return Math.max(safeLimitNumber - safeCurrentNumber, 0)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ログインしていません</p>
          <Button asChild className="bg-teal-600 hover:bg-teal-700">
            <a href="/auth">ログイン</a>
          </Button>
        </div>
      </div>
    )
  }

  if (!userPlanData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">データの読み込みに失敗しました</p>
          <Button onClick={() => window.location.reload()} className="bg-teal-600 hover:bg-teal-700">
            再読み込み
          </Button>
        </div>
      </div>
    )
  }

  const monthlyConsultations = Number(userPlanData.usage?.monthlyConsultations) || 0
  const consultationLimit = Number(userPlanData.usage?.consultationLimit) || 0
  const currentPlanPrice = Number(userPlanData.currentPlan?.price) || 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">プロフィール</h1>
          <p className="text-gray-600">アカウント情報と利用状況を確認・管理できます</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-teal-600" />
                      <CardTitle className="text-lg">基本情報</CardTitle>
                    </div>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="text-teal-600 border-teal-600 hover:bg-teal-50"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        編集
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={handleCancel}>
                          <X className="w-4 h-4 mr-2" />
                          キャンセル
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleSave} 
                          className="bg-teal-600 hover:bg-teal-700"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              保存中...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              保存
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-6">
                    <Avatar className="w-16 h-16">
                      {session?.user?.image ? (
                        <AvatarImage src={session.user.image} alt={formData.name} />
                      ) : (
                        <AvatarFallback className="bg-teal-100 text-teal-600 text-xl font-bold">
                          {formData.name ? formData.name.slice(0, 2) : "US"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{formData.name || "名前未設定"}</h3>
                      <Badge className="bg-blue-100 text-blue-800">
                        {userPlanData.currentPlan?.displayName || "未設定"}プラン
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        お名前
                      </Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="mt-1"
                          placeholder="お名前を入力してください"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{formData.name || "未設定"}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        メールアドレス
                      </Label>
                      <p className="mt-1 text-gray-900">{formData.email}</p>
                      <p className="text-xs text-gray-500 mt-1">※メールアドレスは変更できません</p>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        電話番号
                      </Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="mt-1"
                          placeholder="電話番号を入力してください"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{formData.phone || "未設定"}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                        住所
                      </Label>
                      {isEditing ? (
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="mt-1"
                          placeholder="住所を入力してください"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{formData.address || "未設定"}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">利用統計</CardTitle>
                  <CardDescription>これまでの利用状況</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-teal-50 rounded-lg">
                      <p className="text-2xl font-bold text-teal-600">{usageStats.totalConsultations}</p>
                      <p className="text-sm text-teal-700">総相談回数</p>
                    </div>

                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{monthlyConsultations}</p>
                      <p className="text-sm text-blue-700">今月の相談回数</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-600">
                        {getRemainingUsage(monthlyConsultations, consultationLimit)}
                      </p>
                      <p className="text-sm text-gray-700">残り利用可能回数</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">よく相談するトピック</p>
                      <div className="flex flex-wrap gap-1">
                        {usageStats.favoriteTopics.map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">アカウント情報</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">登録日</span>
                      <span className="text-gray-900">
                        {formatDate(userPlanData.user.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">現在のプラン</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {userPlanData.currentPlan?.displayName || "未設定"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">月額料金</span>
                      <span className="text-gray-900">
                        {formatCurrency(currentPlanPrice)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                <CardTitle className="text-lg">プラン変更・決済</CardTitle>
              </div>
              <CardDescription>プランの変更と決済手続きを行えます</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {allPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      userPlanData.currentPlan?.name === plan.name 
                        ? "border-teal-500 bg-teal-50" 
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {userPlanData.currentPlan?.name === plan.name && (
                      <Badge className="absolute -top-3 left-4 bg-teal-600 text-white">
                        <Check className="w-3 h-3 mr-1" />
                        現在のプラン
                      </Badge>
                    )}
                    
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.displayName}</h3>
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl font-bold text-gray-900">{formatCurrency(plan.price)}</span>
                        <span className="text-gray-500 ml-1">/月</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-2 mb-6">
                      {plan.features && Array.isArray(plan.features) ? plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      )) : (
                        <li className="flex items-center text-sm text-gray-500">
                          機能情報を読み込み中...
                        </li>
                      )}
                    </ul>

                    <SubscriptionButton
                      planName={plan.name}
                      planDisplayName={plan.displayName}
                      price={plan.price}
                      currentPlan={userPlanData.currentPlan?.name}
                      stripePriceId={plan.stripePriceId}
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">決済について</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 安全なStripe決済システムを使用</li>
                      <li>• 毎月自動更新（いつでも解約可能）</li>
                      <li>• アップグレード時は即座に機能が利用可能</li>
                      <li>• 返金ポリシーは利用規約をご確認ください</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg">今月の利用状況</CardTitle>
              </div>
              <CardDescription>現在の利用状況と次回更新日</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">AI相談回数</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {monthlyConsultations}
                      <span className="text-sm font-normal text-gray-500">/{consultationLimit}</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getUsagePercentage(monthlyConsultations, consultationLimit) >= 80
                          ? "bg-red-500" 
                          : getUsagePercentage(monthlyConsultations, consultationLimit) >= 60
                          ? "bg-yellow-500" 
                          : "bg-teal-600"
                      }`}
                      style={{
                        width: `${getUsagePercentage(monthlyConsultations, consultationLimit)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    残り{getRemainingUsage(monthlyConsultations, consultationLimit)}回利用可能
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">次回更新日</span>
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {formatDate(userPlanData.usage.nextBillingDate)}
                  </p>
                  <p className="text-xs text-gray-500">自動更新されます</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-4 pt-6">
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <LogOut className="w-5 h-5 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

