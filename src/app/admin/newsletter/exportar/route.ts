import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { csvFilename, toCsv } from "@/lib/csv";
import { formatDateTime } from "../../_ui";

// Solo administradores: `requireAdmin` redirige al resto antes de tocar datos.
export async function GET() {
	const { supabase } = await requireAdmin();

	const { data, error } = await supabase
		.from("newsletter_subscriptions")
		.select(
			"email, full_name, profile, source, is_active, subscribed_at, unsubscribed_at, consented_at",
		)
		.order("subscribed_at", { ascending: false });
	if (error) {
		throw new Error(`No se pudo exportar el newsletter: ${error.message}`);
	}

	const rows = data ?? [];
	const csv = toCsv(
		[
			"Correo",
			"Nombre",
			"Perfil",
			"Origen",
			"Activa",
			"Alta",
			"Baja",
			"Consentimiento",
		],
		rows.map((row) => [
			row.email,
			row.full_name,
			row.profile,
			row.source,
			row.is_active ? "sí" : "no",
			formatDateTime(row.subscribed_at),
			formatDateTime(row.unsubscribed_at),
			formatDateTime(row.consented_at),
		]),
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
			"Content-Disposition": `attachment; filename="${csvFilename("newsletter")}"`,
			"Cache-Control": "no-store",
		},
	});
}
