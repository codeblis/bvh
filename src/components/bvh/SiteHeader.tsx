"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/indices", label: "Índices" },
  { href: "/mercados", label: "Mercados" },
  { href: "/noticias", label: "Noticias" },
  { href: "/blog", label: "Blog" },
  { href: "/instituto", label: "Instituto" },
  { href: "/cotizar", label: "Cotizar" },
  { href: "/historia", label: "Historia" },
  { href: "/contacto", label: "Contacto" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-primary">
          <Logo className="h-8 w-8 shrink-0 md:h-9 md:w-9" />
          <div className="leading-tight">
            <div className="font-serif text-[13px] font-semibold text-foreground md:text-[15px]">Bolsa de Valores</div>
            <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground md:text-[10px]">de La Habana</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 text-[13px] text-muted-foreground md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`relative transition-colors hover:text-foreground ${isActive(n.href) ? "font-semibold text-foreground after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-primary" : ""}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <button
            type="button"
            className="flex items-center justify-center md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
          <Link
            href="/login"
            className="rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-[12px] font-semibold uppercase tracking-wider text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            Acceder
          </Link>
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-border md:hidden">
          <nav className="mx-auto max-w-7xl px-6 py-4 space-y-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-md px-3 py-2 text-[13px] transition-colors ${isActive(n.href) ? "font-semibold text-foreground bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}