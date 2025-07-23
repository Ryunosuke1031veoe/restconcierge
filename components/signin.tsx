"use client"

import { useState } from "react"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { signIn } from "next-auth/react"

export default function SignIn() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({ email: "", password: "", general: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const res = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
      callbackUrl: "/profile",
    })

    if (res?.error) {
      setErrors((prev) => ({ ...prev, general: "メールまたはパスワードが間違っています" }))
    } else if (res?.ok) {
      window.location.href = "/profile"
    }
    setIsLoading(false)
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
          <CardTitle className="text-2xl font-bold text-center text-gray-900">ログイン</CardTitle>
          <CardDescription className="text-center">メールとパスワードでログイン</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.general && <Alert><AlertDescription>{errors.general}</AlertDescription></Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  メールアドレス
                </Label>
                  <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">パスワード</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">{isLoading ? "ログイン中..." : "ログイン"}</Button>
          </form>
          <div className="text-center text-sm">
            <Link href="/register" className="text-teal-600 hover:underline">アカウントをお持ちでない方はこちら</Link>
          </div>
        </CardContent>
      </Card>

      </div>
    </div>
  )
}
