
import { Prisma } from '@prisma/client'

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

export interface StoreSettingsResponse {
  success: boolean
  message?: string
  data?: StoreSettingsOutput
  error?: string
}

export function arrayToJsonValue(arr: string[]): Prisma.InputJsonValue {
  return arr as Prisma.InputJsonValue
}

export function jsonValueToArray(jsonValue: unknown): string[] {
  if (!jsonValue) return []
  if (Array.isArray(jsonValue)) {
    return jsonValue.filter((item): item is string => typeof item === 'string')
  }
  if (typeof jsonValue === 'string') {
    try {
      const parsed = JSON.parse(jsonValue)
      return Array.isArray(parsed) 
        ? parsed.filter((item): item is string => typeof item === 'string')
        : []
    } catch {
      return []
    }
  }
  return []
}

export const JSON_NULL = Prisma.JsonNull

export function isValidStoreSettings(data: any): data is StoreSettingsInput {
  return (
    data &&
    typeof data.storeName === 'string' &&
    typeof data.storeType === 'string' &&
    typeof data.averageSpend === 'number' &&
    typeof data.seats === 'number' &&
    typeof data.businessHours === 'string' &&
    Array.isArray(data.challenges)
  )
}