import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.99.0';

/**
 * Create a Supabase client with service role key for Edge Functions
 * This bypasses RLS and should only be used in secure server-side contexts
 */
export function createServiceClient() {
  // Supabase automatically provides these env vars in Edge Functions
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
