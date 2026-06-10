import Fastify from 'fastify'
import cors from '@fastify/cors'
import dotenv from 'dotenv'

dotenv.config()

import jwtPlugin from './plugins/jwt'
import { authRoutes } from './routes/auth'
import { txRoutes } from './routes/transactions'
import { uploadRoutes } from './routes/uploads'

const fastify = Fastify({ logger: true })

async function start() {
  await fastify.register(cors)
  await fastify.register(jwtPlugin)

  fastify.get('/health', async () => {
    return { status: 'ok' }
  })

  fastify.register(authRoutes, { prefix: '/auth' })
  fastify.register(txRoutes, { prefix: '/transactions' })
  fastify.register(uploadRoutes, { prefix: '/uploads' })

  try {
    const port = parseInt(process.env.PORT || '3001', 10)
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`Backend server running on http://0.0.0.0:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
