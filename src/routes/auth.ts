import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { db } from '../db/database'

export const authRouter = Router()

authRouter.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' })
  }

  const id = Math.random().toString(36).slice(2)
  const hash = await bcrypt.hash(password, 10)

  db.run('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)', [id, name, email, hash], (err) => {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ message: 'Email already exists' })
      }
      return res.status(500).json({ message: 'Database error' })
    }

    const user = { id, name, email }
    const token = jwt.sign(user, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
    res.json({ token, user })
  })
})

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user: any) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    if (!user) return res.status(400).json({ message: 'Invalid email or password' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ message: 'Invalid email or password' })

    const userData = { id: user.id, name: user.name, email: user.email }
    const token = jwt.sign(userData, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
    res.json({ token, user: userData })
  })
})
