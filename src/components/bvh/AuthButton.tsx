"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";

export function AuthButton() {
	const [signedIn, setSignedIn] = useState(false);

	useEffect(() => {
		if (!hasSupabaseConfig()) return;
		const supabase = createClient();
		void supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
		const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
		return () => data.subscription.unsubscribe();
	}, []);

	return <Link href={signedIn ? "/cuenta" : "/login"} className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-primary transition hover:bg-primary hover:text-primary-foreground sm:px-4 sm:text-[12px]">{signedIn ? "Cuenta" : "Acceder"}</Link>;
}
