import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/bvh/SignOutButton";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mi cuenta | BVH" };

export default async function CuentaPage() {
	if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) redirect("/login?error=config");
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) redirect("/login?callbackUrl=/cuenta");
	return <div className="min-h-screen bg-background text-foreground"><SiteHeader /><main className="mx-auto max-w-4xl px-6 py-16"><p className="text-xs uppercase tracking-[0.24em] text-primary">Área personal</p><h1 className="mt-3 font-serif text-4xl">Tu cuenta BVH</h1><div className="mt-8 rounded-2xl border border-border bg-card/60 p-6"><p className="text-sm text-muted-foreground">Sesión activa como</p><p className="mt-1 font-medium">{user.email}</p><p className="mt-6 max-w-2xl text-sm leading-6 text-muted-foreground">Los paneles de cursos, empresas e inversión se habilitarán progresivamente. Esta página confirma que tu acceso está funcionando sin prometer funciones todavía inexistentes.</p><div className="mt-6"><SignOutButton /></div></div></main><SiteFooter /></div>;
}
