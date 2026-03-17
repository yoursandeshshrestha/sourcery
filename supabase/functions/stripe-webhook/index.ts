import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@17.5.0?target=deno';
import { verifyWebhookSignature, createRefund } from '../_shared/stripe.ts';
import { createServiceClient } from '../_shared/supabase.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      throw new Error('Missing webhook signature or secret');
    }

    // Get raw body for signature verification
    const body = await req.text();

    // Verify webhook signature (async for Deno/Edge environments)
    const event = await verifyWebhookSignature(body, signature, webhookSecret);

    // Log event type in development
    if (Deno.env.get('VITE_ENVIRONMENT') === 'development') {
      console.log('Stripe webhook event:', event.type);
    }

    // Initialize Supabase client
    const supabase = createServiceClient();

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, session);
        break;
      }


      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(supabase, account);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(supabase, paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(supabase, paymentIntent);
        break;
      }

      default:
        if (Deno.env.get('VITE_ENVIRONMENT') === 'development') {
          console.log(`Unhandled event type: ${event.type}`);
        }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

/**
 * Handle checkout.session.completed event
 * Creates and confirms reservation when payment is successful
 */
async function handleCheckoutCompleted(supabase: any, session: Stripe.Checkout.Session) {
  const { deal_id, investor_id, sourcer_id, payment_type, reservation_fee_amount, deal_headline } = session.metadata || {};

  if (payment_type === 'dans_lead') {
    // Handle Dan's Leads purchase
    const { error } = await supabase
      .from('dans_leads_purchases')
      .update({
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('id', session.metadata?.purchase_id);

    if (error) {
      console.error('Error updating Dan\'s lead purchase:', error);
      throw error;
    }

    if (Deno.env.get('VITE_ENVIRONMENT') === 'development') {
      console.log('Dan\'s lead purchase completed:', session.metadata?.purchase_id);
    }
  } else {
    // Handle reservation payment - create reservation NOW (after payment)
    if (!deal_id || !investor_id || !sourcer_id) {
      throw new Error('Missing required metadata in session');
    }

    // Check if deal is still available (race condition protection)
    const { data: existingReservation } = await supabase
      .from('reservations')
      .select('id, investor_id')
      .eq('deal_id', deal_id)
      .eq('status', 'CONFIRMED')
      .maybeSingle();

    if (existingReservation) {
      // Deal was taken by someone else - initiate automatic refund
      console.error('Race condition: Deal already reserved by another user', {
        deal_id,
        existing_investor: existingReservation.investor_id,
        new_investor: investor_id,
        session_id: session.id,
        payment_intent: session.payment_intent,
      });

      // Initiate automatic refund
      try {
        const refund = await createRefund(
          session.payment_intent as string,
          'duplicate',
          {
            deal_id,
            reason: 'Deal no longer available (race condition)',
            investor_id,
            session_id: session.id,
          }
        );

        console.log('Automatic refund initiated:', {
          refund_id: refund.id,
          amount: refund.amount,
          status: refund.status,
        });

        // Record this failed attempt (optional - for analytics)
        await supabase.from('reservations').insert({
          deal_id,
          investor_id,
          sourcer_id,
          reservation_fee_amount: parseFloat(reservation_fee_amount || '0'),
          status: 'CANCELLED',
          reservation_fee_paid: false,
          payment_intent_id: session.payment_intent as string,
          cancelled_at: new Date().toISOString(),
          sourcer_notes: 'Automatic refund - deal taken by another investor',
        });

        return; // Exit successfully after refund
      } catch (refundError) {
        console.error('Failed to process automatic refund:', refundError);
        throw new Error('Deal taken and refund failed - manual intervention required');
      }
    }

    // Create CONFIRMED reservation (payment already succeeded!)
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        deal_id,
        investor_id,
        sourcer_id,
        reservation_fee_amount: parseFloat(reservation_fee_amount || '0'),
        status: 'CONFIRMED',
        reservation_fee_paid: true,
        payment_intent_id: session.payment_intent as string,
        confirmed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (reservationError) {
      console.error('Error creating reservation:', reservationError);
      throw reservationError;
    }

    // Update deal status to RESERVED
    const { error: dealError } = await supabase
      .from('deals')
      .update({
        status: 'RESERVED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', deal_id);

    if (dealError) {
      console.error('Error updating deal status:', dealError);
    }

    if (Deno.env.get('VITE_ENVIRONMENT') === 'development') {
      console.log('Reservation created and confirmed:', reservation.id);
    }
  }
}

/**
 * Handle account.updated event
 * Updates Sourcer's Stripe Connect onboarding status
 */
async function handleAccountUpdated(supabase: any, account: Stripe.Account) {
  const userId = account.metadata?.user_id;

  if (!userId) {
    if (Deno.env.get('VITE_ENVIRONMENT') === 'development') {
      console.log('No user_id in account metadata, skipping');
    }
    return;
  }

  const onboardingCompleted = account.charges_enabled && account.payouts_enabled;

  const { error } = await supabase
    .from('profiles')
    .update({
      stripe_onboarding_completed: onboardingCompleted,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .eq('stripe_connected_account_id', account.id);

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  if (Deno.env.get('VITE_ENVIRONMENT') === 'development') {
    console.log(`Stripe Connect account updated for user ${userId}: ${onboardingCompleted ? 'completed' : 'pending'}`);
  }
}

/**
 * Handle payment_intent.succeeded event
 * Additional logging and tracking
 */
async function handlePaymentIntentSucceeded(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  if (Deno.env.get('VITE_ENVIRONMENT') === 'development') {
    console.log('Payment intent succeeded:', paymentIntent.id);
  }
  // Additional tracking logic can be added here
}

/**
 * Handle payment_intent.payment_failed event
 * Log failures for monitoring (no reservation cleanup needed since we don't pre-create them)
 */
async function handlePaymentIntentFailed(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  console.error('Payment intent failed:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    last_payment_error: paymentIntent.last_payment_error,
  });
  // No action needed - reservation only created after successful payment
}
