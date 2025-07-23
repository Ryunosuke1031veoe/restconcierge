import { MessageCircle, ClipboardList, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "./components/header"
import Footer from "./components/footer"

export default function Component() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <header className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">RestConcierge</h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">AIで飲食店経営をサポート</p>
      </header>

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="rounded-2xl shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-teal-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">AIとチャットで相談</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                24時間いつでもAIアシスタントに経営の悩みを相談できます。リアルタイムで的確なアドバイスを受けられます。
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-teal-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">メニューや業務のアドバイス</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                メニュー開発から店舗運営まで、AIが豊富なデータに基づいて最適な改善提案を行います。
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-teal-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">売上アップのマーケティング提案</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                顧客データを分析し、効果的なプロモーション戦略や集客方法を提案して売上向上をサポートします。
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            今すぐ始めて、お店の可能性を広げましょう
          </h2>
          <p className="text-lg text-gray-600 mb-8">初期費用無料で、すぐにAIコンサルティングを体験できます</p>
          <Button
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            無料ではじめる
          </Button>
        </div>
      </section>
      <Footer />
      
    </div>
  )
}
