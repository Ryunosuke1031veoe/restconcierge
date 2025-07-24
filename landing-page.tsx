// import { MessageCircle, ClipboardList, TrendingUp } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import Header from "./components/header"
// import Footer from "./components/footer"

// export default function Component() {
//   return (
//     <div className="min-h-screen bg-white">

//       <Header />

//       <header className="container mx-auto px-4 py-16 text-center">
//         <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">RestConcierge</h1>
//         <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">AIで飲食店経営をサポート</p>
//       </header>

//       <section className="container mx-auto px-4 py-16">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
//           <Card className="rounded-2xl shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300">
//             <CardHeader className="text-center pb-4">
//               <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <MessageCircle className="w-8 h-8 text-teal-600" />
//               </div>
//               <CardTitle className="text-xl font-bold text-gray-900">AIとチャットで相談</CardTitle>
//             </CardHeader>
//             <CardContent className="text-center">
//               <CardDescription className="text-gray-600 text-base leading-relaxed">
//                 24時間いつでもAIアシスタントに経営の悩みを相談できます。リアルタイムで的確なアドバイスを受けられます。
//               </CardDescription>
//             </CardContent>
//           </Card>

//           <Card className="rounded-2xl shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300">
//             <CardHeader className="text-center pb-4">
//               <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <ClipboardList className="w-8 h-8 text-teal-600" />
//               </div>
//               <CardTitle className="text-xl font-bold text-gray-900">メニューや業務のアドバイス</CardTitle>
//             </CardHeader>
//             <CardContent className="text-center">
//               <CardDescription className="text-gray-600 text-base leading-relaxed">
//                 メニュー開発から店舗運営まで、AIが豊富なデータに基づいて最適な改善提案を行います。
//               </CardDescription>
//             </CardContent>
//           </Card>

//           <Card className="rounded-2xl shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300">
//             <CardHeader className="text-center pb-4">
//               <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <TrendingUp className="w-8 h-8 text-teal-600" />
//               </div>
//               <CardTitle className="text-xl font-bold text-gray-900">売上アップのマーケティング提案</CardTitle>
//             </CardHeader>
//             <CardContent className="text-center">
//               <CardDescription className="text-gray-600 text-base leading-relaxed">
//                 顧客データを分析し、効果的なプロモーション戦略や集客方法を提案して売上向上をサポートします。
//               </CardDescription>
//             </CardContent>
//           </Card>
//         </div>
//       </section>

//       <section className="container mx-auto px-4 py-16 text-center">
//         <div className="max-w-2xl mx-auto">
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
//             今すぐ始めて、お店の可能性を広げましょう
//           </h2>
//           <p className="text-lg text-gray-600 mb-8">初期費用無料で、すぐにAIコンサルティングを体験できます</p>
//           <Button
//             size="lg"
//             className="bg-teal-600 hover:bg-teal-700 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
//           >
//             無料ではじめる
//           </Button>
//         </div>
//       </section>
//       <Footer />
      
