import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import type { Tables } from "@/types/supabase";
import { ARTICLE_STATUSES, ARTICLE_TYPES } from "../../_status";
import { Field, SaveButton } from "../../_ui";
import { saveArticle } from "../actions";

export default async function ArticuloEditor({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const { supabase } = await requireAdmin();
	const isNew = id === "nuevo";

	const { data: categories } = await supabase
		.from("categories")
		.select("id, name")
		.order("name");

	let article: Tables<"articles"> | null = null;
	if (!isNew) {
		const { data } = await supabase
			.from("articles")
			.select("*")
			.eq("id", id)
			.maybeSingle();
		if (!data) notFound();
		article = data;
	}

	const publishedLocal = article?.published_at
		? new Date(article.published_at).toISOString().slice(0, 16)
		: "";

	return (
		<div className="max-w-2xl">
			<Link
				href="/admin/articulos"
				className="text-xs text-muted-foreground hover:text-foreground"
			>
				← Volver a artículos
			</Link>
			<h1 className="mt-2 mb-6 font-serif text-2xl">
				{isNew ? "Nuevo artículo" : "Editar artículo"}
			</h1>
			<form action={saveArticle} className="space-y-4">
				{article ? <input type="hidden" name="id" value={article.id} /> : null}
				<Field
					label="Título"
					name="title"
					defaultValue={article?.title}
					required
				/>
				<Field
					label="Slug"
					name="slug"
					defaultValue={article?.slug}
					hint="Se genera a partir del título si lo dejas vacío."
				/>
				<Field
					label="Extracto"
					name="excerpt"
					defaultValue={article?.excerpt}
					textarea
				/>
				<Field
					label="Contenido"
					name="content"
					defaultValue={article?.content}
					textarea
					required
				/>
				<Field
					label="Imagen destacada (URL)"
					name="featured_image"
					defaultValue={article?.featured_image}
				/>
				<Field
					label="Tipo"
					name="type"
					defaultValue={article?.type ?? "noticia"}
					options={ARTICLE_TYPES}
				/>
				<label className="block text-[13px]">
					<span className="font-medium text-foreground">Categoría</span>
					<select
						name="category_id"
						defaultValue={article?.category_id ?? ""}
						className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
					>
						<option value="">Sin categoría</option>
						{(categories ?? []).map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
				</label>
				<Field
					label="Estado"
					name="status"
					defaultValue={article?.status ?? "borrador"}
					options={ARTICLE_STATUSES}
				/>
				<Field
					label="Fecha de publicación"
					name="published_at"
					type="datetime-local"
					defaultValue={publishedLocal}
					hint="Si se deja vacío y el estado es «publicado», se usa la fecha actual."
				/>
				<SaveButton />
			</form>
		</div>
	);
}
