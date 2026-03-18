import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createServiceClient } from '../_shared/supabase.ts';
import { create } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

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
      .select('id, first_name, last_name, avatar_url, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    // Get Stream credentials
    const apiKey = Deno.env.get('STREAM_API_KEY');
    const apiSecret = Deno.env.get('STREAM_API_SECRET');

    if (!apiKey || !apiSecret) {
      throw new Error('Stream API credentials not configured');
    }

    // Create JWT token for Stream
    const userId = user.id;
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + (24 * 60 * 60); // 24 hours

    const payload = {
      user_id: userId,
      iat,
      exp,
    };

    // Create crypto key from secret
    const encoder = new TextEncoder();
    const keyData = encoder.encode(apiSecret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Generate JWT token
    const streamToken = await create(
      { alg: 'HS256', typ: 'JWT' },
      payload,
      key
    );

    return new Response(
      JSON.stringify({
        token: streamToken,
        api_key: apiKey,
        user_id: userId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Error generating Stream token:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
