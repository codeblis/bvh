"use client";

import Link from "next/link";
import { Logo } from "./Logo";

const SOCIALS = [
  { href: "https://x.com/bolsadelahabana", label: "X", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { href: "https://facebook.com/bolsadelahabana", label: "Facebook", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
  { href: "https://instagram.com/bolsadelahabana", label: "Instagram", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
  { href: "https://linkedin.com/company/bolsadelahabana", label: "LinkedIn", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> },
  { href: "https://youtube.com/@bolsadelahabana", label: "YouTube", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.19a3 3 0 0 0-2.1-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.55A3 3 0 0 0 .5 6.19 32 32 0 0 0 0 12a32 32 0 0 0 .5 5.81 3 3 0 0 0 2.1 2.14c1.9.55 9.4.55 9.4.55s7.5 0 9.4-.55a3 3 0 0 0 2.1-2.14A32 32 0 0 0 24 12a32 32 0 0 0-.5-5.81zM9.5 15.5V8.5l6.2 3.5z"/></svg> },
  { href: "https://t.me/bolsadelahabana", label: "Telegram", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
  { href: "https://wa.me/5351234567", label: "WhatsApp", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg> },
];

const COLS = [
  { title: "Mercado", items: [
    { href: "/mercados", label: "Cotizaciones" },
    { href: "/mercados", label: "Índices" },
    { href: "/noticias", label: "Análisis" },
    { href: "/blog", label: "Blog" },
  ]},
  { title: "Instituto", items: [
    { href: "/instituto", label: "Cursos" },
    { href: "/instituto", label: "Certificaciones" },
    { href: "/instituto", label: "Consultoría" },
    { href: "/instituto", label: "Club de Inversión" },
  ]},
  { title: "Institución", items: [
    { href: "/historia", label: "Nosotros" },
    { href: "/historia", label: "Historia" },
    { href: "/noticias", label: "Prensa" },
    { href: "/contacto", label: "Contacto" },
  ]},
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3 text-primary">
            <Logo className="h-9 w-9" />
            <div className="leading-tight">
              <div className="font-serif text-[15px] font-semibold text-foreground">Bolsa de Valores</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">de La Habana</div>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            Plataforma independiente que profesionaliza el empresariado cubano, genera transparencia
            y conecta talento con capital.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-[7px] border border-border bg-card/50 text-muted-foreground transition hover:border-primary/50 hover:text-primary hover:bg-primary/5"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <div className="mb-4 text-[10px] uppercase tracking-[0.24em] text-primary">{c.title}</div>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              {c.items.map((i) => (
                <li key={`${i.href}-${i.label}`}>
                  <Link href={i.href} className="transition hover:text-foreground">{i.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>© 2026 Bolsa de Valores de La Habana</span>
          <span>Hecho con rigor · La Habana, Cuba</span>
        </div>
      </div>
    </footer>
  );
}