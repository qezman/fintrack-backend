import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const url = process.env.DATABASE_URL || ''
const isAccelerate = url.startsWith('prisma://') || url.startsWith('prisma+postgres://')

let adapter
if (!isAccelerate) {
  const pool = new Pool({ connectionString: url })
  adapter = new PrismaPg(pool)
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(
  isAccelerate ? { accelerateUrl: url } : { adapter }
)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
