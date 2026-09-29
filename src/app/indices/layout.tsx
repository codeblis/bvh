import type { Metadata } from "next";
import { blockOutsideEditorialScope } from "@/lib/scope";

export const metadata: Metadata = {
	title: "Índices | BVH",
	description:
		"Índices sectoriales de la Bolsa de Valores de La Habana. Sección en preparación con datos simulados.",
	alternates: { canonical: "/indices" },
	// Datos simulados y sección sin promocionar: no entra a los índices.
	robots: { index: false, follow: true },
};

export default function IndicesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Fuera del MVP editorial esta sección no se publica.
	blockOutsideEditorialScope();
	return children;
}
