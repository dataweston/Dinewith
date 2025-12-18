'use server'

// Email notification service
// This is a placeholder for integrating with SendGrid, Mailgun, or similar

type EmailTemplate = 
  | 'booking-requested'
  | 'booking-accepted'
  | 'booking-declined'
  | 'booking-completed'
  | 'review-request'
  | 'host-application-submitted'
  | 'host-application-approved'
  | 'host-application-rejected'
  | 'listing-submitted'
  | 'listing-approved'
  | 'listing-rejected'
  | 'payout-requested'
  | 'payout-completed'

interface EmailData {
  to: string
  subject: string
  template: EmailTemplate
  data: Record<string, any>
}

export async function sendEmail({ to, subject, template, data }: EmailData) {
  // In production, integrate with SendGrid, Mailgun, Resend, etc.
  // For now, just log the email
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 Email would be sent:')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('Template:', template)
    console.log('Data:', data)
    return { success: true }
  }

  // TODO: Implement actual email sending
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail')
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  // await sgMail.send({
  //   to,
  //   from: process.env.FROM_EMAIL,
  //   subject,
  //   templateId: getTemplateId(template),
  //   dynamicTemplateData: data
  // })

  return { success: true }
}

// Helper functions for specific email types
export async function sendBookingRequestedEmail(
  hostEmail: string,
  guestName: string,
  listingTitle: string,
  bookingDetails: string
) {
  return sendEmail({
    to: hostEmail,
    subject: `New Booking Request: ${listingTitle}`,
    template: 'booking-requested',
    data: {
      guestName,
      listingTitle,
      bookingDetails
    }
  })
}

export async function sendBookingAcceptedEmail(
  guestEmail: string,
  hostName: string,
  listingTitle: string,
  bookingDetails: string
) {
  return sendEmail({
    to: guestEmail,
    subject: `Booking Confirmed: ${listingTitle}`,
    template: 'booking-accepted',
    data: {
      hostName,
      listingTitle,
      bookingDetails
    }
  })
}

export async function sendReviewRequestEmail(
  guestEmail: string,
  listingTitle: string,
  bookingId: string
) {
  return sendEmail({
    to: guestEmail,
    subject: `Share Your Experience: ${listingTitle}`,
    template: 'review-request',
    data: {
      listingTitle,
      reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}/review`
    }
  })
}

export async function sendHostApplicationStatusEmail(
  applicantEmail: string,
  status: 'approved' | 'rejected',
  notes?: string
) {
  return sendEmail({
    to: applicantEmail,
    subject: status === 'approved' 
      ? 'Welcome to Dinewith - Host Application Approved!'
      : 'Host Application Update',
    template: status === 'approved' 
      ? 'host-application-approved'
      : 'host-application-rejected',
    data: { notes }
  })
}

export async function sendPayoutCompletedEmail(
  hostEmail: string,
  amount: number,
  currency: string
) {
  return sendEmail({
    to: hostEmail,
    subject: 'Payout Completed',
    template: 'payout-completed',
    data: {
      amount: (amount / 100).toFixed(2),
      currency
    }
  })
}
