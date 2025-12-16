import braintree from 'braintree'

const gateway = new braintree.BraintreeGateway({
  environment: process.env.BRAINTREE_ENVIRONMENT === 'production'
    ? braintree.Environment.Production
    : braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID!,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY!,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY!,
})

export async function createBraintreeClientToken() {
  try {
    const response = await gateway.clientToken.generate({})
    return response.clientToken
  } catch (error) {
    console.error('Braintree client token error:', error)
    throw new Error('Failed to generate client token')
  }
}

export async function authorizeBraintreePayment(data: {
  amount: number // in dollars
  paymentMethodNonce: string
  customerId?: string
}) {
  try {
    const result = await gateway.transaction.sale({
      amount: data.amount.toFixed(2),
      paymentMethodNonce: data.paymentMethodNonce,
      options: {
        submitForSettlement: false, // Authorize only
      },
      customerId: data.customerId,
    })

    if (!result.success) {
      throw new Error(result.message || 'Transaction failed')
    }

    return {
      transactionId: result.transaction!.id,
      status: result.transaction!.status,
      amount: parseFloat(result.transaction!.amount),
    }
  } catch (error) {
    console.error('Braintree authorization error:', error)
    throw error
  }
}

export async function captureBraintreePayment(transactionId: string) {
  try {
    const result = await gateway.transaction.submitForSettlement(transactionId)

    if (!result.success) {
      throw new Error(result.message || 'Capture failed')
    }

    return {
      transactionId: result.transaction!.id,
      status: result.transaction!.status,
      amount: parseFloat(result.transaction!.amount),
    }
  } catch (error) {
    console.error('Braintree capture error:', error)
    throw error
  }
}

export async function refundBraintreePayment(transactionId: string, amount?: number) {
  try {
    const result = amount
      ? await gateway.transaction.refund(transactionId, amount.toFixed(2))
      : await gateway.transaction.refund(transactionId)

    if (!result.success) {
      throw new Error(result.message || 'Refund failed')
    }

    return {
      transactionId: result.transaction!.id,
      status: result.transaction!.status,
      refundedAmount: parseFloat(result.transaction!.amount),
    }
  } catch (error) {
    console.error('Braintree refund error:', error)
    throw error
  }
}
