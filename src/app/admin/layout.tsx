import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/bvh/SignOutButton";
import { requireAdmin } from "@/lib/admin";
import { isEditorialScope } from "@/lib/scope";
import { AdminNav, type NavCounts } from "./AdminNav";

export const metadata: Metadata = {
	title: "Panel · BVH",
	robots: { index: false, follow: false },
};

async function pendingWork(
	supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
): Promise<NavCounts> {
	// En el MVP editorial solo hay una bandeja con trabajo posible. Contar las
	// otras tres sería consultar tablas que ninguna pantalla muestra.
	if (isEditorialScope()) {
		const borradores = await supabase
			.from("articles")
			.select("*", { count: "exact", head: true })
			.eq("status", "borrador");
		return {
			mensajes: 0,
			solicitudes: 0,
			inscripciones: 0,
			borradores: borradores.count ?? 0,
		};
	}

	const [mensajes, solicitudes, inscripciones, borradores] = await Promise.all([
		supabase
			.from("contact_messages")
			.select("*", { count: "exact", head: true })
			.eq("status", "pendiente"),
		supabase
			.from("company_applications")
			.select("*", { count: "exact", head: true })
			.eq("status", "nueva"),
		supabase
			.from("course_enrollments")
			.select("*", { count: "exact", head: true })
			.in("status", ["pendiente", "lista_espera"]),
		supabase
			.from("articles")
			.select("*", { count: "exact", head: true })
			.eq("status", "borrador"),
	]);

	// El contador es una ayuda, no el dato de la pantalla: si falla, se omite.
	return {
		mensajes: mensajes.count ?? 0,
		solicitudes: solicitudes.count ?? 0,
		inscripciones: inscripciones.count ?? 0,
		borradores: borradores.count ?? 0,
	};
}

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { supabase, user, profile } = await requireAdmin();
	const counts = await pendingWork(supabase);
	const name = profile?.full_name || user.email;

	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
				<div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
					<Link
						href="/admin"
						className="flex items-baseline gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
					>
						<span className="font-serif text-[17px] font-semibold">BVH</span>
						<span className="text-[11px] text-muted-foreground">
							Panel de operaciones
						</span>
					</Link>
					<div className="flex items-center gap-3 text-[12px] text-muted-foreground">
						<span className="hidden max-w-[22ch] truncate sm:inline">
							{name}
						</span>
						<Link
							href="/"
							className="rounded-md px-2 py-1 transition-colors hover:bg-secondary/60 hover:text-foreground"
						>
							Ver sitio
						</Link>
						<SignOutButton quiet />
					</div>
				</div>
			</header>

			<div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-4 py-6 sm:px-6 lg:flex-row lg:gap-10 lg:py-9">
				<AdminNav counts={counts} />
				<main id="panel" className="min-w-0 flex-1 pb-16">
					{children}
				</main>
			</div>
		</div>
	);
}
