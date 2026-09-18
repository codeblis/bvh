import type { Metadata } from "next";

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
	return children;
}
