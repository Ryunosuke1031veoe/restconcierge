// "use client"

// import type React from "react"
// import { useState, useMemo } from "react"
// import {
//   Upload,
//   FileText,
//   AlertCircle,
//   CheckCircle,
//   X,
//   Calendar,
//   Bot,
//   Loader2,
//   BarChart3,
//   PieChart,
//   TrendingUp,
//   DollarSign,
//   Cloud,
//   Filter,
//   Search,
// } from "lucide-react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Badge } from "@/components/ui/badge"
// import {
//   PieChart as RechartsPieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   BarChart,
//   Bar,
//   Legend,
// } from "recharts"
// import { toast } from "sonner"

// interface CSVData {
//   date: string
//   menu: string
//   quantity: number
//   amount: number
//   weather: string
// }

// interface AnalysisData {
//   dailySales: { date: string; sales: number }[]
//   menuSales: { name: string; value: number; amount: number }[]
//   weatherSales: { weather: string; sales: number }[]
//   totalSales: number
//   averageSpend: number
//   totalOrders: number
//   dailyMenuBreakdown: { [key: string]: any }[]
// }

// interface UsageInfo {
//   current: number
//   limit: number
//   remaining: number
//   planName: string
// }

// const COLORS = ["#0d9488", "#14b8a6", "#5eead4", "#99f6e4", "#f0fdfa"]
// const MENU_COLORS = {
//   醤油ラーメン: "#3b82f6",
//   味噌ラーメン: "#ef4444",
//   餃子: "#10b981",
//   チャーハン: "#f59e0b",
//   ビール: "#8b5cf6",
//   その他: "#6b7280",
// }

// export default function AnalyticsDashboard() {
//   const [dateFilter, setDateFilter] = useState("current-month")
//   const [uploadedFile, setUploadedFile] = useState<File | null>(null)
//   const [isUploading, setIsUploading] = useState(false)
//   const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
//   const [uploadMessage, setUploadMessage] = useState("")
//   const [isDragOver, setIsDragOver] = useState(false)

//   const [selectedMenu, setSelectedMenu] = useState<string>("all")
//   const [startDate, setStartDate] = useState<string>("")
//   const [endDate, setEndDate] = useState<string>("")
//   const [searchTerm, setSearchTerm] = useState<string>("")

//   const [csvData, setCsvData] = useState<CSVData[]>([])
//   const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)

//   const [aiAnalysis, setAiAnalysis] = useState<string>("")
//   const [isAnalyzing, setIsAnalyzing] = useState(false)
//   const [analysisError, setAnalysisError] = useState<string>("")
//   const [lastUsageInfo, setLastUsageInfo] = useState<UsageInfo | null>(null)

//   const filteredData = useMemo(() => {
//     if (!csvData.length) return []

//     return csvData.filter((row) => {
//       const menuMatch = selectedMenu === "all" || row.menu === selectedMenu
//       const dateMatch = (!startDate || row.date >= startDate) && (!endDate || row.date <= endDate)
//       const searchMatch = !searchTerm || row.menu.toLowerCase().includes(searchTerm.toLowerCase())

//       return menuMatch && dateMatch && searchMatch
//     })
//   }, [csvData, selectedMenu, startDate, endDate, searchTerm])

//   // ユニークなメニューリスト
//   const uniqueMenus = useMemo(() => {
//     return Array.from(new Set(csvData.map((row) => row.menu)))
//   }, [csvData])

//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (file) {
//       if (file.type === "text/csv" || file.name.endsWith(".csv")) {
//         setUploadedFile(file)
//         setUploadStatus("idle")
//       } else {
//         setUploadStatus("error")
//         setUploadMessage("CSVファイルを選択してください")
//       }
//     }
//   }

//   const handleDragOver = (event: React.DragEvent) => {
//     event.preventDefault()
//     setIsDragOver(true)
//   }

//   const handleDragLeave = (event: React.DragEvent) => {
//     event.preventDefault()
//     setIsDragOver(false)
//   }

//   const handleDrop = (event: React.DragEvent) => {
//     event.preventDefault()
//     setIsDragOver(false)

//     const files = event.dataTransfer.files
//     const file = files[0]

//     if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
//       setUploadedFile(file)
//       setUploadStatus("idle")
//     } else {
//       setUploadStatus("error")
//       setUploadMessage("CSVファイルを選択してください")
//     }
//   }

//   const parseCSVData = async (file: File): Promise<CSVData[]> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader()

//       reader.onload = (e) => {
//         try {
//           const text = e.target?.result as string
//           const lines = text.split("\n").filter((line) => line.trim() !== "")

//           if (lines.length < 2) {
//             reject(new Error("CSVファイルにデータが含まれていません"))
//             return
//           }

//           const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
//           const expectedHeaders = ["日付", "メニュー", "数量", "金額", "天気"]

//           const hasRequiredColumns = expectedHeaders.every((expected) =>
//             headers.some(
//               (header) =>
//                 header.includes(expected) ||
//                 (expected === "日付" && (header.includes("date") || header.includes("Date"))) ||
//                 (expected === "メニュー" && (header.includes("menu") || header.includes("Menu"))) ||
//                 (expected === "数量" && (header.includes("quantity") || header.includes("Quantity"))) ||
//                 (expected === "金額" && (header.includes("amount") || header.includes("Amount"))) ||
//                 (expected === "天気" && (header.includes("weather") || header.includes("Weather"))),
//             ),
//           )

//           if (!hasRequiredColumns) {
//             reject(new Error("CSVファイルに必要な列が含まれていません。必要な列: 日付, メニュー, 数量, 金額, 天気"))
//             return
//           }

//           // データ行を解析
//           const data: CSVData[] = []
//           const errors: string[] = []

//           for (let i = 1; i < lines.length; i++) {
//             const line = lines[i].trim()
//             if (!line) continue

//             const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))

//             if (values.length < 5) {
//               errors.push(`行 ${i + 1}: 列数が不足しています`)
//               continue
//             }

//             const [dateStr, menu, quantityStr, amountStr, weather] = values

//             // 日付の検証
//             const dateMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}$/)
//             if (!dateMatch) {
//               errors.push(`行 ${i + 1}: 日付の形式が正しくありません (YYYY-MM-DD形式で入力してください)`)
//               continue
//             }

//             // 数量の検証
//             const quantity = Number.parseInt(quantityStr)
//             if (isNaN(quantity) || quantity <= 0) {
//               errors.push(`行 ${i + 1}: 数量は正の整数で入力してください`)
//               continue
//             }

//             // 金額の検証
//             const amount = Number.parseInt(amountStr)
//             if (isNaN(amount) || amount <= 0) {
//               errors.push(`行 ${i + 1}: 金額は正の整数で入力してください`)
//               continue
//             }

//             if (!menu || !weather) {
//               errors.push(`行 ${i + 1}: メニュー名と天気は必須です`)
//               continue
//             }

