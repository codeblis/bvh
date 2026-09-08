import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Actualizar contraseña | BVH",
	robots: { index: false, follow: false },
};

export default function ActualizarPasswordLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
