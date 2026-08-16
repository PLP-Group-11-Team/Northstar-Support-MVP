const WEBHOOK_URL =
  'https://adeshissack27.app.n8n.cloud/webhook/Northstar-support'

function detectType(messageText: string): 'order' | 'return' {
  const message = messageText.toLowerCase()

  if (
    message.includes('return') ||
    message.includes('refund') ||
    message.includes('damaged') ||
    message.includes('wrong item') ||
    message.includes('exchange')
  ) {
    return 'return'
  }

  return 'order'
}

function extractOrderId(messageText: string): string | null {
  const match = messageText.toUpperCase().match(/NS\d{4,}/)
  return match ? match[0] : null
}

export async function processCustomerMessage(
  messageText: string,
): Promise<string> {
  try {
    const type = detectType(messageText)

    const payload =
      type === 'order'
        ? {
            type: 'order',
            orderId: extractOrderId(messageText),
          }
        : {
            type: 'return',
            message: messageText,
          }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const data = await response.json()

    if (data.message) {
      return data.message
    }

    return 'Sorry, I could not find an answer for that request.'
  } catch {
    return 'Sorry, I ran into a problem checking your request. Please try again in a moment.'
  }
}
