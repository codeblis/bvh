"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
	{ href: "/admin", label: "Resumen" },
	{ href: "/admin/mensajes", label: "Mensajes de contacto" },
	{ href: "/admin/solicitudes", label: "Solicitudes RIE-BVH" },
	{ href: "/admin/newsletter", label: "Newsletter" },
	{ href: "/admin/articulos", label: "Artículos" },
	{ href: "/admin/cursos", label: "Cursos" },
	{ href: "/admin/auditoria", label: "Auditoría" },
	{ href: "/admin/empresas", label: "Empresas" },
	{ href: "/admin/indices", label: "Índices" },
] as const;

export function AdminNav() {
	const pathname = usePathname();
	const isActive = (href: string) =>
		href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

	return (
		<nav className="w-56 shrink-0">
			<ul className="space-y-1 text-[13px]">
				{SECTIONS.map((s) => (
					<li key={s.href}>
						<Link
							href={s.href}
							className={`block rounded-md px-3 py-2 transition-colors ${
								isActive(s.href)
									? "bg-primary/10 font-semibold text-foreground"
									: "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
							}`}
						>
							{s.label}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}
