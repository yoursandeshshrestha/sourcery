import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createConnectedAccount, createAccountLink, retrieveAccount } from '../_shared/stripe.ts';
import { createServiceClient } from '../_shared/supabase.ts';
import { enableTestAccountCapabilities } from '../_shared/stripe-test-helpers.ts';
import Stripe from 'https://esm.sh/stripe@17.5.0?target=deno';

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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    // Check if user is a sourcer
    if (profile.role !== 'SOURCER') {
      throw new Error('Only sourcers can create Stripe Connect accounts');
    }

    // Parse request body
    const { action } = await req.json();

    // Get app URL from environment
    const appUrl = Deno.env.get('VITE_APP_URL') || 'http://localhost:7001';
    const refreshUrl = `${appUrl}/dashboard/settings?stripe=refresh`;
    const returnUrl = `${appUrl}/dashboard/settings?stripe=success`;

    if (action === 'create') {
      // Create a new Stripe Connect account
      if (profile.stripe_connected_account_id) {
        throw new Error('Stripe Connect account already exists');
      }

      const account = await createConnectedAccount(
        profile.email,
        {
          user_id: user.id,
          user_email: profile.email,
          user_name: `${profile.first_name} ${profile.last_name}`,
        }
      );

      // Auto-enable capabilities for test accounts
      const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
      if (stripeSecretKey) {
        const stripe = new Stripe(stripeSecretKey, {
          apiVersion: '2024-11-20.acacia',
          httpClient: Stripe.createFetchHttpClient(),
        });
        await enableTestAccountCapabilities(stripe, account.id);
      }

      // Update profile with Stripe account ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          stripe_connected_account_id: account.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Create account link for onboarding
      const accountLink = await createAccountLink(
        account.id,
        refreshUrl,
        returnUrl
      );

      return new Response(
        JSON.stringify({
          account_id: account.id,
          onboarding_url: accountLink.url,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else if (action === 'link') {
      // Generate a new account link for existing account
      if (!profile.stripe_connected_account_id) {
        throw new Error('No Stripe Connect account found');
      }

      const accountLink = await createAccountLink(
        profile.stripe_connected_account_id,
        refreshUrl,
        returnUrl
      );

      return new Response(
        JSON.stringify({
          account_id: profile.stripe_connected_account_id,
          onboarding_url: accountLink.url,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else if (action === 'status') {
      // Check Stripe Connect account status
      if (!profile.stripe_connected_account_id) {
        throw new Error('No Stripe Connect account found');
      }

      const account = await retrieveAccount(profile.stripe_connected_account_id);

      // Check for requirements and restrictions
      const requirements = account.requirements || {};
      const hasRequirements = (requirements.currently_due && requirements.currently_due.length > 0) ||
                              (requirements.eventually_due && requirements.eventually_due.length > 0);

      // Check if account is restricted
      const isRestricted = !account.charges_enabled || !account.payouts_enabled;

      // Get disabled reason if applicable
      const disabledReason = account.requirements?.disabled_reason || null;

      return new Response(
        JSON.stringify({
          account_id: account.id,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
          onboarding_completed: account.charges_enabled && account.payouts_enabled,
          is_restricted: isRestricted,
          has_requirements: hasRequirements,
          disabled_reason: disabledReason,
          currently_due: requirements.currently_due || [],
          eventually_due: requirements.eventually_due || [],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else if (action === 'enable_test') {
      // Enable capabilities for test account (test mode only!)
      if (!profile.stripe_connected_account_id) {
        throw new Error('No Stripe Connect account found');
      }

      const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
      if (!stripeSecretKey?.startsWith('sk_test_')) {
        throw new Error('This action is only available in test mode');
      }

      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2024-11-20.acacia',
        httpClient: Stripe.createFetchHttpClient(),
      });

      await enableTestAccountCapabilities(stripe, profile.stripe_connected_account_id);

      // Check updated status
      const account = await retrieveAccount(profile.stripe_connected_account_id);

      return new Response(
        JSON.stringify({
          account_id: account.id,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          message: 'Test account capabilities enabled',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      throw new Error('Invalid action. Use "create", "link", "status", or "enable_test"');
    }
  } catch (err) {
    console.error('Error with Stripe Connect account:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
