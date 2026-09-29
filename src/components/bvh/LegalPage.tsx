import Link from "next/link";
import { isEditorialScope } from "@/lib/scope";
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
				<LegalContact />
			</article>
			<SiteFooter />
		</div>
	);
}

/**
 * El cierre legal tiene que ofrecer una vía real. Sin formulario público, el
 * enlace a /contacto apuntaría a un 404: se sustituye por el correo, y si el
 * entorno no lo declara se dice sin prometer un canal inexistente.
 */
function LegalContact() {
	const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
	if (!isEditorialScope()) {
		return (
			<p className="border-t border-border pt-6">Para consultas sobre este documento, utiliza el <Link href="/contacto" className="text-primary hover:underline">formulario de contacto</Link>.</p>
		);
	}
	if (contactEmail) {
		return (
			<p className="border-t border-border pt-6">Para consultas sobre este documento, escribe a <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a>.</p>
		);
	}
	return (
		<p className="border-t border-border pt-6">Para consultas sobre este documento, escribe al equipo de la BVH por los canales institucionales publicados.</p>
	);
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
	return <section><h2 className="mb-3 font-serif text-2xl text-foreground">{title}</h2><div className="space-y-3">{children}</div></section>;
}
