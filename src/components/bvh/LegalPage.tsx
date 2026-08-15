import Link from "next/link";
import { PageHero } from "./PageHero";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<SiteHeader />
			<PageHero eyebrow={`Información legal · Actualizada ${updated}`} title={title} description="Documento aplicable al portal BVH durante su etapa de desarrollo y validación." />
			<article className="mx-auto max-w-3xl space-y-8 px-6 py-12 text-sm leading-7 text-foreground/80">
				{children}
				<p className="border-t border-border pt-6">Para consultas sobre este documento, utiliza el <Link href="/contacto" className="text-primary hover:underline">formulario de contacto</Link>.</p>
			</article>
			<SiteFooter />
		</div>
	);
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
	return <section><h2 className="mb-3 font-serif text-2xl text-foreground">{title}</h2><div className="space-y-3">{children}</div></section>;
}
