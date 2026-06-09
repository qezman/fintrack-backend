import { Router } from 'express'
import { db } from '../db/database'
import { AuthRequest } from '../middleware/auth'

export const txRouter = Router()

txRouter.get('/', (req: AuthRequest, res) => {
  const userId = req.user?.id
  db.all('SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC', [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    res.json(rows)
  })
})

txRouter.post('/', (req: AuthRequest, res) => {
  const userId = req.user?.id
  const { amount, type, category, date, note, receiptKey } = req.body
  const id = Math.random().toString(36).slice(2)
  const createdAt = new Date().toISOString()

  db.run(
    'INSERT INTO transactions (id, userId, amount, type, category, date, note, receiptKey, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, userId, amount, type, category, date, note, receiptKey, createdAt],
    (err) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json({ id, userId, amount, type, category, date, note, receiptKey, createdAt })
    }
  )
})

txRouter.delete('/:id', (req: AuthRequest, res) => {
  const userId = req.user?.id
  const id = req.params.id

  db.run('DELETE FROM transactions WHERE id = ? AND userId = ?', [id, userId], (err) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    res.status(204).send()
  })
})

txRouter.get('/summary', (req: AuthRequest, res) => {
  const userId = req.user?.id
  db.all('SELECT amount, type FROM transactions WHERE userId = ?', [userId], (err, rows: any[]) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    
    let totalIncome = 0
    let totalExpenses = 0
    
    rows.forEach(r => {
      if (r.type === 'income') totalIncome += r.amount
      else totalExpenses += r.amount
    })
    
    res.json({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses
    })
  })
})
