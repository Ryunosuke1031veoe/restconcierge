"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Save, Store, Clock, Users, DollarSign, AlertCircle, Crown, MessageCircle, Calendar, Check, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

const storeTypes = [
  "ラーメン店",
  "カフェ・喫茶店",
  "居酒屋",
  "レストラン",
  "ファストフード",
  "焼肉店",
  "寿司店",
  "イタリアン",
  "フレンチ",
  "中華料理",
  "その他",
]

const challengeOptions = [
  { id: "customer-acquisition", label: "集客・新規顧客獲得" },
  { id: "sales-improvement", label: "売上向上" },
  { id: "menu-development", label: "メニュー開発・改善" },
  { id: "staff-shortage", label: "人手不足" },
  { id: "cost-management", label: "コスト管理" },
  { id: "customer-service", label: "接客・サービス向上" },
  { id: "marketing", label: "マーケティング・宣伝" },
  { id: "operations", label: "業務効率化" },
]

interface StoreSettingsData {
  storeName: string
  storeType: string
  averageSpend: string
  seats: string
  businessHours: string
  challenges: string[]
}

export default function SettingsForm() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState<StoreSettingsData>({
    storeName: "",
    storeType: "",
    averageSpend: "",
    seats: "",
    businessHours: "",
    challenges: [],
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // 認証チェック
  useEffect(() => {
    if (status === "loading") return // まだ認証状態を確認中

    if (status === "unauthenticated") {
      console.log("未ログイン状態のため、新規登録ページにリダイレクト")
      router.push("/signin")
      return
    }

    // ログイン済みの場合のみデータを読み込み
    if (status === "authenticated") {
      loadStoreSettings()
    }
  }, [status, router])

  const loadStoreSettings = async () => {
    if (!session) {
      console.log("セッション情報がないため、データ読み込みをスキップ")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/user/store-settings')
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log("認証エラー - 新規登録ページにリダイレクト")
          router.push("/register")
          return
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        const { data } = result
        setFormData({
          storeName: data.storeName || "",
          storeType: data.storeType || "",
          averageSpend: data.averageSpend ? data.averageSpend.toString() : "",
          seats: data.seats ? data.seats.toString() : "",
          businessHours: data.businessHours || "",
          challenges: data.challenges || [],
        })
        setIsFirstTime(data.isFirstTime)
        setLastUpdated(data.lastUpdated)
        
        if (data.isFirstTime) {
          toast.info("初回設定です。店舗情報を入力してAI分析の精度を向上させましょう！")
        }
      } else {
        setError(result.error || '設定の読み込みに失敗しました')
      }
    } catch (error) {
      console.error('設定読み込みエラー:', error)
      
      // 401エラーの場合は新規登録ページにリダイレクト
      if (error instanceof Error && error.message.includes('401')) {
        console.log("401エラーのため、新規登録ページにリダイレクト")
        router.push("/register")
        return
      }
      
      setError('設定の読み込み中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof StoreSettingsData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    
    if (error) setError(null)
    if (successMessage) setSuccessMessage(null)
  }

  const handleChallengeChange = (challengeId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      challenges: checked 
        ? [...prev.challenges, challengeId] 
        : prev.challenges.filter((id) => id !== challengeId),
    }))
  }

  const validateForm = (): string | null => {
    if (!formData.storeName.trim()) {
      return "店舗名を入力してください"
    }
    
    if (!formData.storeType) {
      return "店舗の種類を選択してください"
    }
    
    if (formData.averageSpend && isNaN(Number(formData.averageSpend))) {
      return "平均客単価は数値で入力してください"
    }
    
    if (formData.seats && isNaN(Number(formData.seats))) {
      return "席数は数値で入力してください"
    }
    
    if (formData.averageSpend && Number(formData.averageSpend) < 0) {
      return "平均客単価は0以上の値を入力してください"
    }
    
    if (formData.seats && Number(formData.seats) < 0) {
      return "席数は0以上の値を入力してください"
    }
    
    return null
  }

  const handleSave = async () => {
    if (!session) return

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const requestData = {
        storeName: formData.storeName.trim(),
        storeType: formData.storeType,
        averageSpend: formData.averageSpend ? Number(formData.averageSpend) : 0,
        seats: formData.seats ? Number(formData.seats) : 0,
        businessHours: formData.businessHours.trim(),
        challenges: formData.challenges,
      }

      const response = await fetch('/api/user/store-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/register")
          return
        }
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setSuccessMessage(result.message)
        setLastUpdated(result.data.lastUpdated)
        setIsFirstTime(false)
        
        toast.success(isFirstTime ? "店舗設定が完了しました！" : "設定を更新しました")
        
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(result.error || '保存に失敗しました')
        toast.error(result.error || '保存に失敗しました')
      }
    } catch (error) {
      console.error('保存エラー:', error)
      const errorMessage = '保存中にエラーが発生しました'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!session) return
    
    if (!confirm('店舗設定をリセットしますか？この操作は取り消せません。')) {
      return
    }

    try {
      const response = await fetch('/api/user/store-settings', {
        method: 'DELETE',
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/register")
          return
        }
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setFormData({
          storeName: "",
          storeType: "",
          averageSpend: "",
          seats: "",
          businessHours: "",
          challenges: [],
        })
        setLastUpdated(null)
        setIsFirstTime(true)
        toast.success("設定をリセットしました")
      } else {
        toast.error(result.error || 'リセットに失敗しました')
      }
    } catch (error) {
      console.error('リセットエラー:', error)
      toast.error('リセット中にエラーが発生しました')
    }
  }

  // 認証状態チェック中
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    )
  }

  // 未ログインの場合（通常はリダイレクトされるが念のため）
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">ログインが必要です</p>
          <Button onClick={() => router.push("/register")}>
            新規登録
          </Button>
        </div>
      </div>
    )
  }

  // データ読み込み中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">設定を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">店舗設定</h1>
          <p className="text-gray-600">
            店舗情報を入力して、より精度の高いAIアドバイスを受けましょう
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              最終更新: {new Date(lastUpdated).toLocaleString('ja-JP')}
            </p>
          )}
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Check className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {isFirstTime && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <MessageCircle className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>ようこそ！</strong> 店舗情報を設定すると、AIがあなたの店舗に特化したアドバイスを提供できます。
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-teal-600" />
                <CardTitle className="text-lg">店舗名 <span className="text-red-500">*</span></CardTitle>
              </div>
              <CardDescription>お店の名前を入力してください</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={formData.storeName}
                onChange={(e) => handleInputChange("storeName", e.target.value)}
                placeholder="例: カフェ・ドゥ・パリ"
                className="text-base"
                required
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-teal-600" />
                <CardTitle className="text-lg">店舗の種類 <span className="text-red-500">*</span></CardTitle>
              </div>
              <CardDescription>業態を選択してください</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={formData.storeType} onValueChange={(value) => handleInputChange("storeType", value)}>
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="業態を選択" />
                </SelectTrigger>
                <SelectContent>
                  {storeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-teal-600" />
                  <CardTitle className="text-lg">平均客単価</CardTitle>
                </div>
                <CardDescription>1人あたりの平均支払い金額</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.averageSpend}
                    onChange={(e) => handleInputChange("averageSpend", e.target.value)}
                    placeholder="1200"
                    className="text-base pr-12"
                    min="0"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">円</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  <CardTitle className="text-lg">席数</CardTitle>
                </div>
                <CardDescription>店内の総席数</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.seats}
                    onChange={(e) => handleInputChange("seats", e.target.value)}
                    placeholder="32"
                    className="text-base pr-12"
                    min="0"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">席</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-teal-600" />
                <CardTitle className="text-lg">営業時間</CardTitle>
              </div>
              <CardDescription>営業時間を入力してください</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={formData.businessHours}
                onChange={(e) => handleInputChange("businessHours", e.target.value)}
                placeholder="例: 9:00 - 21:00"
                className="text-base"
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-teal-600" />
                <CardTitle className="text-lg">現在の課題</CardTitle>
              </div>
              <CardDescription>お店が抱えている課題を選択してください（複数選択可）</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challengeOptions.map((challenge) => (
                  <div key={challenge.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={challenge.id}
                      checked={formData.challenges.includes(challenge.id)}
                      onCheckedChange={(checked) => handleChallengeChange(challenge.id, checked as boolean)}
                    />
                    <Label
                      htmlFor={challenge.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {challenge.label}
                    </Label>
                  </div>
                ))}
              </div>
              
              {formData.challenges.length > 0 && (
                <div className="mt-4 p-3 bg-teal-50 rounded-lg">
                  <p className="text-sm text-teal-700 font-medium mb-2">選択された課題:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.challenges.map((challengeId) => {
                      const challenge = challengeOptions.find(c => c.id === challengeId)
                      return challenge ? (
                        <Badge key={challengeId} variant="outline" className="bg-white">
                          {challenge.label}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white px-12 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {isFirstTime ? '設定を完了' : '設定を保存'}
                </>
              )}
            </Button>
            
            {!isFirstTime && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="text-gray-600 border-gray-300 hover:bg-gray-50 px-8 py-3 text-lg rounded-xl"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                設定をリセット
              </Button>
            )}
            
            <Button
              onClick={loadStoreSettings}
              variant="ghost"
              size="lg"
              className="text-teal-600 hover:bg-teal-50 px-8 py-3 text-lg rounded-xl"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              再読み込み
            </Button>
          </div>
          
          {!isFirstTime && lastUpdated && (
            <Card className="shadow-sm border-0 bg-gradient-to-r from-teal-50 to-blue-50 mt-8">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <MessageCircle className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      💡 次のステップ
                    </h3>
                    <p className="text-gray-700 mb-3">
                      店舗設定が完了しました！以下の機能をお試しください：
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>売上データをアップロードしてAI分析を実行</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>設定した課題に基づいた個別アドバイスを確認</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>業態に特化した分析結果を取得</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
