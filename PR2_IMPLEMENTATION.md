# PR2: Host Application System Implementation

## Overview
Implemented a complete host application and role-based authorization system with status lifecycle management and stub KYC endpoints.

## Database Changes

### Prisma Schema Updates
- **Added User Role System**: Created `UserRole` enum (GUEST, HOST, MODERATOR, ADMIN)
- **Added HostApplication Model**: Complete application tracking with:
  - Status lifecycle: DRAFT → SUBMITTED → APPROVED/REJECTED
  - KYC status tracking: NOT_STARTED → IN_PROGRESS → COMPLETED/FAILED
  - Business information fields (name, phone, bio, experience, cuisines)
  - Location fields (address, city, state, zip)
  - Review workflow (reviewer ID, notes, timestamps)

### Migration
Applied migration: `20251216212617_add_host_application_and_roles`

## Authentication & Authorization

### Type Definitions
- Created [`types-next-auth.d.ts`](types-next-auth.d.ts) to extend NextAuth session and JWT with role field
- Updated [`lib/types.ts`](lib/types.ts) to include role in Session interface

### Auth Configuration
- Modified [`auth.ts`](auth.ts): Added role to user object returned from login
- Updated [`auth.config.ts`](auth.config.ts): Include role in JWT token and session callbacks
- Enhanced [`middleware.ts`](middleware.ts): Added role-based route guards
  - `/host/*` routes require authentication
  - `/mod/*` routes require MODERATOR or ADMIN role

## Host Application Flow

### Frontend Pages & Components
1. **[`app/host/apply/page.tsx`](app/host/apply/page.tsx)**
   - Host application form page
   - Shows different states: draft, submitted, approved, rejected
   - Displays status messages and review feedback

2. **[`components/host-application-form.tsx`](components/host-application-form.tsx)**
   - Reusable form component with all required fields
   - Save draft and submit functionality
   - Form validation

### Backend Actions
3. **[`app/host/apply/actions.ts`](app/host/apply/actions.ts)**
   - `saveDraft()`: Save application as draft
   - `submitApplication()`: Submit application for review
   - `getApplication()`: Fetch user's application

## Moderator Review System

### Frontend Pages & Components
4. **[`app/mod/review/hosts/page.tsx`](app/mod/review/hosts/page.tsx)**
   - Application review dashboard
   - Filter by status (all, submitted, approved, rejected)
   - Status counts display

5. **[`components/application-review-card.tsx`](components/application-review-card.tsx)**
   - Display full application details
   - Approve/reject actions with optional notes
   - Shows review history

### Backend Actions
6. **[`app/mod/review/hosts/actions.ts`](app/mod/review/hosts/actions.ts)**
   - `getApplications()`: List applications with filtering
   - `approveApplication()`: Approve and promote user to HOST role
   - `rejectApplication()`: Reject with feedback

## KYC Integration (Stub)

Created placeholder endpoints for future Plaid integration:

7. **[`app/api/kyc/start/route.ts`](app/api/kyc/start/route.ts)**
   - POST endpoint to initiate KYC
   - Updates application status to IN_PROGRESS
   - Returns stub KYC link

8. **[`app/api/kyc/complete/route.ts`](app/api/kyc/complete/route.ts)**
   - POST endpoint to complete KYC
   - Accepts success/failure status
   - Updates application with final KYC status

## Status Lifecycle

### Application Status Flow
```
DRAFT → SUBMITTED → APPROVED
                 ↘ REJECTED
```

### KYC Status Flow
```
NOT_STARTED → IN_PROGRESS → COMPLETED
                          ↘ FAILED
```

## Route Protection

| Route | Access Level |
|-------|-------------|
| `/host/apply` | Any authenticated user |
| `/mod/review/hosts` | MODERATOR or ADMIN only |
| `/api/kyc/*` | Application owner only |

## Future Enhancements

1. **Plaid Integration**: Replace stub KYC endpoints with actual Plaid Link
2. **Email Notifications**: Send emails on status changes
3. **Host Dashboard**: Create `/host/dashboard` for approved hosts
4. **Application Analytics**: Track conversion rates and review times
5. **Bulk Actions**: Allow moderators to approve/reject multiple applications

## Testing Checklist

- [ ] User can save application draft
- [ ] User can submit application
- [ ] Application shows correct status states
- [ ] Moderators can view applications
- [ ] Moderators can approve (user role changes to HOST)
- [ ] Moderators can reject with notes
- [ ] Route guards prevent unauthorized access
- [ ] KYC stub endpoints accept requests
- [ ] Session includes role information
