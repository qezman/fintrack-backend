import { FastifyInstance } from 'fastify'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import path from 'path'

const region = process.env.AWS_REGION || 'us-east-1'
const s3Client = new S3Client({
  region,
  ...(process.env.NODE_ENV !== 'production' && !process.env.AWS_ACCESS_KEY_ID
    ? { credentials: { accessKeyId: 'dummy', secretAccessKey: 'dummy' } }
    : {}),
})

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.post('/presign', async (request, reply) => {
    const { filename, contentType } = request.body as any
    
    const ext = path.extname(filename)
    const key = `receipt-${Date.now()}${ext}`
    const bucket = process.env.AWS_S3_BUCKET_NAME
    
    if (!bucket) {
      return reply.code(500).send({ message: 'Server configuration error: AWS_S3_BUCKET_NAME is not set' })
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    })

    try {
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
      const publicViewUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`
      
      // We return both uploadUrl (for PUT) and the public viewing URL (to be saved as receiptKey)
      return { uploadUrl, key: publicViewUrl }
    } catch (err) {
      fastify.log.error(err)
      return reply.code(500).send({ message: 'Failed to generate presigned URL' })
    }
  })
}
