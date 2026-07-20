"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/bvh/Logo";
import { ThemeToggle } from "@/components/bvh/ThemeToggle";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // TODO: Integrar con Supabase Auth
      // const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      // if (error) throw error;
      // router.push(callbackUrl);

      // Simulación
      await new Promise((r) => setTimeout(r, 1000));
      router.push(callbackUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12 md:py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 text-primary mb-6">
            <Logo className="h-10 w-10" />
            <div className="leading-tight text-left">
              <div className="font-serif text-[18px] font-semibold text-foreground">Bolsa de Valores</div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">de La Habana</div>
            </div>
          </Link>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Iniciar sesión</h1>
          <p className="mt-2 text-muted-foreground">Accede a tu dashboard, cursos y empresas registradas</p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 sm:p-8 shadow-[var(--shadow-elegant)] backdrop-blur">
          {error && (
            <div className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-[13px] text-destructive" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block mb-1.5 text-[12px] font-medium text-foreground">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
                placeholder="tu@correo.cu"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-[12px] font-medium text-foreground">Contraseña</label>
                <Link href="/recuperar-password" className="text-[11px] text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={form.remember}
                onChange={handleChange}
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
              />
              <label htmlFor="remember" className="text-[13px] text-muted-foreground">Recordarme</label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-[var(--shadow-gold)] transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card/60 text-muted-foreground">O continúa con</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-background/40 text-foreground shadow-[var(--shadow-elegant)] backdrop-blur-md transition hover:bg-background/60 hover:border-primary/40" disabled={loading} aria-label="Google">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              </button>
              <button type="button" className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-background/40 text-foreground shadow-[var(--shadow-elegant)] backdrop-blur-md transition hover:bg-background/60 hover:border-primary/40" disabled={loading} aria-label="Apple">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.67-.79 1.87-1.26 2.74-1.33.1 1.04-.31 2.08-.93 2.8-.63.72-1.65 1.24-2.66 1.19-.1-1.06.28-2.06.85-2.66z"/></svg>
              </button>
              <button type="button" className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-background/40 text-foreground shadow-[var(--shadow-elegant)] backdrop-blur-md transition hover:bg-background/60 hover:border-primary/40" disabled={loading} aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </button>
              <button type="button" className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-background/40 text-foreground shadow-[var(--shadow-elegant)] backdrop-blur-md transition hover:bg-background/60 hover:border-primary/40" disabled={loading} aria-label="X">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </button>
              <button type="button" className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-background/40 text-foreground shadow-[var(--shadow-elegant)] backdrop-blur-md transition hover:bg-background/60 hover:border-primary/40" disabled={loading} aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="text-primary hover:underline font-medium">Regístrate</Link>
          </p>
        </div>

        <div className="hidden lg:block fixed bottom-4 right-4">
          <ThemeToggle />
        </div>
        <div className="lg:hidden flex justify-center mt-6">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}