//     </div>
//   )
// }
"use client"
import { MessageCircle, ClipboardList, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "./components/header"
import Footer from "./components/footer"

export default function Component() {
  return (
    <div className="min-h-screen bg-white ">
      <Header />

      <header className="container mx-auto px-4 text-center" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <h1 
          className="text-4xl md:text-6xl font-bold text-gray-900 mt-8 mb-4"
          style={{ fontWeight: '700', fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '1rem' }}
        >
          RestConcierge
        </h1>
        <p 
          className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto"
          style={{ fontWeight: '400', fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', color: '#6b7280' }}
        >
          AIで飲食店経営をサポート
        </p>
      </header>

      <section className="container mx-auto px-4" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}
          className="grid-responsive"
        >
          <style jsx>{`
            @media (min-width: 768px) {
              .grid-responsive {
                grid-template-columns: repeat(3, 1fr) !important;
                gap: 2.5rem !important;
              }
            }
          `}</style>

          <Card 
            className="rounded-2xl shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300"
            style={{ margin: '0', padding: '2rem 1.5rem' }}
          >
            <CardHeader className="text-center pb-4" style={{ paddingBottom: '1rem' }}>
              <div 
                className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto"
                style={{ marginBottom: '1.5rem', width: '4rem', height: '4rem' }}
              >
                <MessageCircle className="w-8 h-8 text-teal-600" />
              </div>
              <CardTitle 
                className="text-xl font-bold text-gray-900"
                style={{ 
                  marginBottom: '1rem', 
                  fontSize: '1.25rem', 
                  fontWeight: '600',
                  lineHeight: '1.4',
                  color: '#111827'
                }}
              >
                AIとチャットで相談
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center" style={{ padding: '0' }}>
              <CardDescription 
                className="text-gray-600 text-base leading-relaxed"
                style={{ 
                  lineHeight: '1.6', 
                  fontSize: '1rem',
                  fontWeight: '400',
                  color: '#6b7280'
                }}
              >
                24時間いつでもAIアシスタントに経営の悩みを相談できます。リアルタイムで的確なアドバイスを受けられます。
              </CardDescription>
            </CardContent>
          </Card>

          <Card 
            className="rounded-2xl shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300"
            style={{ margin: '0', padding: '2rem 1.5rem' }}
          >
            <CardHeader className="text-center pb-4" style={{ paddingBottom: '1rem' }}>
              <div 
                className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto"
                style={{ marginBottom: '1.5rem', width: '4rem', height: '4rem' }}
              >
                <ClipboardList className="w-8 h-8 text-teal-600" />
              </div>
              <CardTitle 
                className="text-xl font-bold text-gray-900"
                style={{ 
                  marginBottom: '1rem', 
                  fontSize: '1.25rem', 
                  fontWeight: '600',
                  lineHeight: '1.4',
                  color: '#111827'
                }}
              >
                メニューや業務のアドバイス
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center" style={{ padding: '0' }}>
              <CardDescription 
                className="text-gray-600 text-base leading-relaxed"
                style={{ 
                  lineHeight: '1.6', 
                  fontSize: '1rem',
                  fontWeight: '400',
                  color: '#6b7280'
                }}
              >
                メニュー開発から店舗運営まで、AIが豊富なデータに基づいて最適な改善提案を行います。
              </CardDescription>
            </CardContent>
          </Card>

          <Card 
            className="rounded-2xl shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300"
            style={{ margin: '0', padding: '2rem 1.5rem' }}
          >
            <CardHeader className="text-center pb-4" style={{ paddingBottom: '1rem' }}>
              <div 
                className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto"
                style={{ marginBottom: '1.5rem', width: '4rem', height: '4rem' }}
              >
                <TrendingUp className="w-8 h-8 text-teal-600" />
              </div>
              <CardTitle 
                className="text-xl font-bold text-gray-900"
                style={{ 
                  marginBottom: '1rem', 
                  fontSize: '1.25rem', 
                  fontWeight: '600',
                  lineHeight: '1.4',
                  color: '#111827'
                }}
              >
                売上アップのマーケティング提案
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center" style={{ padding: '0' }}>
              <CardDescription 
                className="text-gray-600 text-base leading-relaxed"
                style={{ 
                  lineHeight: '1.6', 
                  fontSize: '1rem',
                  fontWeight: '400',
                  color: '#6b7280'
                }}
              >
                顧客データを分析し、効果的なプロモーション戦略や集客方法を提案して売上向上をサポートします。
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      <section 
        className="container mx-auto px-4 text-center"
        style={{ paddingTop: '12rem', paddingBottom: '12rem' }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ 
              marginBottom: '1.5rem',
              fontWeight: '700',
              fontSize: 'clamp(1.875rem, 4vw, 2.5rem)',
              color: '#111827'
            }}
          >
            今すぐ始めて、お店の可能性を広げましょう
          </h2>
          <p 
            className="text-lg text-gray-600"
            style={{ 
              marginBottom: '2rem', 
              lineHeight: '1.6',
              fontWeight: '400',
              fontSize: '1.125rem',
              color: '#6b7280'
            }}
          >
            初期費用無料で、すぐにAIコンサルティングを体験できます
          </p>
          <Button
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            style={{
              fontWeight: '600',
              fontSize: '1.125rem'
            }}
          >
            無料ではじめる
          </Button>
        </div>
      </section>
      <Footer />
    </div>
  )
}