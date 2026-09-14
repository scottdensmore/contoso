export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Return Requested'

export interface OrderActionRecord {
  orderId: string
  action: 'cancel' | 'return'
  reason: string
  notes?: string
  items?: string[] // item IDs for returns
  timestamp: string
}

export interface OrderLifecycleState {
  status: OrderStatus
  canCancel: boolean
  canReturn: boolean
  badgeClass: string
  statusDescription: string
}

const STORAGE_KEY_PREFIX = 'contoso_order_action_'

export function getOrderAction(orderId: string): OrderActionRecord | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }

  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${orderId}`)
    if (!raw) return null
    return JSON.parse(raw) as OrderActionRecord
  } catch {
    return null
  }
}

export function saveOrderAction(record: OrderActionRecord): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  try {
    window.localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${record.orderId}`,
      JSON.stringify(record)
    )
  } catch (error) {
    console.error('Failed to save order action:', error)
  }
}

export function determineOrderStatus(
  orderDate: string | Date,
  existingAction?: OrderActionRecord | null,
  now: Date = new Date()
): OrderLifecycleState {
  if (existingAction?.action === 'cancel') {
    const formattedDate = existingAction.timestamp
      ? new Date(existingAction.timestamp).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null

    return {
      status: 'Cancelled',
      canCancel: false,
      canReturn: false,
      badgeClass: 'bg-red-100 text-red-800',
      statusDescription: formattedDate
        ? `Order cancelled on ${formattedDate}.`
        : 'This order has been cancelled.',
    }
  }

  if (existingAction?.action === 'return') {
    const formattedDate = existingAction.timestamp
      ? new Date(existingAction.timestamp).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null

    return {
      status: 'Return Requested',
      canCancel: false,
      canReturn: false,
      badgeClass: 'bg-purple-100 text-purple-800',
      statusDescription: formattedDate
        ? `Return request submitted on ${formattedDate}.`
        : 'Return request submitted.',
    }
  }

  const parsedOrderDate = new Date(orderDate)
  const diffMs = now.getTime() - parsedOrderDate.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffHours / 24

  // < 24 hours: Processing
  if (diffHours < 24) {
    return {
      status: 'Processing',
      canCancel: true,
      canReturn: false,
      badgeClass: 'bg-yellow-100 text-yellow-800',
      statusDescription:
        'This order is being prepared for shipment. You may cancel before it ships.',
    }
  }

  // 24 hours to 72 hours: Shipped
  if (diffHours <= 72) {
    return {
      status: 'Shipped',
      canCancel: false,
      canReturn: false,
      badgeClass: 'bg-blue-100 text-blue-800',
      statusDescription: 'This order has shipped and is on its way.',
    }
  }

  // > 72 hours: Delivered (eligible for return within 30 days)
  const withinReturnWindow = diffDays <= 30

  return {
    status: 'Delivered',
    canCancel: false,
    canReturn: withinReturnWindow,
    badgeClass: 'bg-green-100 text-green-800',
    statusDescription: withinReturnWindow
      ? 'Delivered. Eligible for return within 30 days.'
      : 'Delivered. The 30-day return window has closed.',
  }
}
