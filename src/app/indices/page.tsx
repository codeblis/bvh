"use client";

import { useState, useMemo, useEffect } from "react";
import { PageHero } from "@/components/bvh/PageHero";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { Download, FileText, ArrowUp, ArrowDown } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface IndexDef {
  name: string;
  desc: string;
  seed: number;
  volatility: number;
}

const INDICES: IndexDef[] = [
  { name: "BVH General", desc: "Índice amplio que agrupa a todas las empresas listadas en la Bolsa de Valores de La Habana.", seed: 42, volatility: 0.8 },
  { name: "BVH Tecnología", desc: "Empresas del sector tecnológico y telecomunicaciones.", seed: 137, volatility: 1.2 },
  { name: "BVH Turismo", desc: "Hoteles, agencias de viajes y servicios turísticos.", seed: 256, volatility: 1.0 },
  { name: "BVH Agroindustria", desc: "Azúcar, tabaco, alimentos procesados y agroexportadoras.", seed: 73, volatility: 1.5 },
  { name: "BVH Energía", desc: "Petróleo, electricidad y energías renovables.", seed: 199, volatility: 0.9 },
  { name: "BVH Top 10", desc: "Las 10 empresas con mayor capitalización bursátil.", seed: 314, volatility: 0.7 },
];

type DataPoint = { date: string; value: number };
type Periodo = "1M" | "3M" | "6M" | "1A" | "YTD" | "Máx";
const PERIODOS: Periodo[] = ["1M", "3M", "6M", "1A", "YTD", "Máx"];

function generateHistory(idx: IndexDef): DataPoint[] {
  const rng = mulberry32(idx.seed);
  const start = new Date("2026-01-01");
  const today = new Date();
  const days = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const points: DataPoint[] = [];
  let value = 1000;
  for (let d = 0; d <= days; d++) {
    const date = new Date(start);
    date.setDate(date.getDate() + d);
    const change = (rng() - 0.48) * idx.volatility;
    value = value * (1 + change / 100);
    points.push({
      date: date.toISOString().slice(0, 10),
      value: parseFloat(value.toFixed(2)),
    });
  }
  return points;
}

const DATA_CACHE = new Map<number, DataPoint[]>();

function getHistory(idx: IndexDef): DataPoint[] {
  if (!DATA_CACHE.has(idx.seed)) {
    DATA_CACHE.set(idx.seed, generateHistory(idx));
  }
  return DATA_CACHE.get(idx.seed)!;
}

function filterByPeriod(data: DataPoint[], periodo: Periodo): DataPoint[] {
  if (periodo === "Máx") return data;
  const today = new Date();
  let start: Date;
  switch (periodo) {
    case "1M": start = new Date(today); start.setMonth(start.getMonth() - 1); break;
    case "3M": start = new Date(today); start.setMonth(start.getMonth() - 3); break;
    case "6M": start = new Date(today); start.setMonth(start.getMonth() - 6); break;
    case "1A": start = new Date(today); start.setFullYear(start.getFullYear() - 1); break;
    case "YTD": start = new Date(today.getFullYear(), 0, 1); break;
  }
  return data.filter((d) => new Date(d.date) >= start);
}

function getVariation(data: DataPoint[]): number {
  if (data.length < 2) return 0;
  const first = data[0].value;
  const last = data[data.length - 1].value;
  return parseFloat((((last - first) / first) * 100).toFixed(2));
}

function getLastValue(data: DataPoint[]): number {
  return data.length > 0 ? data[data.length - 1].value : 0;
}

function getDailyChange(data: DataPoint[]): number {
  if (data.length < 2) return 0;
  const prev = data[data.length - 2].value;
  const curr = data[data.length - 1].value;
  return parseFloat((((curr - prev) / prev) * 100).toFixed(2));
}

function getLookbackChange(data: DataPoint[], days: number): number {
  if (data.length < days + 1) return 0;
  const past = data[data.length - 1 - days].value;
  const curr = data[data.length - 1].value;
  return parseFloat((((curr - past) / past) * 100).toFixed(2));
}

interface SummaryRow {
  name: string;
  value: number;
  chgDay: number;
  chgWeek: number;
  chgMonth: number;
}