//             data.push({
//               date: dateStr,
//               menu: menu,
//               quantity: quantity,
//               amount: amount,
//               weather: weather,
//             })
//           }

//           if (errors.length > 0) {
//             reject(
//               new Error(
//                 `CSVファイルにエラーがあります:\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? `\n他 ${errors.length - 5} 件のエラー` : ""}`,
//               ),
//             )
//             return
//           }

//           if (data.length === 0) {
//             reject(new Error("有効なデータが見つかりませんでした"))
//             return
//           }

//           resolve(data)
//         } catch (error) {
//           reject(new Error("CSVファイルの解析中にエラーが発生しました"))
//         }
//       }

//       reader.onerror = () => {
//         reject(new Error("ファイルの読み込み中にエラーが発生しました"))
//       }

//       reader.readAsText(file, "UTF-8")
//     })
//   }

//   const analyzeData = (data: CSVData[]): AnalysisData => {
//     const dailySalesMap = new Map<string, number>()
//     data.forEach((row) => {
//       const current = dailySalesMap.get(row.date) || 0
//       dailySalesMap.set(row.date, current + row.amount)
//     })
//     const dailySales = Array.from(dailySalesMap.entries())
//       .map(([date, sales]) => ({ date, sales }))
//       .sort((a, b) => a.date.localeCompare(b.date))

//     const menuSalesMap = new Map<string, { quantity: number; amount: number }>()
//     data.forEach((row) => {
//       const current = menuSalesMap.get(row.menu) || { quantity: 0, amount: 0 }
//       menuSalesMap.set(row.menu, {
//         quantity: current.quantity + row.quantity,
//         amount: current.amount + row.amount,
//       })
//     })
//     const totalMenuAmount = Array.from(menuSalesMap.values()).reduce((sum, item) => sum + item.amount, 0)
//     const menuSales = Array.from(menuSalesMap.entries()).map(([name, data]) => ({
//       name,
//       value: totalMenuAmount > 0 ? Math.round((data.amount / totalMenuAmount) * 100) : 0,
//       amount: data.amount,
//     }))

//     const weatherSalesMap = new Map<string, number>()
//     data.forEach((row) => {
//       const current = weatherSalesMap.get(row.weather) || 0
//       weatherSalesMap.set(row.weather, current + row.amount)
//     })
//     const weatherSales = Array.from(weatherSalesMap.entries()).map(([weather, sales]) => ({ weather, sales }))

//     const dailyMenuMap = new Map<string, { [menu: string]: number }>()
//     data.forEach((row) => {
//       if (!dailyMenuMap.has(row.date)) {
//         dailyMenuMap.set(row.date, {})
//       }
//       const dayData = dailyMenuMap.get(row.date)!
//       dayData[row.menu] = (dayData[row.menu] || 0) + row.amount
//     })

//     const dailyMenuBreakdown = Array.from(dailyMenuMap.entries())
//       .map(([date, menuData]) => ({
//         date,
//         ...menuData,
//       }))
//       .sort((a, b) => a.date.localeCompare(b.date))

//     const totalSales = data.reduce((sum, row) => sum + row.amount, 0)
//     const totalOrders = data.reduce((sum, row) => sum + row.quantity, 0)
//     const averageSpend = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0

//     return {
//       dailySales,
//       menuSales,
//       weatherSales,
//       totalSales,
//       averageSpend,
//       totalOrders,
//       dailyMenuBreakdown,
//     }
//   }

//   const performAIAnalysis = async (data: CSVData[], analysis: AnalysisData) => {
//     const prompt = `
// 以下は飲食店の売上データです。このデータを元に、売上傾向の分析と、改善提案を日本語で3つ提示してください。

// 総売上: ¥${analysis.totalSales.toLocaleString()}
// 注文数: ${analysis.totalOrders}
// 平均客単価: ¥${analysis.averageSpend.toLocaleString()}
// 期間日数: ${analysis.dailySales.length}日

// メニュー別売上:
// ${analysis.menuSales.map((m) => `${m.name}: ¥${m.amount.toLocaleString()}`).join("\n")}

// 天気別売上:
// ${analysis.weatherSales.map((w) => `${w.weather}: ¥${w.sales.toLocaleString()}`).join("\n")}

// 以下の形式で回答してください：
// 1. 売上傾向の分析（2-3行）
// 2. 改善提案（3つ、それぞれ具体的に）
// 3. 優先度の高い施策（1つ）
// `

//     try {
//       const res = await fetch("/api/analyze", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ prompt }),
//       })

//       const responseData = await res.json()

//       if (!res.ok) {
//         if (res.status === 403) {
//           throw new Error(`403: ${responseData.error}`)
//         } else if (res.status === 429) {
//           throw new Error(`429: ${responseData.error}`)
//         } else {
//           throw new Error(`${res.status}: ${responseData.error}`)
//         }
//       }

//       return responseData

//     } catch (error) {
//       console.error("AI分析リクエストエラー:", error)
//       throw error
//     }
//   }

//   // 統合されたインポート処理
//   const handleImport = async () => {
//     if (!uploadedFile) return

//     setIsUploading(true)
//     setIsAnalyzing(true)
//     setUploadStatus("idle")
//     setAiAnalysis("")
//     setAnalysisError("")
//     setCsvData([])
//     setAnalysisData(null)
//     setLastUsageInfo(null)

//     try {
//       const parsedData = await parseCSVData(uploadedFile)
//       setCsvData(parsedData)

//       const analysis = analyzeData(parsedData)
//       setAnalysisData(analysis)

//       const aiResult = await performAIAnalysis(parsedData, analysis)
//       setAiAnalysis(aiResult.result)
      
//       if (aiResult.usage) {
//         setLastUsageInfo(aiResult.usage)
//         toast.success(`AI分析が完了しました。残り${aiResult.usage.remaining}回利用可能です。`)
//       }

//       const response = await fetch("/api/analyze/upload", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           records: parsedData,
//           aiAnalysis: aiResult.result 
//         }),
//       })

//       const result = await response.json()

//       if (!response.ok) {
//         throw new Error(result.error || 'アップロードに失敗しました')
//       }

//       setUploadStatus("success")
//       setUploadMessage(
//         `${uploadedFile.name} のインポートと分析が完了しました。${parsedData.length}件のデータを保存しました。`,
//       )

//       if (parsedData.length > 0) {
//         const dates = parsedData.map((row) => row.date).sort()
//         setStartDate(dates[0])
//         setEndDate(dates[dates.length - 1])
//       }

//       console.log('✅ アップロード・分析・保存が完了しました:', result)

//     } catch (error) {
//       setUploadStatus("error")
      
