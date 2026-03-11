# Supabase Migrations

This directory contains the database migrations for the Sourcery platform, broken down into logical, manageable pieces.

## Migration Files

### Core Schema
- **01_extensions_and_enums.sql** - PostgreSQL extensions and custom enum types
- **02_profiles_table.sql** - User profiles table (extends auth.users)
- **03_deals_table.sql** - Property deals table
- **04_reservations_and_pipeline.sql** - Reservations and progression tracking
- **05_messages_table.sql** - In-deal messaging
- **06_dans_leads_tables.sql** - Secondary marketplace (Dan's Leads)

### Row Level Security (RLS)
- **07_rls_profiles.sql** - RLS policies for profiles
- **08_rls_deals.sql** - RLS policies for deals (includes critical private data access control)
- **09_rls_reservations.sql** - RLS policies for reservations and pipeline
- **10_rls_messages.sql** - RLS policies for messages
- **11_rls_leads.sql** - RLS policies for Dan's Leads

### Database Triggers
- **12_trigger_profiles.sql** - Auto-create profile on user signup
- **13_trigger_messages.sql** - Block contact info sharing before reservation
- **14_trigger_timestamps.sql** - Auto-update updated_at timestamps
- **15_trigger_pipeline.sql** - Track stage changes in pipeline

### Helper Functions
- **16_helper_functions.sql** - Utility functions for common operations

## Running Migrations

### Option 1: Supabase CLI (Recommended for Production)
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase (if not done)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push
```

### Option 2: Supabase Dashboard (Quick Start)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file **in order** (01 through 16)
4. Verify no errors before proceeding to the next

### Option 3: Manual SQL Execution
```bash
# Run migrations in order
psql postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres \
  -f 01_extensions_and_enums.sql \
  -f 02_profiles_table.sql \
  # ... continue for all files
```

## Post-Migration Setup

### Create Storage Buckets
After running migrations, create these Supabase Storage buckets:

```sql
-- In Supabase Dashboard > Storage
```

1. **documents** (Private)
   - For: ID, AML, Insurance documents
   - Public: No
   - File size limit: 10MB
   - Allowed MIME types: `image/*, application/pdf`

2. **deal-images** (Public)
   - For: Property photos
   - Public: Yes
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

3. **legal-packs** (Private)
   - For: Legal documents
   - Public: No
   - File size limit: 20MB
   - Allowed MIME types: `application/pdf`

4. **agreements** (Private)
   - For: NDAs and reservation agreements
   - Public: No
   - File size limit: 5MB
   - Allowed MIME types: `application/pdf`

### Configure Storage Policies

```sql
-- Example: Allow authenticated users to upload to deal-images
CREATE POLICY "Users can upload deal images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deal-images'
  AND auth.role() = 'authenticated'
);
```

## Important Notes

### ⚠️ Critical RLS Policy (08_rls_deals.sql)
The "Private deal data access" policy is **critical** for security:
- Private deal data (full_address, vendor_details, legal_pack_url) is **hidden** until payment
- Access is granted **only** when payment_status = 'HELD_IN_ESCROW' or 'RELEASED'
- Test this thoroughly before launch!

### Testing RLS Policies
```sql
-- Test as an investor (should NOT see private data)
SET request.jwt.claim.sub = 'investor-user-id';
SELECT full_address FROM deals WHERE id = 'some-deal-id';
-- Should return NULL or restricted

-- After reservation payment (should see private data)
-- Update reservation status, then test again
```

### Rolling Back Migrations
If you need to rollback:

```bash
# Drop all tables (CAUTION: This deletes all data!)
DROP TABLE IF EXISTS lead_purchases CASCADE;
DROP TABLE IF EXISTS dans_leads CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS progression_pipeline CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

# Drop enums
DROP TYPE IF EXISTS pipeline_stage;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS strategy_type;
DROP TYPE IF EXISTS deal_status;
DROP TYPE IF EXISTS verification_status;
DROP TYPE IF EXISTS user_role;
```

## Migration Dependencies

Each migration must be run **in order** due to dependencies:

```
01 → 02 → 03 → 04 → 05 → 06 (Create all tables)
↓
07 → 08 → 09 → 10 → 11 (Apply RLS policies)
↓
12 → 13 → 14 → 15 (Setup triggers)
↓
16 (Helper functions)
```

## Verification Checklist

After running all migrations:

- [ ] All 7 tables created successfully
- [ ] All 6 enum types exist
- [ ] RLS enabled on all tables
- [ ] RLS policies created (use `\ddp` in psql to list)
- [ ] All triggers created (use `\dft` in psql to list)
- [ ] Storage buckets created
- [ ] Test profile auto-creation (signup new user)
- [ ] Test private data access (before/after payment)
- [ ] Test contact blocking in messages

## Troubleshooting

### Error: "relation already exists"
- You've already run this migration
- Skip to the next file or drop the table first

### Error: "permission denied"
- Ensure you're connected as a superuser
- In Supabase, use the SQL Editor which runs as postgres

### Error: "type already exists"
- The enum type was already created
- Safe to skip or use `DROP TYPE IF EXISTS` first

### RLS Policy Not Working
- Check if RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- Verify policy with: `SELECT * FROM pg_policies WHERE tablename = 'your_table';`
- Test with different user roles

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/trigger-definition.html)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

**Last Updated:** 2026-03-11
**Version:** 1.0
