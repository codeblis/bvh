import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { card } from "./_ui";

export default async function AdminHome() {
	const { supabase } = await requireAdmin();

	const [messages, applications, subscribers, drafts, published, courses] =
		await Promise.all([
			supabase
				.from("contact_messages")
				.select("*", { count: "exact", head: true })
				.eq("status", "pendiente"),
			supabase
				.from("company_applications")
				.select("*", { count: "exact", head: true })
				.eq("status", "nueva"),
			supabase
				.from("newsletter_subscriptions")
				.select("*", { count: "exact", head: true })
				.eq("is_active", true),
			supabase
				.from("articles")
				.select("*", { count: "exact", head: true })
				.eq("status", "borrador"),
			supabase
				.from("articles")
				.select("*", { count: "exact", head: true })
				.eq("status", "publicado"),
			supabase
				.from("courses")
				.select("*", { count: "exact", head: true })
				.eq("status", "activo"),
		]);

	const stats = [
		{ label: "Mensajes sin leer", value: messages.count ?? 0, href: "/admin/mensajes" },
		{ label: "Solicitudes nuevas", value: applications.count ?? 0, href: "/admin/solicitudes" },
		{ label: "Suscriptores activos", value: subscribers.count ?? 0, href: "/admin/newsletter" },
		{ label: "Artículos en borrador", value: drafts.count ?? 0, href: "/admin/articulos" },
		{ label: "Artículos publicados", value: published.count ?? 0, href: "/admin/articulos" },
		{ label: "Cursos activos", value: courses.count ?? 0, href: "/admin/cursos" },
	];

	return (
		<div>
			<h1 className="mb-6 font-serif text-2xl">Resumen</h1>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{stats.map((s) => (
					<Link
						key={s.label}
						href={s.href}
						className={`${card} transition-colors hover:border-primary/40`}
					>
						<p className="text-3xl font-semibold">{s.value}</p>
						<p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
					</Link>
				))}
			</div>
		</div>
	);
}
