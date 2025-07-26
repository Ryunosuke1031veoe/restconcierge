
// export interface StoreSettingsInput {
//   storeName: string
//   storeType: string
//   averageSpend: number
//   seats: number
//   businessHours: string
//   challenges: string[]
// }

// export interface StoreSettingsOutput {
//   storeName: string
//   storeType: string
//   averageSpend: number
//   seats: number
//   businessHours: string
//   challenges: string[]
//   lastUpdated: Date | null
//   isFirstTime: boolean
// }

// export interface StoreSettingsResponse {
//   success: boolean
//   message?: string
//   data?: StoreSettingsOutput
//   error?: string
// }

// // チャット用の店舗プロフィール型（StoreSettingsOutputから変換）
// export interface StoreProfile {
//   id?: string
//   name: string
//   type: string
//   location?: string
//   phoneNumber?: string
//   seats?: number
//   averageSpend?: number
//   openingHours?: string
//   challenges?: string
//   createdAt?: string
//   updatedAt?: string
// }

// // チャット用の型
// export interface Message {
//   id: string
//   content: string
//   sender: "user" | "ai"
//   timestamp: Date
// }

// export interface ChatSession {
//   id: string
//   title: string
//   createdAt: Date
//   updatedAt: Date
// }

// // StoreSettingsOutputからStoreProfileに変換するヘルパー関数の型
// export type StoreSettingsToProfileConverter = (settings: StoreSettingsOutput) => StoreProfile


export interface StoreSettingsInput {
  storeName: string
  storeType: string
  averageSpend: number
  seats: number
  businessHours: string
  challenges: string[]
}

export interface StoreSettingsOutput {
  storeName: string
  storeType: string
  averageSpend: number
  seats: number
  businessHours: string
  challenges: string[]
  lastUpdated: Date | null
  isFirstTime: boolean
}

// API レスポンス構造を正しく定義
export interface StoreSettingsResponse {
  success: boolean
  message?: string
  data?: {
    user: {
      id: string
      name: string
      email: string
      phone: string
      address: string
      createdAt: string
    }
    currentPlan: {
      id: string
      name: string
      displayName: string
      price: number
      consultationLimit: number
      features: string[]
      isActive: boolean
      sortOrder: number
    }
    usage: {
      monthlyConsultations: number
      consultationLimit: number
      nextBillingDate: string
    }
    storeSettings: {
      storeName: string
      storeType: string
      averageSpend: number
      seats: number
      businessHours: string
      challenges: string[]
      lastUpdated: string | null
      isFirstTime: boolean
    }
  }
  error?: string
}

// チャット用の店舗プロフィール型（StoreSettingsOutputから変換）
export interface StoreProfile {
  id?: string
  name: string
  type: string
  location?: string
  phoneNumber?: string
  seats?: number
  averageSpend?: number
  openingHours?: string
  challenges?: string
  createdAt?: string
  updatedAt?: string
}

// チャット用の型
export interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export interface ChatSession {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
}

// StoreSettingsOutputからStoreProfileに変換するヘルパー関数の型
export type StoreSettingsToProfileConverter = (settings: StoreSettingsOutput) => StoreProfile
