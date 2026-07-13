"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";

function getTimeRemaining(target: Date) {
  const total = target.getTime() - Date.now();

  if (total <= 0) {
    return {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    };
  }

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export default function Home() {
  const targetDate = new Date(process.env.NEXT_PUBLIC_LAUNCH_DATE!);
  const [time, setTime] = useState(getTimeRemaining(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      {/* Fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1e3a8a,transparent_60%)]" />

      <div className="absolute inset-0 bg-grid-white/[0.03]" />

      {/* Contenido */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <Image src="/logo_dark.svg" alt="Logo" width={120} height={120} className=""/>
        <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-1 text-sm text-blue-300 backdrop-blur">
          🚀 Próximamente
        </span>
        <h1 className="mt-8 text-5xl font-bold tracking-tight md:text-7xl">
          Estamos construyendo algo increíble
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-neutral-400">
          Nuestro sitio estará disponible muy pronto. Estamos ultimando los
          detalles para ofrecerte una mejor experiencia.
        </p>

        {/* Countdown */}
        <div className="mt-14 grid grid-cols-2 gap-5 md:grid-cols-4">
          <TimeCard value={time.days} label="Días" />
          <TimeCard value={time.hours} label="Horas" />
          <TimeCard value={time.minutes} label="Minutos" />
          <TimeCard value={time.seconds} label="Segundos" />
        </div>
      </div>
    </main>
  );
}

function TimeCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="text-5xl font-bold">{value}</div>
      <div className="mt-2 text-sm uppercase tracking-widest text-neutral-400">
        {label}
      </div>
    </div>
  );
}