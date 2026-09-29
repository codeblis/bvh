"use client";
import { usePathname } from "next/navigation";
import { isEditorialScope } from "@/lib/scope";
import { LiveTicker } from "./LiveTicker";

export function LiveTickerWrapper() {
	const pathname = usePathname();
	// El ticker muestra cotizaciones simuladas. En el MVP editorial no hay
	// ninguna sección de mercado publicada, así que tampoco su escaparate:
	// un dato inventado en cada página es la promesa que no queremos hacer.
	if (isEditorialScope()) return null;
	if (
		pathname === "/login" ||
		pathname === "/registro" ||
		pathname.startsWith("/admin")
	) {
		return null;
	}
	return <LiveTicker />;
}
