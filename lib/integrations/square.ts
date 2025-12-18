import { Client, Environment, ApiError } from 'square'

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.SQUARE_ENVIRONMENT === 'production'
    ? Environment.Production
    : Environment.Sandbox,
})

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
    if (error instanceof ApiError) {
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
    if (error instanceof ApiError) {
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
    if (error instanceof ApiError) {
      throw new Error(error.errors?.[0]?.detail || 'Refund failed')
    }
    throw error
  }
}
