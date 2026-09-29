import { Download } from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import {
	AdminPageHeader,
	buttonGhost,
	EmptyState,
	Flag,
	table,
	tableWrap,
	td,
	th,
} from "../_ui";
import {
	NotificationResultBanner,
	NotificationStatus,
} from "../NotificationStatus";

function first<T>(value: T | T[] | null): T | null {
	return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function NewsletterPage({
	searchParams,
}: {
	searchParams: Promise<{
		notification?: string;
		error?: string;
		lista?: string;
	}>;
}) {
	const query = await searchParams;
	const { supabase } = await requireAdmin();

	const listsResult = await supabase
		.from("newsletter_lists")
		.select("id, slug, name")
		.order("name");
	if (listsResult.error) {
		throw new Error(`No se pudieron cargar las listas: ${listsResult.error.message}`);
	}
	const lists = listsResult.data ?? [];
	const selected = lists.find((list) => list.slug === query.lista);

	let request = supabase
		.from("newsletter_list_subscriptions")
		.select(
			"id, source, subscribed_at, is_active, notification_status, notification_attempts, newsletter_subscriptions(email, full_name, profile, is_active), newsletter_lists(slug, name)",
		)
		.order("subscribed_at", { ascending: false });
	if (selected) request = request.eq("list_id", selected.id);

	const { data, error } = await request;
	if (error) {
		throw new Error(`No se pudo cargar el newsletter: ${error.message}`);
	}
	const rows = data ?? [];
	const active = rows.filter((row) => row.is_active).length;
	const exportHref = selected
		? `/admin/newsletter/exportar?lista=${selected.slug}`
		: "/admin/newsletter/exportar";

	return (
		<div>
			<NotificationResultBanner
				result={query.notification}
				error={query.error}
			/>
			<AdminPageHeader
				action={
					rows.length > 0 ? (
						<a href={exportHref} className={buttonGhost}>
							<Download className="h-4 w-4" aria-hidden="true" />
							Exportar CSV
						</a>
					) : null
				}
				title="Newsletter"
				description={`${
					active === 1
						? "1 suscripción activa"
						: `${active} suscripciones activas`
				} de ${rows.length}${selected ? ` en «${selected.name}»` : " en todas las listas"}.`}
			/>

			<nav aria-label="Filtrar por lista" className="mb-5 flex flex-wrap gap-2">
				<Link
					href="/admin/newsletter"
					className={`${buttonGhost} ${selected ? "" : "border-primary text-primary"}`}
				>
					Todas
				</Link>
				{lists.map((list) => (
					<Link
						key={list.id}
						href={`/admin/newsletter?lista=${list.slug}`}
						className={`${buttonGhost} ${selected?.id === list.id ? "border-primary text-primary" : ""}`}
					>
						{list.name}
					</Link>
				))}
			</nav>

			{rows.length === 0 ? (
				<EmptyState>Sin suscriptores todavía.</EmptyState>
			) : (
				<div className={tableWrap}>
					<table className={table}>
						<thead>
							<tr>
								<th className={th}>Email</th>
								<th className={th}>Nombre</th>
								<th className={th}>Lista</th>
								<th className={th}>Perfil</th>
								<th className={th}>Origen</th>
								<th className={th}>Alta</th>
								<th className={th}>Activa</th>
								<th className={th}>Aviso</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => {
								const person = first(row.newsletter_subscriptions);
								const list = first(row.newsletter_lists);
								// Una baja global manda sobre el estado de cada lista.
								const silenced = person ? !person.is_active : false;
								return (
									<tr key={row.id}>
										<td className={td}>{person?.email ?? "—"}</td>
										<td className={td}>{person?.full_name || "—"}</td>
										<td className={td}>{list?.name ?? "—"}</td>
										<td className={td}>{person?.profile || "—"}</td>
										<td className={td}>{row.source || "—"}</td>
										<td className={`${td} whitespace-nowrap`}>
											{row.subscribed_at
												? new Date(row.subscribed_at).toLocaleDateString("es")
												: "—"}
										</td>
										<td className={td}>
											{silenced ? (
												<Flag tone="fallo">Baja global</Flag>
											) : (
												(row.is_active ? "Sí" : "No")
											)}
										</td>
										<td className={td}>
											<NotificationStatus
												resourceType="newsletter_subscription"
												id={row.id}
												status={row.notification_status}
												attempts={row.notification_attempts}
											/>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
