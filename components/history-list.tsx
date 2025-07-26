// "use client"

// import { useState, useEffect } from "react"
// import { Search, FileText, Eye, Download, Trash2, BarChart3, TrendingUp, DollarSign, Filter, Loader2, AlertCircle } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"

// interface AnalysisHistory {
//   id: string
//   fileName: string
//   uploadDate: string
//   dataCount: number
//   totalSales: number
//   averageSpend: number
//   totalOrders: number
//   status: "completed" | "processing" | "failed"
//   analysisData?: {
//     dailySales: { date: string; sales: number }[]
//     menuSales: { name: string; value: number; amount: number }[]
//     weatherSales: { weather: string; sales: number }[]
//   }
//   aiAnalysis?: string
// }

// interface HistoryStats {
//   totalAnalyses: number
//   completedAnalyses: number
//   totalSales: number
//   averageSpend: number
// }

// export default function ProgressiveAnalysisHistory() {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [statusFilter, setStatusFilter] = useState<string>("all")
//   const [sortBy, setSortBy] = useState<string>("date-desc")
//   const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([])
//   const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistory | null>(null)
//   const [stats, setStats] = useState<HistoryStats>({
//     totalAnalyses: 0,
//     completedAnalyses: 0,
//     totalSales: 0,
//     averageSpend: 0
//   })
//   const [isLoading, setIsLoading] = useState(true)
//   const [isDeleting, setIsDeleting] = useState<string | null>(null)
//   const [error, setError] = useState<string | null>(null)

//   const loadAnalysisHistory = async () => {
//     try {
//       setIsLoading(true)
//       setError(null)

//       const params = new URLSearchParams({
//         page: '1',
//         limit: '10',
//         search: searchTerm,
//         status: statusFilter,
//         sortBy: sortBy
//       })

//       console.log('履歴API呼び出し:', `/api/analyze/history?${params}`)

//       const response = await fetch(`/api/analyze/history?${params}`)
      
//       if (!response.ok) {
//         throw new Error(`API Error: ${response.status} ${response.statusText}`)
//       }

//       const result = await response.json()
//       console.log('履歴API レスポンス:', result)

//       setAnalysisHistory(result.data || [])
//       setStats(result.stats || stats)

//     } catch (error) {
//       console.error('履歴読み込みエラー:', error)
//       const errorMessage = error instanceof Error ? error.message : '履歴の読み込みに失敗しました'
//       setError(errorMessage)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const loadAnalysisDetail = async (analysisId: string) => {
//     try {
//       console.log('詳細読み込み開始:', analysisId)
//       const response = await fetch(`/api/analyze/${analysisId}`)
      
//       if (!response.ok) {
//         throw new Error(`詳細取得エラー: ${response.status}`)
//       }

//       const result = await response.json()
//       console.log('詳細データ:', result)
      
//       setSelectedAnalysis(result.data)
//     } catch (error) {
//       console.error('詳細読み込みエラー:', error)
//       setError('詳細の読み込みに失敗しました')
//     }
//   }

//   useEffect(() => {
//     loadAnalysisHistory()
//   }, [])

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       loadAnalysisHistory()
//     }, 500)
//     return () => clearTimeout(timer)
//   }, [searchTerm, statusFilter, sortBy])

