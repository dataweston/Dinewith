import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export const metadata = {
  title: 'Host Dashboard - Dinewith'
}

export default async function HostPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Redirect to apply page
  redirect('/host/apply')
}
