import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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

    // Get request body
    const { reservation_id, other_user_id } = await req.json();
    if (!reservation_id || !other_user_id) {
      throw new Error('reservation_id and other_user_id are required');
    }

    // Get other user's profile
    const { data: otherProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .eq('id', other_user_id)
      .single();

    if (profileError || !otherProfile) {
      throw new Error('Other user profile not found');
    }

    // Return success with user data for client-side upsert
    return new Response(
      JSON.stringify({
        channel_id: `reservation_${reservation_id}`,
        other_user: {
          id: otherProfile.id,
          name: `${otherProfile.first_name} ${otherProfile.last_name}`,
          image: otherProfile.avatar_url || undefined,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Error preparing Stream channel:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
