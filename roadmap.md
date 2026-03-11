# Sourcery Implementation Roadmap

> **Quick Reference Guide for the 6-Week Build**

## 📊 Project Status
- ✅ **Week 0:** Foundation Complete (React + Vite + Supabase + UI + Auth)
- 🔄 **Current Phase:** Week 1 - Database & User Management (Backend 100%, UI 20%)
- ⏱️ **Timeline:** 6 Weeks Total
- 🎨 **Tech Stack:** React + Vite + Supabase + Stripe Connect

### 🎉 Major Achievement: Database Infrastructure Complete!
All 19 migrations deployed and production-ready:
- ✅ Full database schema (profiles, deals, reservations, pipeline, messages, leads)
- ✅ Comprehensive RLS policies with private data protection
- ✅ Automated triggers (profile creation, contact blocking, timestamps)
- ✅ Helper functions and account deletion

### ⏭️ Next Up: Week 1 UI Components
- Profile management for all roles (Investor/Sourcer/Admin)
- Document upload system (Supabase Storage)
- Admin KYC approval dashboard

---

## 🗓️ Week-by-Week Breakdown

### ✅ Week 0: Foundation (COMPLETED)
**Status:** ✅ Done
- React + Vite setup
- Supabase client initialized
- Auth system (Context + Protected Routes)
- shadcn/ui components
- Layout with Sidebar
- Basic routing structure
- Theme system

---

### 📅 Week 1: Database & User Management
**Focus:** Backend Infrastructure + User Profiles
**Status:** 🔄 In Progress (Database 100%, UI 20%)

#### Database Schema
- [x] **Core Tables:** profiles, deals, reservations, progression_pipeline, messages, dans_leads, lead_purchases
- [x] **RLS Policies:** All critical policies implemented (profiles, deals, reservations, messages, leads)
- [x] **Database Triggers:**
  - Auto-create profiles on user signup (migration 12)
  - Contact info blocking in messages with Regex validation (migration 13)
  - Auto-update timestamps (migration 14)
  - Pipeline automation (migration 15)

#### User Management
- [ ] **Profile Management UI:**
  - **Investor view:** Basic profile editing (name, phone, company, bio) - NO verification required
  - **Sourcer view:** Profile editing + Document upload section (ID, AML, Insurance)
  - **Admin view:** Enhanced profile view with verification controls
- [ ] **Document Upload System (Sourcers Only):**
  - Supabase Storage buckets setup (`documents`, `avatars`)
  - File upload component with drag-and-drop
  - ID, AML, Insurance document types
  - Signed URLs for secure access
  - Storage RLS policies
- [ ] **Admin KYC Dashboard (Sourcer Verification):**
  - List pending Sourcer verifications
  - Document viewer modal
  - Approve/Reject workflow
  - Update `verification_status` in profiles table
  - Note: Investors require NO verification for MVP

**Deliverables:**
- ✅ Functional database with RLS
- ⏳ Profile management for all roles
- ⏳ Document upload system
- ⏳ Admin approval workflow

#### ✅ Completed Backend Files (Migrations)
```
supabase/migrations/
├── 01_extensions_and_enums.sql       ✅ All types defined
├── 02_profiles_table.sql             ✅ Profile table with role-based fields
├── 03_deals_table.sql                ✅ Deals with public/private columns
├── 04_reservations_and_pipeline.sql  ✅ Payment tracking + pipeline
├── 05_messages_table.sql             ✅ In-deal messaging
├── 06_dans_leads_tables.sql          ✅ Secondary marketplace
├── 07_rls_profiles.sql               ✅ Profile security
├── 08_rls_deals.sql                  ✅ CRITICAL: Private data protection
├── 09_rls_reservations.sql           ✅ Reservation access control
├── 10_rls_messages.sql               ✅ Message privacy
├── 11_rls_leads.sql                  ✅ Lead marketplace security
├── 12_trigger_profiles.sql           ✅ Auto-create on signup
├── 13_trigger_messages.sql           ✅ Contact info blocking
├── 14_trigger_timestamps.sql         ✅ Auto-update timestamps
├── 15_trigger_pipeline.sql           ✅ Pipeline automation
├── 16_helper_functions.sql           ✅ Utility functions
└── 19_delete_account_function.sql    ✅ Account deletion RPC
```

#### ✅ Completed Frontend Files
```
src/
├── pages/
│   ├── auth/index.tsx                ✅ Google OAuth login
│   ├── auth-callback/index.tsx       ✅ Production-ready OAuth flow
│   ├── dashboard/index.tsx           ✅ Overview page (placeholder)
│   └── settings/index.tsx            ✅ Settings with account deletion
├── components/
│   ├── Layout.tsx                    ✅ Main layout wrapper
│   ├── DashboardHeader.tsx           ✅ Header with user dropdown
│   ├── ProtectedRoute.tsx            ✅ Auth guard
│   └── sidebar/                      ✅ Full sidebar navigation
├── contexts/
│   ├── AuthContext.tsx               ✅ Auth state management
│   └── SidebarContext.tsx            ✅ Sidebar state
└── lib/
    ├── supabase.ts                   ✅ Supabase client
    ├── date.ts                       ✅ Date/time formatting utilities
    └── utils.ts                      ✅ Helper utilities
```

