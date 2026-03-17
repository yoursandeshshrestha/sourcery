import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createTransfer } from '../_shared/stripe.ts';
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
    const { reservation_id } = await req.json();

    if (!reservation_id) {
      throw new Error('Missing reservation_id');
    }

    // Fetch reservation with related data
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .select(`
        id,
        deal_id,
        investor_id,
        sourcer_id,
        reservation_fee_amount,
        status,
        reservation_fee_paid,
        sourcer:profiles!reservations_sourcer_id_fkey(
          id,
          stripe_connected_account_id,
          stripe_onboarding_completed
        )
      `)
      .eq('id', reservation_id)
      .single();

    if (reservationError || !reservation) {
      throw new Error('Reservation not found');
    }

    // Verify the user is either the investor or an admin
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAuthorized =
      user.id === reservation.investor_id ||
      userProfile?.role === 'ADMIN';

    if (!isAuthorized) {
      throw new Error('Unauthorized to initiate payout');
    }

    // Check reservation status
    if (reservation.status !== 'CONFIRMED') {
      throw new Error('Reservation must be in CONFIRMED status');
    }

    if (!reservation.reservation_fee_paid) {
      throw new Error('Reservation fee not paid');
    }

    // Check if sourcer has Stripe Connect account
    const sourcer = reservation.sourcer as any;
    if (!sourcer?.stripe_connected_account_id) {
      throw new Error('Sourcer does not have a Stripe Connect account');
    }

    if (!sourcer.stripe_onboarding_completed) {
      throw new Error('Sourcer has not completed Stripe onboarding');
    }

    // Check pipeline status - should be COMPLETION
    const { data: pipeline } = await supabase
      .from('progression_pipeline')
      .select('current_stage')
      .eq('reservation_id', reservation_id)
      .single();

    if (pipeline?.current_stage !== 'COMPLETION') {
      throw new Error('Deal must be in COMPLETION stage to initiate payout');
    }

    // Calculate payout amounts
    const reservationFee = reservation.reservation_fee_amount;
    const platformCommission = reservationFee * 0.20; // 20% platform fee
    const sourcerPayout = reservationFee * 0.80; // 80% to sourcer

    // Create Stripe Transfer
    const transfer = await createTransfer(
      sourcerPayout,
      'gbp',
      sourcer.stripe_connected_account_id,
      {
        reservation_id: reservation.id,
        deal_id: reservation.deal_id,
        sourcer_id: reservation.sourcer_id,
        investor_id: reservation.investor_id,
        original_amount: reservationFee.toString(),
        platform_commission: platformCommission.toString(),
        sourcer_payout: sourcerPayout.toString(),
      }
    );

    // Update reservation with transfer info
    const { error: updateError } = await supabase
      .from('reservations')
      .update({
        status: 'COMPLETED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reservation_id);

    if (updateError) {
      console.error('Error updating reservation:', updateError);
      // Note: Transfer already created, log error but don't fail
    }

    // Update deal status
    const { error: dealUpdateError } = await supabase
      .from('deals')
      .update({
        status: 'COMPLETED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reservation.deal_id);

    if (dealUpdateError) {
      console.error('Error updating deal status:', dealUpdateError);
    }

    return new Response(
      JSON.stringify({
        transfer_id: transfer.id,
        amount: sourcerPayout,
        currency: 'gbp',
        destination: sourcer.stripe_connected_account_id,
        platform_commission: platformCommission,
        sourcer_payout: sourcerPayout,
        status: 'completed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Error creating transfer:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
