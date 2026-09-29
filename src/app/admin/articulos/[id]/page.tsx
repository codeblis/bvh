import { ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { EDITORIAL_BUCKET } from "@/modules/content/media";
import type { Tables } from "@/types/supabase";
import {
	ARTICLE_STATUS_LABELS,
	ARTICLE_STATUSES,
	ARTICLE_TYPE_LABELS,
	ARTICLE_TYPES,
} from "../../_status";
import { buttonGhost, Field, Flag, panel, SaveButton } from "../../_ui";
import { ConfirmSubmitButton } from "../../ConfirmSubmitButton";
import { removeArticleCover, saveArticle } from "../actions";
import { CoverUploadForm } from "./CoverUploadForm";

const FORM_ID = "editor-articulo";

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

	const publicPath =
		article?.type === "blog"
			? `/blog/${article.slug}`
			: `/noticias/${article?.slug ?? ""}`;
	const isPublished = article?.status === "publicado";
	const words = (article?.content ?? "")
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;

	return (
		<div>
			<Link
				href="/admin/articulos"
				className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
				Artículos
			</Link>

			<div className="mt-3 mb-7 flex flex-wrap items-center gap-3 border-b border-border/60 pb-5">
				<h1 className="mr-auto font-serif text-[26px] leading-tight sm:text-[30px]">
					{isNew ? "Nuevo artículo" : "Editar artículo"}
				</h1>
				{article ? (
					<>
						<Flag tone={isPublished ? "hecho" : "espera"}>
							{isPublished ? "Publicado" : "Borrador"}
						</Flag>
						<Link
							href={`/admin/articulos/${article.id}/preview`}
							className={buttonGhost}
						>
							<Eye className="h-4 w-4" aria-hidden="true" />
							Vista previa
						</Link>
					</>
				) : null}
			</div>

			{query.error ? (
				<p
					className="mb-5 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
					role="alert"
				>
					{errorMessages[query.error] ?? "No se pudo completar la operación."}
				</p>
			) : null}
			{query.saved === "true" || query.cover ? (
				<p
					className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
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

			<div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
				<form action={saveArticle} id={FORM_ID} className="min-w-0">
					{article ? (
						<input type="hidden" name="id" value={article.id} />
					) : null}

					{/* Manuscrito: el titular se escribe con la voz con la que se publica. */}
					<div className="space-y-6">
						<div>
							<label
								htmlFor="title"
								className="mb-2 block text-[13px] font-medium text-foreground"
							>
								Titular
							</label>
							<input
								id="title"
								name="title"
								defaultValue={article?.title ?? ""}
								required
								placeholder="El titular que leerá el público"
								className="w-full border-0 border-b border-border/70 bg-transparent px-0 pb-3 font-serif text-[26px] leading-tight text-foreground transition-colors placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none sm:text-[32px]"
							/>
						</div>

						<Field
							label="Entradilla"
							name="excerpt"
							defaultValue={article?.excerpt}
							textarea
							rows={3}
							placeholder="Dos o tres líneas que resuman la pieza. Obligatoria para publicar."
							hint="Se usa en los índices, en la portada del artículo y en las tarjetas que se comparten."
						/>

						<div>
							<div className="mb-1.5 flex items-baseline justify-between gap-3">
								<label
									htmlFor="content"
									className="text-[13px] font-medium text-foreground"
								>
									Cuerpo
								</label>
								<span className="text-[11px] tabular-nums text-muted-foreground">
									{words > 0 ? `${words} palabras` : "Markdown"}
								</span>
							</div>
							<textarea
								id="content"
								name="content"
								defaultValue={article?.content ?? ""}
								required
								rows={22}
								placeholder="Escribe en Markdown. Los encabezados, listas y enlaces se respetan; el HTML no se ejecuta."
								className="w-full rounded-lg border border-border/80 bg-background/60 px-4 py-3.5 text-[15px] leading-[1.75] text-foreground transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/25"
							/>
						</div>
					</div>
				</form>

				{/* Ficha de publicación: decide y publica sin bajar hasta el final.
				    Vive fuera del formulario y se asocia por atributo, para que la
				    subida de portada pueda tener su propia acción. */}
				<aside className="space-y-5 lg:sticky lg:top-24">
					<div className={`${panel} space-y-4 p-5`}>
						<h2 className="font-serif text-lg">Publicación</h2>
						<Field
							form={FORM_ID}
							label="Estado"
							name="status"
							defaultValue={article?.status ?? "borrador"}
							options={ARTICLE_STATUSES}
							optionLabels={ARTICLE_STATUS_LABELS}
						/>
						<Field
							form={FORM_ID}
							label="Tipo"
							name="type"
							defaultValue={article?.type ?? "noticia"}
							options={ARTICLE_TYPES}
							optionLabels={ARTICLE_TYPE_LABELS}
						/>
						<div>
							<label
								htmlFor="category_id"
								className="mb-1.5 block text-[13px] font-medium text-foreground"
							>
								Categoría
							</label>
							<select
								id="category_id"
								name="category_id"
								form={FORM_ID}
								defaultValue={article?.category_id ?? ""}
								className="w-full rounded-lg border border-border/80 bg-background/60 px-3 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/25"
							>
								<option value="">Sin categoría</option>
								{(categories ?? []).map((c) => (
									<option key={c.id} value={c.id}>
										{c.name}
									</option>
								))}
							</select>
						</div>
						<Field
							form={FORM_ID}
							label="Fecha de publicación"
							name="published_at"
							type="datetime-local"
							defaultValue={publishedLocal}
							hint="Vacío y en «publicado» usa la fecha de guardado."
						/>
						<Field
							form={FORM_ID}
							label="Slug"
							name="slug"
							defaultValue={article?.slug}
							hint={
								article
									? `Dirección pública: ${publicPath}`
									: "Se genera a partir del titular."
							}
						/>
						<SaveButton full form={FORM_ID}>
							{isPublished ? "Guardar cambios" : "Guardar borrador"}
						</SaveButton>
					</div>

					<div className={`${panel} p-5`}>
						<h2 className="font-serif text-lg">Portada</h2>
						<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
							JPG, PNG, WebP o AVIF, hasta 5 MB. Obligatoria para publicar,
							junto con su texto alternativo.
						</p>
						{!article ? (
							<p className="mt-4 text-sm text-muted-foreground">
								Guarda el borrador y podrás subirla aquí.
							</p>
						) : (
							<>
								{coverUrl ? (
									// biome-ignore lint/performance/noImgElement: Storage host is configured at runtime.
									<img
										src={coverUrl}
										alt={article.featured_image_alt ?? "Portada actual"}
										width={640}
										height={360}
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
					</div>
				</aside>
			</div>
		</div>
	);
}
