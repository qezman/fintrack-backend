import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import { FastifyRequest, FastifyReply } from 'fastify'

export default fp(async function (fastify, opts) {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'supersecret'
  })

  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.code(401).send({ message: 'Unauthorized' })
    }
  })
})

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; name: string; email: string }
    user: { id: string; name: string; email: string }
  }
}