//       if (error instanceof Error) {
//         if (error.message.includes('403')) {
//           setUploadMessage("月間利用制限に達しています。プランをアップグレードしてください。")
//           setAnalysisError("月間利用制限に達しています。プランをアップグレードしてください。")
//           toast.error("月間利用制限に達しました")
//         } else if (error.message.includes('429')) {
//           setUploadMessage("一時的に利用制限に達しています。しばらく時間をおいてから再試行してください。")
//           setAnalysisError("一時的に利用制限に達しています。しばらく時間をおいてから再試行してください。")
//           toast.error("一時的な利用制限")
//         } else {
//           setUploadMessage(error.message || "インポート中にエラーが発生しました。")
//           setAnalysisError("AI分析中にエラーが発生しました。しばらく時間をおいて再度お試しください。")
//         }
//       } else {
//         setUploadMessage("インポート中にエラーが発生しました。")
//         setAnalysisError("AI分析中にエラーが発生しました。")
//       }
//     } finally {
//       setIsUploading(false)
//       setIsAnalyzing(false)
//     }
//   }

//   const clearUpload = () => {
//     setUploadedFile(null)
//     setUploadStatus("idle")
//     setUploadMessage("")
//     setAiAnalysis("")
//     setAnalysisError("")
//     setCsvData([])
//     setAnalysisData(null)
//     setLastUsageInfo(null)
//     setSelectedMenu("all")
//     setStartDate("")
//     setEndDate("")
//     setSearchTerm("")
//   }

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("ja-JP", {
//       style: "currency",
//       currency: "JPY",
//       minimumFractionDigits: 0,
//     }).format(amount)
//   }

//   const clearFilters = () => {
//     setSelectedMenu("all")
//     setStartDate("")
//     setEndDate("")
//     setSearchTerm("")
//   }

//   const UsageDisplay = ({ usage }: { usage: UsageInfo | null }) => {
//     if (!usage) return null

//     const percentage = (usage.current / usage.limit) * 100
//     const isNearLimit = percentage >= 80

//     return (
//       <div className={`mt-4 p-4 rounded-lg border ${isNearLimit ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-sm font-medium text-gray-700">今月の利用状況</span>
//           <span className={`text-sm font-bold ${isNearLimit ? 'text-red-600' : 'text-blue-600'}`}>
//             {usage.current}/{usage.limit}
//           </span>
//         </div>
//         <div className="w-full bg-gray-200 rounded-full h-2">
//           <div
//             className={`h-2 rounded-full transition-all duration-300 ${
//               isNearLimit ? 'bg-red-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-blue-500'
//             }`}
//             style={{ width: `${Math.min(percentage, 100)}%` }}
//           />
//         </div>
//         <div className="flex justify-between mt-2 text-xs text-gray-600">
//           <span>残り {usage.remaining} 回</span>
//           <span>{usage.planName}プラン</span>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
//       <div className="container mx-auto px-4 max-w-7xl">
//         <div className="mb-8">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">売上分析ダッシュボード</h1>
//               <p className="text-gray-600">CSVファイルをアップロードして日別・メニュー別の詳細な売上分析を行います</p>
//             </div>

//             <div className="flex items-center space-x-2">
//               <Calendar className="w-4 h-4 text-gray-500" />
//               <Select value={dateFilter} onValueChange={setDateFilter}>
//                 <SelectTrigger className="w-40">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="current-month">今月</SelectItem>
//                   <SelectItem value="last-month">先月</SelectItem>
//                   <SelectItem value="last-3-months">過去3ヶ月</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </div>

//         <Card className="shadow-sm border-0 bg-white mb-6">
//           <CardHeader className="pb-4">
//             <div className="flex items-center space-x-2">
//               <Upload className="w-5 h-5 text-blue-600" />
//               <CardTitle className="text-lg">データインポート</CardTitle>
//             </div>
//             <CardDescription>CSVファイルをアップロードして売上データを分析します</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {uploadStatus !== "idle" && (
//               <Alert
//                 className={`mb-4 ${uploadStatus === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
//               >
//                 <div className="flex items-start">
//                   {uploadStatus === "success" ? (
//                     <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
//                   ) : (
//                     <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
//                   )}
//                   <AlertDescription
//                     className={`ml-2 ${uploadStatus === "success" ? "text-green-800" : "text-red-800"} whitespace-pre-wrap`}
//                   >
//                     {uploadMessage}
//                   </AlertDescription>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => setUploadStatus("idle")}
//                     className="ml-auto p-1 h-auto flex-shrink-0"
//                   >
//                     <X className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </Alert>
//             )}

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div>
//                 <div
//                   className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
//                     isDragOver
//                       ? "border-blue-400 bg-blue-50"
//                       : uploadedFile
//                         ? "border-green-400 bg-green-50"
//                         : "border-gray-300 hover:border-gray-400"
//                   }`}
//                   onDragOver={handleDragOver}
//                   onDragLeave={handleDragLeave}
//                   onDrop={handleDrop}
//                 >
//                   {uploadedFile ? (
//                     <div className="space-y-2">
//                       <FileText className="w-8 h-8 text-green-600 mx-auto" />
//                       <p className="text-sm font-medium text-green-800">{uploadedFile.name}</p>
//                       <p className="text-xs text-green-600">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={clearUpload}
//                         className="text-gray-600 hover:text-gray-800 bg-transparent"
//                       >
//                         ファイルを変更
//                       </Button>
//                     </div>
//                   ) : (
//                     <div className="space-y-2">
//                       <Upload className="w-8 h-8 text-gray-400 mx-auto" />
//                       <p className="text-sm text-gray-600">
//                         CSVファイルをドラッグ&ドロップ
//                         <br />
//                         または
//                       </p>
//                       <label htmlFor="csv-upload">
//                         <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
//                           <span>ファイルを選択</span>
//                         </Button>
//                       </label>
//                       <input id="csv-upload" type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
//                     </div>
//                   )}
//                 </div>

//                 <div className="mt-4">
//                   <Button
//                     onClick={handleImport}
//                     disabled={!uploadedFile || isUploading}
//                     className="w-full bg-blue-600 hover:bg-blue-700 text-white"
//                   >
//                     {isUploading ? (
//                       <>
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                         {isAnalyzing ? "分析中..." : "インポート中..."}
//                       </>
//                     ) : (
//                       <>
//                         <Upload className="w-4 h-4 mr-2" />
//                         インポート・分析実行
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </div>

//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <h4 className="text-sm font-medium text-gray-900 mb-3">CSVファイル形式</h4>
//                 <div className="space-y-3 text-sm text-gray-600">
//                   <div>
//                     <p className="font-medium mb-1">必要な列（1行目にヘッダーが必要）:</p>
//                     <code className="bg-white px-2 py-1 rounded text-xs">日付,メニュー,数量,金額,天気</code>
//                   </div>

//                   <div>
//                     <p className="font-medium mb-1">例:</p>
//                     <div className="bg-white p-2 rounded text-xs font-mono">
//                       日付,メニュー,数量,金額,天気
//                       <br />
//                       2024-01-15,醤油ラーメン,5,4000,晴れ
//                       <br />
//                       2024-01-15,餃子,3,1500,晴れ
//                       <br />
//                       2024-01-16,味噌ラーメン,8,6400,雨
//                     </div>
//                   </div>

//                   <div>
//                     <p className="font-medium mb-1">注意事項:</p>
//                     <ul className="list-disc list-inside space-y-1 text-xs">
//                       <li>日付形式: YYYY-MM-DD（例: 2024-01-15）</li>
//                       <li>数量・金額は半角数字のみ</li>
//                       <li>天気: 晴れ、曇り、雨、雪など</li>
//                       <li>文字コード: UTF-8推奨</li>
//                       <li>1行目は必ずヘッダー行にしてください</li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {csvData.length > 0 && (
//           <Card className="shadow-sm border-0 bg-white mb-6">
//             <CardHeader className="pb-4">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-2">
//                   <Filter className="w-5 h-5 text-purple-600" />
//                   <CardTitle className="text-lg">フィルター</CardTitle>
//                 </div>
//                 <Button variant="outline" size="sm" onClick={clearFilters}>
//                   フィルターをクリア
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <div>
//                   <Label htmlFor="menu-filter" className="text-sm font-medium text-gray-700 mb-2 block">
//                     メニュー
//                   </Label>
//                   <Select value={selectedMenu} onValueChange={setSelectedMenu}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="メニューを選択" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">すべて</SelectItem>
//                       {uniqueMenus.map((menu) => (
//                         <SelectItem key={menu} value={menu}>
//                           {menu}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <Label htmlFor="start-date" className="text-sm font-medium text-gray-700 mb-2 block">
//                     開始日
//                   </Label>
//                   <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
//                 </div>

//                 <div>
//                   <Label htmlFor="end-date" className="text-sm font-medium text-gray-700 mb-2 block">
//                     終了日
//                   </Label>
//                   <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
//                 </div>

//                 <div>
//                   <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
//                     検索
//                   </Label>
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                     <Input
//                       id="search"
//                       type="text"
//                       placeholder="メニュー名で検索"
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="pl-10"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {analysisData && (
//           <>
//             <div className="mb-6">
//               <h2 className="text-xl font-bold text-gray-900 mb-4">📊 全体統計</h2>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <Card className="shadow-sm border-0 bg-white">
//                   <CardHeader className="pb-2">
//                     <div className="flex items-center space-x-2">
//                       <DollarSign className="w-5 h-5 text-green-600" />
//                       <CardTitle className="text-lg">売上合計</CardTitle>
//                     </div>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-3xl font-bold text-gray-900">{formatCurrency(analysisData.totalSales)}</p>
//                     <p className="text-sm text-gray-600 mt-1">総注文数: {analysisData.totalOrders}件</p>
//                   </CardContent>
//                 </Card>

//                 <Card className="shadow-sm border-0 bg-white">
//                   <CardHeader className="pb-2">
//                     <div className="flex items-center space-x-2">
//                       <TrendingUp className="w-5 h-5 text-blue-600" />
//                       <CardTitle className="text-lg">平均客単価</CardTitle>
//                     </div>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-3xl font-bold text-gray-900">{formatCurrency(analysisData.averageSpend)}</p>
//                     <p className="text-sm text-gray-600 mt-1">1注文あたりの平均金額</p>
//                   </CardContent>
//                 </Card>

//                 <Card className="shadow-sm border-0 bg-white">
//                   <CardHeader className="pb-2">
//                     <div className="flex items-center space-x-2">
//                       <BarChart3 className="w-5 h-5 text-purple-600" />
//                       <CardTitle className="text-lg">分析期間</CardTitle>
//                     </div>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-3xl font-bold text-gray-900">{analysisData.dailySales.length}</p>
//                     <p className="text-sm text-gray-600 mt-1">日間のデータ</p>
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>


//             <div className="mb-6">
//               <h2 className="text-xl font-bold text-gray-900 mb-4">📈 詳細分析</h2>


//               <Card className="shadow-sm border-0 bg-white mb-6">
//                 <CardHeader className="pb-4">
//                   <div className="flex items-center space-x-2">
//                     <BarChart3 className="w-5 h-5 text-blue-600" />
//                     <CardTitle className="text-lg">日別・メニュー別売上推移</CardTitle>
//                   </div>
//                   <CardDescription>各日のメニューごとの売上を色分けで表示</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="h-80 overflow-x-auto">
//                     <div style={{ minWidth: "600px", height: "100%" }}>
//                       <ResponsiveContainer width="100%" height="100%">
//                         <BarChart data={analysisData.dailyMenuBreakdown}>
//                           <CartesianGrid strokeDasharray="3 3" />
//                           <XAxis dataKey="date" />
//                           <YAxis />
//                           <Tooltip
//                             formatter={(value, name) => [formatCurrency(value as number), name]}
//                             labelFormatter={(label) => `日付: ${label}`}
//                           />
//                           <Legend />
//                           {uniqueMenus.map((menu, index) => (
//                             <Bar
//                               key={menu}
//                               dataKey={menu}
//                               stackId="a"
//                               fill={MENU_COLORS[menu as keyof typeof MENU_COLORS] || COLORS[index % COLORS.length]}
//                             />
//                           ))}
//                         </BarChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card className="shadow-sm border-0 bg-white">
//                 <CardHeader className="pb-4">
//                   <div className="flex items-center space-x-2">
//                     <FileText className="w-5 h-5 text-gray-600" />
//                     <CardTitle className="text-lg">日別・メニュー別詳細表</CardTitle>
//                   </div>
//                   <CardDescription>
//                     フィルタリング結果: {filteredData.length}件のデータ
//                     {filteredData.length !== csvData.length && ` (全${csvData.length}件中)`}
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="overflow-x-auto">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>日付</TableHead>
//                           <TableHead>メニュー</TableHead>
//                           <TableHead className="text-right">数量</TableHead>
//                           <TableHead className="text-right">金額</TableHead>
//                           <TableHead>天気</TableHead>
//                           <TableHead className="text-right">単価</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {filteredData.map((row, index) => (
//                           <TableRow key={index}>
//                             <TableCell className="font-medium">{row.date}</TableCell>
//                             <TableCell>{row.menu}</TableCell>
//                             <TableCell className="text-right">{row.quantity}個</TableCell>
//                             <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
//                             <TableCell>
//                               <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
//                                 {row.weather}
//                               </span>
//                             </TableCell>
//                             <TableCell className="text-right text-sm text-gray-600">
//                               {formatCurrency(Math.round(row.amount / row.quantity))}
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                     {filteredData.length === 0 && (
//                       <div className="text-center py-8 text-gray-500">フィルター条件に一致するデータがありません</div>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Traditional Charts */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//               {/* Menu Sales Chart */}
//               <Card className="shadow-sm border-0 bg-white">
//                 <CardHeader className="pb-4">
//                   <div className="flex items-center space-x-2">
//                     <PieChart className="w-5 h-5 text-green-600" />
//                     <CardTitle className="text-lg">メニュー別売上比率</CardTitle>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="h-64 flex items-center">
//                     <div className="w-1/2">
//                       <ResponsiveContainer width="100%" height={200}>
//                         <RechartsPieChart>
//                           <Pie
//                             data={analysisData.menuSales}
//                             cx="50%"
//                             cy="50%"
//                             innerRadius={40}
//                             outerRadius={80}
//                             paddingAngle={5}
//                             dataKey="value"
//                           >
//                             {analysisData.menuSales.map((entry, index) => (
//                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                             ))}
//                           </Pie>
//                           <Tooltip formatter={(value) => `${value}%`} />
//                         </RechartsPieChart>
//                       </ResponsiveContainer>
//                     </div>
//                     <div className="w-1/2 pl-4">
//                       <div className="space-y-3">
//                         {analysisData.menuSales.map((item, index) => (
//                           <div key={item.name} className="flex items-center justify-between">
//                             <div className="flex items-center">
//                               <div
//                                 className="w-3 h-3 rounded-full mr-2"
//                                 style={{ backgroundColor: COLORS[index % COLORS.length] }}
//                               />
//                               <span className="text-sm text-gray-700">{item.name}</span>
//                             </div>
//                             <div className="text-right">
//                               <p className="text-sm font-medium">{item.value}%</p>
//                               <p className="text-xs text-gray-500">{formatCurrency(item.amount)}</p>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Weather Sales Chart */}
//               <Card className="shadow-sm border-0 bg-white">
//                 <CardHeader className="pb-4">
//                   <div className="flex items-center space-x-2">
//                     <Cloud className="w-5 h-5 text-orange-600" />
//                     <CardTitle className="text-lg">天気別売上傾向</CardTitle>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="h-64">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <BarChart data={analysisData.weatherSales}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="weather" />
//                         <YAxis />
//                         <Tooltip formatter={(value) => formatCurrency(value as number)} />
//                         <Bar dataKey="sales" fill="#f59e0b" />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </>
//         )}

//         {/* AI Analysis Section */}
//         {(isAnalyzing || aiAnalysis || analysisError) && (
//           <Card className="shadow-sm border-0 bg-white">
//             <CardHeader className="pb-4">
//               <div className="flex items-center space-x-2">
//                 <Bot className="w-5 h-5 text-purple-600" />
//                 <CardTitle className="text-lg">📊 AIによる売上分析と提案</CardTitle>
//               </div>
//               <CardDescription>アップロードされたデータをAIが分析し、改善提案を行います</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {isAnalyzing && (
//                 <div className="flex items-center justify-center py-8">
//                   <div className="text-center">
//                     <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
//                     <p className="text-gray-600">AIが売上データを分析中です...</p>
//                     <p className="text-sm text-gray-500 mt-2">しばらくお待ちください</p>
//                   </div>
//                 </div>
//               )}

//               {analysisError && (
//                 <Alert className="border-red-200 bg-red-50">
//                   <AlertCircle className="w-4 h-4 text-red-600" />
//                   <AlertDescription className="text-red-800">{analysisError}</AlertDescription>
//                 </Alert>
//               )}

//               {aiAnalysis && (
//                 <div className="space-y-4">
//                   <div className="bg-gray-100 rounded-lg p-6">
//                     <div className="prose prose-sm max-w-none">
//                       <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{aiAnalysis}</div>
//                     </div>
//                   </div>
                  
//                   {/* 使用量表示 */}
//                   <UsageDisplay usage={lastUsageInfo} />
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         )}

//         {/* No Data State */}
//         {csvData.length === 0 && uploadStatus !== "success" && (
//           <Card className="shadow-sm border-0 bg-white">
//             <CardContent className="p-12 text-center">
//               <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">データをアップロードしてください</h3>
//               <p className="text-gray-600 mb-6">
//                 CSVファイルをアップロードすると、詳細な売上分析とAIによる改善提案を確認できます。
//               </p>
//               <div className="text-sm text-gray-500">
//                 <p>対応形式: CSV (.csv)</p>
//                 <p>必要な列: 日付, メニュー, 数量, 金額, 天気</p>
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   )
// }


"use client"

import type React from "react"
import { useState, useMemo } from "react"
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Calendar,
  Bot,
  Loader2,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Cloud,
  Filter,
  Search,
  Crown,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts"
import { toast } from "sonner"

interface CSVData {
  date: string
  menu: string
  quantity: number
  amount: number
  weather: string
}

interface AnalysisData {
  dailySales: { date: string; sales: number }[]
  menuSales: { name: string; value: number; amount: number }[]
  weatherSales: { weather: string; sales: number }[]
  totalSales: number
  averageSpend: number
  totalOrders: number
  dailyMenuBreakdown: { [key: string]: any }[]
}

interface UsageInfo {
  current: number
  limit: number
  remaining: number
  planName: string
}

const COLORS = ["#0d9488", "#14b8a6", "#5eead4", "#99f6e4", "#f0fdfa"]
const MENU_COLORS = {
  醤油ラーメン: "#3b82f6",
  味噌ラーメン: "#ef4444",
  餃子: "#10b981",
  チャーハン: "#f59e0b",
  ビール: "#8b5cf6",
  その他: "#6b7280",
}

export default function AnalyticsDashboard() {
  const [dateFilter, setDateFilter] = useState("current-month")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)

  const [selectedMenu, setSelectedMenu] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")

  const [csvData, setCsvData] = useState<CSVData[]>([])
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)

  const [aiAnalysis, setAiAnalysis] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string>("")
  const [lastUsageInfo, setLastUsageInfo] = useState<UsageInfo | null>(null)
  const [aiAnalysisAvailable, setAiAnalysisAvailable] = useState<boolean>(true)

  const filteredData = useMemo(() => {
    if (!csvData.length) return []

    return csvData.filter((row) => {
      const menuMatch = selectedMenu === "all" || row.menu === selectedMenu
      const dateMatch = (!startDate || row.date >= startDate) && (!endDate || row.date <= endDate)
      const searchMatch = !searchTerm || row.menu.toLowerCase().includes(searchTerm.toLowerCase())

      return menuMatch && dateMatch && searchMatch
    })
  }, [csvData, selectedMenu, startDate, endDate, searchTerm])

  // ユニークなメニューリスト
  const uniqueMenus = useMemo(() => {
    return Array.from(new Set(csvData.map((row) => row.menu)))
  }, [csvData])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setUploadedFile(file)
        setUploadStatus("idle")
      } else {
        setUploadStatus("error")
        setUploadMessage("CSVファイルを選択してください")
      }
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)

    const files = event.dataTransfer.files
    const file = files[0]

    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      setUploadedFile(file)
      setUploadStatus("idle")
    } else {
      setUploadStatus("error")
      setUploadMessage("CSVファイルを選択してください")
    }
  }

  const parseCSVData = async (file: File): Promise<CSVData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split("\n").filter((line) => line.trim() !== "")

          if (lines.length < 2) {
            reject(new Error("CSVファイルにデータが含まれていません"))
            return
          }

          const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
          const expectedHeaders = ["日付", "メニュー", "数量", "金額", "天気"]

          const hasRequiredColumns = expectedHeaders.every((expected) =>
            headers.some(
              (header) =>
                header.includes(expected) ||
                (expected === "日付" && (header.includes("date") || header.includes("Date"))) ||
                (expected === "メニュー" && (header.includes("menu") || header.includes("Menu"))) ||
                (expected === "数量" && (header.includes("quantity") || header.includes("Quantity"))) ||
                (expected === "金額" && (header.includes("amount") || header.includes("Amount"))) ||
                (expected === "天気" && (header.includes("weather") || header.includes("Weather"))),
            ),
          )

          if (!hasRequiredColumns) {
            reject(new Error("CSVファイルに必要な列が含まれていません。必要な列: 日付, メニュー, 数量, 金額, 天気"))
            return
          }

          // データ行を解析
          const data: CSVData[] = []
          const errors: string[] = []

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))

            if (values.length < 5) {
              errors.push(`行 ${i + 1}: 列数が不足しています`)
              continue
            }

            const [dateStr, menu, quantityStr, amountStr, weather] = values

            // 日付の検証
            const dateMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}$/)
            if (!dateMatch) {
              errors.push(`行 ${i + 1}: 日付の形式が正しくありません (YYYY-MM-DD形式で入力してください)`)
              continue
            }

            // 数量の検証
            const quantity = Number.parseInt(quantityStr)
            if (isNaN(quantity) || quantity <= 0) {
              errors.push(`行 ${i + 1}: 数量は正の整数で入力してください`)
              continue
            }

            // 金額の検証
            const amount = Number.parseInt(amountStr)
            if (isNaN(amount) || amount <= 0) {
              errors.push(`行 ${i + 1}: 金額は正の整数で入力してください`)
              continue
            }

            if (!menu || !weather) {
              errors.push(`行 ${i + 1}: メニュー名と天気は必須です`)
              continue
            }

            data.push({
              date: dateStr,
              menu: menu,
              quantity: quantity,
              amount: amount,
              weather: weather,
            })
          }

          if (errors.length > 0) {
            reject(
              new Error(
                `CSVファイルにエラーがあります:\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? `\n他 ${errors.length - 5} 件のエラー` : ""}`,
              ),
            )
            return
          }

          if (data.length === 0) {
            reject(new Error("有効なデータが見つかりませんでした"))
            return
          }

          resolve(data)
        } catch (error) {
          reject(new Error("CSVファイルの解析中にエラーが発生しました"))
        }
      }

      reader.onerror = () => {
        reject(new Error("ファイルの読み込み中にエラーが発生しました"))
      }

      reader.readAsText(file, "UTF-8")
    })
  }

  const analyzeData = (data: CSVData[]): AnalysisData => {
    const dailySalesMap = new Map<string, number>()
    data.forEach((row) => {
      const current = dailySalesMap.get(row.date) || 0
      dailySalesMap.set(row.date, current + row.amount)
    })
    const dailySales = Array.from(dailySalesMap.entries())
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const menuSalesMap = new Map<string, { quantity: number; amount: number }>()
    data.forEach((row) => {
      const current = menuSalesMap.get(row.menu) || { quantity: 0, amount: 0 }
      menuSalesMap.set(row.menu, {
        quantity: current.quantity + row.quantity,
        amount: current.amount + row.amount,
      })
    })
    const totalMenuAmount = Array.from(menuSalesMap.values()).reduce((sum, item) => sum + item.amount, 0)
    const menuSales = Array.from(menuSalesMap.entries()).map(([name, data]) => ({
      name,
      value: totalMenuAmount > 0 ? Math.round((data.amount / totalMenuAmount) * 100) : 0,
      amount: data.amount,
    }))

    const weatherSalesMap = new Map<string, number>()
    data.forEach((row) => {
      const current = weatherSalesMap.get(row.weather) || 0
      weatherSalesMap.set(row.weather, current + row.amount)
    })
    const weatherSales = Array.from(weatherSalesMap.entries()).map(([weather, sales]) => ({ weather, sales }))

    const dailyMenuMap = new Map<string, { [menu: string]: number }>()
    data.forEach((row) => {
      if (!dailyMenuMap.has(row.date)) {
        dailyMenuMap.set(row.date, {})
      }
      const dayData = dailyMenuMap.get(row.date)!
      dayData[row.menu] = (dayData[row.menu] || 0) + row.amount
    })

    const dailyMenuBreakdown = Array.from(dailyMenuMap.entries())
      .map(([date, menuData]) => ({
        date,
        ...menuData,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const totalSales = data.reduce((sum, row) => sum + row.amount, 0)
    const totalOrders = data.reduce((sum, row) => sum + row.quantity, 0)
    const averageSpend = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0

    return {
      dailySales,
      menuSales,
      weatherSales,
      totalSales,
      averageSpend,
      totalOrders,
      dailyMenuBreakdown,
    }
  }

  const performAIAnalysis = async (data: CSVData[], analysis: AnalysisData) => {
    const prompt = `
以下は飲食店の売上データです。このデータを元に、売上傾向の分析と、改善提案を日本語で3つ提示してください。

総売上: ¥${analysis.totalSales.toLocaleString()}
注文数: ${analysis.totalOrders}
平均客単価: ¥${analysis.averageSpend.toLocaleString()}
期間日数: ${analysis.dailySales.length}日

メニュー別売上:
${analysis.menuSales.map((m) => `${m.name}: ¥${m.amount.toLocaleString()}`).join("\n")}

天気別売上:
${analysis.weatherSales.map((w) => `${w.weather}: ¥${w.sales.toLocaleString()}`).join("\n")}

以下の形式で回答してください：
1. 売上傾向の分析（2-3行）
2. 改善提案（3つ、それぞれ具体的に）
3. 優先度の高い施策（1つ）
`

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      const responseData = await res.json()

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error(`403: ${responseData.error}`)
        } else if (res.status === 429) {
          throw new Error(`429: ${responseData.error}`)
        } else {
          throw new Error(`${res.status}: ${responseData.error}`)
        }
      }

      return responseData

    } catch (error) {
      console.error("AI分析リクエストエラー:", error)
      throw error
    }
  }

  // 統合されたインポート処理（修正版）
  const handleImport = async () => {
    if (!uploadedFile) return

    setIsUploading(true)
    setIsAnalyzing(true)
    setUploadStatus("idle")
    setAiAnalysis("")
    setAnalysisError("")
    setCsvData([])
    setAnalysisData(null)
    setLastUsageInfo(null)
    setAiAnalysisAvailable(true)

    let parsedData: CSVData[] = []
    let analysis: AnalysisData | null = null
    let aiResult: any = null

    try {
      // 1. CSVデータ解析
      console.log('📊 CSVデータ解析開始')
      parsedData = await parseCSVData(uploadedFile)
      setCsvData(parsedData)
      console.log('✅ CSVデータ解析完了:', parsedData.length, '件')

      // 2. 基本分析処理
      console.log('📈 基本分析処理開始')
      analysis = analyzeData(parsedData)
      setAnalysisData(analysis)
      console.log('✅ 基本分析処理完了')

      // 3. AI分析実行（エラーがあっても続行）
      console.log('🤖 AI分析開始')
      try {
        aiResult = await performAIAnalysis(parsedData, analysis)
        setAiAnalysis(aiResult.result)
        
        if (aiResult.usage) {
          setLastUsageInfo(aiResult.usage)
          toast.success(`AI分析が完了しました。残り${aiResult.usage.remaining}回利用可能です。`)
        }
        console.log('✅ AI分析完了')
      } catch (aiError) {
        console.warn('⚠️ AI分析はスキップ:', aiError)
        setAiAnalysisAvailable(false)
        
        if (aiError instanceof Error) {
          if (aiError.message.includes('403')) {
            setAnalysisError("フリープランではAI分析は利用できません。基本分析データのみ保存されました。")
            toast.info("基本分析データを保存しました。AI分析はプレミアム機能です。")
          } else if (aiError.message.includes('429')) {
            setAnalysisError("一時的に利用制限に達しています。基本分析データは保存されました。")
            toast.warning("利用制限により、AI分析をスキップしました。")
          } else {
            setAnalysisError("AI分析中にエラーが発生しましたが、基本分析データは保存されました。")
            toast.warning("AI分析をスキップして、基本データを保存しました。")
          }
        }
      }

      setIsAnalyzing(false)

      // 4. データ保存処理（AI分析の成否に関わらず実行）
      console.log('💾 データ保存開始')
      const response = await fetch("/api/analyze/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          records: parsedData,
          aiAnalysis: aiResult?.result || null // AI分析がない場合はnull
        }),
      })

      const result = await response.json()
      console.log('🔍 Upload API Response:', { status: response.status, result })

      if (!response.ok) {
        throw new Error(result.error || 'データ保存に失敗しました')
      }

      // 5. 成功時の処理
      setUploadStatus("success")
      
      const aiMessage = aiResult 
        ? `AI分析と基本データの保存が完了しました。` 
        : `基本分析データの保存が完了しました。`
      
      setUploadMessage(
        `${uploadedFile.name} のインポートが完了しました。${parsedData.length}件のデータを保存しました。${aiMessage}`,
      )

      if (parsedData.length > 0) {
        const dates = parsedData.map((row) => row.date).sort()
        setStartDate(dates[0])
        setEndDate(dates[dates.length - 1])
      }

      console.log('✅ 全処理完了:', result)

    } catch (error) {
      console.error('❌ 処理エラー:', error)
      setUploadStatus("error")
      
      if (error instanceof Error) {
        if (error.message.includes('CSV')) {
          // CSV解析エラー
          setUploadMessage(error.message)
        } else {
          // データ保存エラー
          setUploadMessage(`データ保存エラー: ${error.message}`)
        }
      } else {
        setUploadMessage("処理中にエラーが発生しました。")
      }
    } finally {
      setIsUploading(false)
      setIsAnalyzing(false)
    }
  }

  const clearUpload = () => {
    setUploadedFile(null)
    setUploadStatus("idle")
    setUploadMessage("")
    setAiAnalysis("")
    setAnalysisError("")
    setCsvData([])
    setAnalysisData(null)
    setLastUsageInfo(null)
    setSelectedMenu("all")
    setStartDate("")
    setEndDate("")
    setSearchTerm("")
    setAiAnalysisAvailable(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const clearFilters = () => {
    setSelectedMenu("all")
    setStartDate("")
    setEndDate("")
    setSearchTerm("")
  }

  const UsageDisplay = ({ usage }: { usage: UsageInfo | null }) => {
    if (!usage) return null

    const percentage = (usage.current / usage.limit) * 100
    const isNearLimit = percentage >= 80

    return (
      <div className={`mt-4 p-4 rounded-lg border ${isNearLimit ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">今月の利用状況</span>
          <span className={`text-sm font-bold ${isNearLimit ? 'text-red-600' : 'text-blue-600'}`}>
            {usage.current}/{usage.limit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isNearLimit ? 'bg-red-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>残り {usage.remaining} 回</span>
          <span>{usage.planName}プラン</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">売上分析ダッシュボード</h1>
              <p className="text-gray-600">CSVファイルをアップロードして日別・メニュー別の詳細な売上分析を行います</p>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">今月</SelectItem>
                  <SelectItem value="last-month">先月</SelectItem>
                  <SelectItem value="last-3-months">過去3ヶ月</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Card className="shadow-sm border-0 bg-white mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">データインポート</CardTitle>
            </div>
            <CardDescription>CSVファイルをアップロードして売上データを分析します</CardDescription>
          </CardHeader>
          <CardContent>
            {uploadStatus !== "idle" && (
              <Alert
                className={`mb-4 ${uploadStatus === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
              >
                <div className="flex items-start">
                  {uploadStatus === "success" ? (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <AlertDescription
                    className={`ml-2 ${uploadStatus === "success" ? "text-green-800" : "text-red-800"} whitespace-pre-wrap`}
                  >
                    {uploadMessage}
                  </AlertDescription>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadStatus("idle")}
                    className="ml-auto p-1 h-auto flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver
                      ? "border-blue-400 bg-blue-50"
                      : uploadedFile
                        ? "border-green-400 bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <FileText className="w-8 h-8 text-green-600 mx-auto" />
                      <p className="text-sm font-medium text-green-800">{uploadedFile.name}</p>
                      <p className="text-xs text-green-600">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearUpload}
                        className="text-gray-600 hover:text-gray-800 bg-transparent"
                      >
                        ファイルを変更
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        CSVファイルをドラッグ&ドロップ
                        <br />
                        または
                      </p>
                      <label htmlFor="csv-upload">
                        <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
                          <span>ファイルを選択</span>
                        </Button>
                      </label>
                      <input id="csv-upload" type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Button
                    onClick={handleImport}
                    disabled={!uploadedFile || isUploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isAnalyzing ? "分析中..." : "インポート中..."}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        インポート・分析実行
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">CSVファイル形式</h4>
                <div className="space-y-3 text-sm text-gray-600">
                  <div>
                    <p className="font-medium mb-1">必要な列（1行目にヘッダーが必要）:</p>
                    <code className="bg-white px-2 py-1 rounded text-xs">日付,メニュー,数量,金額,天気</code>
                  </div>

                  <div>
                    <p className="font-medium mb-1">例:</p>
                    <div className="bg-white p-2 rounded text-xs font-mono">
                      日付,メニュー,数量,金額,天気
                      <br />
                      2024-01-15,醤油ラーメン,5,4000,晴れ
                      <br />
                      2024-01-15,餃子,3,1500,晴れ
                      <br />
                      2024-01-16,味噌ラーメン,8,6400,雨
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-1">注意事項:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>日付形式: YYYY-MM-DD（例: 2024-01-15）</li>
                      <li>数量・金額は半角数字のみ</li>
                      <li>天気: 晴れ、曇り、雨、雪など</li>
                      <li>文字コード: UTF-8推奨</li>
                      <li>1行目は必ずヘッダー行にしてください</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {csvData.length > 0 && (
          <Card className="shadow-sm border-0 bg-white mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-purple-600" />
                  <CardTitle className="text-lg">フィルター</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  フィルターをクリア
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="menu-filter" className="text-sm font-medium text-gray-700 mb-2 block">
                    メニュー
                  </Label>
                  <Select value={selectedMenu} onValueChange={setSelectedMenu}>
                    <SelectTrigger>
                      <SelectValue placeholder="メニューを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      {uniqueMenus.map((menu) => (
                        <SelectItem key={menu} value={menu}>
                          {menu}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="start-date" className="text-sm font-medium text-gray-700 mb-2 block">
                    開始日
                  </Label>
                  <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="end-date" className="text-sm font-medium text-gray-700 mb-2 block">
                    終了日
                  </Label>
                  <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
                    検索
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="メニュー名で検索"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {analysisData && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📊 全体統計</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-sm border-0 bg-white">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <CardTitle className="text-lg">売上合計</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(analysisData.totalSales)}</p>
                    <p className="text-sm text-gray-600 mt-1">総注文数: {analysisData.totalOrders}件</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-0 bg-white">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">平均客単価</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(analysisData.averageSpend)}</p>
                    <p className="text-sm text-gray-600 mt-1">1注文あたりの平均金額</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-0 bg-white">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      <CardTitle className="text-lg">分析期間</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900">{analysisData.dailySales.length}</p>
                    <p className="text-sm text-gray-600 mt-1">日間のデータ</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📈 詳細分析</h2>

              <Card className="shadow-sm border-0 bg-white mb-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">日別・メニュー別売上推移</CardTitle>
                  </div>
                  <CardDescription>各日のメニューごとの売上を色分けで表示</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 overflow-x-auto">
                    <div style={{ minWidth: "600px", height: "100%" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analysisData.dailyMenuBreakdown}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip
                            formatter={(value, name) => [formatCurrency(value as number), name]}
                            labelFormatter={(label) => `日付: ${label}`}
                          />
                          <Legend />
                          {uniqueMenus.map((menu, index) => (
                            <Bar
                              key={menu}
                              dataKey={menu}
                              stackId="a"
                              fill={MENU_COLORS[menu as keyof typeof MENU_COLORS] || COLORS[index % COLORS.length]}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <CardTitle className="text-lg">日別・メニュー別詳細表</CardTitle>
                  </div>
                  <CardDescription>
                    フィルタリング結果: {filteredData.length}件のデータ
                    {filteredData.length !== csvData.length && ` (全${csvData.length}件中)`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>日付</TableHead>
                          <TableHead>メニュー</TableHead>
                          <TableHead className="text-right">数量</TableHead>
                          <TableHead className="text-right">金額</TableHead>
                          <TableHead>天気</TableHead>
                          <TableHead className="text-right">単価</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{row.date}</TableCell>
                            <TableCell>{row.menu}</TableCell>
                            <TableCell className="text-right">{row.quantity}個</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                {row.weather}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-sm text-gray-600">
                              {formatCurrency(Math.round(row.amount / row.quantity))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filteredData.length === 0 && (
                      <div className="text-center py-8 text-gray-500">フィルター条件に一致するデータがありません</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Traditional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Menu Sales Chart */}
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5 text-green-600" />
                    <CardTitle className="text-lg">メニュー別売上比率</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center">
                    <div className="w-1/2">
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsPieChart>
                          <Pie
                            data={analysisData.menuSales}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {analysisData.menuSales.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 pl-4">
                      <div className="space-y-3">
                        {analysisData.menuSales.map((item, index) => (
                          <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-sm text-gray-700">{item.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{item.value}%</p>
                              <p className="text-xs text-gray-500">{formatCurrency(item.amount)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weather Sales Chart */}
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <Cloud className="w-5 h-5 text-orange-600" />
                    <CardTitle className="text-lg">天気別売上傾向</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysisData.weatherSales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="weather" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Bar dataKey="sales" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* AI Analysis Section */}
        {(isAnalyzing || aiAnalysis || analysisError) && (
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-purple-600" />
                <CardTitle className="text-lg">📊 AIによる売上分析と提案</CardTitle>
              </div>
              <CardDescription>アップロードされたデータをAIが分析し、改善提案を行います</CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyzing && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">AIが売上データを分析中です...</p>
                    <p className="text-sm text-gray-500 mt-2">しばらくお待ちください</p>
                  </div>
                </div>
              )}

              {analysisError && !aiAnalysisAvailable && (
                <div className="text-center py-8 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50">
                  <Crown className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">AI分析はプレミアム機能です</h3>
                  <p className="text-purple-700 mb-4 max-w-md mx-auto">
                    基本的な分析データはご利用いただけます。より詳細なAI分析と改善提案をご希望の場合は、プランをアップグレードしてください。
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Crown className="w-4 h-4 mr-2" />
                    プランをアップグレード
                  </Button>
                  <div className="mt-4 text-sm text-purple-600">
                    <p className="font-medium">プレミアムプランの特典：</p>
                    <ul className="mt-2 space-y-1">
                      <li>• AIによる詳細な売上分析</li>
                      <li>• 具体的な改善提案</li>
                      <li>• 無制限のデータアップロード</li>
                      <li>• 高度なレポート機能</li>
                    </ul>
                  </div>
                </div>
              )}

              {analysisError && aiAnalysisAvailable && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800">{analysisError}</AlertDescription>
                </Alert>
              )}

              {aiAnalysis && (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-6">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{aiAnalysis}</div>
                    </div>
                  </div>
                  
                  {/* 使用量表示 */}
                  <UsageDisplay usage={lastUsageInfo} />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* No Data State */}
        {csvData.length === 0 && uploadStatus !== "success" && (
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">データをアップロードしてください</h3>
              <p className="text-gray-600 mb-6">
                CSVファイルをアップロードすると、詳細な売上分析とAIによる改善提案を確認できます。
              </p>
              <div className="text-sm text-gray-500">
                <p>対応形式: CSV (.csv)</p>
                <p>必要な列: 日付, メニュー, 数量, 金額, 天気</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
