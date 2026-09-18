import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Crear cuenta | BVH",
	alternates: { canonical: "/registro" },
	robots: { index: false, follow: true },
};

export default function RegistroLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
