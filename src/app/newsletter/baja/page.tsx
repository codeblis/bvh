import type { Metadata } from "next";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { unsubscribeSchema } from "@/lib/forms";
import { unsubscribeNewsletter } from "./actions";

export const metadata: Metadata = {
	title: "Baja del newsletter · BVH",
	robots: { index: false, follow: false },
};

export default async function NewsletterUnsubscribePage({
	searchParams,
}: {
	searchParams: Promise<{ token?: string; result?: string }>;
}) {
	const { token, result } = await searchParams;
	const validToken = unsubscribeSchema.safeParse({ token }).success;
	const messages: Record<string, string> = {
		success: "Tu suscripción quedó desactivada.",
		inactive:
			"La suscripción ya estaba inactiva o el enlace dejó de ser válido.",
		invalid: "El enlace de baja no es válido.",
		unavailable: "No pudimos procesar la baja. Inténtalo nuevamente más tarde.",
	};

	return (
		<div className="min-h-screen bg-background text-foreground">
			<SiteHeader />
			<main className="mx-auto flex max-w-xl flex-1 flex-col justify-center px-6 py-20 text-center">
				<p className="text-[10px] uppercase tracking-[0.24em] text-primary">
					Newsletter BVH
				</p>
				<h1 className="mt-3 font-serif text-3xl">Gestionar suscripción</h1>
				{result ? (
					<p
						className={`mt-6 rounded-xl border p-5 text-sm ${result === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-border bg-card/60 text-muted-foreground"}`}
						role="status"
					>
						{messages[result] ?? messages.invalid}
					</p>
				) : validToken ? (
					<>
						<p className="mt-4 text-sm text-muted-foreground">
							Confirma que deseas dejar de recibir comunicaciones del
							newsletter.
						</p>
						<form action={unsubscribeNewsletter} className="mt-6">
							<input type="hidden" name="token" value={token} />
							<button
								type="submit"
								className="rounded-md bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-wide text-primary-foreground"
							>
								Confirmar baja
							</button>
						</form>
					</>
				) : (
					<p className="mt-6 rounded-xl border border-border bg-card/60 p-5 text-sm text-muted-foreground">
						Necesitas un enlace de baja válido.
					</p>
				)}
			</main>
			<SiteFooter />
		</div>
	);
}
