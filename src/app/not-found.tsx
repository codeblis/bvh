import Link from "next/link";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { SiteHeader } from "@/components/bvh/SiteHeader";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<SiteHeader />
			<main className="mx-auto flex max-w-3xl flex-col items-start px-6 py-24">
				<p className="text-xs uppercase tracking-[0.24em] text-primary">Error 404</p>
				<h1 className="mt-4 font-serif text-4xl">Esta página no existe</h1>
				<p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
					El enlace puede haber cambiado o el contenido todavía no está publicado.
				</p>
				<div className="mt-7 flex flex-wrap gap-3">
					<Link
						href="/"
						className="rounded-md bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground"
					>
						Ir al inicio
					</Link>
					<Link
						href="/noticias"
						className="rounded-md border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-wide"
					>
						Ver noticias
					</Link>
				</div>
			</main>
			<SiteFooter />
		</div>
	);
}
