-- ============================================
-- SEED FILE - Test Accounts with Email/Password
-- ============================================
-- This file seeds 3 test accounts with email/password authentication:
-- 1. yoursandeshshrestha@gmail.com - ADMIN - Password: TestPassword123!
-- 2. yoursandeshgeneral@gmail.com - SOURCER (verified) - Password: TestPassword123!
-- 3. contactyouraryan@gmail.com - INVESTOR - Password: TestPassword123!
-- ============================================

-- Clean up existing test users if they exist
DELETE FROM auth.users
WHERE email IN (
  'yoursandeshshrestha@gmail.com',
  'yoursandeshgeneral@gmail.com',
  'contactyouraryan@gmail.com'
);

-- Insert test users into auth.users with email/password
-- Password for all accounts: TestPassword123!
-- Using fixed UUIDs for consistency
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES
  -- Admin user
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'yoursandeshshrestha@gmail.com',
    extensions.crypt('TestPassword123!', extensions.gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Sandesh", "last_name": "Shrestha"}'::jsonb,
    false,
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  ),
  -- Sourcer user
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'yoursandeshgeneral@gmail.com',
    extensions.crypt('TestPassword123!', extensions.gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Sandesh", "last_name": "General"}'::jsonb,
    false,
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  ),
  -- Investor user
  (
    '33333333-3333-3333-3333-333333333333'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'contactyouraryan@gmail.com',
    extensions.crypt('TestPassword123!', extensions.gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Aryan", "last_name": "Contact"}'::jsonb,
    false,
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

-- Insert corresponding identities
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '{"sub": "11111111-1111-1111-1111-111111111111", "email": "yoursandeshshrestha@gmail.com"}'::jsonb,
    'email',
    '11111111-1111-1111-1111-111111111111',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '{"sub": "22222222-2222-2222-2222-222222222222", "email": "yoursandeshgeneral@gmail.com"}'::jsonb,
    'email',
    '22222222-2222-2222-2222-222222222222',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    '{"sub": "33333333-3333-3333-3333-333333333333", "email": "contactyouraryan@gmail.com"}'::jsonb,
    'email',
    '33333333-3333-3333-3333-333333333333',
    NOW(),
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert corresponding profiles (trigger will create them, but we'll ensure they have correct roles)
INSERT INTO profiles (
  id,
  role,
  verification_status,
  first_name,
  last_name,
  email,
  bio,
  created_at,
  updated_at
) VALUES
  -- Admin profile
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'ADMIN',
    NULL,
    'Sandesh',
    'Shrestha',
    'yoursandeshshrestha@gmail.com',
    'Platform Administrator',
    NOW(),
    NOW()
  ),
  -- Sourcer profile (VERIFIED)
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'SOURCER',
    'VERIFIED',
    'Sandesh',
    'General',
    'yoursandeshgeneral@gmail.com',
    'Verified Property Sourcer',
    NOW(),
    NOW()
  ),
  -- Investor profile
  (
    '33333333-3333-3333-3333-333333333333'::uuid,
    'INVESTOR',
    NULL,
    'Aryan',
    'Contact',
    'contactyouraryan@gmail.com',
    'Property Investor',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  verification_status = EXCLUDED.verification_status,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- Create test deal
INSERT INTO deals (
  id,
  sourcer_id,
  status,
  headline,
  description,
  strategy_type,
  approximate_location,
  full_address,
  capital_required,
  reservation_fee,
  sourcing_fee,
  financial_metrics,
  created_at,
  updated_at
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid, -- Sourcer
  'RESERVED',
  '3-Bed Victorian Terrace - Prime BTL Opportunity',
  E'Beautiful Victorian terrace in a highly sought-after area. Perfect for buy-to-let investors looking for strong rental yields.\n\nThe property features three spacious bedrooms, a modern kitchen, and a large rear garden. Recently refurbished to a high standard with new electrics and plumbing throughout.\n\nLocated close to local amenities, schools, and transport links. Strong rental demand in the area with similar properties achieving £1,500 pcm.',
  'BTL',
  'Central Manchester, M1',
  '123 Victoria Street, Manchester, M1 4PL',
  272500.00,
  3000.00,
  7500.00,
  jsonb_build_object(
    'purchase_price', 250000,
    'refurb_costs', 15000,
    'total_investment', 272500,
    'estimated_gdv', 320000,
    'estimated_rental_income', 1500,
    'estimated_profit', 55000
  ),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create test reservation
INSERT INTO reservations (
  id,
  deal_id,
  investor_id,
  sourcer_id,
  status,
  reservation_fee_amount,
  reservation_fee_paid,
  reserved_at,
  confirmed_at,
  updated_at
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, -- Deal
  '33333333-3333-3333-3333-333333333333'::uuid, -- Investor
  '22222222-2222-2222-2222-222222222222'::uuid, -- Sourcer
  'CONFIRMED',
  3000.00,
  true,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Pipeline entry will be auto-created by trigger

-- Display seeded accounts
SELECT
  email,
  role,
  verification_status,
  first_name || ' ' || last_name as full_name,
  created_at
FROM profiles
WHERE email IN (
  'yoursandeshshrestha@gmail.com',
  'yoursandeshgeneral@gmail.com',
  'contactyouraryan@gmail.com'
)
ORDER BY
  CASE role
    WHEN 'ADMIN' THEN 1
    WHEN 'SOURCER' THEN 2
    WHEN 'INVESTOR' THEN 3
  END;