//   const formatDate = (dateString: string) => {
//     try {
//       return new Date(dateString).toLocaleDateString("ja-JP", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       })
//     } catch {
//       return dateString
//     }
//   }

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("ja-JP", {
//       style: "currency",
//       currency: "JPY",
//       minimumFractionDigits: 0,
//     }).format(amount)
//   }

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "completed":
//         return "bg-green-100 text-green-800 border-green-300"
//       case "processing":
//         return "bg-yellow-100 text-yellow-800 border-yellow-300"
//       case "failed":
//         return "bg-red-100 text-red-800 border-red-300"
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-300"
//     }
//   }

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case "completed":
//         return "完了"
//       case "processing":
//         return "処理中"
//       case "failed":
//         return "失敗"
//       default:
//         return "不明"
//     }
//   }

//   const handleDelete = async (analysisId: string) => {
//     if (!confirm("この分析結果を削除しますか？")) {
//       return
//     }

//     setIsDeleting(analysisId)
//     try {
//       const response = await fetch(`/api/analyze/history?id=${analysisId}`, {
//         method: 'DELETE'
//       })

//       if (!response.ok) {
//         throw new Error('削除に失敗しました')
//       }

//       setAnalysisHistory(prev => prev.filter(analysis => analysis.id !== analysisId))
      
//       setStats(prev => ({
//         ...prev,
//         totalAnalyses: prev.totalAnalyses - 1
//       }))

//       console.log("分析結果を削除しました")
//     } catch (error) {
//       console.error("削除エラー:", error)
//       setError("削除に失敗しました")
//     } finally {
//       setIsDeleting(null)
//     }
//   }

//   const clearFilters = () => {
//     setSearchTerm("")
//     setStatusFilter("all")
//     setSortBy("date-desc")
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">分析履歴を読み込み中...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="container mx-auto px-4 max-w-6xl">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">分析結果履歴</h1>
//           <p className="text-gray-600">過去にアップロードした売上データの分析結果を確認・管理できます</p>
//         </div>

//         {error && (
//           <Alert className="mb-6 border-red-200 bg-red-50">
//             <AlertCircle className="w-4 h-4 text-red-600" />
//             <AlertDescription className="text-red-800">{error}</AlertDescription>
//           </Alert>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <Card className="shadow-sm border-0 bg-white">
//             <CardContent className="p-4">
//               <div className="flex items-center space-x-2">
//                 <FileText className="w-5 h-5 text-blue-600" />
//                 <div>
//                   <p className="text-sm text-gray-600">総分析数</p>
//                   <p className="text-2xl font-bold text-gray-900">{stats.totalAnalyses}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="shadow-sm border-0 bg-white">
//             <CardContent className="p-4">
//               <div className="flex items-center space-x-2">
//                 <BarChart3 className="w-5 h-5 text-green-600" />
//                 <div>
//                   <p className="text-sm text-gray-600">完了済み</p>
//                   <p className="text-2xl font-bold text-gray-900">{stats.completedAnalyses}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="shadow-sm border-0 bg-white">
//             <CardContent className="p-4">
//               <div className="flex items-center space-x-2">
//                 <DollarSign className="w-5 h-5 text-purple-600" />
//                 <div>
//                   <p className="text-sm text-gray-600">総売上</p>
//                   <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSales)}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="shadow-sm border-0 bg-white">
//             <CardContent className="p-4">
//               <div className="flex items-center space-x-2">
//                 <TrendingUp className="w-5 h-5 text-orange-600" />
//                 <div>
//                   <p className="text-sm text-gray-600">平均客単価</p>
//                   <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageSpend)}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <Card className="shadow-sm border-0 bg-white mb-6">
//           <CardHeader className="pb-4">
//             <div className="flex items-center space-x-2">
//               <Filter className="w-5 h-5 text-gray-600" />
//               <CardTitle className="text-lg">フィルター・検索</CardTitle>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <Input
//                   type="text"
//                   placeholder="ファイル名で検索..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>

//               <Select value={statusFilter} onValueChange={setStatusFilter}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="ステータス" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">すべて</SelectItem>
//                   <SelectItem value="completed">完了</SelectItem>
//                   <SelectItem value="processing">処理中</SelectItem>
//                   <SelectItem value="failed">失敗</SelectItem>
//                 </SelectContent>
//               </Select>

//               <Select value={sortBy} onValueChange={setSortBy}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="並び順" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="date-desc">日付（新しい順）</SelectItem>
//                   <SelectItem value="date-asc">日付（古い順）</SelectItem>
//                   <SelectItem value="sales-desc">売上（高い順）</SelectItem>
//                   <SelectItem value="sales-asc">売上（低い順）</SelectItem>
//                   <SelectItem value="name-asc">ファイル名（A-Z）</SelectItem>
//                   <SelectItem value="name-desc">ファイル名（Z-A）</SelectItem>
//                 </SelectContent>
//               </Select>

//               <Button variant="outline" onClick={clearFilters}>
//                 フィルターをクリア
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         <div className="space-y-4">
//           {analysisHistory.length === 0 ? (
//             <Card className="shadow-sm border-0 bg-white">
//               <CardContent className="p-8 text-center">
//                 <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-500">
//                   {searchTerm || statusFilter !== 'all' 
//                     ? "検索条件に一致する分析結果が見つかりませんでした" 
//                     : "まだ分析結果がありません。データをアップロードして分析を開始しましょう。"}
//                 </p>
//                 <Button 
//                   onClick={loadAnalysisHistory}
//                   className="mt-4"
//                 >
//                   再読み込み
//                 </Button>
//               </CardContent>
//             </Card>
//           ) : (
//             analysisHistory.map((analysis) => (
//               <Card key={analysis.id} className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
//                 <CardContent className="p-6">
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center space-x-3 mb-3">
//                         <FileText className="w-5 h-5 text-blue-600" />
//                         <h3 className="text-lg font-semibold text-gray-900">{analysis.fileName}</h3>
//                         <Badge className={getStatusColor(analysis.status)}>{getStatusText(analysis.status)}</Badge>
//                       </div>

//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                         <div>
//                           <p className="text-sm text-gray-500">アップロード日</p>
//                           <p className="font-medium text-gray-900">{formatDate(analysis.uploadDate)}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500">データ件数</p>
//                           <p className="font-medium text-gray-900">{analysis.dataCount}件</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500">総売上</p>
//                           <p className="font-medium text-gray-900">{formatCurrency(analysis.totalSales)}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500">平均客単価</p>
//                           <p className="font-medium text-gray-900">{formatCurrency(analysis.averageSpend)}</p>
//                         </div>
//                       </div>

//                       {analysis.status === "failed" && (
//                         <Alert className="border-red-200 bg-red-50 mb-4">
//                           <AlertDescription className="text-red-800">
//                             分析処理中にエラーが発生しました。ファイル形式を確認して再度アップロードしてください。
//                           </AlertDescription>
//                         </Alert>
//                       )}
//                     </div>

//                     <div className="flex items-center space-x-2 ml-4">
//                       {analysis.status === "completed" && (
//                         <>
//                           <Dialog>
//                             <DialogTrigger asChild>
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent"
//                                 onClick={() => loadAnalysisDetail(analysis.id)}
//                               >
//                                 <Eye className="w-4 h-4 mr-2" />
//                                 詳細
//                               </Button>
//                             </DialogTrigger>
//                             <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//                               <DialogHeader>
//                                 <DialogTitle className="flex items-center space-x-2">
//                                   <BarChart3 className="w-5 h-5 text-blue-600" />
//                                   <span>{analysis.fileName} - 分析結果詳細</span>
//                                 </DialogTitle>
//                                 <DialogDescription>
//                                   {formatDate(analysis.uploadDate)} • {analysis.dataCount}件のデータ
//                                 </DialogDescription>
//                               </DialogHeader>

//                               {selectedAnalysis ? (
//                                 <div className="space-y-6">
//                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                     <div className="bg-green-50 p-4 rounded-lg border border-green-200">
//                                       <h4 className="font-semibold text-green-800 mb-2">総売上</h4>
//                                       <p className="text-2xl font-bold text-green-600">
//                                         {formatCurrency(selectedAnalysis.totalSales)}
//                                       </p>
//                                     </div>
//                                     <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//                                       <h4 className="font-semibold text-blue-800 mb-2">平均客単価</h4>
//                                       <p className="text-2xl font-bold text-blue-600">
//                                         {formatCurrency(selectedAnalysis.averageSpend)}
//                                       </p>
//                                     </div>
//                                     <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
//                                       <h4 className="font-semibold text-purple-800 mb-2">総注文数</h4>
//                                       <p className="text-2xl font-bold text-purple-600">{selectedAnalysis.totalOrders}件</p>
//                                     </div>
//                                   </div>

//                                   {selectedAnalysis.aiAnalysis && (
//                                     <div className="bg-gray-50 p-6 rounded-lg">
//                                       <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
//                                         <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
//                                         AI分析結果
//                                       </h4>
//                                       <div className="prose prose-sm max-w-none">
//                                         <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
//                                           {selectedAnalysis.aiAnalysis}
//                                         </div>
//                                       </div>
//                                     </div>
//                                   )}

//                                   {!selectedAnalysis.analysisData && (
//                                     <div className="text-center py-8 bg-gray-50 rounded-lg">
//                                       <p className="text-gray-600">詳細な分析データは利用できません</p>
//                                     </div>
//                                   )}
//                                 </div>
//                               ) : (
//                                 <div className="flex items-center justify-center py-8">
//                                   <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
//                                   <span className="text-gray-600">詳細データを読み込み中...</span>
//                                 </div>
//                               )}
//                             </DialogContent>
//                           </Dialog>

//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="text-green-600 border-green-600 hover:bg-green-50"
//                             onClick={() => console.log('エクスポート:', analysis.id)}
//                           >
//                             <Download className="w-4 h-4 mr-2" />
//                             出力
//                           </Button>
//                         </>
//                       )}

//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleDelete(analysis.id)}
//                         disabled={isDeleting === analysis.id}
//                         className="text-red-600 border-red-600 hover:bg-red-50"
//                       >
//                         {isDeleting === analysis.id ? (
//                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                         ) : (
//                           <Trash2 className="w-4 h-4 mr-2" />
//                         )}
//                         削除
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }


"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Search, FileText, Eye, Download, Trash2, BarChart3, TrendingUp, DollarSign, Filter, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface AnalysisHistory {
  id: string
  fileName: string
  uploadDate: string
  dataCount: number
  totalSales: number
  averageSpend: number
  totalOrders: number
  status: "completed" | "processing" | "failed"
  analysisData?: {
    dailySales: { date: string; sales: number }[]
    menuSales: { name: string; value: number; amount: number }[]
    weatherSales: { weather: string; sales: number }[]
  }
  aiAnalysis?: string
}

