import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createServiceClient } from '../_shared/supabase.ts';
import { create } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Initialize a Stream chat channel for a reservation
 * Called automatically when a reservation is confirmed
 * This is an internal function - called by webhooks and other server-side functions
 * Deploy with: supabase functions deploy stream-initialize-channel --no-verify-jwt
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createServiceClient();
    const body = await req.json();
    const { reservation_id, investor_id, sourcer_id } = body;

    if (!reservation_id || !investor_id || !sourcer_id) {
      throw new Error('reservation_id, investor_id, and sourcer_id are required');
    }

    // Get Stream credentials
    const apiKey = Deno.env.get('STREAM_API_KEY');
    const apiSecret = Deno.env.get('STREAM_API_SECRET');

    if (!apiKey || !apiSecret) {
      throw new Error('Stream credentials not configured');
    }

    // Get both user profiles
    const { data: investorProfile, error: investorError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .eq('id', investor_id)
      .single();

    if (investorError || !investorProfile) {
      throw new Error('Investor profile not found');
    }

    const { data: sourcerProfile, error: sourcerError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .eq('id', sourcer_id)
      .single();

    if (sourcerError || !sourcerProfile) {
      throw new Error('Sourcer profile not found');
    }

    // Create server-side token for Stream REST API
    const iat = Math.floor(Date.now() / 1000);
    const payload = {
      server: true,
      iat,
      exp: iat + 3600, // 1 hour
    };

    const encoder = new TextEncoder();
    const keyData = encoder.encode(apiSecret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const serverToken = await create({ alg: 'HS256', typ: 'JWT' }, payload, key);

    // Upsert both users in Stream
    const upsertResponse = await fetch(`https://chat.stream-io-api.com/users?api_key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': serverToken,
        'Stream-Auth-Type': 'jwt',
      },
      body: JSON.stringify({
        users: {
          [investorProfile.id]: {
            id: investorProfile.id,
            name: `${investorProfile.first_name} ${investorProfile.last_name}`,
            image: investorProfile.avatar_url || undefined,
          },
          [sourcerProfile.id]: {
            id: sourcerProfile.id,
            name: `${sourcerProfile.first_name} ${sourcerProfile.last_name}`,
            image: sourcerProfile.avatar_url || undefined,
          },
        },
      }),
    });

    if (!upsertResponse.ok) {
      const errorText = await upsertResponse.text();
      console.error('Stream upsert error:', errorText);
      throw new Error(`Failed to upsert users in Stream: ${errorText}`);
    }

    // Create the channel
    const channelId = `reservation_${reservation_id}`;
    const createChannelResponse = await fetch(
      `https://chat.stream-io-api.com/channels/messaging/${channelId}?api_key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': serverToken,
          'Stream-Auth-Type': 'jwt',
        },
        body: JSON.stringify({
          created_by_id: sourcer_id, // Sourcer creates the channel
          members: [investor_id, sourcer_id],
        }),
      }
    );

    if (!createChannelResponse.ok) {
      const errorText = await createChannelResponse.text();

      // If channel already exists, that's okay
      if (!errorText.includes('already exists')) {
        console.error('Stream channel creation error:', errorText);
        throw new Error(`Failed to create channel: ${errorText}`);
      }
    }

    if (Deno.env.get('VITE_ENVIRONMENT') === 'development') {
      console.log(`Stream channel initialized for reservation ${reservation_id}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        channel_id: channelId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    console.error('Error initializing Stream channel:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
