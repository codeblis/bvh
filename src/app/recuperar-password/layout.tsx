import type { Metadata } from "next";
import { blockOutsideEditorialScope } from "@/lib/scope";

export const metadata: Metadata = {
	title: "Recuperar contraseña | BVH",
	alternates: { canonical: "/recuperar-password" },
	robots: { index: false, follow: true },
};

export default function RecuperarPasswordLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Depende del envío de correo, que este alcance no tiene.
	blockOutsideEditorialScope();
	return children;
}
