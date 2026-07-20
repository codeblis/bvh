"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export type Article = {
  id: string;
  slug: string;
  cat: string;
  date: string;
  title: string;
  excerpt: string;
  author?: string;
  readMin?: number;
  views?: number;
  image?: string;
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CU", { day: "2-digit", month: "short", year: "numeric" });
}

export function ArticleIndex({
  articles,
  categories,
  newsletter,
  accentLabel,
  basePath,
}: {
  articles: Article[];
  categories: string[];
  newsletter: { title: string; description: string; placeholder: string; cta: string; hint: string };
  accentLabel: string;
  basePath: string;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Todas");

  const sorted = useMemo(
    () => [...articles].sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [articles],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return sorted.filter((a) => {
      const okCat = cat === "Todas" || a.cat === cat;
      const okQ =
        !term ||
        a.title.toLowerCase().includes(term) ||
        a.excerpt.toLowerCase().includes(term) ||
        a.cat.toLowerCase().includes(term);
      return okCat && okQ;
    });
  }, [sorted, cat, q]);

  const latest = sorted.slice(0, 5);
  const popular = [...articles].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of articles) m.set(a.cat, (m.get(a.cat) ?? 0) + 1);
    return m;
  }, [articles]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      {/* toolbar: categories left, search right */}
      <div className="mb-8 flex flex-col gap-4 rounded-xl border border-border bg-card/60 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-nowrap gap-2 overflow-x-auto">
          {["Todas", ...categories].map((c) => {
            const active = c === cat;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-widest transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
                {c !== "Todas" && (
                  <span className="ml-1.5 text-[10px] opacity-70">{counts.get(c) ?? 0}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="relative w-full md:max-w-sm">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título, tema o categoría…"
            className="w-full rounded-md border border-border bg-background px-3 py-2.5 pl-9 text-[13px] text-foreground focus:border-primary focus:outline-none"
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* MAIN */}
        <div>
          {filtered.length === 0 && (
            <div className="rounded-xl border border-border bg-card/50 p-10 text-center text-muted-foreground">
              No hay resultados para &ldquo;<span className="text-foreground">{q}</span>&rdquo;.
            </div>
          )}

          {featured && (
            <Link href={`${basePath}/${featured.slug}`} className="mb-8 block overflow-hidden rounded-2xl border border-border bg-card/70 transition-colors hover:bg-card">
              <div
                className="h-40 w-full"
                style={{ background: "var(--gradient-hero)" }}
              />
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-primary">
                  <span>Destacado · {featured.cat}</span>
                  <span className="text-muted-foreground">{fmtDate(featured.date)}</span>
                </div>
                <h2 className="mt-4 font-serif text-2xl leading-tight text-foreground md:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{featured.excerpt}</p>
                <div className="mt-6 flex items-center justify-between text-[11px] uppercase tracking-widest text-muted-foreground">
                  <span>{featured.author ?? "Redacción BVH"} · {featured.readMin ?? 4} min</span>
                  <span className="text-primary">Leer artículo →</span>
                </div>
              </div>
            </Link>
          )}

          <div className="grid gap-px bg-border md:grid-cols-2 rounded-xl overflow-hidden">
            {rest.map((p, i) => (
              <Link key={p.id} href={`${basePath}/${p.slug}`} className={`group flex flex-col bg-background p-6 transition-colors hover:bg-card ${rest.length % 2 !== 0 && i === rest.length - 1 ? "md:col-span-2" : ""}`}>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-primary">
                  <span>{p.cat}</span>
                  <span className="text-muted-foreground">{fmtDate(p.date)}</span>
                </div>
                <h3 className="mt-4 font-serif text-lg leading-snug text-foreground">{p.title}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted-foreground">{p.excerpt}</p>
                <div className="mt-5 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>{p.readMin ?? 3} min · {(p.views ?? 0).toLocaleString("es-CU")} vistas</span>
                  <span className="text-primary">Leer →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-8">
          <div className="rounded-xl border border-border bg-card/60 p-6">
            <div className="mb-4 text-[10px] uppercase tracking-[0.24em] text-primary">Últimas entradas</div>
            <ul className="space-y-4">
              {latest.map((a, i) => (
                <li key={a.id} className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="font-mono text-[11px] text-primary">0{i + 1}</span>
                  <div>
                    <Link href={`${basePath}/${a.slug}`} className="text-[13px] leading-snug text-foreground hover:text-primary">{a.title}</Link>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{fmtDate(a.date)} · {a.cat}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-6">
            <div className="mb-4 text-[10px] uppercase tracking-[0.24em] text-primary">Más populares</div>
            <ul className="space-y-4">
              {popular.map((a, i) => (
                <li key={a.id} className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="font-serif text-2xl text-primary/70">{i + 1}</span>
                  <div>
                    <Link href={`${basePath}/${a.slug}`} className="text-[13px] leading-snug text-foreground hover:text-primary">{a.title}</Link>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{(a.views ?? 0).toLocaleString("es-CU")} vistas</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-6">
            <div className="mb-4 text-[10px] uppercase tracking-[0.24em] text-primary">Categorías</div>
            <ul className="space-y-2 text-[13px]">
              {categories.map((c) => (
                <li key={c} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <button
                    onClick={() => setCat(c)}
                    className={`transition ${cat === c ? "text-primary" : "text-foreground hover:text-primary"}`}
                  >
                    {c}
                  </button>
                  <span className="font-mono text-[11px] text-muted-foreground">{counts.get(c) ?? 0}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Newsletter */}
      <div className="mt-16 overflow-hidden rounded-2xl border border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="grid gap-8 p-6 md:grid-cols-[1.2fr_1fr] md:p-14">
          <div>
            <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-primary">Newsletter · {accentLabel}</div>
            <h3 className="font-serif text-2xl leading-tight text-foreground md:text-3xl">{newsletter.title}</h3>
            <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-muted-foreground">{newsletter.description}</p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col justify-center gap-3"
          >
            <input
              required
              type="email"
              placeholder={newsletter.placeholder}
              className="w-full rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
            />
            <button className="rounded-md bg-primary px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary-foreground transition hover:brightness-110">
              {newsletter.cta}
            </button>
            <p className="text-[11px] text-muted-foreground">{newsletter.hint}</p>
          </form>
        </div>
      </div>
    </section>
  );
}
