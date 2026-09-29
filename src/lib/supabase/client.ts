import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

export function hasSupabaseConfig() {
	return Boolean(
		process.env.NEXT_PUBLIC_SUPABASE_URL &&
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	);
}

export function createClient() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !key) throw new Error("La autenticación todavía no está configurada.");
	return createBrowserClient<Database>(url, key);
}