function computeSummaryRows(): SummaryRow[] {
  return INDICES.map((idx) => {
    const data = getHistory(idx);
    return {
      name: idx.name,
      value: getLastValue(data),
      chgDay: getDailyChange(data),
      chgWeek: getLookbackChange(data, 7),
      chgMonth: getLookbackChange(data, 30),
    };
  });
}

function getLiveHistory(idx: IndexDef, tick: number): DataPoint[] {
  if (tick === 0) return getHistory(idx);
  const data = getHistory(idx);
  if (data.length === 0) return data;
  const last = data[data.length - 1];
  let liveVal = last.value;
  for (let t = 1; t <= tick; t++) {
    const rng = mulberry32(idx.seed * 31 + t * 7);
    const change = (rng() - 0.5) * 0.4;
    liveVal = liveVal * (1 + change / 100);
  }
  liveVal = parseFloat(liveVal.toFixed(2));
  return [...data.slice(0, -1), { ...last, value: liveVal }];
}

function computeLiveSummaryRows(tick: number): SummaryRow[] {
  return INDICES.map((idx) => {
    const data = getLiveHistory(idx, tick);
    return {
      name: idx.name,
      value: getLastValue(data),
      chgDay: getDailyChange(data),
      chgWeek: getLookbackChange(data, 7),
      chgMonth: getLookbackChange(data, 30),
    };
  });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-CU", { day: "2-digit", month: "short" });
}

function formatValue(n: number) {
  return n.toLocaleString("es-CU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-background/95 px-3 py-2 shadow-[var(--shadow-elegant)] backdrop-blur text-[13px]">
      <div className="text-muted-foreground text-[11px]">{formatDate(label!)}</div>
      <div className="font-mono font-semibold text-foreground">{formatValue(payload[0].value)}</div>
    </div>
  );
}

