import { FastifyInstance } from 'fastify'
import { prisma } from '../db/prisma'

function getString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function optionalString(value: unknown) {
  const stringValue = getString(value)
  return stringValue ? stringValue : undefined
}

function getAmount(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return Number.NaN

  return Number(value.replace(/,/g, '').trim())
}

export async function txRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/', async (request, reply) => {
    const userId = request.user.id
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    })
    return transactions
  })

  fastify.post('/', async (request, reply) => {
    const userId = request.user.id
    const body = (request.body ?? {}) as Record<string, unknown>
    const amount = getAmount(body.amount ?? body.value)
    const type = getString(body.type ?? body.transactionType).toLowerCase()
    const category = getString(body.category ?? body.categoryName)
    const rawDate = body.date ?? body.transactionDate
    const date = rawDate ? new Date(String(rawDate)) : new Date()
    const note = optionalString(body.note ?? body.notes ?? body.description)
    const receiptKey = optionalString(body.receiptKey ?? body.receiptUrl ?? body.receipt)

    if (!Number.isFinite(amount) || amount <= 0) {
      return reply.code(400).send({ message: 'Amount must be a positive number' })
    }

    if (!['income', 'expense'].includes(type)) {
      return reply.code(400).send({ message: 'Type must be income or expense' })
    }

    if (!category) {
      return reply.code(400).send({ message: 'Category is required' })
    }

    if (Number.isNaN(date.getTime())) {
      return reply.code(400).send({ message: 'Date must be valid' })
    }
    
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        type,
        category,
        date,
        note,
        receiptKey
      }
    })
    
    return transaction
  })

  fastify.delete('/:id', async (request, reply) => {
    const userId = request.user.id
    const { id } = request.params as any

    await prisma.transaction.deleteMany({
      where: { id, userId }
    })

    return reply.code(204).send()
  })

  fastify.get('/summary', async (request, reply) => {
    const userId = request.user.id
    
    const rows = await prisma.transaction.findMany({
      where: { userId },
      select: { amount: true, type: true }
    })
    
    let totalIncome = 0
    let totalExpenses = 0
    
    rows.forEach(r => {
      if (r.type === 'income') totalIncome += r.amount
      else totalExpenses += r.amount
    })
    
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses
    }
  })
}
