import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Session } from '@/lib/types'
import { ListingForm } from '@/components/listing-form'
import { createListing } from '../actions'

export const metadata = {
  title: 'Create Listing - Dinewith'
}

export default async function NewListingPage() {
  const session = (await auth()) as Session

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'HOST' && session.user.role !== 'ADMIN') {
    redirect('/host/apply')
  }

  const handleCreate = async (data: any) => {
    'use server'
    const result = await createListing(data)
    if ('error' in result) {
      throw new Error(result.error)
    }
    redirect('/host/listings')
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Listing</h1>
        <p className="text-muted-foreground">
          Create a new dining experience to share with guests
        </p>
      </div>

      <ListingForm onSubmit={handleCreate} />
    </div>
  )
}
