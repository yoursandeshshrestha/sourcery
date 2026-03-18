# Stripe Connect Setup Guide

## Prerequisites

Before using Stripe Connect features in Sourcery, you need to enable Connect in your Stripe account.

---

## Step 1: Enable Stripe Connect

### For Test Mode (Development)

1. **Visit Stripe Dashboard:**
   ```
   https://dashboard.stripe.com/connect/accounts/overview
   ```

2. **Activate Connect:**
   - Click the **"Get started"** button
   - Or click **"Activate Stripe Connect"**
   - Accept the terms and conditions
   - ✅ Connect is now enabled!

3. **Verify Activation:**
   - You should see "Connect" in your left sidebar
   - Navigate to: https://dashboard.stripe.com/test/connect/accounts
   - You should see an empty list (no error)

### For Live Mode (Production)

1. Same steps as above, but:
   - Switch to **Live mode** toggle in top-right
   - May require additional business verification
   - Stripe will review your Connect application

---

## Step 2: Configure Stripe Connect Settings (Optional)

1. **Go to Connect Settings:**
   ```
   https://dashboard.stripe.com/settings/connect
   ```

2. **Platform Profile:**
   - **Platform name:** Sourcery
   - **Platform description:** Property deal sourcing marketplace
   - **Support email:** your-support@email.com

3. **Branding:**
   - Upload logo (optional)
   - Set brand color: `#1287ff` (Sourcery blue)

4. **Account Types:**
   - Ensure **"Express accounts"** is enabled (default)
   - This allows Sourcers to onboard quickly

---

## Step 3: Test the Integration

### Create a Test Sourcer Account

1. **Log in to Sourcery** with a test account
2. **Apply to become a Sourcer:**
   - Go to Profile
   - Click "Apply to Become a Sourcer"
   - Upload test documents (can use dummy PDFs)
3. **Admin approves** (you'll need admin access)
4. **Navigate to Settings:**
   - Should see "Payment Settings" section
   - Click "Connect Stripe Account"

### Complete Test Onboarding

1. **Stripe redirects** to onboarding form
2. **Fill test data:**
   - Business name: Test Business
   - Business type: Individual
   - Use test phone/address
   - For bank account, use: `000123456789` (Stripe test routing number: `110000000`)
3. **Submit onboarding**
4. **Redirected back** to Sourcery Settings
5. **See green checkmark** ✅

---

## Troubleshooting

### Error: "You can only create new accounts if you've signed up for Connect"

**Solution:** Stripe Connect is not enabled in your account.
- Go to: https://dashboard.stripe.com/connect/accounts/overview
- Click "Get started" to enable Connect

### Error: "No such account"

**Solution:** The connected account ID doesn't exist.
- Check if the Sourcer completed onboarding
- Verify `stripe_connected_account_id` is stored in the profile

### Onboarding link expired

**Solution:** Account links expire after 5 minutes.
- Click "Continue Stripe Onboarding" to generate a new link
- Complete the form quickly

### "Charges not enabled" or "Payouts not enabled"

**Solution:** Onboarding incomplete.
- Click "Continue Stripe Onboarding"
- Complete all required fields
- Verify bank account details

---

## Stripe Test Data

### Test Bank Accounts (US)

- **Routing number:** `110000000`
- **Account number:** `000123456789`

### Test Cards (for investors paying reservation fees)

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0027 6000 3184`

**Expiry:** Any future date (e.g., `12/34`)
**CVC:** Any 3 digits (e.g., `123`)

---

## Webhook Configuration

Already configured via `npm run deploy:stripe`, but manual setup:

1. **Go to Webhooks:**
   ```
   https://dashboard.stripe.com/test/webhooks
   ```

2. **Add endpoint:**
   - URL: `https://ulsafrboqmcqrqmeiczo.supabase.co/functions/v1/stripe-webhook`
   - Events to send:
     - `checkout.session.completed`
     - `account.updated`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`

3. **Copy webhook signing secret:**
   - Starts with `whsec_...`
   - Set via: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`

---

## Useful Links

- **Stripe Connect Docs:** https://stripe.com/docs/connect
- **Test Onboarding:** https://stripe.com/docs/connect/testing
- **Webhook Events:** https://stripe.com/docs/webhooks
- **Dashboard:** https://dashboard.stripe.com/test/connect

---

## Support

If you encounter issues:
1. Check Stripe Dashboard → Logs for errors
2. Check Supabase Dashboard → Edge Functions → Logs
3. Verify webhook signature matches secret
4. Ensure all secrets are set correctly
