import Stripe from 'https://esm.sh/stripe@17.5.0?target=deno';

/**
 * Enable capabilities for a test account
 * Only works in test mode!
 */
export async function enableTestAccountCapabilities(
  stripe: Stripe,
  accountId: string
): Promise<void> {
  try {
    // Only for test accounts (start with acct_)
    if (!accountId.startsWith('acct_')) {
      throw new Error('Invalid account ID');
    }

    // Check if we're in test mode
    const isTestMode = Deno.env.get('STRIPE_SECRET_KEY')?.startsWith('sk_test_');

    if (!isTestMode) {
      console.log('Not in test mode - skipping auto-enable');
      return;
    }

    // Enable card payments and transfers capabilities
    await stripe.accounts.update(accountId, {
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    console.log(`Test account ${accountId} capabilities enabled`);
  } catch (error) {
    console.error('Error enabling test account capabilities:', error);
    // Don't throw - this is just a helper for test mode
  }
}

/**
 * Mark test account as verified (skips identity verification)
 * Only works in test mode!
 */
export async function bypassTestAccountVerification(
  stripe: Stripe,
  accountId: string
): Promise<void> {
  try {
    const isTestMode = Deno.env.get('STRIPE_SECRET_KEY')?.startsWith('sk_test_');

    if (!isTestMode) {
      return;
    }

    // In test mode, we can mark verification as complete
    await stripe.accounts.update(accountId, {
      // @ts-ignore - Test mode only properties
      individual: {
        verification: {
          status: 'verified',
        },
      },
    });

    console.log(`Test account ${accountId} verification bypassed`);
  } catch (error) {
    console.error('Error bypassing verification:', error);
  }
}
