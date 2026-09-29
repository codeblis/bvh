import { requireAdmin } from "@/lib/admin";
import {
	AdminPageHeader,
	card,
	EmptyState,
	FormBanner,
	table,
	tableWrap,
	td,
	th,
} from "../_ui";
import { ConfirmSubmitButton } from "../ConfirmSubmitButton";
import { deleteCategory, saveCategory } from "./actions";

const errorMessages: Record<string, string> = {
	invalid: "Revisa el nombre: entre 2 y 80 caracteres.",
	save: "No se pudo guardar la categoría. Inténtalo nuevamente.",
	duplicate: "Ya existe una categoría con ese nombre o slug.",
	delete: "No se pudo eliminar la categoría. Inténtalo nuevamente.",
	"in-use":
		"Esa categoría tiene artículos asignados. Reasígnalos antes de eliminarla.",
	"not-found": "Esa categoría ya no existe.",
};

const successMessages: Record<string, string> = {
	created: "Categoría creada.",
	updated: "Categoría actualizada.",
	deleted: "Categoría eliminada.",
};

const input =
	"w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:border-primary focus:outline-none";

export default async function CategoriasPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string; saved?: string }>;
}) {
	const query = await searchParams;
	const { supabase } = await requireAdmin();
	const [categories, articles] = await Promise.all([
		supabase
			.from("categories")
			.select("id, name, slug, description")
			.order("name", { ascending: true }),
		supabase.from("articles").select("category_id"),
	]);
	if (categories.error)
		throw new Error(
			`No se pudieron cargar las categorías: ${categories.error.message}`,
		);
	if (articles.error)
		throw new Error(
			`No se pudo contar el uso de las categorías: ${articles.error.message}`,
		);

	const usage = new Map<string, number>();
	for (const row of articles.data ?? []) {
		if (!row.category_id) continue;
		usage.set(row.category_id, (usage.get(row.category_id) ?? 0) + 1);
	}
	const rows = categories.data ?? [];

	return (
		<div>
			<FormBanner
				error={query.error}
				success={query.saved}
				errorMessages={errorMessages}
				successMessages={successMessages}
			/>
			<AdminPageHeader
				title="Categorías"
				description="Taxonomía editorial de noticias y blog. Publicar un artículo exige una categoría."
			/>

			{rows.length === 0 ? (
				<EmptyState>Sin categorías. Crea la primera abajo.</EmptyState>
			) : (
				<div className={tableWrap}>
					<table className={table}>
						<thead>
							<tr>
								<th className={th}>Nombre</th>
								<th className={th}>Slug</th>
								<th className={th}>Descripción</th>
								<th className={th}>Artículos</th>
								<th className={th} />
							</tr>
						</thead>
						<tbody>
							{rows.map((category) => {
								const used = usage.get(category.id) ?? 0;
								return (
									<tr key={category.id}>
										<td className={td}>
											<form action={saveCategory} className="flex gap-2">
												<input type="hidden" name="id" value={category.id} />
												<input
													name="name"
													aria-label={`Nombre de ${category.name}`}
													defaultValue={category.name}
													required
													className={input}
												/>
												<input
													type="hidden"
													name="slug"
													value={category.slug}
												/>
												<input
													type="hidden"
													name="description"
													value={category.description ?? ""}
												/>
												<button
													type="submit"
													className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
												>
													Guardar
												</button>
											</form>
										</td>
										<td className={td}>{category.slug}</td>
										<td className={`${td} max-w-sm text-muted-foreground`}>
											{category.description || "—"}
										</td>
										<td className={td}>{used}</td>
										<td className={td}>
											{used > 0 ? (
												<span className="text-xs text-muted-foreground">
													En uso
												</span>
											) : (
												<form action={deleteCategory}>
													<input type="hidden" name="id" value={category.id} />
													<ConfirmSubmitButton
														message={`Eliminar la categoría «${category.name}». Esta acción no se puede deshacer.`}
														className="text-xs text-destructive hover:underline"
													>
														Eliminar
													</ConfirmSubmitButton>
												</form>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			<div className="mt-8">
				<h2 className="mb-3 font-serif text-lg">Añadir categoría</h2>
				<form
					action={saveCategory}
					className={`${card} grid items-end gap-3 sm:grid-cols-[1fr_1fr_2fr_auto]`}
				>
					<label className="text-[12px]">
						<span className="text-muted-foreground">Nombre</span>
						<input name="name" required className={input} />
					</label>
					<label className="text-[12px]">
						<span className="text-muted-foreground">Slug</span>
						<input
							name="slug"
							placeholder="Se genera del nombre"
							className={input}
						/>
					</label>
					<label className="text-[12px]">
						<span className="text-muted-foreground">Descripción</span>
						<input name="description" className={input} />
					</label>
					<button
						type="submit"
						className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
					>
						Añadir
					</button>
				</form>
			</div>
		</div>
	);
}
