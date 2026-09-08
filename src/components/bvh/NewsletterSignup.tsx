"use client";

import { useState } from "react";
import Link from "next/link";

type NewsletterSignupProps = {
	cta: string;
	placeholder: string;
	hint: string;
	source?: string;
	detailed?: boolean;
};

export function NewsletterSignup({
	cta,
	placeholder,
	hint,
	source = "sitio",
	detailed = false,
}: NewsletterSignupProps) {
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [message, setMessage] = useState("");

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formElement = event.currentTarget;
		setStatus("loading");
		setMessage("");
		const formData = new FormData(formElement);

		try {
			const response = await fetch("/api/newsletter", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: formData.get("email"),
					nombre: formData.get("nombre") || undefined,
					perfil: formData.get("perfil") || undefined,
					source,
				}),
			});
			const result = (await response.json()) as {
				message?: string;
				notification?: string;
			};
			if (!response.ok) throw new Error(result.message);
			setStatus("success");
			setMessage(
				result.notification === "pending"
					? "Suscripción recibida. El aviso interno está pendiente; no necesitas volver a suscribirte."
					: "Suscripción recibida. Gracias por seguir a BVH.",
			);
			formElement.reset();
		} catch (error) {
			setStatus("error");
			setMessage(
				error instanceof Error && error.message
					? error.message
					: "No pudimos procesar la suscripción.",
			);
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col justify-center gap-3"
		>
			{detailed && (
				<div className="grid gap-3 sm:grid-cols-2">
					<input
						name="nombre"
						required
						placeholder="Nombre"
						className="w-full rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
					/>
					<input
						name="email"
						required
						type="email"
						placeholder={placeholder}
						className="w-full rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
					/>
				</div>
			)}
			{!detailed && (
				<input
					name="email"
					required
					type="email"
					placeholder={placeholder}
					aria-label="Correo electrónico"
					className="w-full rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
				/>
			)}
			{detailed && (
				<select
					name="perfil"
					aria-label="Perfil"
					className="w-full rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
				>
					<option>Emprendedor / MIPYME</option>
					<option>Inversor</option>
					<option>Prensa / Investigación</option>
					<option>Diáspora</option>
					<option>Otro</option>
				</select>
			)}
			<button
				type="submit"
				disabled={status === "loading"}
				className="rounded-md bg-primary px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary-foreground transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
			>
				{status === "loading" ? "Enviando…" : cta}
			</button>
			<p className="text-[11px] text-muted-foreground">{hint}</p>
			<p className="text-[10px] leading-relaxed text-muted-foreground">
				Al suscribirte aceptas nuestra{" "}
				<Link href="/privacidad" className="text-primary hover:underline">
					política de privacidad
				</Link>
				. Puedes darte de baja cuando quieras.
			</p>
			{message && (
				<p
					role="status"
					className={`text-[12px] ${status === "success" ? "text-bvh-up" : "text-destructive"}`}
				>
					{message}
				</p>
			)}
		</form>
	);
}