export default function IndicesPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [periodo, setPeriodo] = useState<Periodo>("1A");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const index = INDICES[selectedIdx];
  const fullData = useMemo(() => getLiveHistory(index, tick), [index, tick]);
  const chartData = useMemo(() => filterByPeriod(fullData, periodo), [fullData, periodo]);
  const chgPeriod = useMemo(() => getVariation(chartData), [chartData]);
  const isUp = chgPeriod >= 0;
  const currentValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;

  const yDomain = useMemo(() => {
    if (chartData.length < 2) return [0, 2000];
    const vals = chartData.map((d) => d.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = (max - min) * 0.08;
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [chartData]);

  const summaryRows = useMemo(() => computeLiveSummaryRows(tick), [tick]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <PageHero
        eyebrow="Transparencia · Datos verificables"
        title={<>Índices <span className="italic text-primary">BVH</span></>}
        description="Consulte la evolución histórica de nuestros índices sectoriales y generales. Metodología abierta, datos auditables y actualización en tiempo real durante la sesión."
      />
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6">
            <div className="rounded-xl border border-border bg-card/60 p-6">
              <h3 className="font-serif text-xl text-foreground">Navegación</h3>
              <nav className="mt-4 space-y-1">
                {INDICES.map((i, idx) => (
                  <button
                    key={i.name}
                    onClick={() => setSelectedIdx(idx)}
                    type="button"
                    className={`w-full text-left rounded-md px-3 py-2 text-[13px] transition ${
                      selectedIdx === idx
                        ? "font-semibold text-foreground bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {i.name}
                  </button>
                ))}
              </nav>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-6">
              <h3 className="font-serif text-xl text-foreground">Metodología</h3>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                Los índices BVH se calculan bajo metodología de capitalización bursátil ajustada por flotante,
                revisada trimestralmente. La base es 1000 puntos al 1 de enero de 2026.
                <br /><br />
                <a href="/metodologia" className="text-primary hover:underline">Ver metodología completa →</a>
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-6">
              <h3 className="font-serif text-xl text-foreground">Descargas</h3>
              <div className="mt-3 space-y-2">
                <a href="/descargas/indices-bvh-mensual.csv" className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary">
                  <Download className="w-4 h-4" aria-hidden="true" />
                  CSV histórico (mensual)
                </a>
                <a href="/descargas/indices-bvh-anual.xlsx" className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary">
                  <Download className="w-4 h-4" aria-hidden="true" />
                  Excel histórico (anual)
                </a>
                <a href="/descargas/metodologia-indices-bvh.pdf" className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary">
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  Metodología (PDF)
                </a>
              </div>
            </div>
          </aside>

          <div className="space-y-8">
            <div className="rounded-xl border border-border bg-card/60 p-6">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-2xl text-foreground">{index.name}</h2>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--bvh-up)]/30 bg-[color:var(--bvh-up)]/10 px-2 py-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--bvh-up)] animate-pulse" />
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-[color:var(--bvh-up)]">Live</span>
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-muted-foreground">{index.desc}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {PERIODOS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriodo(p)}
                      type="button"
                      className={`rounded-md px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide transition ${
                        periodo === p
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Valor actual</div>
                  <div className="mt-1 font-mono text-3xl font-semibold text-foreground">{formatValue(currentValue)}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Variación ({periodo})</div>
                  <div className={`mt-1 font-mono text-3xl font-semibold ${isUp ? "text-[color:var(--bvh-up)]" : "text-[color:var(--bvh-down)]"}`}>
                    {isUp ? "+" : ""}{chgPeriod}%
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Actualizado</div>
                  <div className="mt-1 font-mono text-[13px] text-muted-foreground">Hoy, {new Date().toLocaleTimeString("es-CU", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
              <div className="mt-8 h-48 sm:h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
                    <defs>
                      <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isUp ? "var(--bvh-up)" : "var(--bvh-down)"} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={isUp ? "var(--bvh-up)" : "var(--bvh-down)"} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                      minTickGap={40}
                    />
                    <YAxis
                      domain={yDomain}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => v.toFixed(0)}
                      width={52}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={isUp ? "var(--bvh-up)" : "var(--bvh-down)"}
                      strokeWidth={2}
                      fill="url(#chartFill)"
                      dot={false}
                      activeDot={{ r: 4, fill: isUp ? "var(--bvh-up)" : "var(--bvh-down)", strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/60 p-6">
              <h3 className="font-serif text-xl text-foreground">Todos los índices — Resumen</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Índice</th>
                      <th className="px-4 py-3 text-right">Valor</th>
                      <th className="px-4 py-3 text-right">Var. día</th>
                      <th className="px-4 py-3 text-right">Var. semana</th>
                      <th className="px-4 py-3 text-right">Var. mes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono">
                    {summaryRows.map((r) => (
                      <tr key={r.name} className="transition-colors hover:bg-secondary/40">
                        <td className="px-4 py-3 font-sans text-foreground">{r.name}</td>
                        <td className="px-4 py-3 text-right text-foreground">{formatValue(r.value)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-block rounded-md px-2 py-1 text-[11px] ${r.chgDay >= 0 ? "bg-[color:var(--bvh-up)]/15 text-[color:var(--bvh-up)]" : "bg-[color:var(--bvh-down)]/15 text-[color:var(--bvh-down)]"}`}>
                            {r.chgDay >= 0 ? <><ArrowUp className="w-3 h-3 inline" aria-hidden="true" /> +</> : <><ArrowDown className="w-3 h-3 inline" aria-hidden="true" /> </>}{r.chgDay.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-block rounded-md px-2 py-1 text-[11px] ${r.chgWeek >= 0 ? "bg-[color:var(--bvh-up)]/15 text-[color:var(--bvh-up)]" : "bg-[color:var(--bvh-down)]/15 text-[color:var(--bvh-down)]"}`}>
                            {r.chgWeek >= 0 ? <><ArrowUp className="w-3 h-3 inline" aria-hidden="true" /> +</> : <><ArrowDown className="w-3 h-3 inline" aria-hidden="true" /> </>}{r.chgWeek.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-block rounded-md px-2 py-1 text-[11px] ${r.chgMonth >= 0 ? "bg-[color:var(--bvh-up)]/15 text-[color:var(--bvh-up)]" : "bg-[color:var(--bvh-down)]/15 text-[color:var(--bvh-down)]"}`}>
                            {r.chgMonth >= 0 ? <><ArrowUp className="w-3 h-3 inline" aria-hidden="true" /> +</> : <><ArrowDown className="w-3 h-3 inline" aria-hidden="true" /> </>}{r.chgMonth.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 border-t border-border pt-3 text-[10px] uppercase tracking-widest text-muted-foreground/70">
                Datos simulados con fines demostrativos · BVH © 2026
              </div>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