interface HistoryStats {
  totalAnalyses: number
  completedAnalyses: number
  totalSales: number
  averageSpend: number
}

export default function ProgressiveAnalysisHistory() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([])
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistory | null>(null)
  const [stats, setStats] = useState<HistoryStats>({
    totalAnalyses: 0,
    completedAnalyses: 0,
    totalSales: 0,
    averageSpend: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 認証チェック
  useEffect(() => {
    if (status === "loading") return // まだ認証状態を確認中

    if (status === "unauthenticated") {
      console.log("未ログイン状態のため、新規登録ページにリダイレクト")
      router.push("/register")
      return
    }

    // ログイン済みの場合のみデータを読み込み
    if (status === "authenticated") {
      loadAnalysisHistory()
    }
  }, [status, router])

  const loadAnalysisHistory = async () => {
    if (!session) {
      console.log("セッション情報がないため、データ読み込みをスキップ")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: '1',
        limit: '10',
        search: searchTerm,
        status: statusFilter,
        sortBy: sortBy
      })

      console.log('履歴API呼び出し:', `/api/analyze/history?${params}`)

      const response = await fetch(`/api/analyze/history?${params}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log("認証エラー - 新規登録ページにリダイレクト")
          router.push("/register")
          return
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('履歴API レスポンス:', result)

      setAnalysisHistory(result.data || [])
      setStats(result.stats || stats)

    } catch (error) {
      console.error('履歴読み込みエラー:', error)
      
      // 401エラーの場合は新規登録ページにリダイレクト
      if (error instanceof Error && error.message.includes('401')) {
        console.log("401エラーのため、新規登録ページにリダイレクト")
        router.push("/register")
        return
      }
      
      const errorMessage = error instanceof Error ? error.message : '履歴の読み込みに失敗しました'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAnalysisDetail = async (analysisId: string) => {
    if (!session) return

    try {
      console.log('詳細読み込み開始:', analysisId)
      const response = await fetch(`/api/analyze/${analysisId}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/register")
          return
        }
        throw new Error(`詳細取得エラー: ${response.status}`)
      }

      const result = await response.json()
      console.log('詳細データ:', result)
      
      setSelectedAnalysis(result.data)
    } catch (error) {
      console.error('詳細読み込みエラー:', error)
      setError('詳細の読み込みに失敗しました')
    }
  }

  const handleDelete = async (analysisId: string) => {
    if (!session) return
    
    if (!confirm("この分析結果を削除しますか？")) {
      return
    }

    setIsDeleting(analysisId)
    try {
      const response = await fetch(`/api/analyze/history?id=${analysisId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/register")
          return
        }
        throw new Error('削除に失敗しました')
      }

      setAnalysisHistory(prev => prev.filter(analysis => analysis.id !== analysisId))
      
      setStats(prev => ({
        ...prev,
        totalAnalyses: prev.totalAnalyses - 1
      }))

      console.log("分析結果を削除しました")
    } catch (error) {
      console.error("削除エラー:", error)
      setError("削除に失敗しました")
    } finally {
      setIsDeleting(null)
    }
  }

  // 検索・フィルター変更時の処理
  useEffect(() => {
    if (status !== "authenticated") return

    const timer = setTimeout(() => {
      loadAnalysisHistory()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm, statusFilter, sortBy, status])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "failed":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "完了"
      case "processing":
        return "処理中"
      case "failed":
        return "失敗"
      default:
        return "不明"
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setSortBy("date-desc")
  }

  // 認証状態チェック中
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
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
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">分析履歴を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">分析結果履歴</h1>
          <p className="text-gray-600">過去にアップロードした売上データの分析結果を確認・管理できます</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">総分析数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAnalyses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">完了済み</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedAnalyses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">総売上</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSales)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">平均客単価</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageSpend)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm border-0 bg-white mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <CardTitle className="text-lg">フィルター・検索</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="ファイル名で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                  <SelectItem value="processing">処理中</SelectItem>
                  <SelectItem value="failed">失敗</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="並び順" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">日付（新しい順）</SelectItem>
                  <SelectItem value="date-asc">日付（古い順）</SelectItem>
                  <SelectItem value="sales-desc">売上（高い順）</SelectItem>
                  <SelectItem value="sales-asc">売上（低い順）</SelectItem>
                  <SelectItem value="name-asc">ファイル名（A-Z）</SelectItem>
                  <SelectItem value="name-desc">ファイル名（Z-A）</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                フィルターをクリア
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {analysisHistory.length === 0 ? (
            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? "検索条件に一致する分析結果が見つかりませんでした" 
                    : "まだ分析結果がありません。データをアップロードして分析を開始しましょう。"}
                </p>
                <Button 
                  onClick={loadAnalysisHistory}
                  className="mt-4"
                >
                  再読み込み
                </Button>
              </CardContent>
            </Card>
          ) : (
            analysisHistory.map((analysis) => (
              <Card key={analysis.id} className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{analysis.fileName}</h3>
                        <Badge className={getStatusColor(analysis.status)}>{getStatusText(analysis.status)}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">アップロード日</p>
                          <p className="font-medium text-gray-900">{formatDate(analysis.uploadDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">データ件数</p>
                          <p className="font-medium text-gray-900">{analysis.dataCount}件</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">総売上</p>
                          <p className="font-medium text-gray-900">{formatCurrency(analysis.totalSales)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">平均客単価</p>
                          <p className="font-medium text-gray-900">{formatCurrency(analysis.averageSpend)}</p>
                        </div>
                      </div>

                      {analysis.status === "failed" && (
                        <Alert className="border-red-200 bg-red-50 mb-4">
                          <AlertDescription className="text-red-800">
                            分析処理中にエラーが発生しました。ファイル形式を確認して再度アップロードしてください。
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {analysis.status === "completed" && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent"
                                onClick={() => loadAnalysisDetail(analysis.id)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                詳細
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                  <BarChart3 className="w-5 h-5 text-blue-600" />
                                  <span>{analysis.fileName} - 分析結果詳細</span>
                                </DialogTitle>
                                <DialogDescription>
                                  {formatDate(analysis.uploadDate)} • {analysis.dataCount}件のデータ
                                </DialogDescription>
                              </DialogHeader>

                              {selectedAnalysis ? (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                      <h4 className="font-semibold text-green-800 mb-2">総売上</h4>
                                      <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(selectedAnalysis.totalSales)}
                                      </p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                      <h4 className="font-semibold text-blue-800 mb-2">平均客単価</h4>
                                      <p className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(selectedAnalysis.averageSpend)}
                                      </p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                      <h4 className="font-semibold text-purple-800 mb-2">総注文数</h4>
                                      <p className="text-2xl font-bold text-purple-600">{selectedAnalysis.totalOrders}件</p>
                                    </div>
                                  </div>

                                  {selectedAnalysis.aiAnalysis && (
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                        <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                                        AI分析結果
                                      </h4>
                                      <div className="prose prose-sm max-w-none">
                                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                          {selectedAnalysis.aiAnalysis}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {!selectedAnalysis.analysisData && (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                      <p className="text-gray-600">詳細な分析データは利用できません</p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center justify-center py-8">
                                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                                  <span className="text-gray-600">詳細データを読み込み中...</span>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => console.log('エクスポート:', analysis.id)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            出力
                          </Button>
                        </>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(analysis.id)}
                        disabled={isDeleting === analysis.id}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        {isDeleting === analysis.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        削除
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
