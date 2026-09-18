import type { Metadata } from "next";

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
	return children;
}
