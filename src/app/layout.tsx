import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LiveTickerWrapper } from "@/components/bvh/LiveTickerWrapper";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BVH | Bolsa de Valores de La Habana",
  description: "Bolsa de Valores de La Habana: la plataforma independiente que profesionaliza el empresariado cubano, genera transparencia y conecta talento con capital.",
  openGraph: {
    title: "BVH · Bolsa de Valores de La Habana",
    description: "Bolsa de Valores de La Habana: la plataforma independiente que profesionaliza el empresariado cubano, genera transparencia y conecta talento con capital.",
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
      lang="es"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        playfairDisplay.variable,
        "dark"
      )}
    >
      <body className="min-h-full flex flex-col">
        <LiveTickerWrapper />
        {children}
      </body>
    </html>
  );
}