import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe instance
 */
export const getStripe = (): Promise<Stripe | null> | null => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      return null;
    }

    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

/**
 * Create a checkout session for deal reservation
 */
export async function createCheckoutSession(
  dealId: string,
  ndaSignatureName?: string
) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('You must be logged in to reserve a deal');
    }

    const response = await supabase.functions.invoke('stripe-create-checkout', {
      body: {
        deal_id: dealId,
        payment_type: 'reservation',
        nda_signature_name: ndaSignatureName,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.error) {
      throw response.error;
    }

    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error creating checkout session:', error);
    }
    throw error;
  }
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(
  dealId: string,
  ndaSignatureName?: string
) {
  try {
    const { url } = await createCheckoutSession(dealId, ndaSignatureName);

    if (!url) {
      throw new Error('Failed to create checkout session');
    }

    // Redirect to Stripe Checkout page
    window.location.href = url;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error redirecting to checkout:', error);
    }
    throw error;
  }
}

/**
 * Create Stripe Connect account for Sourcer
 */
export async function createConnectAccount() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('You must be logged in');
    }

    const response = await supabase.functions.invoke('stripe-connect-account', {
      body: {
        action: 'create',
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.error) {
      throw response.error;
    }

    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error creating Connect account:', error);
    }
    throw error;
  }
}

/**
 * Get Stripe Connect account link
 */
export async function getConnectAccountLink() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('You must be logged in');
    }

    const response = await supabase.functions.invoke('stripe-connect-account', {
      body: {
        action: 'link',
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.error) {
      throw response.error;
    }

    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error getting Connect account link:', error);
    }
    throw error;
  }
}

/**
 * Get Stripe Connect account status
 */
export async function getConnectAccountStatus() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('You must be logged in');
    }

    const response = await supabase.functions.invoke('stripe-connect-account', {
      body: {
        action: 'status',
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.error) {
      throw response.error;
    }

    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error getting Connect account status:', error);
    }
    throw error;
  }
}

/**
 * Initiate payout/transfer for completed deal
 */
export async function initiatePayoutTransfer(reservationId: string) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('You must be logged in');
    }

    const response = await supabase.functions.invoke('stripe-create-transfer', {
      body: {
        reservation_id: reservationId,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.error) {
      throw response.error;
    }

    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error initiating payout transfer:', error);
    }
    throw error;
  }
}

/**
 * Create checkout session for Dan's Lead
 */
export async function createDansLeadCheckoutSession(leadId: string, amount: number) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('You must be logged in to purchase a lead');
    }

    // First, create the purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('lead_purchases')
      .insert({
        lead_id: leadId,
        buyer_id: session.user.id,
        amount,
        stripe_payment_intent_id: '', // Will be updated by webhook
      })
      .select()
      .single();

    if (purchaseError || !purchase) {
      throw new Error('Failed to create lead purchase');
    }

    const response = await supabase.functions.invoke('stripe-create-checkout', {
      body: {
        deal_id: leadId,
        payment_type: 'dans_lead',
        purchase_id: purchase.id,
        amount,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.error) {
      throw response.error;
    }

    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error creating Dan\'s Lead checkout session:', error);
    }
    throw error;
  }
}
