"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
	const router = useRouter();
	async function signOut() { const supabase = createClient(); await supabase.auth.signOut(); router.push("/"); router.refresh(); }
	return <button type="button" onClick={signOut} className="rounded-md border border-border px-5 py-3 text-xs font-semibold uppercase tracking-wider hover:border-primary">Cerrar sesión</button>;
}
