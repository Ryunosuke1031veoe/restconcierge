"use client"

import type React from "react"
import { useSession } from 'next-auth/react'
import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronUp, Send, Store, User, Bot, MessageSquare, Plus, AlertCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ChatEmptyState from "./chat-empty-state"
import Link from "next/link"
import { StoreProfile, Message, ChatSession, StoreSettingsResponse, StoreSettingsOutput } from "@/types/store-settings"
import { convertStoreSettingsToProfile, isValidStoreProfile, formatCurrency } from "@/lib/utils"

const defaultStoreProfile: StoreProfile = {
  name: "店舗名未設定",
  type: "未設定",
  location: "未設定",
  seats: 0,
  averageSpend: 0,
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(defaultStoreProfile)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [currentUsage, setCurrentUsage] = useState({ current: 0, limit: 5, remaining: 5 })
  const [usageError, setUsageError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [hasStartedChat, setHasStartedChat] = useState(false)

  const { data: session, status } = useSession()

  const fetchStoreProfile = async () => {
    try {
      setIsLoadingProfile(true)
      setProfileError(null)
      
      const res = await fetch("/api/user/store-settings")
      
      if (res.ok) {
        const result = await res.json()
        console.log('🔍 API レスポンス:', result) // デバッグ用
        
        if (result.success && result.data && result.data.storeSettings) {
          // 正しい構造でデータを取得
          const storeSettings = result.data.storeSettings
          
          // StoreSettingsOutput 形式に変換
          const settingsOutput: StoreSettingsOutput = {
            storeName: storeSettings.storeName || "",
            storeType: storeSettings.storeType || "",
            averageSpend: storeSettings.averageSpend || 0,
            seats: storeSettings.seats || 0,
            businessHours: storeSettings.businessHours || "",
            challenges: storeSettings.challenges || [],
            lastUpdated: storeSettings.lastUpdated ? new Date(storeSettings.lastUpdated) : null,
            isFirstTime: storeSettings.isFirstTime || false
          }
          
          console.log('🏪 変換前の店舗設定:', settingsOutput) // デバッグ用
          
          // StoreProfile に変換
          const profile = convertStoreSettingsToProfile(settingsOutput)
          console.log('✅ 変換後のプロフィール:', profile) // デバッグ用
          
          setStoreProfile(profile)
          
          // 使用量情報も設定
          if (result.data.usage) {
            setCurrentUsage({
              current: result.data.usage.monthlyConsultations || 0,
              limit: result.data.usage.consultationLimit || 5,
              remaining: (result.data.usage.consultationLimit || 5) - (result.data.usage.monthlyConsultations || 0)
            })
          } else {
            setCurrentUsage({
              current: 0,
              limit: 5,
              remaining: 5
            })
          }
        } else {
          // 店舗情報未設定の場合
          console.log('店舗情報未設定 - 初回ユーザー')
          setStoreProfile(defaultStoreProfile)
          setCurrentUsage({
            current: 0,
            limit: 5,
            remaining: 5
          })
        }
      } else if (res.status === 404) {
        // 店舗情報未設定
        console.log('店舗情報未設定 - 404レスポンス')
        setStoreProfile(defaultStoreProfile)
        setCurrentUsage({
          current: 0,
          limit: 5,
          remaining: 5
        })
      } else {
        // その他のHTTPエラー
        console.error(`API Error: ${res.status}`)
        setProfileError("店舗情報の取得に失敗しました")
      }
    } catch (error) {
      console.error("店舗プロフィール取得エラー:", error)
      // ネットワークエラーの場合でもデフォルト値を設定
      setStoreProfile(defaultStoreProfile)
      setCurrentUsage({
        current: 0,
        limit: 5,
        remaining: 5
      })
      setProfileError("ネットワークエラーが発生しました")
    } finally {
      setIsLoadingProfile(false)
    }
  }

  // チャットセッション一覧を取得
  const fetchChatSessions = async () => {
    try {
      const res = await fetch("/api/chat/sessions")
      if (res.ok) {
        const sessions = await res.json()
        setChatSessions(sessions)
      }
    } catch (error) {
      console.error("チャットセッション取得エラー:", error)
    }
  }

  // 特定のセッションのメッセージを取得
  const loadChatSession = async (sessionId: string) => {
    setIsLoadingHistory(true)
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        const formattedMessages: Message[] = data.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.role === "user" ? "user" : "ai",
          timestamp: new Date(msg.createdAt),
        }))
        setMessages(formattedMessages)
        setCurrentSessionId(sessionId)
        setHasStartedChat(true)
      }
    } catch (error) {
      console.error("チャット履歴取得エラー:", error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // 新しいチャットセッションを作成
  const createNewSession = async () => {
    try {
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "新しいチャット",
        }),
      })
      
      if (res.ok) {
        const newSession = await res.json()
        setChatSessions(prev => [newSession, ...prev])
        setCurrentSessionId(newSession.id)
        setMessages([])
        setHasStartedChat(false)
      }
    } catch (error) {
      console.error("新しいセッション作成エラー:", error)
    }
  }

  // メッセージを保存
  const saveMessage = async (sessionId: string, role: "user" | "assistant", content: string) => {
    try {
      await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          content,
        }),
      })
    } catch (error) {
      console.error("メッセージ保存エラー:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return

    setIsSending(true)
    setHasStartedChat(true)

    // 新しいセッションが必要な場合は作成
    let sessionId = currentSessionId
    if (!sessionId) {
      try {
        const res = await fetch("/api/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: inputValue.slice(0, 50), // 最初のメッセージをタイトルに
          }),
        })
        
        if (res.ok) {
          const newSession = await res.json()
          sessionId = newSession.id
          setCurrentSessionId(sessionId)
          setChatSessions(prev => [newSession, ...prev])
        }
      } catch (error) {
        console.error("セッション作成エラー:", error)
        setIsSending(false)
        return
      }
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    setInputValue("")

    // ユーザーメッセージを保存
    if (sessionId) {
      await saveMessage(sessionId, "user", newMessage.content)
    }

    try {
      console.log('💬 AIに送信する店舗プロフィール:', storeProfile) // デバッグ用
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.content,
          })),
          storeProfile: storeProfile, // 店舗情報をAIに渡す
        }),
      })

      const data = await res.json()

      if (res.status === 429) {
        // 利用制限に達した場合
        setUsageError(data.error || "今月の利用制限に達しました")
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.error || "今月の相談回数の上限に達しました。プランをアップグレードするか、来月までお待ちください。",
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
        
        // 使用量情報を更新
        if (data.currentUsage && data.monthlyLimit) {
          setCurrentUsage({
            current: data.currentUsage,
            limit: data.monthlyLimit,
            remaining: data.monthlyLimit - data.currentUsage
          })
        }
        return
      }

      if (data.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])
        
        // 使用量情報を更新
        if (data.usage) {
          setCurrentUsage({
            current: data.usage.currentUsage,
            limit: data.usage.monthlyLimit,
            remaining: data.usage.remaining
          })
        }
        
        // AIメッセージを保存
        if (sessionId) {
          await saveMessage(sessionId, "assistant", aiMessage.content)
        }
      } else {
        throw new Error(data.error || "AIからの応答がありません")
      }
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "AIとの通信中にエラーが発生しました。しばらく待ってから再度お試しください。",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatCurrencyDisplay = (amount: number | undefined) => {
    if (!amount) return "未設定"
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // 使用量を取得する関数
  const fetchUsageInfo = async () => {
    try {
      const res = await fetch("/api/user/usage")
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          setCurrentUsage({
            current: result.data.monthlyConsultations,
            limit: result.data.consultationLimit,
            remaining: result.data.remaining
          })
        }
      }
    } catch (error) {
      console.error('使用量取得エラー:', error)
    }
  }

  // 初回読み込み時にデータを取得
  useEffect(() => {
    if (session?.user?.email) {
      console.log('✅ セッション確認:', session.user.email)
      fetchStoreProfile()
      fetchChatSessions()
      fetchUsageInfo() // 使用量を取得
    } else {
      console.log('❌ セッションなし:', { status, session })
    }
  }, [session])

  if (status === "loading" || isLoadingProfile) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* サイドバー - チャット履歴 */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button
            onClick={createNewSession}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            新しいチャット
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-2">
          {chatSessions.map((session) => (
            <Button
              key={session.id}
              variant={currentSessionId === session.id ? "secondary" : "ghost"}
              className="w-full justify-start mb-2 h-auto p-3 text-left"
              onClick={() => loadChatSession(session.id)}
            >
              <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">
                  {session.title || "無題のチャット"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {new Date(session.updatedAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </Button>
          ))}
        </ScrollArea>
      </div>

      {/* メインチャットエリア */}
      <div className="flex-1 flex flex-col">
        {/* Store Profile Section */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          {profileError ? (
            <div className="p-4">
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  {profileError}
                  <Link
                    href="/settings"
                    className="ml-2 text-yellow-600 hover:text-yellow-700 underline font-medium"
                  >
                    店舗情報を設定する
                  </Link>
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <Collapsible open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <CollapsibleTrigger asChild>
                  <button className="flex items-center space-x-3 text-left flex-1 hover:bg-gray-50 p-2 rounded-md transition-colors">
                    <Store className="w-5 h-5 text-teal-600" />
                    <span className="font-medium text-gray-900">{storeProfile.name}</span>
                    {profileError && (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <div className="flex items-center space-x-2 ml-4">
                  <Link href="/settings">
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                  </Link>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {isProfileOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <CollapsibleContent>
                <div className="px-4 pb-4">
                  <Card className="border-0 bg-gray-50">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">業態</p>
                          <p className="font-medium text-gray-900">{storeProfile.type || "未設定"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">平均客単価</p>
                          <p className="font-medium text-gray-900">{formatCurrencyDisplay(storeProfile.averageSpend)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">席数</p>
                          <p className="font-medium text-gray-900">
                            {storeProfile.seats ? `${storeProfile.seats}席` : "未設定"}
                          </p>
                        </div>
                        {storeProfile.openingHours && (
                          <div>
                            <p className="text-gray-500 mb-1">営業時間</p>
                            <p className="font-medium text-gray-900">{storeProfile.openingHours}</p>
                          </div>
                        )}
                      </div>
                      
                      {storeProfile.challenges && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-gray-500 mb-1">現在の課題</p>
                          <p className="text-sm text-gray-900 leading-relaxed">
                            {typeof storeProfile.challenges === 'string' 
                              ? storeProfile.challenges 
                              : JSON.stringify(storeProfile.challenges)
                            }
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-hidden">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-500">チャット履歴を読み込み中...</p>
              </div>
            </div>
          ) : !hasStartedChat && messages.length === 0 ? (
            <ChatEmptyState 
              onStartChat={() => setHasStartedChat(true)} 
              storeProfile={storeProfile}
              onQuestionSelect={(question) => {
                setInputValue(question)
                setHasStartedChat(true)
              }}
            />
          ) : (
            <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex items-start space-x-3 max-w-[80%] ${
                        message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className={message.sender === "user" ? "bg-teal-100" : "bg-blue-100"}>
                          {message.sender === "user" ? (
                            <User className="w-4 h-4 text-teal-600" />
                          ) : (
                            <Bot className="w-4 h-4 text-blue-600" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          message.sender === "user"
                            ? "bg-teal-600 text-white"
                            : "bg-white text-gray-900 border border-gray-200"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-2 ${message.sender === "user" ? "text-teal-100" : "text-gray-500"}`}>
                          {message.timestamp.toLocaleTimeString("ja-JP", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* 送信中インジケーター */}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3 max-w-[80%]">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100">
                          <Bot className="w-4 h-4 text-blue-600" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-2xl px-4 py-3 shadow-sm bg-white border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <p className="text-sm text-gray-600">AIが回答を準備中...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            {/* 使用量表示 */}
            <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
              <span>今月の相談回数: {currentUsage.current}/{currentUsage.limit}</span>
              <span className={`${currentUsage.remaining <= 1 ? 'text-red-500 font-medium' : ''}`}>
                残り{currentUsage.remaining}回
              </span>
            </div>
            
            {/* エラー表示 */}
            {usageError && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{usageError}</p>
              </div>
            )}
            
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`${storeProfile.name}の経営について質問してください...`}
                  className="min-h-[44px] resize-none border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-xl"
                  disabled={isSending || currentUsage.remaining <= 0}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isSending || currentUsage.remaining <= 0}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {currentUsage.remaining <= 0 && (
              <p className="mt-2 text-sm text-red-600 text-center">
                今月の相談回数を使い切りました。<span className="font-medium">プランをアップグレード</span>するか、来月までお待ちください。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
