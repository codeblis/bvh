import type { Metadata } from "next";
import { blockOutsideEditorialScope } from "@/lib/scope";

export const metadata: Metadata = {
	title: "Actualizar contraseña | BVH",
	robots: { index: false, follow: false },
};

export default function ActualizarPasswordLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Depende del envío de correo, que este alcance no tiene.
	blockOutsideEditorialScope();
	return children;
}
