import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { HostApplicationForm } from '@/components/host-application-form'
import { saveDraft, submitApplication, getApplication } from './actions'
import { Session } from '@/lib/types'

export const metadata = {
  title: 'Apply to Host - Dinewith'
}

export default async function HostApplyPage() {
  const session = (await auth()) as Session

  if (!session?.user) {
    redirect('/login')
  }

  const application = await getApplication()

  const handleSaveDraft = async (data: any) => {
    'use server'
    const result = await saveDraft(data)
    if (result.error) {
      throw new Error(result.error)
    }
  }

  const handleSubmit = async (data: any) => {
    'use server'
    const result = await submitApplication(data)
    if (result.error) {
      throw new Error(result.error)
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Host Application</h1>
        <p className="text-muted-foreground">
          Join our community of talented chefs and hosts. Share your culinary
          expertise with guests looking for unique dining experiences.
        </p>
      </div>

      {application?.status === 'SUBMITTED' && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold mb-1">Application Submitted</h3>
          <p className="text-sm text-muted-foreground">
            Your application is currently under review. We&apos;ll notify you once a
            decision has been made.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Submitted on {new Date(application.submittedAt!).toLocaleDateString()}
          </p>
        </div>
      )}

      {application?.status === 'APPROVED' && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 className="font-semibold mb-1">Application Approved</h3>
          <p className="text-sm text-muted-foreground">
            Congratulations! Your application has been approved. You can now
            start creating dining experiences.
          </p>
        </div>
      )}

      {application?.status === 'REJECTED' && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <h3 className="font-semibold mb-1">Application Not Approved</h3>
          <p className="text-sm text-muted-foreground">
            Unfortunately, your application was not approved at this time.
          </p>
          {application.reviewNotes && (
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Feedback:</strong> {application.reviewNotes}
            </p>
          )}
        </div>
      )}

      {(!application || application.status === 'DRAFT') && (
        <HostApplicationForm
          applicationId={application?.id}
          initialData={
            application
              ? {
                  businessName: application.businessName || undefined,
                  phone: application.phone || undefined,
                  bio: application.bio || undefined,
                  experienceYears: application.experienceYears || undefined,
                  cuisineTypes: application.cuisineTypes,
                  address: application.address || undefined,
                  city: application.city || undefined,
                  state: application.state || undefined,
                  zipCode: application.zipCode || undefined
                }
              : undefined
          }
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
