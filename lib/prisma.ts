
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl = process.env.DATABASE_URL || 
  "mysql://avnadmin:AVNS_NnIX7VD6elZnLsQPUSb@mysql-37af86d7-isiiryuno1031-e169.k.aivencloud.com:27896/defaultdb?ssl-mode=REQUIRED"

console.log('🔧 DATABASE_URL status:', process.env.DATABASE_URL ? 'Found' : 'Using fallback')

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error"],
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
