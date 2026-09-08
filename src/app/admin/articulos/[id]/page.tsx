import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { EDITORIAL_BUCKET } from "@/modules/content/media";
import type { Tables } from "@/types/supabase";
import { ARTICLE_STATUSES, ARTICLE_TYPES } from "../../_status";
import { Field, SaveButton } from "../../_ui";
import { ConfirmSubmitButton } from "../../ConfirmSubmitButton";
import { removeArticleCover, saveArticle } from "../actions";
import { CoverUploadForm } from "./CoverUploadForm";

export default async function ArticuloEditor({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{
		error?: string;
		saved?: string;
		cover?: string;
		cleanup?: string;
	}>;
}) {
	const { id } = await params;
	const query = await searchParams;
	const { supabase } = await requireAdmin();
	const isNew = id === "nuevo";

	const { data: categories, error: categoriesError } = await supabase
		.from("categories")
		.select("id, name")
		.order("name");
	if (categoriesError) {
		throw new Error(
			`No se pudieron cargar las categorías: ${categoriesError.message}`,
		);
	}

	let article: Tables<"articles"> | null = null;
	if (!isNew) {
		const { data, error } = await supabase
			.from("articles")
			.select("*")
			.eq("id", id)
			.maybeSingle();
		if (error)
			throw new Error(`No se pudo cargar el artículo: ${error.message}`);
		if (!data) notFound();
		article = data;
	}

	const publishedLocal = article?.published_at
		? new Date(article.published_at).toISOString().slice(0, 16)
		: "";
	const coverUrl = article?.featured_image_path
		? /^https?:\/\//i.test(article.featured_image_path)
			? article.featured_image_path
			: supabase.storage
					.from(EDITORIAL_BUCKET)
					.getPublicUrl(article.featured_image_path).data.publicUrl
		: null;
	const errorMessages: Record<string, string> = {
		invalid: "Revisa los campos obligatorios y sus formatos.",
		save: "No se pudo guardar el artículo. Inténtalo nuevamente.",
		slug: "Ese slug ya existe para este tipo de contenido.",
		"not-found": "El artículo ya no existe o no está disponible.",
		identity:
			"Despublica el artículo antes de cambiar su tipo o slug para evitar enlaces rotos.",
		"incomplete-publish":
			"Para publicar necesitas extracto, categoría, portada y texto alternativo. Guarda primero como borrador.",
		"cover-fields":
			"Selecciona una imagen y escribe un texto alternativo de 3 a 300 caracteres.",
		"cover-file": "Selecciona un archivo de imagen.",
		"cover-empty": "El archivo está vacío.",
		"cover-too_large": "La portada supera el límite de 5 MB.",
		"cover-type": "Formato no permitido. Usa JPG, PNG, WebP o AVIF.",
		"cover-upload": "No se pudo subir la portada.",
		"cover-save": "La subida no pudo asociarse al artículo y fue revertida.",
		"cover-remove": "No se pudo quitar la portada.",
		"published-cover": "Despublica el artículo antes de eliminar su portada.",
	};

	return (
		<div className="max-w-3xl">
			<Link
				href="/admin/articulos"
				className="text-xs text-muted-foreground hover:text-foreground"
			>
				← Volver a artículos
			</Link>
			<div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-3">
				<h1 className="font-serif text-2xl">
					{isNew ? "Nuevo artículo" : "Editar artículo"}
				</h1>
				{article ? (
					<Link
						href={`/admin/articulos/${article.id}/preview`}
						className="rounded-md border border-border px-4 py-2 text-xs hover:border-primary hover:text-primary"
					>
						Vista previa
					</Link>
				) : null}
			</div>
			{query.error ? (
				<p
					className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
					role="alert"
				>
					{errorMessages[query.error] ?? "No se pudo completar la operación."}
				</p>
			) : null}
			{query.saved === "true" || query.cover ? (
				<p
					className="mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
					role="status"
				>
					{query.cover === "removed"
						? "Portada eliminada."
						: query.cover === "updated"
							? "Portada actualizada."
							: "Artículo guardado."}
					{query.cleanup === "pending"
						? " El archivo anterior quedó pendiente de limpieza."
						: ""}
				</p>
			) : null}
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

			<section className="mt-8 rounded-xl border border-border bg-card/40 p-5">
				<h2 className="font-serif text-lg">Portada</h2>
				<p className="mt-1 text-xs text-muted-foreground">
					JPG, PNG, WebP o AVIF. Máximo 5 MB. La ruta final la genera el
					servidor.
				</p>
				{!article ? (
					<p className="mt-4 text-sm text-muted-foreground">
						Guarda el borrador antes de subir una portada.
					</p>
				) : (
					<>
						{coverUrl ? (
							// biome-ignore lint/performance/noImgElement: Storage host is configured at runtime.
							<img
								src={coverUrl}
								alt={article.featured_image_alt ?? "Portada actual"}
								width={960}
								height={540}
								className="mt-4 aspect-video w-full rounded-lg border border-border object-cover"
							/>
						) : null}
						<CoverUploadForm
							articleId={article.id}
							defaultAlt={article.featured_image_alt}
							hasCover={Boolean(coverUrl)}
						/>
						{coverUrl ? (
							<form action={removeArticleCover} className="mt-3">
								<input type="hidden" name="id" value={article.id} />
								<ConfirmSubmitButton
									message="¿Quitar esta portada? El archivo dejará de estar asociado al borrador."
									className="text-xs text-destructive hover:underline"
								>
									Quitar portada
								</ConfirmSubmitButton>
							</form>
						) : null}
					</>
				)}
			</section>
		</div>
	);
}
