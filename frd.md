Project Overview: Sourcery
Document Type: Business Context & Project Scope (MVP)
Prepared By: Levi (Project Manager)
Target Timeline: 6 Weeks (AI-Assisted Build)
Tech Stack: Next.js (Vercel) + Supabase + Stripe Connect
1. Executive Summary
Sourcery is a B2B/B2C PropTech SaaS platform designed to modernize and secure the off-market property deal sourcing industry.
Currently, the industry relies on fragmented, unregulated communication (WhatsApp groups, Instagram DMs, and spreadsheets). This results in high fraud risk, unstandardized financial data, and high friction for both buyers and sellers.
Sourcery solves this by acting as a trust-driven marketplace and an end-to-end workflow engine. It enforces identity verification, standardizes financial data ingestion, secures reservation fees via an escrow-style Stripe Connect flow, and provides a Kanban-style CRM to track property transactions through to legal completion.
2. The Problem vs. The Solution
The Current Reality (The Pain)
The Sourcery Solution (The Gain)
Rampant Fraud: Investors fear scams and ghosting after paying sourcing fees via direct bank transfer.
Trust Engine: Strict KYC/AML and Insurance verification before a Sourcer can list. Funds are held in escrow.
Data Chaos: Deals are shared as unformatted text blocks with manipulated or incorrect ROI/Yield calculations.
The Maths Guard: A standardized deal upload wizard that auto-calculates financial metrics based on raw inputs.
Platform Leakage: Users meet online but transact offline to save platform fees.
The Sticky CRM: A built-in progression tracker that manages the legal conveyancing process, making the platform essential.

