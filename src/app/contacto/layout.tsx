import type { Metadata } from "next";
import { blockOutsideEditorialScope } from "@/lib/scope";

export const metadata: Metadata = {
	title: "Contacto | BVH",
	description:
		"Prensa, alianzas institucionales, listado de empresas o consultas del Instituto BVH. El equipo de la Bolsa de Valores de La Habana responde en 48 horas hábiles.",
	alternates: { canonical: "/contacto" },
};

export default function ContactoLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Fuera del MVP editorial esta sección no se publica.
	blockOutsideEditorialScope();
	return children;
}
