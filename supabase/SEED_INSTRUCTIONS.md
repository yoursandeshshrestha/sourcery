# Database Seeding Instructions

## Test Accounts (Email/Password Authentication)

This seed file creates 3 test accounts with email/password authentication:

| Email | Password | Role | Verification Status |
|-------|----------|------|---------------------|
| yoursandeshshrestha@gmail.com | TestPassword123! | ADMIN | N/A |
| yoursandeshgeneral@gmail.com | TestPassword123! | SOURCER | ✅ VERIFIED |
| contactyouraryan@gmail.com | TestPassword123! | INVESTOR | N/A |

## How to Use

### Automatic Seeding (Recommended) ✅

The seed file runs **automatically** when you reset your database:

```bash
# Clean database and seed test accounts
npm run dbseed
```

This will:
1. Reset the database to clean state
2. Run all migrations
3. **Automatically seed the 3 test accounts**

### Manual Seeding

If you want to run the seed file without resetting:

**Via Supabase Dashboard:**
1. Go to [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard)
2. Open [supabase/seed.sql](supabase/seed.sql) in your editor
3. Copy all contents
4. Paste into SQL Editor
5. Click **Run**

**Via psql (if you have DATABASE_URL):**
```bash
psql $DATABASE_URL -f supabase/seed.sql
```

## Login to Your App

After seeding, you can login with:

**Admin Account:**
- Email: `yoursandeshshrestha@gmail.com`
- Password: `TestPassword123!`
- Role: ADMIN (full access)

**Sourcer Account:**
- Email: `yoursandeshgeneral@gmail.com`
- Password: `TestPassword123!`
- Role: SOURCER (verified, can create deals)

**Investor Account:**
- Email: `contactyouraryan@gmail.com`
- Password: `TestPassword123!`
- Role: INVESTOR (can browse and reserve deals)

## Verification

You can verify the accounts were created by checking the profiles table:

```sql
SELECT
  email,
  role,
  verification_status,
  first_name || ' ' || last_name as full_name
FROM profiles
WHERE email IN (
  'yoursandeshshrestha@gmail.com',
  'yoursandeshgeneral@gmail.com',
  'contactyouraryan@gmail.com'
)
ORDER BY role;
```

## Notes

- **ADMIN** role: Full access to admin dashboard, can verify sourcers
- **SOURCER** role: Pre-verified, can create and manage deals immediately
- **INVESTOR** role: Can browse deals and make reservations
- All accounts use the same password for convenience: `TestPassword123!`
- The seed file automatically cleans up old test accounts before creating new ones
