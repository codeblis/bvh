import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import type { Tables } from "@/types/supabase";
import { COMPANY_STATUSES } from "../../_status";
import { Field, FormBanner, SaveButton } from "../../_ui";
import { saveCompany } from "../actions";

const errorMessages: Record<string, string> = {
	invalid: "Revisa los campos obligatorios y sus formatos.",
	save: "No se pudo guardar la empresa. Inténtalo nuevamente.",
	duplicate: "Ya existe una empresa con ese nombre o slug.",
	"not-found": "Esa empresa ya no existe en el directorio.",
};

export default async function EmpresaEditor({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ error?: string }>;
}) {
	const { id } = await params;
	const query = await searchParams;
	const { supabase } = await requireAdmin();
	const isNew = id === "nuevo";

	let company: Tables<"companies"> | null = null;
	if (!isNew) {
		const { data, error } = await supabase
			.from("companies")
			.select("*")
			.eq("id", id)
			.maybeSingle();
		if (error)
			throw new Error(`No se pudo cargar la empresa: ${error.message}`);
		if (!data) notFound();
		company = data;
	}

	return (
		<div className="max-w-2xl">
			<Link
				href="/admin/empresas"
				className="text-xs text-muted-foreground hover:text-foreground"
			>
				← Volver a empresas
			</Link>
			<h1 className="mt-2 mb-6 font-serif text-2xl">
				{isNew ? "Nueva empresa" : "Editar empresa"}
			</h1>
			<FormBanner
				error={query.error}
				errorMessages={errorMessages}
				successMessages={{}}
			/>
			<form action={saveCompany} className="space-y-4">
				{company ? <input type="hidden" name="id" value={company.id} /> : null}
				<Field
					label="Nombre"
					name="name"
					defaultValue={company?.name}
					required
				/>
				<Field
					label="Slug"
					name="slug"
					defaultValue={company?.slug}
					hint="Se genera a partir del nombre si lo dejas vacío."
				/>
				<Field
					label="Descripción"
					name="description"
					defaultValue={company?.description}
					textarea
				/>
				<Field
					label="Logo (URL)"
					name="logo_url"
					defaultValue={company?.logo_url}
				/>
				<Field label="Sector" name="sector" defaultValue={company?.sector} />
				<Field
					label="Sitio web"
					name="website"
					defaultValue={company?.website}
				/>
				<Field
					label="Estado"
					name="status"
					defaultValue={company?.status ?? "interesada"}
					options={COMPANY_STATUSES}
				/>
				<SaveButton />
			</form>
		</div>
	);
}
