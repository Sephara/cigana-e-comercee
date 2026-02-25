import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL não configurada')

const isAccelerate = url.includes('accelerate') || url.includes('prisma-data-platform')
const log: ('query' | 'error' | 'warn')[] =
  process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']

const clientOptions = isAccelerate ? { accelerateUrl: url, log } : { log }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient(clientOptions as any)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
