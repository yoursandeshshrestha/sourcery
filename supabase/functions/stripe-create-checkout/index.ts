import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createCheckoutSession } from '../_shared/stripe.ts';
import { createServiceClient } from '../_shared/supabase.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase client
    const supabase = createServiceClient();

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { deal_id, payment_type } = await req.json();

    if (!deal_id) {
      throw new Error('Missing deal_id');
    }

    // Fetch deal details
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('id, headline, reservation_fee, sourcer_id')
      .eq('id', deal_id)
      .single();

    if (dealError || !deal) {
      throw new Error('Deal not found');
    }

    // Check if deal is available (only CONFIRMED reservations block the deal)
    const { data: existingReservation } = await supabase
      .from('reservations')
      .select('id')
      .eq('deal_id', deal_id)
      .eq('status', 'CONFIRMED')
      .maybeSingle();

    if (existingReservation) {
      throw new Error('Deal is already reserved');
    }

    // NOTE: We do NOT create a reservation here!
    // The reservation will be created by the webhook when payment succeeds.
    // This allows multiple users to initiate checkout simultaneously without blocking each other.

    // Get app URL from environment
    const appUrl = Deno.env.get('VITE_APP_URL') || 'http://localhost:7001';

    // Create Stripe Checkout Session (no reservation created yet!)
    const session = await createCheckoutSession(
      deal.reservation_fee,
      'gbp',
      {
        deal_id: deal.id,
        investor_id: user.id,
        sourcer_id: deal.sourcer_id,
        payment_type: payment_type || 'reservation',
        deal_headline: deal.headline,
        reservation_fee_amount: deal.reservation_fee.toString(),
      },
      `${appUrl}/account/reservations?payment=success&deal_id=${deal.id}`,
      `${appUrl}/deals/${deal.id}?payment=cancelled`,
      user.email // Pre-fill email in Stripe checkout
    );

    return new Response(
      JSON.stringify({
        session_id: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
