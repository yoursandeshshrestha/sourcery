# Sourcery - PropTech SaaS Platform

## Project Overview
**Timeline:** 6 Weeks (AI-Assisted Build)
**Stack:** React + Vite + Supabase + Stripe Connect
**Domain:** B2B/B2C PropTech - Off-Market Property Deal Marketplace

### The Problem
The off-market property industry currently operates through:
- Fragmented WhatsApp groups and Instagram DMs
- Unregulated direct bank transfers (high fraud risk)
- Unstandardized financial data (manipulated ROI/Yield)
- No tracking for deal progression through legal completion

### The Solution
Sourcery provides:
1. **Trust Engine** - Sourcer KYC/AML verification + escrow payments via Stripe Connect
2. **The Maths Guard** - Auto-calculated financial metrics from raw inputs
3. **The Sticky CRM** - Built-in Kanban to track deals through legal completion
4. **Data Redaction** - RLS-powered security to protect deal details until payment

**Verification Model (MVP):**
- ✅ **Sourcers:** Must complete KYC (ID, AML, Insurance) before listing deals
- ❌ **Investors:** No verification required - immediate access to marketplace

---

## User Personas

### 1. The Investor (Buyer)
- **Profile:** Time-poor, capital-rich individuals seeking off-market deals (HMOs, Flips, BTLs)
- **Pain Points:** 50 different WhatsApp groups, fear of scams, unsafe reservation fees
- **Key Actions:**
  - Browse filtered marketplace (no verification required)
  - Sign digital NDA before reservation
  - Pay reservation fees (escrow protected via Stripe)
  - Track deal progress in CRM
- **Note:** Investors do NOT require KYC verification for MVP - immediate onboarding for faster conversion

### 2. The Deal Sourcer (Seller)
- **Profile:** Property networkers who find deals but need buyers
- **Pain Points:** Unprofessional presentation, tyre-kickers, unpaid sourcing fees
- **Key Actions:**
  - Upload compliance documents (ID, AML, Insurance)
  - Create standardized deal listings
  - Manage active reservations
  - Receive secure payouts

