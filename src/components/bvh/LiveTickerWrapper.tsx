"use client";
import { usePathname } from "next/navigation";
import { LiveTicker } from "./LiveTicker";

export function LiveTickerWrapper() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/registro") return null;
  return <LiveTicker />;
}
