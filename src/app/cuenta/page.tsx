import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/bvh/SignOutButton";
import { SiteFooter } from "@/components/bvh/SiteFooter";
import { SiteHeader } from "@/components/bvh/SiteHeader";
import { blockOutsideEditorialScope } from "@/lib/scope";
import { createClient } from "@/lib/supabase/server";
import { listMyCourseEnrollments } from "@/modules/courses/enrollments.server";

export const metadata: Metadata = {
	title: "Mi cuenta | BVH",
	robots: { index: false, follow: false },
};

function formatDate(value: string | null, timeZone: string) {
	return value
		? new Date(value).toLocaleDateString("es-CU", {
				day: "2-digit",
				month: "long",
				year: "numeric",
				timeZone,
			})
		: "Fecha por confirmar";
}

export default async function CuentaPage() {
	// El historial propio es de cursos: fuera del MVP editorial no se publica.
	blockOutsideEditorialScope();
	if (
		!process.env.NEXT_PUBLIC_SUPABASE_URL ||
		!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
	) {
		redirect("/login?error=config");
	}

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) redirect("/login?callbackUrl=/cuenta");

	const enrollments = await listMyCourseEnrollments();

	return (
		<div className="min-h-screen bg-background text-foreground">
			<SiteHeader />
			<main className="mx-auto max-w-4xl px-6 py-16">
				<p className="text-xs uppercase tracking-[0.24em] text-primary">
					Área personal
				</p>
				<h1 className="mt-3 font-serif text-4xl">Tu cuenta BVH</h1>
				<div className="mt-8 rounded-2xl border border-border bg-card/60 p-6">
					<p className="text-sm text-muted-foreground">Sesión activa como</p>
					<p className="mt-1 font-medium">{user.email}</p>
					<div className="mt-6">
						<SignOutButton />
					</div>
				</div>

				<section className="mt-10">
					<h2 className="font-serif text-2xl">Tus cursos</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Inscripciones y estado actual.
					</p>
					{enrollments.length === 0 ? (
						<div className="mt-5 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
							Todavía no tienes cursos.{" "}
							<Link href="/instituto" className="text-primary hover:underline">
								Explorar catálogo
							</Link>
						</div>
					) : (
						<div className="mt-5 grid gap-4 sm:grid-cols-2">
							{enrollments.map((enrollment) => {
								return (
									<article
										key={enrollment.id}
										className="rounded-xl border border-border bg-card/60 p-5"
									>
										<p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
											{enrollment.status.replaceAll("_", " ")}
										</p>
										<h3 className="mt-2 font-serif text-lg">
											{enrollment.course_title}
										</h3>
										<p className="mt-2 text-xs text-muted-foreground">
											{formatDate(enrollment.starts_at, enrollment.timezone)} ·{" "}
											{enrollment.modality}
										</p>
										<p className="mt-2 text-xs text-muted-foreground">
											Edición {enrollment.offering_status}
										</p>
										{enrollment.course_status === "activo" ? (
											<Link
												href={`/instituto/cursos/${enrollment.course_slug}`}
												className="mt-4 inline-block text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
											>
												Ver curso
											</Link>
										) : null}
									</article>
								);
							})}
						</div>
					)}
				</section>
			</main>
			<SiteFooter />
		</div>
	);
}
