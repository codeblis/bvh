import type { Metadata } from "next";
import { blockOutsideEditorialScope } from "@/lib/scope";

export const metadata: Metadata = {
	title: "Acerca de la BVH | BVH",
	description:
		"La Bolsa de Valores de La Habana es el primer proyecto de infraestructura financiera moderna en Cuba en más de seis décadas: una iniciativa privada e independiente por la transparencia y la canalización de capital.",
	alternates: { canonical: "/acerca" },
};

export default function AcercaLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Fuera del MVP editorial esta sección no se publica.
	blockOutsideEditorialScope();
	return children;
}
