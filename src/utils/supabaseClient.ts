import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client that uses a Clerk JWT for authentication.
 * 
 * @param clerkToken The JWT token obtained from Clerk via window.Clerk.session.getToken({ template: 'supabase' })
 */
export const createClerkSupabaseClient = (clerkToken: string) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${clerkToken}`,
        },
      },
    }
  )
}
