import type { Metadata } from "next";
import { blockOutsideEditorialScope } from "@/lib/scope";

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
	// Fuera del MVP editorial esta sección no se publica.
	blockOutsideEditorialScope();
	return children;
}
