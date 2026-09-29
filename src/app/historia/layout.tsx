import type { Metadata } from "next";
import { blockOutsideEditorialScope } from "@/lib/scope";

export const metadata: Metadata = {
	title: "Historia | BVH",
	description:
		"De la plaza bursátil de 1914 a la infraestructura financiera del siglo XXI: el pasado, el presente fundacional y el futuro de la Bolsa de Valores de La Habana.",
	alternates: { canonical: "/historia" },
};

export default function HistoriaLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Fuera del MVP editorial esta sección no se publica.
	blockOutsideEditorialScope();
	return children;
}
