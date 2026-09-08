"use client";

import Link from "next/link";

export default function AdminError({ reset }: { reset: () => void }) {
	return (
		<div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6">
			<h1 className="font-serif text-2xl">No se pudo cargar esta sección</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				No se confirmó ningún cambio. Reintenta o vuelve al resumen.
			</p>
			<div className="mt-5 flex flex-wrap gap-3">
				<button
					type="button"
					onClick={reset}
					className="rounded-md bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground"
				>
					Reintentar
				</button>
				<Link
					href="/admin"
					className="rounded-md border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide"
				>
					Volver al resumen
				</Link>
			</div>
		</div>
	);
}
