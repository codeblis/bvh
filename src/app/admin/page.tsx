import { ArrowRight, PenLine } from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { ACTION_LABELS, RESOURCE_LABELS } from "./_status";
import {
	AdminPageHeader,
	buttonPrimary,
	buttonQuiet,
	Flag,
	panel,
} from "./_ui";

function first<T>(value: T | T[] | null): T | null {
	return Array.isArray(value) ? (value[0] ?? null) : value;
}

function when(value: string) {
	const date = new Date(value);
	const minutes = Math.round((Date.now() - date.getTime()) / 60000);
	if (minutes < 1) return "ahora mismo";
	if (minutes < 60) return `hace ${minutes} min`;
	if (minutes < 1440) return `hace ${Math.round(minutes / 60)} h`;
	return date.toLocaleDateString("es", { day: "2-digit", month: "short" });
}

export default async function AdminHome() {
	const { supabase } = await requireAdmin();

	const [
		messages,
		applications,
		failedNotices,
		enrollments,
		drafts,
		published,
		courses,
		subscribers,
		activity,
	] = await Promise.all([
		supabase
			.from("contact_messages")
			.select("*", { count: "exact", head: true })
			.eq("status", "pendiente"),
		supabase
			.from("company_applications")
			.select("*", { count: "exact", head: true })
			.eq("status", "nueva"),
		supabase
			.from("contact_messages")
			.select("*", { count: "exact", head: true })
			.eq("notification_status", "failed"),
		supabase
			.from("course_enrollments")
			.select("*", { count: "exact", head: true })
			.in("status", ["pendiente", "lista_espera"]),
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
		supabase
			.from("newsletter_subscriptions")
			.select("*", { count: "exact", head: true })
			.eq("is_active", true),
		supabase
			.from("audit_events")
			.select(
				"id, created_at, action, resource_type, profiles(full_name, email)",
			)
			.order("created_at", { ascending: false })
			.limit(6),
	]);

	const failed = [
		messages,
		applications,
		failedNotices,
		enrollments,
		drafts,
		published,
		courses,
		subscribers,
		activity,
	].find((result) => result.error);
	if (failed?.error) {
		throw new Error(`No se pudo cargar el resumen: ${failed.error.message}`);
	}

	const queue = [
		{
			label: "Mensajes de contacto sin leer",
			value: messages.count ?? 0,
			href: "/admin/mensajes",
			action: "Leer",
		},
		{
			label: "Solicitudes RIE-BVH nuevas",
			value: applications.count ?? 0,
			href: "/admin/solicitudes",
			action: "Revisar",
		},
		{
			label: "Avisos por correo que no salieron",
			value: failedNotices.count ?? 0,
			href: "/admin/mensajes",
			action: "Reintentar",
		},
		{
			label: "Inscripciones por confirmar",
			value: enrollments.count ?? 0,
			href: "/admin/cursos/inscripciones",
			action: "Confirmar",
		},
		{
			label: "Artículos en borrador",
			value: drafts.count ?? 0,
			href: "/admin/articulos",
			action: "Continuar",
		},
	].filter((item) => item.value > 0);

	const site = [
		{ label: "Artículos publicados", value: published.count ?? 0 },
		{ label: "Cursos activos", value: courses.count ?? 0 },
		{ label: "Suscriptores activos", value: subscribers.count ?? 0 },
	];

	return (
		<div>
			<AdminPageHeader
				title="Resumen"
				description="Lo que espera acción hoy, el estado del sitio y los últimos cambios registrados."
				action={
					<Link href="/admin/articulos/nuevo" className={buttonPrimary}>
						<PenLine className="h-4 w-4" aria-hidden="true" />
						Escribir artículo
					</Link>
				}
			/>

			<section aria-labelledby="pendiente">
				<h2 id="pendiente" className="mb-3 text-[13px] font-medium">
					Requiere tu atención
				</h2>
				{queue.length === 0 ? (
					<div
						className={`${panel} flex flex-wrap items-center gap-3 px-5 py-6 text-sm`}
					>
						<Flag tone="hecho">Al día</Flag>
						<p className="text-muted-foreground">
							No hay mensajes, solicitudes ni inscripciones esperando.
						</p>
					</div>
				) : (
					<ul className={`${panel} divide-y divide-border/50`}>
						{queue.map((item) => (
							<li key={item.label}>
								<Link
									href={item.href}
									className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-secondary/30"
								>
									<span className="w-12 shrink-0 font-serif text-[28px] leading-none tabular-nums text-primary">
										{item.value}
									</span>
									<span className="min-w-0 flex-1 text-sm">{item.label}</span>
									<span className="hidden shrink-0 items-center gap-1.5 text-[13px] text-muted-foreground transition-colors group-hover:text-primary sm:flex">
										{item.action}
										<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
									</span>
								</Link>
							</li>
						))}
					</ul>
				)}
			</section>

			<div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr]">
				<section aria-labelledby="estado">
					<h2 id="estado" className="mb-3 text-[13px] font-medium">
						Estado del sitio
					</h2>
					<dl className={`${panel} divide-y divide-border/50`}>
						{site.map((item) => (
							<div
								key={item.label}
								className="flex items-baseline justify-between gap-4 px-5 py-3.5"
							>
								<dt className="text-sm text-muted-foreground">{item.label}</dt>
								<dd className="font-serif text-lg tabular-nums">
									{item.value}
								</dd>
							</div>
						))}
					</dl>
				</section>

				<section aria-labelledby="actividad">
					<div className="mb-3 flex items-baseline justify-between gap-3">
						<h2 id="actividad" className="text-[13px] font-medium">
							Últimos movimientos
						</h2>
						<Link href="/admin/auditoria" className={buttonQuiet}>
							Ver auditoría
						</Link>
					</div>
					{(activity.data ?? []).length === 0 ? (
						<div className={`${panel} px-5 py-6 text-sm text-muted-foreground`}>
							Todavía no se ha registrado ningún cambio.
						</div>
					) : (
						<ul className={`${panel} divide-y divide-border/50`}>
							{(activity.data ?? []).map((event) => {
								const actor = first(event.profiles);
								return (
									<li
										key={event.id}
										className="flex items-baseline justify-between gap-4 px-5 py-3.5 text-sm"
									>
										<span className="min-w-0">
											<span className="text-foreground">
												{actor?.full_name || actor?.email || "Sistema"}
											</span>{" "}
											<span className="text-muted-foreground">
												{ACTION_LABELS[event.action] ?? event.action}{" "}
												{RESOURCE_LABELS[event.resource_type] ??
													event.resource_type}
											</span>
										</span>
										<span className="shrink-0 whitespace-nowrap text-[12px] tabular-nums text-muted-foreground">
											{event.created_at ? when(event.created_at) : "—"}
										</span>
									</li>
								);
							})}
						</ul>
					)}
				</section>
			</div>
		</div>
	);
}
