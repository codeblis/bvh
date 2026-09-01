import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/bvh/SignOutButton";
import { requireAdmin } from "@/lib/admin";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = {
	title: "Panel · BVH",
	robots: { index: false, follow: false },
};

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user } = await requireAdmin();

	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="border-b border-border bg-background/85 backdrop-blur">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
					<Link href="/admin" className="font-serif text-lg font-semibold">
						BVH · Panel
					</Link>
					<div className="flex items-center gap-4 text-xs text-muted-foreground">
						<span className="hidden sm:inline">{user.email}</span>
						<Link href="/" className="hover:text-foreground">
							Ver sitio
						</Link>
						<SignOutButton />
					</div>
				</div>
			</header>
			<div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 md:flex-row">
				<AdminNav />
				<main className="min-w-0 flex-1">{children}</main>
			</div>
		</div>
	);
}
