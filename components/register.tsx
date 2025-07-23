"use client"

import { useState } from "react"
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signIn } from "next-auth/react"
import Link from "next/link"

interface FormData {
  name: string
  email: string
  password: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  general?: string
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", password: "" })
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = () => {
    const newErrors: FormErrors = {}
    if (!formData.name || formData.name.length < 2) newErrors.name = "2文字以上の名前を入力してください"
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "有効なメールアドレスを入力してください"
    if (!formData.password || formData.password.length < 6) newErrors.password = "パスワードは6文字以上にしてください"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      console.log('🚀 登録処理開始:', { name: formData.name, email: formData.email })
      
      const registerRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (registerRes.ok) {
        console.log('✅ 登録成功 - 自動ログイン開始')
        
        const signInResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false 
        })

        console.log('🔐 ログイン結果:', signInResult)

        if (signInResult?.ok && !signInResult?.error) {
          console.log('✅ 自動ログイン成功 - トップページに遷移')
          
          window.location.href = "/"
        } else {
          console.error('❌ 自動ログイン失敗:', signInResult?.error)
          
          setErrors({ 
            general: "登録は成功しましたが、自動ログインに失敗しました。ログインページから手動でログインしてください。" 
          })
          
          setTimeout(() => {
            window.location.href = "/signin"
          }, 3000)
        }
      } else {
        const data = await registerRes.json()
        console.error('❌ 登録失敗:', data)
        setErrors({ general: data.message || "登録に失敗しました" })
      }
    } catch (error) {
      console.error('❌ 登録処理エラー:', error)
      setErrors({ general: "エラーが発生しました。もう一度お試しください。" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-teal-600 transition-colors">
              RestConcierge
            </h1>
          </Link>
          <p className="text-gray-600">飲食店経営をAIでサポート</p>
        </div> 
        
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">新規登録</CardTitle>
            <CardDescription className="text-center text-gray-600">
              アカウントを作成してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {errors.general && (
              <Alert className={errors.general.includes('成功') ? 'border-green-200 bg-green-50' : ''}>
                <AlertDescription className={errors.general.includes('成功') ? 'text-green-700' : ''}>
                  {errors.general}
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">名前</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    placeholder="お名前を入力してください"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    placeholder="メールアドレスを入力してください"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">パスワード</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password} 
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                    placeholder="パスワードを入力してください"
                    disabled={isLoading}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    登録中...
                  </div>
                ) : (
                  "アカウントを作成"
                )}
              </Button>
            </form>
            
            <div className="text-center text-sm">
              <span className="text-gray-600">すでにアカウントをお持ちですか？ </span>
              <Link href="/signin" className="text-teal-600 hover:underline font-medium">
                ログイン
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}