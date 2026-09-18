import type { Metadata } from "next";

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
	return children;
}
