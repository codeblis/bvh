"use client";

import { useEffect, useMemo, useState } from "react";

type Tick = { id: string; sym: string; name: string; sector: string; price: number; change: number; vol: string };

const INITIAL: Tick[] = [
  { id: "1", sym: "AZCUBA", name: "Grupo Empresarial AZCUBA", sector: "Agroindustria", price: 142.5, change: 2.3, vol: "18,450" },
  { id: "2", sym: "ETECSA", name: "Empresa de Telecomunicaciones", sector: "Tecnología", price: 89.2, change: 0.8, vol: "32,100" },
  { id: "3", sym: "CIMEX", name: "CIMEX S.A.", sector: "Comercio", price: 67.8, change: -1.2, vol: "9,870" },
  { id: "4", sym: "GAESA", name: "Administración Empresarial", sector: "Conglomerado", price: 215.0, change: 3.1, vol: "5,200" },
  { id: "5", sym: "BFI", name: "Banco Financiero Internacional", sector: "Banca", price: 45.6, change: -0.5, vol: "6,410" },
  { id: "6", sym: "CUBACAB", name: "Cubacar S.A.", sector: "Transporte", price: 33.4, change: 1.7, vol: "2,980" },
  { id: "7", sym: "ISLAZUL", name: "Cadena Islazul", sector: "Turismo", price: 58.9, change: 0.4, vol: "7,640" },
  { id: "8", sym: "CUBANA", name: "Cubana de Aviación", sector: "Aeronáutica", price: 121.3, change: -2.8, vol: "3,120" },
  { id: "9", sym: "TRD", name: "TRD Caribe", sector: "Comercio", price: 76.5, change: 1.1, vol: "4,780" },
  { id: "10", sym: "CUPET", name: "Unión Cuba-Petróleo", sector: "Energía", price: 188.7, change: -0.9, vol: "14,300" },
];

export function LiveTicker() {
  const [rows, setRows] = useState<Tick[]>(INITIAL);
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const t = () => {
      const d = new Date();
      setNow(d.toLocaleTimeString("es-CU", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    t();
    const clock = setInterval(t, 1000);
    const tick = setInterval(() => {
      setRows((prev) =>
        prev.map((r) => {
          const drift = (Math.random() - 0.5) * 0.6;
          const price = Math.max(1, +(r.price + drift).toFixed(2));
          const change = +(r.change + (Math.random() - 0.5) * 0.4).toFixed(2);
          return { ...r, price, change };
        }),
      );
    }, 2600);
    return () => {
      clearInterval(clock);
      clearInterval(tick);
    };
  }, []);

  const doubled = useMemo(() => [...rows, ...rows], [rows]);

  return (
    <div className="border-b border-border bg-card/80 backdrop-blur">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex shrink-0 items-center gap-2 border-r border-border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-primary">
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          BVH Live · <span className="tabular-nums">{now}</span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="ticker-track flex w-max gap-8 py-2.5 text-[12px] font-mono">
            {doubled.map((r, i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap">
                <span className="font-semibold tracking-wider text-foreground">{r.sym}</span>
                <span className="text-muted-foreground">{r.price.toFixed(2)}</span>
                <span className={r.change >= 0 ? "text-[color:var(--bvh-up)]" : "text-[color:var(--bvh-down)]"}>
                  {r.change >= 0 ? "▲" : "▼"} {r.change >= 0 ? "+" : ""}
                  {r.change.toFixed(2)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
