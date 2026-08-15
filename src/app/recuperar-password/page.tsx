"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/bvh/Logo";
import { createClient } from "@/lib/supabase/client";

export default function RecuperarPasswordPage() {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault(); setLoading(true); setMessage("");
		try {
			const supabase = createClient();
			const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` });
			if (error) throw error;
			setMessage("Si existe una cuenta con ese correo, recibirás instrucciones para continuar.");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "No pudimos iniciar la recuperación.");
		} finally { setLoading(false); }
	}

	return <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
		<div className="w-full max-w-md rounded-2xl border border-border bg-card/60 p-6 shadow-[var(--shadow-elegant)] sm:p-8">
			<Link href="/" className="mb-8 flex items-center gap-3"><Logo className="h-10 w-10" /><span className="font-serif text-lg">BVH</span></Link>
			<h1 className="font-serif text-3xl">Recuperar acceso</h1><p className="mt-2 text-sm text-muted-foreground">Te enviaremos un enlace de recuperación si el correo está registrado.</p>
			<form onSubmit={handleSubmit} className="mt-6 space-y-4"><label htmlFor="email" className="block text-xs">Correo electrónico</label><input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm" /><button type="submit" disabled={loading} className="w-full rounded-md bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-60">{loading ? "Enviando…" : "Enviar instrucciones"}</button></form>
			{message && <p role="status" className="mt-4 text-sm text-muted-foreground">{message}</p>}<Link href="/login" className="mt-6 inline-block text-sm text-primary hover:underline">Volver a iniciar sesión</Link>
		</div>
	</main>;
}
