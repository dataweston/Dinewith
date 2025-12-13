import { z } from 'zod'

const optionalTrimmed = (schema: z.ZodTypeAny) =>
  z.preprocess(value => {
    if (typeof value !== 'string') {
      return value
    }
    const trimmed = value.trim()
    return trimmed.length === 0 ? undefined : trimmed
  }, schema.optional())

const guestsSchema = z.preprocess(value => {
  if (value === undefined || value === null) {
    return undefined
  }

  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return undefined
    }
    const parsed = Number.parseInt(trimmed, 10)
    return Number.isFinite(parsed) ? parsed : trimmed
  }

  return value
}, z.number({ invalid_type_error: 'Guests must be a number' }).int('Guests must be a whole number').min(1, 'Party size must be at least 1').max(12, 'Party size must be 12 or fewer').optional())

export const waitlistSchema = z.object({
  citySlug: z.string().min(1, 'City is required'),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email'),
  name: optionalTrimmed(
    z.string().min(2, 'Name is too short').max(80, 'Name is too long')
  ),
  guests: guestsSchema,
  notes: optionalTrimmed(z.string().max(500, 'Notes must be under 500 characters')),
  source: optionalTrimmed(z.string().max(50, 'Source is too long'))
})

export type WaitlistPayload = z.infer<typeof waitlistSchema>
