"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/bvh/Logo";
import { ThemeToggle } from "@/components/bvh/ThemeToggle";
import { User, Building2 } from "lucide-react";

type FormData = {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
  tipo: "individual" | "empresa";
  aceptaTerminos: boolean;
  newsletter: boolean;
};

const initialForm: FormData = {
  nombre: "",
  email: "",
  password: "",
  confirmPassword: "",
  tipo: "individual",
  aceptaTerminos: false,
  newsletter: true,
};

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!form.aceptaTerminos) {
      setError("Debes aceptar los términos y condiciones");
      return;
    }

    setLoading(true);
    try {
      // TODO: Integrar con Supabase Auth
      // const { error } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { nombre: form.nombre, tipo: form.tipo } } });
      // if (error) throw error;

      await new Promise((r) => setTimeout(r, 1000));
      router.push("/login?registered=true");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error en el registro");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 text-primary mb-6">
            <Logo className="h-10 w-10" />
            <div className="leading-tight text-left">
              <div className="font-serif text-[18px] font-semibold text-foreground">Bolsa de Valores</div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">de La Habana</div>
            </div>
          </Link>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Crear cuenta</h1>
          <p className="mt-2 text-muted-foreground">Únete a la comunidad BVH: cursos, índices, red de inversores y más</p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 sm:p-8 shadow-[var(--shadow-elegant)] backdrop-blur">
          {error && (
            <div className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-[13px] text-destructive" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="nombre" className="block mb-1.5 text-[12px] font-medium text-foreground">Nombre completo *</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                autoComplete="name"
                value={form.nombre}
                onChange={handleChange}
                className="w-full rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
                placeholder="Juan Pérez García"
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-1.5 text-[12px] font-medium text-foreground">Email *</label>
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
              <label htmlFor="password" className="block mb-1.5 text-[12px] font-medium text-foreground">Contraseña *</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block mb-1.5 text-[12px] font-medium text-foreground">Confirmar contraseña *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
                placeholder="Repite tu contraseña"
              />
            </div>

            <fieldset>
              <legend className="block mb-2 text-[12px] font-medium text-foreground">Me registro como *</legend>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <label htmlFor="tipo-individual" className={`relative cursor-pointer rounded-xl border-2 p-4 transition ${form.tipo === "individual" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                  <input
                    id="tipo-individual"
                    type="radio"
                    name="tipo"
                    value="individual"
                    checked={form.tipo === "individual"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <User className="w-6 h-6" aria-hidden="true" />
                    <span className="font-medium text-foreground">Individual</span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">Inversor, estudiante, profesional</div>
                </label>
                <label htmlFor="tipo-empresa" className={`relative cursor-pointer rounded-xl border-2 p-4 transition ${form.tipo === "empresa" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                  <input
                    id="tipo-empresa"
                    type="radio"
                    name="tipo"
                    value="empresa"
                    checked={form.tipo === "empresa"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6" aria-hidden="true" />
                    <span className="font-medium text-foreground">Empresa / MIPYME</span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">Registro para cotizar (RIE-BVH)</div>
                </label>
              </div>
            </fieldset>

            <div className="flex items-start gap-3">
              <input
                id="aceptaTerminos"
                name="aceptaTerminos"
                type="checkbox"
                required
                checked={form.aceptaTerminos}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
              />
              <label htmlFor="aceptaTerminos" className="text-[13px] text-muted-foreground">
                Acepto los <Link href="/terminos" className="text-primary hover:underline">términos y condiciones</Link> y la <Link href="/privacidad" className="text-primary hover:underline">política de privacidad</Link> de BVH. *
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="newsletter"
                name="newsletter"
                type="checkbox"
                checked={form.newsletter}
                onChange={handleChange}
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
              />
              <label htmlFor="newsletter" className="text-[13px] text-muted-foreground">
                Recibir newsletter institucional mensual (opcional)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-[var(--shadow-gold)] transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">Inicia sesión</Link>
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