import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import crypto from 'node:crypto'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

// In-memory store for pending requests and completed callback results, keyed by requestId
const resultsMap = new Map()

// Middleware
app.use(cors({
  origin: CLIENT_ORIGIN,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}))
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Support request endpoint
app.post('/api/support/request', (req, res) => {
  const { message } = req.body

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Message must be a non-empty string.' })
  }

  const requestId = crypto.randomUUID()

  // Store initial pending state for the generated requestId
  resultsMap.set(requestId, {
    requestId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  })

  // Note: Later, when ZAPIER_CATCH_HOOK_URL is configured, the request will be forwarded to Zapier here.

  return res.status(202).json({
    requestId,
    status: 'accepted',
  })
})

// Support callback endpoint (called by Zapier)
app.post('/api/support/callback', (req, res) => {
  const payload = req.body

  if (!payload || !payload.requestId || typeof payload.requestId !== 'string') {
    return res.status(400).json({ error: 'requestId is required.' })
  }

  if (!resultsMap.has(payload.requestId)) {
    return res.status(404).json({ error: 'Request ID not found.' })
  }

  // Update pending entry with completed callback payload
  resultsMap.set(payload.requestId, payload)

  return res.status(200).json({ status: 'acknowledged' })
})

// Support result endpoint (polled by React frontend)
app.get('/api/support/result/:requestId', (req, res) => {
  const { requestId } = req.params

  if (!resultsMap.has(requestId)) {
    return res.status(404).json({ error: 'Request ID not found.' })
  }

  const result = resultsMap.get(requestId)
  return res.status(200).json(result)
})

app.listen(PORT, () => {
  console.log(`Northstar Support server running on port ${PORT}`)
})
