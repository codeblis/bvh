"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";

type Session = { signedIn: boolean; isAdmin: boolean };

export function AuthButton() {
	const [session, setSession] = useState<Session>({
		signedIn: false,
		isAdmin: false,
	});

	useEffect(() => {
		if (!hasSupabaseConfig()) return;
		const supabase = createClient();
		let active = true;

		// `onAuthStateChange` emite la sesión inicial al suscribirse: basta con
		// escucharla. El rol lo decide el servidor; esto solo elige qué enlace
		// ofrecer, así que no hace falta revalidar el token en cada página.
		const { data } = supabase.auth.onAuthStateChange(
			async (_event, current) => {
				if (!active) return;
				const user = current?.user;
				if (!user) {
					setSession({ signedIn: false, isAdmin: false });
					return;
				}
				setSession((previous) => ({ ...previous, signedIn: true }));
				const { data: profile } = await supabase
					.from("profiles")
					.select("role")
					.eq("id", user.id)
					.maybeSingle();
				if (!active) return;
				setSession({ signedIn: true, isAdmin: profile?.role === "admin" });
			},
		);

		return () => {
			active = false;
			data.subscription.unsubscribe();
		};
	}, []);

	return (
		<div className="flex items-center gap-2">
			{session.isAdmin ? (
				<Link
					href="/admin"
					className="rounded-md px-2 py-2 text-[12px] font-medium text-muted-foreground transition hover:text-foreground sm:px-3"
				>
					Panel
				</Link>
			) : null}
			<Link
				href={session.signedIn ? "/cuenta" : "/login"}
				className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-primary transition hover:bg-primary hover:text-primary-foreground sm:px-4 sm:text-[12px]"
			>
				{session.signedIn ? "Cuenta" : "Acceder"}
			</Link>
		</div>
	);
}
