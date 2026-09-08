"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/bvh/Logo";
import { updatePassword } from "@/modules/identity/actions";

export default function ActualizarPasswordPage() {
	const router = useRouter();
	const [password, setPassword] = useState("");
	const [confirmation, setConfirmation] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setError("");

		if (password.length < 8) {
			setError("La contraseña debe tener al menos 8 caracteres.");
			return;
		}
		if (password !== confirmation) {
			setError("Las contraseñas no coinciden.");
			return;
		}

		setLoading(true);
		try {
			const result = await updatePassword({ password, confirmation });
			if (result.error) {
				setError(result.error);
				return;
			}
			router.replace("/login?passwordUpdated=true");
			router.refresh();
		} catch {
			setError("No pudimos actualizar la contraseña. Inténtalo más tarde.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
			<div className="w-full max-w-md rounded-2xl border border-border bg-card/60 p-6 shadow-[var(--shadow-elegant)] sm:p-8">
				<Link href="/" className="mb-8 flex items-center gap-3">
					<Logo className="h-10 w-10" />
					<span className="font-serif text-lg">BVH</span>
				</Link>
				<h1 className="font-serif text-3xl">Nueva contraseña</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Define una contraseña nueva para tu cuenta.
				</p>
				{error ? (
					<p className="mt-4 text-sm text-destructive" role="alert">
						{error}
					</p>
				) : null}
				<form onSubmit={handleSubmit} className="mt-6 space-y-4">
					<label htmlFor="password" className="block text-xs">
						Nueva contraseña
					</label>
					<input
						id="password"
						type="password"
						required
						minLength={8}
						autoComplete="new-password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm"
					/>
					<label htmlFor="confirmation" className="block text-xs">
						Confirmar contraseña
					</label>
					<input
						id="confirmation"
						type="password"
						required
						minLength={8}
						autoComplete="new-password"
						value={confirmation}
						onChange={(event) => setConfirmation(event.target.value)}
						className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm"
					/>
					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-md bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-60"
					>
						{loading ? "Guardando…" : "Guardar contraseña"}
					</button>
				</form>
			</div>
		</main>
	);
}
