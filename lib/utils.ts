import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { StoreSettingsOutput, StoreProfile } from "@/types/store-settings"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}




export function convertStoreSettingsToProfile(settings: StoreSettingsOutput): StoreProfile {
  return {
    id: undefined, 
    name: settings.storeName || "店舗名未設定",
    type: settings.storeType || "未設定",
    location: undefined, 
    phoneNumber: undefined, 
    seats: settings.seats || undefined,
    averageSpend: settings.averageSpend || undefined,
    openingHours: settings.businessHours || undefined,
    challenges: Array.isArray(settings.challenges) 
      ? settings.challenges.join(', ') 
      : undefined,
    createdAt: undefined,
    updatedAt: settings.lastUpdated?.toString(),
  }
}


export function isValidStoreProfile(profile: StoreProfile): boolean {
  return !!(
    profile.name && 
    profile.name !== "店舗名未設定" &&
    profile.type && 
    profile.type !== "未設定"
  )
}


export function formatCurrency(amount: number | undefined): string {
  if (!amount || amount === 0) return "未設定"
  
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0
  }).format(amount)
}