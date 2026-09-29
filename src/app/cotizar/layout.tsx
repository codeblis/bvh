import type { Metadata } from "next";
import { blockOutsideEditorialScope } from "@/lib/scope";

export const metadata: Metadata = {
	title: "Cotizar en la BVH | BVH",
	description:
		"Requisitos y proceso de incorporación al registro de empresas de la Bolsa de Valores de La Habana. Sección en preparación.",
	alternates: { canonical: "/cotizar" },
	// Datos simulados y sección sin promocionar: no entra a los índices.
	robots: { index: false, follow: true },
};

export default function CotizarLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Fuera del MVP editorial esta sección no se publica.
	blockOutsideEditorialScope();
	return children;
}
