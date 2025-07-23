"use client"

import { MessageCircle, Bot, Sparkles, Store, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StoreProfile } from "@/types/store-settings"
import { isValidStoreProfile } from "@/lib/utils"

interface ChatEmptyStateProps {
  onStartChat: () => void
  storeProfile?: StoreProfile
  onQuestionSelect?: (question: string) => void
}

export default function ChatEmptyState({ onStartChat, storeProfile, onQuestionSelect }: ChatEmptyStateProps) {
  const hasStoreProfile = storeProfile && isValidStoreProfile(storeProfile)
  
  const getSuggestedQuestions = () => {
    if (!hasStoreProfile) {
      return [
        "売上を向上させるにはどうすればいいですか？",
        "効果的な集客方法を教えてください",
        "コスト削減のアドバイスをください",
        "メニュー開発のヒントをください"
      ]
    }

    const questions = []

    if (storeProfile.type.includes("カフェ") || storeProfile.type.includes("喫茶")) {
      questions.push("カフェの回転率を上げる方法は？")
      questions.push("コーヒー以外の収益源はありますか？")
    } else if (storeProfile.type.includes("レストラン") || storeProfile.type.includes("料理")) {
      questions.push("ディナータイムの売上を増やすには？")
      questions.push("リピーター獲得の秘訣は？")
    } else if (storeProfile.type.includes("居酒屋") || storeProfile.type.includes("バー")) {
      questions.push("平日の集客を増やすには？")
      questions.push("宴会需要を取り込む方法は？")
    } else {
      questions.push(`${storeProfile.type}の売上向上策は？`)
    }


    if (storeProfile.averageSpend) {
      if (storeProfile.averageSpend < 1000) {
        questions.push("客単価を上げる具体的な方法は？")
      } else if (storeProfile.averageSpend > 3000) {
        questions.push("高単価でも集客を維持するには？")
      }
    }

    if (storeProfile.seats) {
      if (storeProfile.seats < 20) {
        questions.push("小規模店舗の効率的な運営方法は？")
      } else if (storeProfile.seats > 50) {
        questions.push("大型店舗のオペレーション改善策は？")
      }
    }


    if (storeProfile.challenges) {
      if (storeProfile.challenges.includes("集客")) {
        questions.push("集客力を強化する具体的な施策は？")
      }
      if (storeProfile.challenges.includes("人手不足")) {
        questions.push("人手不足を解決する方法は？")
      }
      if (storeProfile.challenges.includes("コスト")) {
        questions.push("コスト削減の優先順位は？")
      }
    }


    const defaultQuestions = [
      "今の売上を分析してもらえますか？",
      "競合との差別化戦略は？",
      "スタッフのモチベーション向上策は？",
      "季節に応じた戦略を教えてください"
    ]

    const uniqueQuestions = [...new Set([...questions, ...defaultQuestions])]
    return uniqueQuestions.slice(0, 4)
  }

  const suggestedQuestions = getSuggestedQuestions()

  const handleQuestionClick = (question: string) => {
    if (onQuestionSelect) {
      onQuestionSelect(question)
    }
    onStartChat()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 bg-gray-50">
      <div className="max-w-md mx-auto text-center space-y-6">

        <div className="relative">
          <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-12 h-12 text-teal-600" />
          </div>

          <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-blue-600" />
          </div>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-yellow-600" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {hasStoreProfile ? `${storeProfile.name}のAI相談` : "AIコンサルタントがお待ちしています"}
          </h2>


          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            {hasStoreProfile 
              ? `${storeProfile.name}の経営課題について、専門的なアドバイスを提供します。`
              : "AIに相談してみましょう。あなたのお店の経営をサポートします"
            }
          </p>
        </div>

        {hasStoreProfile && (
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600">
            <Store className="w-4 h-4 text-teal-600" />
            <span>{storeProfile.type}</span>
            {storeProfile.averageSpend && (
              <>
                <span>•</span>
                <span>客単価 {storeProfile.averageSpend.toLocaleString()}円</span>
              </>
            )}
          </div>
        )}

        <div className="space-y-4">
          <p className="text-sm text-gray-500 font-medium">
            {hasStoreProfile ? "こんな質問はいかがですか？" : "こんなことを相談できます"}
          </p>
          
          {hasStoreProfile ? (
            
            <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-left text-xs h-auto py-2 px-3 bg-white hover:bg-teal-50 hover:border-teal-300 border-gray-200 text-gray-700"
                  onClick={() => handleQuestionClick(question)}
                >
                  <TrendingUp className="w-3 h-3 mr-2 text-teal-600 flex-shrink-0" />
                  <span className="truncate">{question}</span>
                </Button>
              ))}
            </div>
          ) : (

            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full border border-gray-200">
                集客方法
              </span>
              <span className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full border border-gray-200">
                メニュー開発
              </span>
              <span className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full border border-gray-200">
                売上向上
              </span>
              <span className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full border border-gray-200">
                コスト削減
              </span>
            </div>
          )}
        </div>

        <div className="pt-4">
          <Button
            onClick={onStartChat}
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {hasStoreProfile ? "相談を始める" : "相談を始める"}
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-gray-400">24時間いつでも相談可能 • 無料でご利用いただけます</p>
          {!hasStoreProfile && (
            <p className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
              💡 より具体的なアドバイスを受けるには、店舗情報を設定することをお勧めします
            </p>
          )}
        </div>
      </div>
    </div>
  )
}