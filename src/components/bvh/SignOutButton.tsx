"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
	const router = useRouter();
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);
	async function signOut() {
		setPending(true);
		setError("");
		try {
			const supabase = createClient();
			const result = await supabase.auth.signOut();
			if (result.error) throw result.error;
			router.push("/");
			router.refresh();
		} catch {
			setError("No pudimos cerrar la sesión. Inténtalo de nuevo.");
		} finally {
			setPending(false);
		}
	}
	return (
		<>
			<button
				type="button"
				onClick={signOut}
				disabled={pending}
				className="rounded-md border border-border px-5 py-3 text-xs font-semibold uppercase tracking-wider hover:border-primary disabled:opacity-60"
			>
				{pending ? "Cerrando sesión…" : "Cerrar sesión"}
			</button>
			{error && (
				<p role="alert" className="mt-3 text-sm text-destructive">
					{error}
				</p>
			)}
		</>
	);
}
