import Stripe from 'https://esm.sh/stripe@17.5.0?target=deno';

/**
 * Initialize Stripe with secret key from environment
 */
export function createStripeClient(): Stripe {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: '2024-12-18.acacia',
    httpClient: Stripe.createFetchHttpClient(),
  });
}

/**
 * Verify Stripe webhook signature (async version for Deno/Edge environments)
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<Stripe.Event> {
  const stripe = createStripeClient();

  try {
    return await stripe.webhooks.constructEventAsync(payload, signature, secret);
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
}

/**
 * Create a Stripe Connect account for a Sourcer
 */
export async function createConnectedAccount(
  email: string,
  metadata: Record<string, string>
): Promise<Stripe.Account> {
  const stripe = createStripeClient();

  return await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    metadata,
  });
}

/**
 * Create an account link for Stripe Connect onboarding
 */
export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<Stripe.AccountLink> {
  const stripe = createStripeClient();

  return await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });
}

/**
 * Create a Checkout Session for reservation payment
 */
export async function createCheckoutSession(
  amount: number,
  currency: string,
  metadata: Record<string, string>,
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string
): Promise<Stripe.Checkout.Session> {
  const stripe = createStripeClient();

  return await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: 'Property Reservation Fee',
            description: metadata.deal_headline || 'Reserve this property deal',
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    customer_email: customerEmail, // Pre-fill email
    metadata,
    success_url: successUrl,
    cancel_url: cancelUrl,
    payment_intent_data: {
      metadata,
    },
  });
}

/**
 * Create a transfer to a connected account (payout)
 */
export async function createTransfer(
  amount: number,
  currency: string,
  destinationAccountId: string,
  metadata: Record<string, string>
): Promise<Stripe.Transfer> {
  const stripe = createStripeClient();

  return await stripe.transfers.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    destination: destinationAccountId,
    metadata,
  });
}

/**
 * Retrieve a Checkout Session
 */
export async function retrieveCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  const stripe = createStripeClient();
  return await stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Retrieve an Account
 */
export async function retrieveAccount(
  accountId: string
): Promise<Stripe.Account> {
  const stripe = createStripeClient();
  return await stripe.accounts.retrieve(accountId);
}

/**
 * Create a refund for a payment intent
 */
export async function createRefund(
  paymentIntentId: string,
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' = 'requested_by_customer',
  metadata?: Record<string, string>
): Promise<Stripe.Refund> {
  const stripe = createStripeClient();
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
    reason,
    metadata,
  });
}
