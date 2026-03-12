# Database Migration Workflow

## Overview

This document outlines the migration workflow for the Sourcery platform - a property investment marketplace connecting investors with verified off-market deals. We follow a streamlined process for managing database schema changes with clear organization and maintainability.

## Core Principles

1. **Fix bugs in base migrations, not new incremental files**
   - When a bug is found, fix it directly in the relevant base migration file
   - Do NOT create new fix migrations (e.g., `99_fix_something.sql`)
   - This keeps the migration history clean and maintainable

2. **Test with full database reset**
   - After fixing a bug in a base migration: `supabase db reset --linked`
   - This ensures migrations run cleanly from scratch
   - Validates that the fix doesn't break dependent migrations

3. **Separation of concerns**
   - **Migrations (SQL)**: Schema only - tables, columns, types, indexes, triggers, RLS policies
   - **Seeding (TypeScript)**: Data only - handled separately if needed
   - Never mix schema and data in the same file

4. **Break down by functional domain**
   - Each table group gets its own migration file
   - Easier to locate and fix issues
   - Clear organization by business domain

## Migration File Structure

```
supabase/migrations/
├── 01_extensions_and_enums.sql        # PostgreSQL extensions & enum types
├── 02_profiles_table.sql              # User profiles (investors & sourcers)
├── 03_deals_table.sql                 # Off-market property deals
├── 04_reservations_and_pipeline.sql   # Deal reservations & progress tracking
├── 05_messages_table.sql              # Messaging between users
├── 06_dans_leads_tables.sql           # Investor lead tracking
├── 07_rls_profiles.sql                # Row Level Security - profiles
├── 08_rls_deals.sql                   # Row Level Security - deals
├── 09_rls_reservations.sql            # Row Level Security - reservations
├── 10_rls_messages.sql                # Row Level Security - messages
├── 11_rls_leads.sql                   # Row Level Security - leads
├── 12_trigger_profiles.sql            # Profile auto-creation triggers
├── 13_trigger_messages.sql            # Message notification triggers
├── 14_trigger_timestamps.sql          # Auto-update timestamps
├── 15_trigger_pipeline.sql            # Pipeline status automation
├── 16_helper_functions.sql            # Utility functions
└── 19_delete_account_function.sql     # Account deletion logic
```

## Domain Model Overview

### Core Tables
- **profiles**: User profiles (INVESTOR or SOURCER role)
- **deals**: Off-market property listings with financials
- **reservations**: Investor reservations on deals (escrow tracking)
- **pipeline**: Deal progress tracking (legals, valuation, mortgage, completion)
- **messages**: Communication between investors and sourcers
- **leads**: Investor interest tracking and filtering

### Security Model
- **Row Level Security (RLS)**: Enabled on all tables
- **Policies**: Separate files (07-11) for each domain
- **Auth**: Google OAuth only via Supabase Auth
- **Auto-creation**: Profile trigger creates user profile on first signup

## Workflow: Fixing a Bug

### Step 1: Identify the Issue
- Note the error message
- Identify which migration file contains the problematic code
- Example: `deal_status` column missing → check `03_deals_table.sql`

### Step 2: Fix in Base Migration
- Open the relevant base migration file
- Make the fix directly in that file
- Example: Add `deal_status deal_status_enum DEFAULT 'draft'` to deals table

### Step 3: Reset and Test
```bash
supabase db reset --linked
```
- This drops the entire database and re-runs all migrations from scratch
- Validates that all migrations run in correct order
- Ensures no dependencies are broken

### Step 4: Verify
- Check that the error is resolved
- Run the application to ensure functionality
- Test with actual user flows (auth, creating deals, reservations, etc.)

### Step 5: Iterate
- If issues persist, repeat steps 2-4
- Keep fixing in base migrations until clean reset works

## Migration Naming Convention

- Use 2-digit prefixes: `01`, `02`, `03`, etc.
- Never use date-based prefixes (e.g., `20260313000000`) - they break alphanumeric sorting
- Descriptive names after the number: `03_deals_table.sql`
- Group by function: tables first, then RLS policies, then triggers, then functions

## Common Pitfalls to Avoid

1. **Creating incremental fix migrations**
   - ❌ Creating `99_fix_deals_table.sql` for a bug
   - ✅ Fixing the bug in `03_deals_table.sql` directly

2. **Mixing schema and data**
   - ❌ Adding INSERT statements in migration files
   - ✅ Keep migrations pure schema only

3. **Wrong migration order**
   - ❌ Using date-based naming that sorts incorrectly
   - ✅ Using 2-digit sequential prefixes

4. **Not testing full reset**
   - ❌ Only testing `supabase db push` with incremental changes
   - ✅ Always test with `supabase db reset --linked` for clean slate

5. **Breaking down too granularly or too coarsely**
   - ❌ One massive `tables.sql` file with all tables
   - ❌ Separate file for each individual table (too many files)
   - ✅ Group related tables by functional domain (profiles, deals, reservations, messages, etc.)
   - ✅ Group RLS policies together by table
   - ✅ Group triggers together by function

6. **Forgetting RLS policies**
   - ❌ Creating tables without corresponding RLS policies
   - ✅ Every table MUST have RLS policies for security
   - ✅ Test policies with different user roles (INVESTOR vs SOURCER)

## Archive Strategy

When consolidating migrations:
1. Create an archive directory: `archive_YYYY_MM_DD/`
2. Move all old incremental migrations into it
3. Keep for historical reference and debugging
4. Never delete old migrations - they document the evolution

## Authentication Strategy

Sourcery uses **Google OAuth only**:
- No email/password authentication
- Profiles auto-created via trigger on `auth.users` insert
- Default role: `INVESTOR`
- Users can upgrade to `SOURCER` role in settings
- All handled by Supabase Auth + trigger in `12_trigger_profiles.sql`

### User Roles
- **INVESTOR**: Browse deals, make reservations, track pipeline
- **SOURCER**: Create deals, manage reservations, communicate with investors

## File Organization

```
/supabase/
  /migrations/          # Schema migrations only (17 files)
  /functions/           # Edge functions (if any)

/src/
  /pages/               # React pages
  /components/          # Reusable components
  /lib/                 # Utilities & helpers
    date.ts             # formatDate, formatTime, formatDateTime

/docs/
  migration-guide.md    # This file
```

## Testing Checklist

After making migration changes, test:
- [ ] `supabase db reset --linked` runs without errors
- [ ] All tables created successfully
- [ ] All RLS policies applied
- [ ] All triggers active
- [ ] Google OAuth login works
- [ ] Profile auto-creation on first login
- [ ] Investor can browse deals
- [ ] Sourcer can create deals
- [ ] Reservations work with correct permissions
- [ ] Messages work between investor and sourcer
- [ ] Pipeline tracking updates correctly

## Key Takeaways

- **Base migrations are living documents** - fix them directly, don't pile on fixes
- **Reset is your friend** - always test with `supabase db reset --linked`
- **Organize by domain** - group related tables together
- **Schema ≠ Data** - keep them separate
- **2-digit prefixes** - simple, sequential, sortable
- **RLS is critical** - every table must have proper policies for security
- **Google OAuth only** - no email/password auth in this project
- **Role-based access** - INVESTOR vs SOURCER roles drive permissions