#### ⏳ Pending Frontend Files
```
src/
├── pages/
│   ├── profile/index.tsx             ⏳ Role-based profile management
│   └── admin/
│       └── kyc/index.tsx             ⏳ KYC approval dashboard
└── components/
    ├── DocumentUpload.tsx            ⏳ File upload component
    ├── DocumentViewer.tsx            ⏳ Document preview modal
    └── VerificationBadge.tsx         ⏳ Status indicator
```

---

### 📅 Week 2: Deal Ingestion & Marketplace
**Focus:** Core Product - Deal Creation & Discovery

#### Deal Creation
- [ ] **Dynamic Form:**
  - Strategy selector (FLIP, HMO, R2R, BTL, BRRR)
  - Conditional field rendering based on strategy
  - JSONB storage for flexible metrics
- [ ] **Server-Side Calculations:**
  - ROI calculation
  - Yield calculation (Gross/Net)
  - ROCE calculation
  - Zod validation (no negative values)
- [ ] **Image Upload:**
  - Multiple images per deal
  - Supabase Storage integration
  - Image preview and management

#### Marketplace
- [ ] **Deal Listing Page:**
  - Card grid layout
  - Filters (strategy, location, ROI range, yield)
  - Sorting options
- [ ] **Deal Detail Page:**
  - Redacted view (RLS-protected)
  - Public: approximate_location, calculated_roi, capital_required
  - Hidden: full_address, vendor_details, legal_pack_url
- [ ] **Search Functionality:**
  - Full-text search on headline and location
  - Debounced input

**Deliverables:**
- Functional deal creation wizard
- Marketplace with filtering
- Redacted detail view
- Search capability

---

### 📅 Week 3: Stripe Connect & Transactions
**Focus:** Payment Infrastructure + RLS Unlock

#### Stripe Integration
- [ ] **Sourcer Onboarding:**
  - Stripe Connect Express/Standard account creation
  - Onboarding flow
  - Store `stripe_connected_account_id`
- [ ] **Reservation Flow:**
  - NDA generation and digital signature
  - Stripe Checkout Session creation
  - Payment capture (hold in platform balance)
- [ ] **Webhook Handling:**
  - Supabase Edge Function
  - `checkout.session.completed` event
  - Update reservation status to `HELD_IN_ESCROW`

#### The Unlock
- [ ] **RLS Logic:**
  - Test: User cannot see private data before payment
  - Test: User CAN see private data after payment
- [ ] **Full Deal View:**
  - Show full_address
  - Show vendor_details
  - Show legal_pack_url
  - Download legal pack
- [ ] **Payment History:**
  - List of all reservations
  - Payment status tracking

**Deliverables:**
- Stripe Connect onboarding works
- Reservation payment flow complete
- RLS unlock verified
- Full deal access post-payment

---

### 📅 Week 4: Kanban CRM & Realtime
**Focus:** Deal Progression Tracking + Communication

#### Kanban Board
- [ ] **Pipeline UI:**
  - Drag-and-drop stages
  - Stages: RESERVED → LEGALS → VALUATION → MORTGAGE → EXCHANGE → COMPLETION
  - Visual status indicators
- [ ] **Realtime Updates:**
  - Supabase Realtime subscription
  - Live stage changes for both parties
  - Optimistic UI updates

#### Messaging System
- [ ] **In-Deal Chat:**
  - Message thread per deal
  - Link to reservation_id
  - Realtime message delivery
- [ ] **Contact Blocking:**
  - Frontend Regex validation
  - Database trigger (BEFORE INSERT)
  - Warning toast on blocked message
  - Patterns: Phone `(\+44|07\d{9})`, Email `[\w\.-]+@[\w\.-]+\.\w+`

#### Completion Flow
- [ ] **Deal Completion:**
  - Mark as COMPLETION stage
  - Prompt Investor to authorize payout
  - Auto-authorize after 72hrs option

**Deliverables:**
- Functional Kanban board
- Realtime updates working
- Secure messaging with contact blocking
- Completion workflow

---

### 📅 Week 5: Payouts & Secondary Market
**Focus:** Financial Settlement + Dan's Leads

#### Payout System
- [ ] **Stripe Transfer Integration:**
  - Calculate split (80% Sourcer, 20% Platform)
  - Create Transfer to connected account
  - Handle transfer failures
- [ ] **Payout Authorization UI:**
  - Investor confirmation screen
  - Auto-authorize logic (72hrs)
  - Payment receipt generation
- [ ] **Commission Tracking:**
  - Platform commission calculations
  - Revenue analytics for admin

