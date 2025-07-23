import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-teal-400 mb-4">RestConcierge</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                AIで飲食店経営をサポートする次世代のコンサルティングサービス。
                売上データの分析から経営改善のアドバイスまで、24時間いつでも経営の悩みを相談できます。
                
              </p>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-teal-400 font-semibold mb-2">主な機能</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• AIによる売上データ分析</li>
                  <li>• 24時間対応のチャット相談</li>
                  <li>• カスタマイズ可能なダッシュボード</li>
                  <li>• 経営改善提案と実行支援</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-white mb-4">お問い合わせ</h4>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">メール</p>
                  <Link
                    href="mailto:support@restconcierge.com"
                    className="text-white hover:text-teal-400 transition-colors duration-200"
                  >
                    restconcierge1030@gmail.com
                  </Link>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">住所</p>
                  <p className="text-white text-sm">
                    東京都大田区東矢口３丁目 3-10
                    <br />
                    RestConciergeビル 5F
                  </p>
                </div>
              </div>
            </div>

            
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
              <Link href="#" className="text-gray-300 hover:text-teal-400 transition-colors duration-200">
                利用規約
              </Link>
              <Link href="#" className="text-gray-300 hover:text-teal-400 transition-colors duration-200">
                プライバシーポリシー
              </Link>
              <Link href="#" className="text-gray-300 hover:text-teal-400 transition-colors duration-200">
                特定商取引法に基づく表記
              </Link>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">© 2025 RestConcierge. All rights reserved.</p>
              <p className="text-gray-500 text-xs mt-1">Powered by AI Technology</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}