3. User Personas
The Investor (Buyer)
Profile: Time-poor, capital-rich individuals looking for off-market property deals (HMOs, Flips, Buy-to-Lets).
Motivations: Wants a curated, trustworthy feed of deals without the noise of 50 different WhatsApp groups. Needs to know their reservation fee is safe if a deal falls through due to bad data.
Key Actions: Filtering the marketplace, completing ID verification, paying reservation fees, tracking deal progress.
The Deal Sourcer (Seller)
Profile: Active property networkers who find off-market deals but need buyers.
Motivations: Wants to look professional, stop dealing with "tyre-kickers" (unserious buyers), and ensure they actually get paid their sourcing fee when a deal completes.
Key Actions: Uploading compliance documents, creating standardized deal listings, managing active reservations in the CRM, receiving payouts.
The Admin (Internal Team)
Profile: The Sourcery operational team.
Motivations: Maintain platform integrity, resolve disputes, and manage the secondary lead-generation market.
Key Actions: Approving/Rejecting KYC documents, refunding escrow payments, managing platform fee parameters.
4. The Core User Journey (The Loop)
The system architecture must support this specific sequence of events:
Supply Generation: A Verified Sourcer uploads a deal. The backend auto-calculates the financials (Yield/ROI).
Redacted Discovery: Investors browse the feed. Critical data (Exact Address, Vendor Name, Legal Docs) is heavily redacted/hidden by Supabase Row Level Security (RLS) to protect the Sourcer's asset.
The Lock (Transaction): An Investor clicks "Reserve". They sign a digital NDA and pay a reservation fee via Stripe Checkout.
Escrow Hold: Stripe captures the funds and holds them in the platform balance.
The Unlock: A Stripe Webhook triggers a database update. RLS policies instantly unlock the redacted data for that specific Investor. The deal is marked as "Reserved".
Progression: Both parties use the shared Kanban board to track the deal through legals, valuation, and exchange.
Completion: The deal completes. An Admin or system trigger instructs Stripe to transfer the sourcing fee to the Sourcer's connected account, retaining the platform commission.
5. Technology Stack & AI Leverage
This project is operating on an aggressive 6-week timeline, assuming heavy leverage of AI coding assistants (Cursor, Copilot) to generate boilerplate and UI components.
Frontend: Next.js App Router hosted on Vercel.
UI/Styling: Tailwind CSS + Lucide Icons. (Brand Colors: Electric Cyan #00C2D4 and Deep Navy #0A1F2C. Fonts: Almarai for UI, Geist Mono for financial data).
Backend & Database: Supabase (PostgreSQL, Row Level Security, Edge Functions, Auth, Storage).
Payment Gateway: Stripe Connect (Using "Separate Charges and Transfers" for escrow functionality and Stripe Identity for KYC).
6. The 6-Week Execution Timeline
The developer is expected to manage their own sprints within this framework:
Week 1: Foundation. Supabase DB schema, Next.js setup, User Auth, and profile management.
Week 2: The Marketplace. Deal ingestion wizard (server-side math validation), image uploads to Supabase Storage, and the redacted deal feed UI.
Week 3: The Transaction. Stripe Connect integration. Handling the checkout session, webhooks via Edge Functions, and the RLS unlock logic.
Week 4: The Workflow. The real-time Kanban board (Supabase Realtime) and the regex-protected chat system.
Week 5: Admin & Secondary Features. Admin dashboard for KYC approval/disputes, the "Dan's Leads" micro-transaction module, and fund payout logic.
Week 6: QA & Launch Prep. End-to-end testing, mobile UI polish, Stripe live-mode verification, and edge-case resolution.
7. Out of Scope for MVP (Phase 1)
To protect the 6-week timeline, the following features are strictly out of scope:
Multi-user "Team" accounts for large sourcing agencies.
Built-in educational course hosting (LMS features).
Deep API integrations with external property data tools like Property Engine (users will upload PDFs manually for now).



This is the Functional Requirements Document (FRD).
This document strips away the marketing language and defines the exact system behaviors, constraints, and logic the developer must build. It is written specifically for a Next.js and Supabase architecture, leveraging native features to meet the 6-week timeline.

Functional Requirements Document (FRD)
Project: Sourcery MVP Prepared By: Levi (Project Manager) Stack: Next.js (App Router), Supabase (PostgreSQL, Auth, RLS, Edge Functions, Storage), Stripe Connect Timeline: 6 Weeks
1. Authentication & Role-Based Access Control (RBAC)
1.1 User Provisioning
System: Supabase Auth (Email/Password & Google OAuth).
Trigger: A Supabase Database Trigger (AFTER INSERT ON auth.users) must automatically create a record in the public.profiles table.
Roles: The profile must be assigned a role: INVESTOR, SOURCER, or ADMIN.
1.2 The Verification Gate (Sourcers Only)
Requirement: Sourcer profiles default to verification_status: PENDING.
Storage: Identity documents (ID, AML, Insurance) must be uploaded to a private Supabase Storage bucket. URLs are stored in the profile record.
Access Control: The frontend UI must lock the "Create Deal" route for any user where role == SOURCER and verification_status != VERIFIED.
Admin Action: Admins can toggle status to VERIFIED via an internal dashboard, instantly unlocking the creation routes.
2. Deal Ingestion & The "Maths Guard"
2.1 Dynamic Form & JSONB Storage
Data Structure: Because property strategies vary widely, the database deals table must use a JSONB column named financial_metrics to store raw inputs (e.g., Purchase Price, Refurb Cost, Monthly Rent).
Conditional UI: The frontend form fields must dynamically render based on the selected strategy_type ENUM (e.g., FLIP, HMO, R2R, BTL).
2.2 Server-Side Calculation (Critical)
Constraint: Users cannot input their own ROI or Yield.
Logic: The Next.js Server Action handling the form submission must calculate the ROI, ROCE, and Gross/Net Yield based on the raw JSONB inputs before writing to the database.
Validation: Use Zod (or similar) on the server to validate all numerical inputs prevent negative or impossible figures.
3. Data Redaction & Security (Supabase RLS)
3.1 Public vs. Private Data
Public Columns: approximate_location, headline, strategy_type, calculated_roi, calculated_yield, capital_required, media_urls.
Private Columns: full_address, vendor_details, legal_pack_url.
3.2 Row Level Security (RLS) Implementation
Constraint: Custom middleware is discouraged. The developer must use PostgreSQL RLS policies to handle redaction at the database layer.
Policy Logic: The system must only allow SELECT access to the private columns IF the authenticated user is the Sourcer who created the deal, OR if a record exists in the reservations table where investor_id == auth.uid(), deal_id == deals.id, and payment_status == HELD_IN_ESCROW.
Result: The API physically cannot leak the address to a user who has not paid.
4. The Transaction Engine (Stripe Connect)
4.1 Reservation Initiation
Action: Investor clicks "Reserve".
Document Generation: System generates a digital NDA/Reservation Agreement. Investor must digitally sign (checkbox/e-signature API) before proceeding to checkout.
4.2 Payment Capture & Webhook Routing
Checkout: System initiates a Stripe Checkout Session for the reservation fee (e.g., 3,000 GBP).
Escrow: Stripe is configured to hold funds in the Platform Balance (Separate Charges and Transfers).
Webhook Handling: Stripe fires checkout.session.completed. This must be caught by a Supabase Edge Function (to ensure it operates independently of the Next.js frontend).
State Mutation: The Edge Function updates the reservations table payment_status to HELD_IN_ESCROW.
The Unlock: By updating this status, the RLS policy (Section 3.2) automatically resolves to true, granting the frontend access to the unredacted deal data.
5. Deal Progression (Kanban CRM)
5.1 Pipeline Generation
Trigger: Upon successful reservation, a record is created in the progression_pipeline table linking the Investor and Sourcer.
Stages (ENUM): RESERVED, LEGALS_INSTRUCTED, VALUATION, MORTGAGE_OFFER, EXCHANGE, COMPLETION.
5.2 Realtime State Management
System: The Kanban board must utilize Supabase Realtime.
Logic: When either party drags a card to a new column, the database updates the current_stage ENUM. Supabase Realtime pushes this update to the other user's client instantly, ensuring both parties are synchronized without refreshing.
6. Secure Messaging
6.1 In-App Chat
System: A messages table linked to the deal_id and reservation_id, utilizing Supabase Realtime for instant delivery.
6.2 Server-Side Regex Blocking
Constraint: Users must not share contact details to bypass the platform before reservation.
Implementation: The developer must create a PostgreSQL Database Trigger (BEFORE INSERT ON messages).
Logic: The trigger must run a Regex match against the message payload for phone numbers (e.g., (\+44|07\d{9})) and emails (e.g., [\w\.-]+@[\w\.-]+\.\w+).
Action: If a match is found AND the deal is not yet reserved, the database aborts the insert and returns an error code. The frontend catches this error and displays a warning toast to the user.
7. Completion & Fund Payout
7.1 Payout Authorization
Action: When a deal reaches COMPLETION, the Investor is prompted to click "Authorize Payout". (Fallback: Auto-authorize after 72 hours of entering the completion stage if no dispute is raised).
7.2 Financial Routing
Execution: A Supabase Edge Function securely calls the Stripe API to initiate a Transfer.
Logic: The function calculates the agreed split (e.g., 80% to Sourcer's connected Stripe account, 20% retained in Sourcery Platform Balance as commission).
State Update: The reservations.payment_status is updated to RELEASED.
8. Secondary Market: "Dan's Leads"
8.1 Micro-transaction Flow
UI: A separate feed displaying basic, redacted details of distressed sellers (e.g., "3 Bed Semi, Leeds").
Transaction: User clicks "Buy Lead". A Stripe micro-transaction (e.g., 40 GBP) is processed.
Unlock: Upon successful charge, the UI updates to reveal the seller's name and contact number.

PM Handoff Note
This FRD removes ambiguity. If the developer builds exactly to these specifications, using Edge Functions for the webhooks and RLS for the redaction, the platform will be highly secure and incredibly fast.
The final artifact required to guarantee a 6-week execution is the Database Schema (SQL). Because we are relying heavily on Supabase RLS and JSONB columns, getting the table structures right on Day 1 is critical.



