"use client";

import Link from "next/link";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function PublicModuleError({
	reset,
	title,
}: {
	reset: () => void;
	title: string;
}) {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<SiteHeader />
			<main className="mx-auto flex max-w-3xl flex-col items-start px-6 py-24">
				<p className="text-xs uppercase tracking-[0.22em] text-primary">Servicio temporalmente no disponible</p>
				<h1 className="mt-4 font-serif text-3xl">No pudimos cargar {title}</h1>
				<p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
					Tus datos no fueron modificados. Puedes intentarlo nuevamente o volver al inicio.
				</p>
				<div className="mt-7 flex flex-wrap gap-3">
					<button
						type="button"
						onClick={reset}
						className="rounded-md bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground"
					>
						Reintentar
					</button>
					<Link
						href="/"
						className="rounded-md border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-wide"
					>
						Volver al inicio
					</Link>
				</div>
			</main>
			<SiteFooter />
		</div>
	);
}