### 3. The Admin (Internal)
- **Profile:** Sourcery operations team
- **Responsibilities:**
  - Approve/Reject Sourcer KYC documents (ID, AML, Insurance)
  - Resolve disputes and refund escrow payments
  - Manage platform fees and commission splits
  - Oversee secondary lead market (Dan's Leads)

---

## Core User Journey (The Loop)

```
1. SUPPLY GENERATION
   → Verified Sourcer uploads deal
   → Backend auto-calculates financials (Yield/ROI)

2. REDACTED DISCOVERY
   → Investors browse feed
   → Critical data (address, vendor, docs) hidden by RLS

3. THE LOCK (Transaction)
   → Investor clicks "Reserve"
   → Signs digital NDA
   → Pays reservation fee via Stripe Checkout

4. ESCROW HOLD
   → Stripe captures funds in platform balance

5. THE UNLOCK
   → Stripe webhook triggers DB update
   → RLS policy grants access to redacted data
   → Deal marked as "Reserved"

6. PROGRESSION
   → Both parties use Kanban to track deal
   → Stages: RESERVED → LEGALS → VALUATION → MORTGAGE → EXCHANGE → COMPLETION

7. COMPLETION
   → Deal completes
   → Admin/system triggers Stripe transfer
   → Sourcing fee paid to Sourcer (minus platform commission)
```

---

## Technical Architecture

### Frontend
- **Framework:** React 19 + Vite 7
- **Router:** React Router DOM v7
- **UI:** Tailwind CSS 4 + shadcn/ui (Radix UI)
- **State:** Tanstack Query + Context API
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React

### Backend & Database
- **Platform:** Supabase
  - PostgreSQL with Row Level Security (RLS)
  - Supabase Auth (Email/Password + OAuth)
  - Supabase Storage (Document/Image uploads)
  - Supabase Edge Functions (Webhooks)
  - Supabase Realtime (Kanban + Chat)

### Payments
- **Provider:** Stripe Connect
- **Model:** Separate Charges and Transfers (Escrow functionality)
- **Features:**
  - Stripe Identity (KYC verification)
  - Checkout Sessions
  - Webhooks for state management
  - Connected Accounts for Sourcers

### Design System
- **Brand Colors:**
  - Electric Cyan: `#00C2D4`
  - Deep Navy: `#0A1F2C`
- **Fonts:**
  - UI: Almarai
  - Financial Data: Geist Mono

---

## Database Schema

### Core Tables

#### `profiles`
```sql
id: uuid (FK to auth.users)
role: ENUM('INVESTOR', 'SOURCER', 'ADMIN')
verification_status: ENUM('PENDING', 'VERIFIED', 'REJECTED')  -- Sourcers only
first_name: text
last_name: text
email: text
phone: text?
company_name: text?
-- Sourcer-specific fields (KYC documents)
id_document_url: text?
aml_document_url: text?
insurance_document_url: text?
stripe_connected_account_id: text?
-- Investor-specific fields (no KYC required)
stripe_customer_id: text?
-- Timestamps
created_at: timestamptz
updated_at: timestamptz
```

#### `deals`
```sql
id: uuid PRIMARY KEY
sourcer_id: uuid (FK to profiles)
status: ENUM('DRAFT', 'ACTIVE', 'RESERVED', 'COMPLETED', 'CANCELLED')

-- Public metadata
headline: text
strategy_type: ENUM('FLIP', 'HMO', 'R2R', 'BTL', 'BRRR')
approximate_location: text (e.g., "North Leeds")
capital_required: decimal
calculated_roi: decimal (%)
calculated_yield: decimal (%)
calculated_roce: decimal (%)

-- Private data (RLS protected)
full_address: text
vendor_details: jsonb
legal_pack_url: text

-- Financial metrics (JSONB - dynamic by strategy)
financial_metrics: jsonb
/*
Example for HMO:
{
  "purchase_price": 200000,
  "refurb_cost": 50000,
  "monthly_rent": 2500,
  "room_count": 5,
  "gross_yield": 12.0,
  "net_yield": 8.5
}
*/

-- Media
media_urls: text[] (Supabase Storage URLs)

-- Metadata
reservation_fee: decimal (default 3000)
sourcing_fee: decimal
created_at: timestamptz
updated_at: timestamptz
```

#### `reservations`
```sql
id: uuid PRIMARY KEY
deal_id: uuid (FK to deals)
investor_id: uuid (FK to profiles)
sourcer_id: uuid (FK to profiles)

payment_status: ENUM('PENDING', 'HELD_IN_ESCROW', 'RELEASED', 'REFUNDED')
stripe_checkout_session_id: text
stripe_payment_intent_id: text
amount: decimal

-- Legal agreement
nda_signed: boolean
nda_signed_at: timestamptz
agreement_url: text

-- Timestamps
created_at: timestamptz
updated_at: timestamptz
```

#### `progression_pipeline`
```sql
id: uuid PRIMARY KEY
reservation_id: uuid (FK to reservations)
current_stage: ENUM('RESERVED', 'LEGALS_INSTRUCTED', 'VALUATION', 'MORTGAGE_OFFER', 'EXCHANGE', 'COMPLETION')
notes: text?
estimated_completion_date: date?
actual_completion_date: date?
created_at: timestamptz
updated_at: timestamptz
```

#### `messages`
```sql
id: uuid PRIMARY KEY
deal_id: uuid (FK to deals)
reservation_id: uuid? (FK to reservations)
sender_id: uuid (FK to profiles)
content: text
is_flagged: boolean (contact info detected)
created_at: timestamptz
```

#### `dans_leads` (Secondary Market)
```sql
id: uuid PRIMARY KEY
title: text
description: text (redacted)
location: text (approximate)
price: decimal (lead price, e.g., 40 GBP)

-- Private data (unlocked after purchase)
full_details: jsonb
seller_name: text
seller_phone: text

created_at: timestamptz
```

#### `lead_purchases`
```sql
id: uuid PRIMARY KEY
lead_id: uuid (FK to dans_leads)
buyer_id: uuid (FK to profiles)
stripe_payment_intent_id: text
amount: decimal
created_at: timestamptz
```

---

## Row Level Security (RLS) Policies

### Critical RLS Logic

#### `deals` Table - Private Column Access
```sql
-- Users can see private data IF:
-- 1. They are the Sourcer who created it
-- 2. OR they have a paid reservation (payment_status = 'HELD_IN_ESCROW')

CREATE POLICY "Private deal data access"
ON deals
FOR SELECT
USING (
  auth.uid() = sourcer_id
  OR
  EXISTS (
    SELECT 1 FROM reservations
    WHERE reservations.deal_id = deals.id
    AND reservations.investor_id = auth.uid()
    AND reservations.payment_status IN ('HELD_IN_ESCROW', 'RELEASED')
  )
);
```

#### `messages` Table - Contact Info Blocking
```sql
-- Database trigger blocks messages with contact info BEFORE reservation
CREATE TRIGGER block_contact_sharing
BEFORE INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION check_contact_info();

-- Function uses Regex:
-- Phone: (\+44|07\d{9})
-- Email: [\w\.-]+@[\w\.-]+\.\w+
```

---

## Stripe Integration

### Sourcer Onboarding
1. Sourcer completes platform KYC (Admin approves)
2. System creates Stripe Connected Account (Express/Standard)
3. Sourcer completes Stripe onboarding
4. `stripe_connected_account_id` stored in `profiles`

### Reservation Payment Flow
1. Investor clicks "Reserve Deal"
2. Frontend creates Checkout Session via API
3. Stripe Checkout captures payment
4. Funds held in **Platform Balance** (not transferred yet)
5. Webhook fires: `checkout.session.completed`
6. Edge Function updates `reservations.payment_status = 'HELD_IN_ESCROW'`
7. RLS policy resolves → Investor can now see private deal data

### Payout Flow (Deal Completion)
1. Deal reaches `COMPLETION` stage in Kanban
2. Investor authorizes payout (or auto-authorize after 72hrs)
3. Edge Function calls Stripe API:
   ```javascript
   await stripe.transfers.create({
     amount: sourcingFee * 0.8, // 80% to Sourcer
     currency: 'gbp',
     destination: sourcer.stripe_connected_account_id,
     transfer_group: reservation.id,
   });
   ```
4. Update `reservations.payment_status = 'RELEASED'`
5. Platform retains 20% commission

---

## Key Features & Implementation Details

### 1. Authentication & RBAC
- **Supabase Auth** with Email/Password and Google OAuth
- **Database Trigger:** Auto-create `profiles` record on user signup (default role: INVESTOR)
- **Verification Gate (Sourcers Only):**
  - Sourcers default to `verification_status = 'PENDING'`
  - Must upload ID, AML, and Insurance documents to Supabase Storage
  - Cannot create deals until Admin approves (`verification_status = 'VERIFIED'`)
  - Investors have immediate access with no verification required

### 2. Deal Ingestion (The Maths Guard)
- **Dynamic Form:** Renders fields based on `strategy_type` selection
- **JSONB Storage:** Flexible schema for different property strategies
- **Server-Side Calculation:** ROI/Yield calculated on backend (not user input)
- **Validation:** Zod schema prevents negative or impossible values
- **Image Upload:** Supabase Storage with signed URLs

### 3. Marketplace Feed
- **Public View:** Shows `approximate_location`, `calculated_roi`, `capital_required`
- **Redacted Data:** Address/vendor/docs hidden by RLS
- **Filtering:** By strategy type, location, ROI range, yield
- **Search:** Full-text search on headline and location

### 4. Transaction Engine
- **NDA Generation:** Digital agreement with checkbox/e-signature
- **Stripe Checkout:** Embedded or redirect flow
- **Webhook Handling:** Supabase Edge Function (independent of frontend)
- **Atomic State Update:** RLS unlock happens immediately after payment

### 5. Kanban CRM
- **Realtime Updates:** Supabase Realtime subscriptions
- **Drag & Drop:** Update `current_stage` in `progression_pipeline`
- **Shared View:** Both Investor and Sourcer see same board
- **Stage Tracking:**
  - RESERVED → LEGALS_INSTRUCTED → VALUATION → MORTGAGE_OFFER → EXCHANGE → COMPLETION

### 6. Secure Messaging
- **In-Deal Chat:** Linked to `deal_id` and `reservation_id`
- **Realtime:** Supabase Realtime for instant delivery
- **Contact Blocking:** Database trigger + Regex before reservation
- **Warning Toast:** Frontend catches error if contact info detected

### 7. Admin Dashboard
- **Sourcer KYC Review:** Approve/Reject verification with document viewer (ID, AML, Insurance)
- **Dispute Resolution:** Refund escrow payments, manage failed transactions
- **Platform Stats:** Total deals, GMV, commission earned, active users
- **User Management:** Ban/suspend users, role management
- **Note:** No Investor verification workflow needed for MVP

### 8. Dan's Leads (Secondary Market)
- **Redacted Listings:** Basic property info visible
- **Micro-Transaction:** £40 to unlock full details
- **Instant Access:** Stripe payment → reveal seller contact

---

## 6-Week Implementation Timeline

### ✅ Week 0: Foundation (COMPLETED)
- [x] Vite + React setup
- [x] Supabase client initialization
- [x] Auth system (Context + Protected Routes)
- [x] UI components (shadcn/ui)
- [x] Layout with Sidebar
- [x] Basic routing
- [x] Theme system

### 📋 Week 1: Database & User Management
- [x] Create Supabase schema (all tables) - ✅ Complete
- [x] Implement RLS policies - ✅ Complete
- [x] Database triggers (auto-create profiles, contact blocking) - ✅ Complete
- [ ] Profile management UI (role-based views)
  - Investor: Basic profile editing (no verification)
  - Sourcer: Profile + Document upload (ID, AML, Insurance)
  - Admin: Enhanced view with verification controls
- [ ] Document upload to Supabase Storage (Sourcers only)
- [ ] Admin KYC approval dashboard (Sourcer verification only)

### 📋 Week 2: Deal Ingestion & Marketplace
- [ ] Dynamic deal creation form (strategy-specific fields)
- [ ] Server-side financial calculations
- [ ] Image upload with Supabase Storage
- [ ] Deal listing page with filters
- [ ] Deal detail page (redacted view)
- [ ] Search functionality

### 📋 Week 3: Stripe Connect & Transactions
- [ ] Stripe Connect onboarding for Sourcers
- [ ] Reservation flow (NDA + Checkout)
- [ ] Supabase Edge Function for webhooks
- [ ] RLS unlock logic after payment
- [ ] Full deal detail view (post-payment)
- [ ] Payment history for users

### 📋 Week 4: Kanban CRM & Realtime
- [ ] Progression pipeline UI (Kanban board)
- [ ] Drag-and-drop stage updates
- [ ] Supabase Realtime subscriptions
- [ ] In-deal messaging system
- [ ] Contact info blocking (frontend + backend)
- [ ] Deal completion flow

### 📋 Week 5: Payouts & Secondary Market
- [ ] Stripe Transfer API integration
- [ ] Payout authorization UI
- [ ] Commission calculation
- [ ] Dan's Leads marketplace
- [ ] Lead purchase flow
- [ ] Admin payout management

### 📋 Week 6: QA, Polish & Launch Prep
- [ ] End-to-end testing (all user flows)
- [ ] Mobile responsiveness
- [ ] Error handling & edge cases
- [ ] Loading states & animations
- [ ] Email notifications (Supabase)
- [ ] Stripe live mode setup
- [ ] Security audit (RLS policies)
- [ ] Documentation

---

## Out of Scope (MVP Phase 1)

The following features are **strictly excluded** to protect the 6-week timeline:

❌ Multi-user "Team" accounts for agencies
❌ Built-in educational courses (LMS)
❌ API integrations with external property data tools
❌ Mobile native apps (iOS/Android)
❌ Advanced analytics dashboard
❌ White-label solutions
❌ Multi-currency support
❌ Automated legal document generation

---

## Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_... (server-only)
STRIPE_WEBHOOK_SECRET=whsec_... (Edge Function)

# App
VITE_APP_URL=http://localhost:7001
```

---

## Critical Implementation Notes

### 1. Security First
- **Never bypass RLS** for convenience
- **Always validate** on server-side (Edge Functions)
- **Use JSONB** carefully (validate structure)
- **Test RLS policies** thoroughly before launch

### 2. Financial Calculations
```typescript
// Example ROI calculation
const calculateROI = (metrics: FinancialMetrics) => {
  const { purchase_price, refurb_cost, arv } = metrics;
  const total_invested = purchase_price + refurb_cost;
  const profit = arv - total_invested;
  return (profit / total_invested) * 100;
};
```

### 3. Webhook Reliability
- **Idempotency:** Handle duplicate webhook calls
- **Retry Logic:** Stripe retries failed webhooks
- **Logging:** Store all webhook events for debugging

### 4. RLS Testing
```sql
-- Test as Investor (should NOT see address)
SELECT full_address FROM deals WHERE id = 'deal-id';

-- Pay reservation fee, then test again (should see address)
```

---

## API Endpoints (Supabase Edge Functions)

### `/stripe/create-checkout-session`
- **Input:** `{ deal_id, investor_id }`
- **Output:** `{ session_id, url }`

### `/stripe/webhook`
- **Input:** Stripe webhook payload
- **Actions:**
  - `checkout.session.completed` → Update reservation
  - `account.updated` → Update Sourcer connected account

### `/stripe/create-transfer`
- **Input:** `{ reservation_id }`
- **Output:** `{ transfer_id, amount }`

### `/deals/calculate-metrics`
- **Input:** `{ strategy_type, financial_metrics }`
- **Output:** `{ roi, yield, roce }`

---

## Success Metrics (Post-Launch)

- **User Acquisition:** 100 Sourcers + 500 Investors (Month 1)
- **Deal Volume:** 50 deals listed per week
- **Transaction Rate:** 20% conversion (browse → reserve)
- **Completion Rate:** 30% of reservations → completion
- **GMV (Gross Merchandise Value):** £500k in first 90 days
- **Platform Commission:** 20% of sourcing fees
- **User Retention:** 60% MAU (Monthly Active Users)

---

## Support & Documentation

### For Developers
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Connect Guide](https://stripe.com/docs/connect)
- [React Router v7 Docs](https://reactrouter.com/)

### For Users
- User Guide (in-app)
- Video Tutorials (YouTube)
- Support Email: support@sourcery.com
- Live Chat (Intercom)

---

## Glossary

- **HMO:** House in Multiple Occupation (rented by room)
- **BTL:** Buy-to-Let (traditional rental)
- **R2R:** Rent-to-Rent (subletting)
- **BRRR:** Buy, Refurbish, Refinance, Rent
- **ROI:** Return on Investment
- **ROCE:** Return on Capital Employed
- **Yield:** Annual rental income / property value (%)
- **GDV:** Gross Development Value
- **ARV:** After Repair Value

---

**Document Version:** 1.1
**Last Updated:** 2026-03-12
**Maintained By:** Development Team

**Key Changes (v1.1):**
- Clarified verification is Sourcer-only (no Investor verification for MVP)
- Updated database infrastructure status to 100% complete
- Aligned with FRD requirements
