import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { csvFilename, toCsv } from "@/lib/csv";
import { formatDateTime } from "../../_ui";

function first<T>(value: T | T[] | null): T | null {
	return Array.isArray(value) ? (value[0] ?? null) : value;
}

// Solo administradores: `requireAdmin` redirige al resto antes de tocar datos.
export async function GET(request: Request) {
	const { supabase } = await requireAdmin();
	const listSlug = new URL(request.url).searchParams.get("lista");

	let query = supabase
		.from("newsletter_list_subscriptions")
		.select(
			"source, is_active, subscribed_at, unsubscribed_at, consented_at, newsletter_subscriptions(email, full_name, profile, is_active), newsletter_lists!inner(slug, name)",
		)
		.order("subscribed_at", { ascending: false });
	if (listSlug) query = query.eq("newsletter_lists.slug", listSlug);

	const { data, error } = await query;
	if (error) {
		throw new Error(`No se pudo exportar el newsletter: ${error.message}`);
	}

	const rows = data ?? [];
	const csv = toCsv(
		[
			"Correo",
			"Nombre",
			"Lista",
			"Perfil",
			"Origen",
			"Activa en la lista",
			"Baja global",
			"Alta",
			"Baja",
			"Consentimiento",
		],
		rows.map((row) => {
			const person = first(row.newsletter_subscriptions);
			const list = first(row.newsletter_lists);
			return [
				person?.email ?? null,
				person?.full_name ?? null,
				list?.name ?? null,
				person?.profile ?? null,
				row.source,
				row.is_active ? "sí" : "no",
				person && !person.is_active ? "sí" : "no",
				formatDateTime(row.subscribed_at),
				formatDateTime(row.unsubscribed_at),
				formatDateTime(row.consented_at),
			];
		}),
	);

	// La acción queda auditada aunque el archivo no guarde rastro de quién lo
	// descargó: se registra el actor y cuántas filas salieron, no su contenido.
	const recorded = await supabase.rpc("record_data_export", {
		p_resource_type: "newsletter_subscriptions",
		p_rows: rows.length,
	});
	if (recorded.error) {
		throw new Error(
			`No se pudo registrar la exportación: ${recorded.error.message}`,
		);
	}

	return new NextResponse(csv, {
		headers: {
			"Content-Type": "text/csv; charset=utf-8",
			"Content-Disposition": `attachment; filename="${csvFilename(listSlug ? `newsletter-${listSlug}` : "newsletter")}"`,
			"Cache-Control": "no-store",
		},
	});
}
