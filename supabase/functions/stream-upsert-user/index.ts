import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createServiceClient } from '../_shared/supabase.ts';
import { create } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabase = createServiceClient();
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) throw new Error('Unauthorized');

    const { user_id } = await req.json();
    if (!user_id) throw new Error('user_id is required');

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) throw new Error('User not found');

    // Get Stream credentials
    const apiKey = Deno.env.get('STREAM_API_KEY');
    const apiSecret = Deno.env.get('STREAM_API_SECRET');

    if (!apiKey || !apiSecret) throw new Error('Stream credentials not configured');

    // Create server-side token for Stream REST API
    const iat = Math.floor(Date.now() / 1000);
    const payload = {
      server: true, // Server-side token
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

    // Upsert user via Stream REST API with server token
    const streamResponse = await fetch(`https://chat.stream-io-api.com/users?api_key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': serverToken,
        'Stream-Auth-Type': 'jwt',
      },
      body: JSON.stringify({
        users: {
          [profile.id]: {
            id: profile.id,
            name: `${profile.first_name} ${profile.last_name}`,
            image: profile.avatar_url || undefined,
          },
        },
      }),
    });

    if (!streamResponse.ok) {
      const errorText = await streamResponse.text();
      console.error('Stream API error:', errorText);
      throw new Error(`Failed to upsert user in Stream: ${errorText}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
