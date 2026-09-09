import { PenLine } from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import {
	AdminPageHeader,
	buttonPrimary,
	EmptyState,
	Flag,
	table,
	tableWrap,
	td,
	th,
} from "../_ui";
import { ConfirmSubmitButton } from "../ConfirmSubmitButton";
import { unpublishArticle } from "./actions";

export default async function ArticulosPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const { error: queryError } = await searchParams;
	const { supabase } = await requireAdmin();
	const { data, error } = await supabase
		.from("articles")
		.select("id, title, type, status, published_at, views")
		.order("created_at", { ascending: false });
	if (error)
		throw new Error(`No se pudieron cargar los artículos: ${error.message}`);
	const rows = data ?? [];

	return (
		<div>
			<AdminPageHeader
				title="Artículos"
				description="Noticias y entradas de blog del sitio público."
				action={
					<Link href="/admin/articulos/nuevo" className={buttonPrimary}>
						<PenLine className="h-4 w-4" aria-hidden="true" />
						Nuevo artículo
					</Link>
				}
			/>
			{queryError ? (
				<p
					className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
					role="alert"
				>
					No se pudo completar la operación. Revisa el registro e inténtalo de
					nuevo.
				</p>
			) : null}
			{rows.length === 0 ? (
				<EmptyState
					action={
						<Link href="/admin/articulos/nuevo" className={buttonPrimary}>
							Escribir el primero
						</Link>
					}
				>
					Aquí aparecerán las noticias y entradas de blog. Todavía no hay
					ninguna.
				</EmptyState>
			) : (
				<div className={tableWrap}>
					<table className={table}>
						<thead>
							<tr>
								<th className={th}>Título</th>
								<th className={th}>Tipo</th>
								<th className={th}>Estado</th>
								<th className={th}>Publicado</th>
								<th className={th}>Vistas</th>
								<th className={th} />
							</tr>
						</thead>
						<tbody>
							{rows.map((r) => (
								<tr
									key={r.id}
									className="transition-colors hover:bg-secondary/20"
								>
									<td className={td}>
										<Link
											href={`/admin/articulos/${r.id}`}
											className="font-medium text-foreground transition-colors hover:text-primary"
										>
											{r.title}
										</Link>
									</td>
									<td className={td}>
										<span className="text-muted-foreground">
											{r.type === "blog" ? "Blog" : "Noticia"}
										</span>
									</td>
									<td className={td}>
										<Flag tone={r.status === "publicado" ? "hecho" : "espera"}>
											{r.status === "publicado" ? "Publicado" : "Borrador"}
										</Flag>
									</td>
									<td
										className={`${td} whitespace-nowrap tabular-nums text-muted-foreground`}
									>
										{r.published_at
											? new Date(r.published_at).toLocaleDateString("es")
											: "—"}
									</td>
									<td className={`${td} tabular-nums text-muted-foreground`}>
										{r.views ?? 0}
									</td>
									<td className={td}>
										{r.status === "publicado" ? (
											<form action={unpublishArticle}>
												<input type="hidden" name="id" value={r.id} />
												<ConfirmSubmitButton
													message="El artículo dejará de estar visible en el sitio público. Podrás publicarlo nuevamente."
													className="text-xs text-destructive hover:underline"
												>
													Despublicar
												</ConfirmSubmitButton>
											</form>
										) : null}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
