export interface Order {
  id: string
  customerName: string
  item: string
  status: string
  trackingNumber?: string
  expectedDelivery: string
  latestUpdate: string
}

const MOCK_ORDERS: Record<string, Order> = {
  NS1001: {
    id: 'NS1001',
    customerName: 'Risper Odhiambo',
    item: 'Wireless Headphones',
    status: 'Shipped',
    trackingNumber: 'TRK45821',
    expectedDelivery: '2026-08-15',
    latestUpdate: 'Package departed Nairobi sorting facility',
  },
  NS1002: {
    id: 'NS1002',
    customerName: 'Jasmine Kerubo',
    item: 'Laptop Backpack',
    status: 'Processing',
    expectedDelivery: '2026-08-17',
    latestUpdate: 'Order received and being prepared for dispatch',
  },
  NS1003: {
    id: 'NS1003',
    customerName: 'David Wafula',
    item: 'Running Shoes',
    status: 'Delivered',
    trackingNumber: 'TRK67214',
    expectedDelivery: '2026-08-10',
    latestUpdate: 'Package delivered successfully',
  },
}

export async function processCustomerMessage(messageText: string): Promise<string> {
  const match = messageText.match(/NS\d{4}/i)

  if (match) {
    const orderId = match[0].toUpperCase()
    const order = MOCK_ORDERS[orderId]

    if (order) {
      const trackingText = order.trackingNumber
        ? ` (Tracking: ${order.trackingNumber})`
        : ''

      return `Order ${order.id} (${order.item}) for ${order.customerName} is currently ${order.status}${trackingText}. Expected delivery date: ${order.expectedDelivery}. Latest update: "${order.latestUpdate}".`
    }

    return `I couldn't find any order matching "${orderId}". Please check your order number and try again.`
  }

  const orderKeywords = ['order', 'track', 'tracking', 'package', 'shipment', 'delivery']
  const lowerMessage = messageText.toLowerCase()
  const asksAboutOrder = orderKeywords.some((keyword) => lowerMessage.includes(keyword))

  if (asksAboutOrder) {
    return 'Could you please provide your order ID (for example, NS1001) so I can check the status for you?'
  }

  return 'Hi! I can help you check an order status. If you are inquiring about an order, please share your order ID (e.g., NS1001).'
}
