const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

interface SupportRequestResponse {
  requestId: string
  status: string
}

interface SupportResultResponse {
  requestId: string
  status: string
  reply?: string
  intent?: string
  escalation?: boolean
  order?: unknown
  error?: string
}

const POLLING_INTERVAL_MS = 1000
const MAX_POLLING_ATTEMPTS = 30

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function processCustomerMessage(messageText: string): Promise<string> {
  try {
    const requestRes = await fetch(`${API_BASE_URL}/api/support/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: messageText }),
    })

    if (!requestRes.ok) {
      throw new Error(`Request failed with status ${requestRes.status}`)
    }

    const requestData: SupportRequestResponse = await requestRes.json()
    const { requestId } = requestData

    if (!requestId) {
      throw new Error('No requestId returned from server.')
    }

    for (let attempt = 0; attempt < MAX_POLLING_ATTEMPTS; attempt++) {
      await delay(POLLING_INTERVAL_MS)

      const resultRes = await fetch(`${API_BASE_URL}/api/support/result/${requestId}`)

      if (!resultRes.ok) {
        throw new Error(`Polling failed with status ${resultRes.status}`)
      }

      const resultData: SupportResultResponse = await resultRes.json()

      if (resultData.status !== 'pending') {
        if (resultData.reply) {
          return resultData.reply
        }
        throw new Error('Completed result missing reply field.')
      }
    }

    throw new Error('Polling timed out waiting for support response.')
  } catch {
    return 'Sorry, I ran into a problem checking your request. Please try again in a moment.'
  }
}
