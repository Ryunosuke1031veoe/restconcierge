
interface StoreContext {
  storeName?: string
  storeType?: string
  averageSpend?: number
  seats?: number
  businessHours?: string
  challenges?: string[]
}

export function generateEnhancedPrompt(
  analysisData: any,
  csvData: any[],
  storeContext: StoreContext
): string {
  const challengeLabels = {
    "customer-acquisition": "集客・新規顧客獲得",
    "sales-improvement": "売上向上",
    "menu-development": "メニュー開発・改善",
    "staff-shortage": "人手不足",
    "cost-management": "コスト管理",
    "customer-service": "接客・サービス向上",
    "marketing": "マーケティング・宣伝",
    "operations": "業務効率化"
  } as const

  const challengeText = storeContext.challenges?.length 
    ? storeContext.challenges.map(id => challengeLabels[id as keyof typeof challengeLabels] || id).join("、")
    : "特に指定なし"

  return `
あなたは経験豊富な飲食店経営コンサルタントです。以下の店舗情報と売上データを分析し、具体的で実践的な改善提案を提供してください。

【店舗情報】
店舗名: ${storeContext.storeName || "未設定"}
業態: ${storeContext.storeType || "未設定"}
平均客単価: ${storeContext.averageSpend ? `¥${storeContext.averageSpend.toLocaleString()}` : "未設定"}
席数: ${storeContext.seats ? `${storeContext.seats}席` : "未設定"}
営業時間: ${storeContext.businessHours || "未設定"}
現在の課題: ${challengeText}

【売上データ分析結果】
総売上: ¥${analysisData.totalSales.toLocaleString()}
注文数: ${analysisData.totalOrders}
平均客単価: ¥${analysisData.averageSpend.toLocaleString()}
分析期間: ${analysisData.dailySales.length}日間

【メニュー別売上】
${analysisData.menuSales.map((m: any) => `${m.name}: ¥${m.amount.toLocaleString()} (${m.value}%)`).join("\n")}

【天気別売上】
${analysisData.weatherSales.map((w: any) => `${w.weather}: ¥${w.sales.toLocaleString()}`).join("\n")}

【分析指示】
この${storeContext.storeType || "飲食店"}の売上データを詳細に分析し、以下の観点から改善提案を行ってください：

1. **売上傾向の分析**: 
   - 設定された課題「${challengeText}」の観点から現状を分析
   - 業態「${storeContext.storeType}」の一般的な指標との比較
   - 客単価や席数を考慮した収益性の評価

2. **具体的な改善提案（優先順位順に3つ）**:
   - 各提案に期待される効果と実施期間を明記
   - 店舗の規模（${storeContext.seats}席）や業態に適した現実的な提案
   - 設定された課題の解決につながる具体的アクション

3. **最優先で取り組むべき施策**:
   - 即効性があり、リスクが低い施策を1つ選定
   - 具体的な実施手順と期待される成果

4. **業態特有のアドバイス**:
   - ${storeContext.storeType || "この業態"}に特化した追加のアドバイス

回答は日本語で、実際に実行可能な具体的な内容にしてください。
`
}