'use server'

import { signIn } from '@/auth'
import { getStringFromBuffer } from '@/lib/utils'
import { z } from 'zod'
import { AuthResult } from '@/lib/types'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'


export async function signup(
  _prevState: AuthResult | undefined,
  formData: FormData
) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const parsedCredentials = z
    .object({
      email: z.string().email(),
      password: z.string().min(6)
    })
    .safeParse({
      email,
      password
    })

  if (parsedCredentials.success) {
    const salt = crypto.randomUUID()

    const encoder = new TextEncoder()
    const saltedPassword = encoder.encode(password + salt)
    const hashedPasswordBuffer = await crypto.subtle.digest(
      'SHA-256',
      saltedPassword
    )
    const hashedPassword = getStringFromBuffer(hashedPasswordBuffer)

    try {
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          salt
        }
      })

      await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      return { type: 'success', message: 'Account created!' }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return { type: 'error', message: 'User already exists! Please log in.' }
      }

      return {
        type: 'error',
        message: 'Something went wrong! Please try again.'
      }
    }
  } else {
    return {
      type: 'error',
      message: 'Invalid entries, please try again!'
    }
  }
}
