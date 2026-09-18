export interface ReturnLabelData {
  orderId: string
  rmaNumber: string
  trackingNumber: string
  carrier: string
  serviceType: string
  returnCenter: {
    name: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  customer: {
    name: string
    address: string
    city: string
    state: string
    postalCode: string
  }
  createdDate: string
  expiryDate: string
  instructions: string[]
}

export const RETURN_LABEL_STORAGE_KEY_PREFIX = 'contoso_return_label_'

const DEFAULT_RETURN_CENTER = {
  name: 'Contoso Outdoors Returns Depot',
  address: '1201 3rd Ave',
  city: 'Seattle',
  state: 'WA',
  postalCode: '98101',
  country: 'USA',
}

const DEFAULT_INSTRUCTIONS = [
  'Pack items securely in original packaging if possible.',
  'Affix this printed label firmly to the top of the package.',
  'Cover or remove any old shipping labels or barcodes.',
  'Drop off at any authorized UPS or Contoso Retail Store location.',
]

export function generateReturnLabelData(
  order: any,
  actionRecord?: any
): ReturnLabelData {
  const orderId = String(order?.id ?? '')
  const rmaNumber = `RMA-${orderId}`

  // Deterministic tracking number: 1Z-CTSO-RET-${String(order.id).replace(/\D/g, '').padEnd(8, '0').slice(0, 8)}
  const digits = orderId.replace(/\D/g, '')
  const paddedDigits = digits.padEnd(8, '0').slice(0, 8)
  const trackingNumber = `1Z-CTSO-RET-${paddedDigits}`

  const user = order?.user ?? {}
  const customerName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.name ||
    'Customer'

  // Extract address lines safely
  let customerAddress = user.addressLine1 || user.address || ''
  if (user.addressLine2) {
    customerAddress = `${customerAddress}, ${user.addressLine2}`
  }

  const customerCity = user.city || 'Seattle'
  const customerState = user.state || 'WA'
  const customerPostalCode = user.zipCode || user.postalCode || '98101'

  const createdDate = actionRecord?.timestamp
    ? new Date(actionRecord.timestamp).toISOString()
    : new Date().toISOString()

  const createdTime = new Date(createdDate).getTime()
  const expiryDate = new Date(createdTime + 14 * 24 * 60 * 60 * 1000).toISOString()

  return {
    orderId,
    rmaNumber,
    trackingNumber,
    carrier: 'Contoso Express Returns / UPS Ground Prepaid',
    serviceType: 'UPS Ground Return Service',
    returnCenter: { ...DEFAULT_RETURN_CENTER },
    customer: {
      name: customerName,
      address: customerAddress,
      city: customerCity,
      state: customerState,
      postalCode: customerPostalCode,
    },
    createdDate,
    expiryDate,
    instructions: [...DEFAULT_INSTRUCTIONS],
  }
}

export function getReturnLabel(orderId: string): ReturnLabelData | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }

  try {
    const raw = window.localStorage.getItem(`${RETURN_LABEL_STORAGE_KEY_PREFIX}${orderId}`)
    if (!raw) return null
    return JSON.parse(raw) as ReturnLabelData
  } catch {
    return null
  }
}

export function saveReturnLabel(data: ReturnLabelData): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  try {
    window.localStorage.setItem(
      `${RETURN_LABEL_STORAGE_KEY_PREFIX}${data.orderId}`,
      JSON.stringify(data)
    )
  } catch (error) {
    console.error('Failed to save return label:', error)
  }
}

export function getOrGenerateReturnLabel(
  order: any,
  actionRecord?: any
): ReturnLabelData {
  const existing = getReturnLabel(String(order?.id))
  if (existing) {
    return existing
  }
  const generated = generateReturnLabelData(order, actionRecord)
  saveReturnLabel(generated)
  return generated
}
