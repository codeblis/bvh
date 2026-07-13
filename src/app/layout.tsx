import type { Metadata } from "next";
import { Geist, Geist_Mono, Raleway, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const playfairDisplayHeading = Playfair_Display({
	subsets: ["latin"],
	variable: "--font-heading",
});

const raleway = Raleway({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "BVH | Bolsa de Valores de La Habana",

	description: "La casa del emprendedor cubano.",

	openGraph: {
		title: "BVH | Bolsa de Valores de La Habana",

		description: "La casa del emprendedor cubano.",

		url: "https://bolsadelahabana.com/",

		siteName: "Bolsa de Valores de La Habana",

		images: [
			{
				url: "https://bolsadelahabana.com/logo.png",

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

		images: ["https://bolsadelahabana.com/logo.svg"],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={cn(
				"h-full",
				"antialiased",
				geistSans.variable,
				geistMono.variable,
				"font-sans",
				raleway.variable,
				playfairDisplayHeading.variable,
			)}
		>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	);
}
