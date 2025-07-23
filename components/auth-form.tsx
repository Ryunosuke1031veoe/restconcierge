"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthForm() {
  const { data: session, status } = useSession()
  const router = useRouter()

  
  useEffect(() => {
  console.log("session:", session)
  console.log("status:", status)
    if (status === "authenticated") {
      router.push("/profile")
    }
  }, [status, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-gray-900">
            RestConcierge ログイン
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "authenticated" ? (
            <>
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <AlertDescription>
                  {session.user?.email} でログインしています
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                ログアウト
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => signIn("google", { callbackUrl: "/profile" })}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              >
                Googleでログイン
              </Button>
              <p className="text-sm text-center text-gray-500">
                アカウントをお持ちでない場合、ログイン時に自動で作成されます。
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
