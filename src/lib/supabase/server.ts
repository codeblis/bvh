import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error("Supabase configuration is missing")
  }

  return createServerClient<Database>(
		url,
		key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
			cookiesToSet.forEach(({ name, value, options }) => {
				cookieStore.set(name, value, options)
			})
          } catch {
            // setAll fue llamado desde un Server Component — se ignora
            // si tienes el proxy refrescando la sesión (ver 3.11)
          }
        },
      },
    }
  )
}
