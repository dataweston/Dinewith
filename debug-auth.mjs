import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { webcrypto } from 'crypto'

const prisma = new PrismaClient()

// Test password
const testEmail = 'maria@dinewith.com'
const testPassword = 'host123'

// Get user from DB
const user = await prisma.user.findUnique({
  where: { email: testEmail },
  select: { email: true, password: true, salt: true }
})

console.log('User from DB:', user)

// Try to hash with same logic as auth.ts
const encoder = new TextEncoder()
const saltedPassword = encoder.encode(testPassword + user.salt)
console.log('Salted password (first 20 bytes):', Array.from(saltedPassword).slice(0, 20))

const hashedPasswordBuffer = await webcrypto.subtle.digest('SHA-256', saltedPassword)
const hashedPassword = Array.from(new Uint8Array(hashedPasswordBuffer))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('')

console.log('Computed hash:', hashedPassword)
console.log('Stored hash:', user.password)
console.log('Match:', hashedPassword === user.password)

await prisma.$disconnect()
