"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/bvh/Logo";
import { ThemeToggle } from "@/components/bvh/ThemeToggle";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { getSafeAuthRedirect } from "@/lib/safe-redirect";
import { isEditorialScope } from "@/lib/scope";
import { Suspense } from "react";

const SIN_CONFIGURAR =
	"Este sitio no tiene configurado su acceso a la base de datos, así que no hay dónde validar las credenciales. No es tu contraseña: falta NEXT_PUBLIC_SUPABASE_URL en el build.";

function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = getSafeAuthRedirect(searchParams.get("callbackUrl"));
	const notice =
		searchParams.get("registered") === "true"
			? "Solicitud recibida. Revisa tu correo si se requiere confirmación. Si ya tienes cuenta, inicia sesión."
			: searchParams.get("passwordUpdated") === "true"
				? "Contraseña actualizada. Ya puedes iniciar sesión."
				: "";
	const queryError = searchParams.get("error");

	const [form, setForm] = useState({
		email: "",
		password: "",
		remember: false,
	});
	/**
	 * Sin configuración no es que las credenciales fallen: es que no hay a quién
	 * preguntarle. Decirlo aparte importa porque el mensaje genérico manda a
	 * revisar la contraseña, y eso hace perder horas buscando en el sitio
	 * equivocado. Pasó. Y se dice al cargar, no al enviar: el botón está
	 * deshabilitado, así que nadie llegaría a ver el aviso.
	 */
	const configurado = hasSupabaseConfig();

	const [error, setError] = useState(configurado ? "" : SIN_CONFIGURAR);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		if (!configurado) {
			setError(SIN_CONFIGURAR);
			setLoading(false);
			return;
		}

		try {
			const supabase = createClient();
			const { error: authError } = await supabase.auth.signInWithPassword({
				email: form.email,
				password: form.password,
			});
			if (authError) throw authError;
			router.push(callbackUrl);
			router.refresh();
		} catch {
			setError(
				"No pudimos iniciar sesión. Revisa tus datos y la confirmación del correo, o inténtalo más tarde.",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm((prev) => ({
			...prev,
			[e.target.name]:
				e.target.type === "checkbox" ? e.target.checked : e.target.value,
		}));
	};

	return (
		<div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12 md:py-16">
			<div className="w-full max-w-md">
				<div className="text-center mb-10">
					<Link
						href="/"
						className="inline-flex items-center gap-3 text-primary mb-6"
					>
						<Logo className="h-10 w-10" />
						<div className="leading-tight text-left">
							<div className="font-serif text-[18px] font-semibold text-foreground">
								Bolsa de Valores
							</div>
							<div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
								de La Habana
							</div>
						</div>
					</Link>
					<h1 className="font-serif text-3xl font-semibold text-foreground">
						Iniciar sesión
					</h1>
					<p className="mt-2 text-muted-foreground">
						Accede a tu dashboard, cursos y empresas registradas
					</p>
				</div>

				<div className="rounded-2xl border border-border bg-card/60 p-4 sm:p-8 shadow-[var(--shadow-elegant)] backdrop-blur">
					{error && (
						<div
							className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-[13px] text-destructive"
							role="alert"
						>
							{error}
						</div>
					)}
					{!error && queryError && (
						<div
							className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-[13px] text-destructive"
							role="alert"
						>
							{queryError === "config"
								? "La autenticación todavía no está configurada en este entorno."
								: "No pudimos completar el acceso. Inténtalo nuevamente."}
						</div>
					)}
					{notice && (
						<div
							className="mb-6 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-[13px] text-foreground"
							role="status"
						>
							{notice}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-5" noValidate>
						<div>
							<label
								htmlFor="email"
								className="block mb-1.5 text-[12px] font-medium text-foreground"
							>
								Email
							</label>
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
								<label
									htmlFor="password"
									className="text-[12px] font-medium text-foreground"
								>
									Contraseña
								</label>
								{/* Recuperar la contraseña se hace por correo; sin correo, el
								    enlace llevaría a un 404. La restablece quien administra
								    el proyecto Supabase. */}
								{isEditorialScope() ? null : (
									<Link
										href="/recuperar-password"
										className="text-[11px] text-primary hover:underline"
									>
										¿Olvidaste tu contraseña?
									</Link>
								)}
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
							<label
								htmlFor="remember"
								className="text-[13px] text-muted-foreground"
							>
								Recordarme
							</label>
						</div>
						<button
							type="submit"
							disabled={loading || !configurado}
							className="w-full rounded-md bg-primary px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-[var(--shadow-gold)] transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Entrando..." : "Iniciar sesión"}
						</button>
					</form>

					{isEditorialScope() ? null : (
						<p className="mt-6 text-center text-[13px] text-muted-foreground">
							¿No tienes cuenta?{" "}
							<Link
								href="/registro"
								className="text-primary hover:underline font-medium"
							>
								Regístrate
							</Link>
						</p>
					)}
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
		<Suspense
			fallback={
				<div className="min-h-screen bg-background flex items-center justify-center">
					Cargando...
				</div>
			}
		>
			<LoginForm />
		</Suspense>
	);
}
