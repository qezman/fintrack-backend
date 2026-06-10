import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { prisma } from '../db/prisma'

function getString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    const body = (request.body ?? {}) as Record<string, unknown>
    const name = getString(body.name)
    const email = getString(body.email).toLowerCase()
    const password = getString(body.password)
    
    if (!name || !email || !password) {
      return reply.code(400).send({ message: 'Missing fields' })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return reply.code(400).send({ message: 'Email already exists' })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hash
      }
    })

    const token = fastify.jwt.sign({ id: user.id, name: user.name, email: user.email }, { expiresIn: '7d' })
    return { token, user: { id: user.id, name: user.name, email: user.email } }
  })

  fastify.post('/login', async (request, reply) => {
    const body = (request.body ?? {}) as Record<string, unknown>
    const email = getString(body.email).toLowerCase()
    const password = getString(body.password)

    if (!email || !password) {
      return reply.code(400).send({ message: 'Email and password are required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return reply.code(400).send({ message: 'Invalid email or password' })
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      return reply.code(400).send({ message: 'Invalid email or password' })
    }

    const token = fastify.jwt.sign({ id: user.id, name: user.name, email: user.email }, { expiresIn: '7d' })
    return { token, user: { id: user.id, name: user.name, email: user.email } }
  })
}
