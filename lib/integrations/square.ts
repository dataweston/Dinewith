import { Client } from 'square'

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.SQUARE_ENVIRONMENT === 'production'
    ? 'production'
    : 'sandbox',
})

export async function authorizeSquarePayment(data: {
  amount: number // in cents
  sourceId: string // payment token from Square Web Payments SDK
  idempotencyKey: string
  customerId?: string
}) {
  try {
    const response = await client.paymentsApi.createPayment({
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
      paymentId: response.result.payment!.id!,
      status: response.result.payment!.status,
      amount: Number(response.result.payment!.amountMoney!.amount),
    }
  } catch (error) {
    console.error('Square authorization error:', error)
    if (error && typeof error === 'object' && 'errors' in error) {
      const apiError = error as { errors?: Array<{ detail?: string }> }
      throw new Error(apiError.errors?.[0]?.detail || 'Payment failed')
    }
    throw error
  }
}

export async function captureSquarePayment(paymentId: string) {
  try {
    const response = await client.paymentsApi.completePayment(paymentId)

    return {
      paymentId: response.result.payment!.id!,
      status: response.result.payment!.status,
      amount: Number(response.result.payment!.amountMoney!.amount),
    }
  } catch (error) {
    console.error('Square capture error:', error)
    if (error && typeof error === 'object' && 'errors' in error) {
      const apiError = error as { errors?: Array<{ detail?: string }> }
      throw new Error(apiError.errors?.[0]?.detail || 'Capture failed')
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
    const response = await client.refundsApi.refundPayment({
      idempotencyKey: data.idempotencyKey,
      paymentId: data.paymentId,
      amountMoney: {
        amount: BigInt(data.amount),
        currency: 'USD',
      },
      reason: data.reason,
    })

    return {
      refundId: response.result.refund!.id!,
      status: response.result.refund!.status,
      amount: Number(response.result.refund!.amountMoney!.amount),
    }
  } catch (error) {
    console.error('Square refund error:', error)
    if (error && typeof error === 'object' && 'errors' in error) {
      const apiError = error as { errors?: Array<{ detail?: string }> }
      throw new Error(apiError.errors?.[0]?.detail || 'Refund failed')
    }
    throw error
  }
}
