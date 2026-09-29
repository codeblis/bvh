import Link from "next/link";
import type { ArticleSummary } from "@/modules/content/types";
import { ArticleCover } from "./ArticleCover";

function fmtDate(iso: string) {
	return new Date(iso).toLocaleDateString("es-CU", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

/**
 * Bloque de últimas publicaciones para la portada. Es de servidor: la portada
 * no necesita interacción, solo lo último que se publicó.
 *
 * El estado vacío no es un detalle: el día del lanzamiento no habrá artículos
 * y la portada tiene que decirlo sin parecer rota.
 */
export function LatestArticles({
	id,
	eyebrow,
	title,
	description,
	articles,
	basePath,
	indexLabel,
	emptyLabel,
}: {
	id: string;
	eyebrow: string;
	title: string;
	description: string;
	articles: ArticleSummary[];
	basePath: string;
	indexLabel: string;
	emptyLabel: string;
}) {
	const [lead, ...rest] = articles;

	return (
		<section aria-labelledby={id} className="border-b border-border">
			<div className="mx-auto max-w-7xl px-6 py-20">
				<div className="mb-10 flex flex-wrap items-end justify-between gap-4">
					<div>
						<div className="mb-3 text-[11px] uppercase tracking-[0.24em] text-primary">
							{eyebrow}
						</div>
						<h2
							id={id}
							className="font-serif text-3xl leading-tight text-foreground md:text-4xl"
						>
							{title}
						</h2>
						<p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
							{description}
						</p>
					</div>
					<Link
						href={basePath}
						className="rounded-md border border-border bg-card/40 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground transition hover:bg-card"
					>
						{indexLabel} →
					</Link>
				</div>

				{articles.length === 0 ? (
					<p className="rounded-xl border border-border bg-card/40 px-6 py-10 text-center text-[14px] text-muted-foreground">
						{emptyLabel}
					</p>
				) : (
					<div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
						<Link
							href={`${basePath}/${lead.slug}`}
							className="group block overflow-hidden rounded-2xl border border-border bg-card/70 transition-colors hover:bg-card"
						>
							<ArticleCover
								slug={lead.slug}
								src={lead.image}
								alt={lead.imageAlt}
								className="h-48 w-full md:h-60"
							/>
							<div className="p-6 md:p-8">
								<div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-primary">
									<span>{lead.cat}</span>
									<time dateTime={lead.date} className="text-muted-foreground">
										{fmtDate(lead.date)}
									</time>
								</div>
								<h3 className="mt-4 font-serif text-2xl leading-tight text-foreground md:text-3xl">
									{lead.title}
								</h3>
								<p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
									{lead.excerpt}
								</p>
								<div className="mt-6 text-[11px] uppercase tracking-widest text-primary">
									Leer artículo →
								</div>
							</div>
						</Link>

						{rest.length > 0 ? (
							<ul className="divide-y divide-border rounded-2xl border border-border">
								{rest.map((article) => (
									<li key={article.id}>
										<Link
											href={`${basePath}/${article.slug}`}
											className="block px-6 py-5 transition-colors hover:bg-card"
										>
											<div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-primary">
												<span className="min-w-0 truncate">{article.cat}</span>
												<time
													dateTime={article.date}
													className="shrink-0 text-muted-foreground"
												>
													{fmtDate(article.date)}
												</time>
											</div>
											<h3 className="mt-2 font-serif text-lg leading-snug text-foreground">
												{article.title}
											</h3>
											<p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
												{article.excerpt}
											</p>
										</Link>
									</li>
								))}
							</ul>
						) : null}
					</div>
				)}
			</div>
		</section>
	);
}
