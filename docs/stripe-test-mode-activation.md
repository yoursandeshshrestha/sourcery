# Stripe Connect Test Mode Activation

## Issue: Onboarding Complete but Account Not Active

When you complete Stripe Connect onboarding in **test mode**, you might see:
```json
{
  "charges_enabled": false,
  "payouts_enabled": false,
  "details_submitted": true,
  "onboarding_completed": false
}
```

This is because test accounts need manual activation.

---

## Quick Fix: Manually Enable Test Account

### Option 1: Via Stripe Dashboard (Recommended)

1. **Go to Connect Accounts:**
   ```
   https://dashboard.stripe.com/test/connect/accounts/overview
   ```

2. **Click on the account** you just created
   - Should see something like `acct_1TCHO09chI6B7QxM`

3. **Click "Enable charges & payouts"** button
   - Should be at the top of the account details page
   - This instantly activates the test account

4. **Refresh Sourcery**
   - Banner should disappear
   - Can now create deals ✅

### Option 2: Via API (Automated)

Run this in your terminal to activate the account:

```bash
curl https://api.stripe.com/v1/accounts/acct_1TCHO09chI6B7QxM \
  -u sk_test_YOUR_SECRET_KEY: \
  -d "charges_enabled=true" \
  -d "payouts_enabled=true"
```

Replace:
- `acct_1TCHO09chI6B7QxM` with your account ID
- `sk_test_YOUR_SECRET_KEY` with your Stripe secret key from `.env`

---

## Why This Happens

**In Test Mode:**
- Stripe doesn't automatically enable charges/payouts
- This prevents accidental test charges
- You must manually activate each test account

**In Live Mode:**
- Stripe reviews the business information
- Automatically enables charges/payouts if approved
- Can take 1-2 business days for review

---

## Automated Solution (For Development)

We can add an auto-activation step for test mode. Let me create a helper:

```typescript
// In your Edge Function or locally
async function activateTestAccount(accountId: string) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // Only in test mode!
  if (accountId.startsWith('acct_')) {
    await stripe.accounts.update(accountId, {
      // @ts-ignore - Test mode only
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
  }
}
```

---

## Check Current Status

You can check the account status anytime:

```bash
curl https://api.stripe.com/v1/accounts/acct_1TCHO09chI6B7QxM \
  -u sk_test_YOUR_SECRET_KEY:
```

Look for:
- `charges_enabled: true` ✅
- `payouts_enabled: true` ✅
- `requirements.currently_due: []` (empty array) ✅

---

## Troubleshooting

### Banner Still Shows After Activation

1. **Check Stripe Dashboard:**
   - Verify account shows "Active" status
   - Both charges and payouts should be enabled

2. **Refresh Profile in Sourcery:**
   - Click your avatar → Profile
   - Navigate back to Settings
   - Or hard refresh (Cmd+Shift+R)

3. **Check Database:**
   - Run: `select stripe_connected_account_id, stripe_onboarding_completed from profiles where role = 'SOURCER';`
   - Should show `stripe_onboarding_completed: true`

4. **Trigger Webhook Manually:**
   - The `account.updated` webhook should fire automatically
   - If not, you can manually update the profile:
   ```sql
   UPDATE profiles
   SET stripe_onboarding_completed = true
   WHERE stripe_connected_account_id = 'acct_1TCHO09chI6B7QxM';
   ```

### Requirements Still Pending

If Stripe shows "Currently due" requirements:
- Complete any missing fields in Stripe Dashboard
- Common: Additional business info, bank verification
- Click the account in Dashboard to see what's needed

---

## For Production (Live Mode)

When going live:
1. Switch to Live mode in Stripe Dashboard
2. Complete Connect application (if required)
3. Users complete real onboarding with real information
4. Stripe automatically enables charges/payouts after verification
5. Usually takes 1-2 business days

No manual activation needed in live mode!
