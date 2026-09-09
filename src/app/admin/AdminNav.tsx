"use client";

import {
	BookOpen,
	Building2,
	FileText,
	Inbox,
	LineChart,
	Mail,
	Menu,
	ScrollText,
	Send,
	Tags,
	UserCog,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export type NavCounts = {
	mensajes: number;
	solicitudes: number;
	inscripciones: number;
	borradores: number;
};

const GROUPS = [
	{
		name: "Bandejas",
		items: [
			{
				href: "/admin/mensajes",
				label: "Mensajes de contacto",
				icon: Inbox,
				count: "mensajes" as const,
			},
			{
				href: "/admin/solicitudes",
				label: "Solicitudes RIE-BVH",
				icon: Send,
				count: "solicitudes" as const,
			},
			{ href: "/admin/newsletter", label: "Newsletter", icon: Mail },
		],
	},
	{
		name: "Contenido",
		items: [
			{
				href: "/admin/articulos",
				label: "Artículos",
				icon: FileText,
				count: "borradores" as const,
			},
			{ href: "/admin/categorias", label: "Categorías", icon: Tags },
		],
	},
	{
		name: "Instituto",
		items: [
			{ href: "/admin/cursos", label: "Cursos", icon: BookOpen },
			{
				href: "/admin/cursos/inscripciones",
				label: "Inscripciones",
				icon: Users,
				count: "inscripciones" as const,
			},
		],
	},
	{
		name: "Gobierno",
		items: [
			{ href: "/admin/usuarios", label: "Usuarios y roles", icon: UserCog },
			{ href: "/admin/auditoria", label: "Auditoría", icon: ScrollText },
		],
	},
	{
		name: "Mercado",
		items: [
			{ href: "/admin/empresas", label: "Empresas", icon: Building2 },
			{ href: "/admin/indices", label: "Índices", icon: LineChart },
		],
	},
] as const;

function isActive(pathname: string, href: string) {
	if (href === "/admin/cursos") {
		return pathname === href || pathname.startsWith("/admin/cursos/");
	}
	return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({
	counts,
	onNavigate,
}: {
	counts: NavCounts;
	onNavigate?: () => void;
}) {
	const pathname = usePathname();

	return (
		<div className="space-y-6">
			<Link
				href="/admin"
				onClick={onNavigate}
				className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${
					pathname === "/admin"
						? "bg-primary/10 font-semibold text-primary"
						: "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
				}`}
			>
				<LineChart className="h-4 w-4 shrink-0" aria-hidden="true" />
				Resumen
			</Link>

			{GROUPS.map((group) => (
				<div key={group.name}>
					<p className="mb-2 px-3 text-[11px] text-muted-foreground/70">
						{group.name}
					</p>
					<ul className="space-y-0.5">
						{group.items.map((item) => {
							const active = isActive(pathname, item.href);
							const pending =
								"count" in item && item.count ? counts[item.count] : 0;
							const Icon = item.icon;
							return (
								<li key={item.href}>
									<Link
										href={item.href}
										onClick={onNavigate}
										aria-current={active ? "page" : undefined}
										className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${
											active
												? "bg-primary/10 font-semibold text-primary"
												: "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
										}`}
									>
										<Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
										<span className="min-w-0 flex-1 truncate">
											{item.label}
										</span>
										{pending > 0 ? (
											<span
												className="shrink-0 rounded-md border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-amber-300"
												title={`${pending} sin atender`}
											>
												{pending}
											</span>
										) : null}
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			))}
		</div>
	);
}

export function AdminNav({ counts }: { counts: NavCounts }) {
	// Navegar cierra el cajón desde el propio enlace: en móvil el menú no debe
	// quedarse tapando el resultado.
	const [open, setOpen] = useState(false);

	return (
		<>
			<div className="flex items-center justify-between border-b border-border/60 px-4 py-3 lg:hidden">
				<button
					type="button"
					onClick={() => setOpen(!open)}
					aria-expanded={open}
					aria-controls="admin-nav"
					className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[13px]"
				>
					{open ? (
						<X className="h-4 w-4" aria-hidden="true" />
					) : (
						<Menu className="h-4 w-4" aria-hidden="true" />
					)}
					Secciones
				</button>
			</div>

			<nav
				id="admin-nav"
				aria-label="Secciones del panel"
				className={`${open ? "block" : "hidden"} border-b border-border/60 px-4 py-4 lg:sticky lg:top-6 lg:block lg:w-60 lg:shrink-0 lg:self-start lg:border-none lg:px-0 lg:py-0`}
			>
				<NavList counts={counts} onNavigate={() => setOpen(false)} />
			</nav>
		</>
	);
}
