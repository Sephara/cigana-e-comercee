import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL não configurada')

const log: ('query' | 'error' | 'warn')[] =
  process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']

const pool = new Pool({ connectionString: url })
const adapter = new PrismaPg(pool)
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter, log })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
