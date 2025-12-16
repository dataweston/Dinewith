import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error']
  })
}

export const prisma: PrismaClient = (() => {
  if (!process.env.DATABASE_URL) {
    return new Proxy(
      {},
      {
        get() {
          throw new Error(
            'DATABASE_URL is not set. Configure it in Vercel Project Settings → Environment Variables (and locally in your .env) before using Prisma.'
          )
        }
      }
    ) as unknown as PrismaClient
  }

  if (process.env.NODE_ENV !== 'production') {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient()
    }
    return globalForPrisma.prisma
  }

  return createPrismaClient()
})()
