import type { Metadata } from "next";

// Las páginas de identidad no son destino de búsqueda: llevan título propio
// y canonical, pero se quedan fuera del índice como `actualizar-password`.
export const metadata: Metadata = {
	title: "Iniciar sesión | BVH",
	alternates: { canonical: "/login" },
	robots: { index: false, follow: true },
};

export default function LoginLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