#### Dan's Leads
- [ ] **Secondary Marketplace:**
  - Redacted lead listings
  - Basic property info visible
  - Price per lead (e.g., £40)
- [ ] **Lead Purchase Flow:**
  - Micro-transaction via Stripe
  - Instant unlock of full details
  - Reveal seller contact info
- [ ] **Lead Management:**
  - Admin can create leads
  - Purchase history for users

**Deliverables:**
- Sourcing fee payout works
- Commission tracking
- Dan's Leads marketplace functional
- Lead purchase flow complete

---

### 📅 Week 6: QA, Polish & Launch Prep
**Focus:** Testing, Refinement, Production Readiness

#### Testing
- [ ] **End-to-End Flows:**
  - Investor journey (signup → browse → reserve → completion)
  - Sourcer journey (signup → KYC → create deal → get paid)
  - Admin journey (approve KYC → manage disputes)
- [ ] **Edge Cases:**
  - Payment failures
  - Webhook retries
  - RLS policy edge cases
  - Concurrent reservations

#### Polish
- [ ] **Mobile Responsiveness:**
  - Test on iOS/Android
  - Touch-friendly interactions
  - Responsive layouts
- [ ] **UX Improvements:**
  - Loading states (skeletons)
  - Animations (transitions)
  - Error messages (user-friendly)
  - Empty states

#### Production
- [ ] **Email Notifications:**
  - Deal reserved
  - KYC approved/rejected
  - Payment received
  - Deal completed
- [ ] **Stripe Live Mode:**
  - Complete Stripe verification
  - Switch to live keys
  - Test live transactions
- [ ] **Security Audit:**
  - Review all RLS policies
  - Test authentication edge cases
  - XSS/SQL injection checks
  - API rate limiting

#### Documentation
- [ ] **Technical Docs:**
  - Deployment guide
  - Environment setup
  - Database migrations
- [ ] **User Guides:**
  - Investor onboarding
  - Sourcer onboarding
  - Admin manual

**Deliverables:**
- Fully tested application
- Mobile responsive
- Production-ready
- Documented

---

## 🎯 Critical Success Factors

### 1. Security First
- **RLS policies** are non-negotiable
- **Never expose** private deal data before payment
- **Validate** all financial inputs server-side
- **Test** RLS thoroughly

### 2. Financial Accuracy
- **Server-side calculations only** (no client-side ROI)
- **Zod validation** for all numeric inputs
- **Precision** in commission splits
- **Audit trail** for all transactions

### 3. Realtime Experience
- **Supabase Realtime** for Kanban and Chat
- **Optimistic updates** for snappy UX
- **Conflict resolution** for concurrent edits

### 4. Payment Reliability
- **Webhook idempotency** (handle duplicates)
- **Retry logic** for failed transfers
- **Error handling** for payment failures
- **Stripe testing** in test mode first

---

## 📦 Key Deliverables by Milestone

### Milestone 1 (Week 1-2): Foundation
- ✅ Database schema live (100% complete - all tables created)
- ✅ RLS policies implemented (100% complete - all security rules active)
- 🔄 User profiles working (Settings page done, Profile page pending)
- ⏳ Deal creation functional (Week 2)
- ⏳ Marketplace visible (Week 2)

### Milestone 2 (Week 3-4): Transactions
- ⏳ Stripe Connect integrated
- ⏳ Reservation payment works
- ⏳ RLS unlock verified
- ⏳ Kanban board live

### Milestone 3 (Week 5-6): Completion
- ⏳ Payouts functioning
- ⏳ Dan's Leads live
- ⏳ All testing passed
- ⏳ Production ready

---

## 🚀 Launch Checklist

### Pre-Launch
- [ ] All 37 todos completed
- [ ] Security audit passed
- [ ] Stripe live mode verified
- [ ] Mobile tested
- [ ] User guides written

### Launch Day
- [ ] DNS configured
- [ ] SSL certificates active
- [ ] Monitoring tools enabled
- [ ] Support email ready
- [ ] Announcement sent

### Post-Launch (Week 1)
- [ ] Monitor error logs
- [ ] User feedback collection
- [ ] Performance optimization
- [ ] Bug fixes deployed

---

## 📞 Emergency Contacts

### Technical Issues
- Supabase Support: https://supabase.com/support
- Stripe Support: https://support.stripe.com

### Team Communication
- Development Updates: Daily standups
- Blockers: Raise immediately
- Progress Tracking: GitHub Issues + Todo List

---

## 🎓 Learning Resources

### Supabase
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)
- [Edge Functions](https://supabase.com/docs/guides/functions)

### Stripe
- [Connect Guide](https://stripe.com/docs/connect)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Testing](https://stripe.com/docs/testing)

### React + TypeScript
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [TanStack Query](https://tanstack.com/query)

---

**Last Updated:** 2026-03-12
**Version:** 1.1
**Status:** Database Infrastructure Complete ✅ | Building Week 1 UI Components 🔄
