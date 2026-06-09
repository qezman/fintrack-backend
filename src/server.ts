import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth'
import { txRouter } from './routes/transactions'
import { authenticateToken } from './middleware/auth'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/auth', authRouter)
app.use('/transactions', authenticateToken, txRouter)

import fs from 'fs'
import path from 'path'

const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use('/uploads', express.static(uploadsDir))

app.post('/uploads/presign', authenticateToken, (req, res) => {
  const { filename } = req.body
  const ext = path.extname(filename)
  const key = `receipt-${Date.now()}${ext}`
  res.json({
    uploadUrl: `http://localhost:3001/uploads/${key}`,
    key
  })
})

app.put('/uploads/:key', (req, res) => {
  const filePath = path.join(uploadsDir, req.params.key)
  const writeStream = fs.createWriteStream(filePath)
  
  req.pipe(writeStream)
  
  req.on('end', () => {
    res.status(200).send('OK')
  })
  
  req.on('error', (err) => {
    console.error('Upload error:', err)
    res.status(500).send('Upload failed')
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
})
