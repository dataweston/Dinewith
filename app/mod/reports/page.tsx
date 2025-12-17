import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function ModReportsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  if (session.user.role !== 'MODERATOR' && session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const reports = await prisma.report.findMany({
    where: {
      status: 'PENDING'
    },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      reportedUser: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Moderation Queue</h1>
      
      {reports.length === 0 ? (
        <p className="text-muted-foreground">No pending reports</p>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <div
              key={report.id}
              className="border rounded-lg p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {report.reason.replace('_', ' ')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Reported {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {report.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Reporter</p>
                  <p>{report.reporter.name || report.reporter.email}</p>
                </div>
                {report.reportedUser && (
                  <div>
                    <p className="font-medium">Reported User</p>
                    <p>{report.reportedUser.name || report.reportedUser.email}</p>
                  </div>
                )}
              </div>

              {report.description && (
                <div>
                  <p className="font-medium text-sm mb-1">Description</p>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </div>
              )}

              <div className="flex gap-2">
                <form action={`/mod/reports/actions`} method="POST">
                  <input type="hidden" name="reportId" value={report.id} />
                  <input type="hidden" name="action" value="approve" />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Take Action
                  </button>
                </form>
                <form action={`/mod/reports/actions`} method="POST">
                  <input type="hidden" name="reportId" value={report.id} />
                  <input type="hidden" name="action" value="dismiss" />
                  <button
                    type="submit"
                    className="px-4 py-2 border rounded-md hover:bg-gray-100"
                  >
                    Dismiss
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
