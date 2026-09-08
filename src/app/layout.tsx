import type { Metadata } from "next";
import "./globals.css";
import { LiveTickerWrapper } from "@/components/bvh/LiveTickerWrapper";

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL ?? "https://bolsadelahabana.com",
	),
	title: "BVH | Bolsa de Valores de La Habana",
	description:
		"Bolsa de Valores de La Habana: la plataforma independiente que profesionaliza el empresariado cubano, genera transparencia y conecta talento con capital.",
	openGraph: {
		title: "BVH · Bolsa de Valores de La Habana",
		description:
			"Bolsa de Valores de La Habana: la plataforma independiente que profesionaliza el empresariado cubano, genera transparencia y conecta talento con capital.",
		url: "/",
		siteName: "Bolsa de Valores de La Habana",
		images: [
			{
				url: "/logo.png",
				width: 500,
				height: 700,
				alt: "Bolsa de Valores de La Habana",
			},
		],
		locale: "es_ES",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "BVH, Bolsa de Valores de La Habana",
		description: "La casa del emprendedor cubano.",
		images: ["/logo.svg"],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es" className="h-full antialiased dark">
			<body className="min-h-full flex flex-col">
				<LiveTickerWrapper />
				{children}
			</body>
		</html>
	);
}
