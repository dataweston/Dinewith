import { SquareClient, SquareEnvironment, SquareError } from 'square'

let client: SquareClient | null = null

function getClient() {
  if (client) return client

  const token = process.env.SQUARE_ACCESS_TOKEN
  if (!token) {
    throw new Error('Missing SQUARE_ACCESS_TOKEN')
  }

  client = new SquareClient({
    token,
    environment:
      process.env.SQUARE_ENVIRONMENT === 'production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  })

  return client
}

export async function authorizeSquarePayment(data: {
  amount: number // in cents
  sourceId: string // payment token from Square Web Payments SDK
  idempotencyKey: string
  customerId?: string
}) {
  try {
    const response = await getClient().payments.create({
      sourceId: data.sourceId,
      idempotencyKey: data.idempotencyKey,
      amountMoney: {
        amount: BigInt(data.amount),
        currency: 'USD',
      },
      customerId: data.customerId,
      autocomplete: false, // Don't auto-capture
    })

    return {
      paymentId: response.payment!.id!,
      status: response.payment!.status,
      amount: Number(response.payment!.amountMoney!.amount),
    }
  } catch (error) {
    console.error('Square authorization error:', error)
    if (error instanceof SquareError) {
      throw new Error(error.errors?.[0]?.detail || 'Payment failed')
    }
    throw error
  }
}

export async function captureSquarePayment(paymentId: string) {
  try {
    const response = await getClient().payments.complete({
      paymentId,
    })

    return {
      paymentId: response.payment!.id!,
      status: response.payment!.status,
      amount: Number(response.payment!.amountMoney!.amount),
    }
  } catch (error) {
    console.error('Square capture error:', error)
    if (error instanceof SquareError) {
      throw new Error(error.errors?.[0]?.detail || 'Capture failed')
    }
    throw error
  }
}

export async function refundSquarePayment(data: {
  paymentId: string
  amount: number // in cents
  idempotencyKey: string
  reason?: string
}) {
  try {
    const response = await getClient().refunds.refundPayment({
      idempotencyKey: data.idempotencyKey,
      paymentId: data.paymentId,
      amountMoney: {
        amount: BigInt(data.amount),
        currency: 'USD',
      },
      reason: data.reason,
    })

    return {
      refundId: response.refund!.id!,
      status: response.refund!.status,
      amount: Number(response.refund!.amountMoney!.amount),
    }
  } catch (error) {
    console.error('Square refund error:', error)
    if (error instanceof SquareError) {
      throw new Error(error.errors?.[0]?.detail || 'Refund failed')
    }
    throw error
  }
}
