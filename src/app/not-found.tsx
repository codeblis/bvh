import Link from "next/link";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { SiteHeader } from "@/components/bvh/SiteHeader";

export default function NotFound() {
	return <div className="min-h-screen bg-background text-foreground"><SiteHeader /><main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-6 py-20"><p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Error 404</p><h1 className="mt-4 font-serif text-5xl">Esta página no cotiza aquí.</h1><p className="mt-5 max-w-xl text-muted-foreground">El enlace puede haber cambiado o la sección todavía no está disponible.</p><div className="mt-8 flex gap-3"><Link href="/" className="rounded-md bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground">Volver al inicio</Link><Link href="/contacto" className="rounded-md border border-border px-5 py-3 text-xs font-semibold uppercase tracking-wider">Contactar</Link></div></main><SiteFooter /></div>;
}
