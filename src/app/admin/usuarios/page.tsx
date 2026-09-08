import { requireAdmin } from "@/lib/admin";
import {
	AdminPageHeader,
	EmptyState,
	FormBanner,
	table,
	tableWrap,
	td,
	th,
} from "../_ui";
import { ConfirmSubmitButton } from "../ConfirmSubmitButton";
import { updateProfileRole } from "./actions";

const PAGE_SIZE = 100;

const errorMessages: Record<string, string> = {
	invalid: "Cuenta o rol inválido.",
	save: "No se pudo cambiar el rol. Inténtalo nuevamente.",
	forbidden: "Tu sesión ya no tiene permiso para cambiar roles.",
	self: "No puedes cambiar tu propio rol: pídeselo a otra persona administradora.",
	"not-found": "Esa cuenta ya no existe.",
};

const successMessages: Record<string, string> = {
	admin: "La cuenta ahora es administradora.",
	usuario: "La cuenta ya no es administradora.",
};

function fmt(value: string | null) {
	return value ? new Date(value).toLocaleDateString("es") : "—";
}

export default async function UsuariosPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string; saved?: string; q?: string }>;
}) {
	const query = await searchParams;
	const search = (query.q ?? "").trim();
	const { supabase, user } = await requireAdmin();

	let request = supabase
		.from("profiles")
		.select("id, email, full_name, role, created_at")
		.order("created_at", { ascending: false })
		.limit(PAGE_SIZE);
	if (search) {
		const term = `%${search.replaceAll("%", "").replaceAll(",", " ")}%`;
		request = request.or(`email.ilike.${term},full_name.ilike.${term}`);
	}
	const { data, error } = await request;
	if (error)
		throw new Error(`No se pudieron cargar las cuentas: ${error.message}`);
	const rows = data ?? [];
	const admins = rows.filter((row) => row.role === "admin").length;

	return (
		<div>
			<FormBanner
				error={query.error}
				success={query.saved}
				errorMessages={errorMessages}
				successMessages={successMessages}
			/>
			<AdminPageHeader
				title="Usuarios y roles"
				description={`${rows.length} cuenta(s) mostradas, ${admins} con rol administrador. El listado se limita a ${PAGE_SIZE} y se filtra por búsqueda.`}
			/>

			<form method="get" className="mb-5 flex flex-wrap gap-2">
				<label htmlFor="q" className="sr-only">
					Buscar por correo o nombre
				</label>
				<input
					id="q"
					name="q"
					defaultValue={search}
					placeholder="Buscar por correo o nombre"
					className="w-full max-w-sm rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
				/>
				<button
					type="submit"
					className="rounded-md border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:border-primary hover:text-primary"
				>
					Buscar
				</button>
			</form>

			{rows.length === 0 ? (
				<EmptyState>
					{search
						? "Ninguna cuenta coincide con esa búsqueda."
						: "Todavía no hay cuentas registradas."}
				</EmptyState>
			) : (
				<div className={tableWrap}>
					<table className={table}>
						<thead>
							<tr>
								<th className={th}>Cuenta</th>
								<th className={th}>Alta</th>
								<th className={th}>Rol</th>
								<th className={th} />
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => {
								const isSelf = row.id === user.id;
								const isAdmin = row.role === "admin";
								return (
									<tr key={row.id}>
										<td className={td}>
											<div className="font-medium">{row.full_name || "—"}</div>
											<div className="text-muted-foreground">{row.email}</div>
										</td>
										<td className={`${td} whitespace-nowrap`}>
											{fmt(row.created_at)}
										</td>
										<td className={td}>
											<span
												className={
													isAdmin ? "text-primary" : "text-muted-foreground"
												}
											>
												{isAdmin ? "Administrador" : "Usuario"}
											</span>
										</td>
										<td className={td}>
											{isSelf ? (
												<span className="text-xs text-muted-foreground">
													Tu propia cuenta
												</span>
											) : (
												<form action={updateProfileRole}>
													<input type="hidden" name="id" value={row.id} />
													<input
														type="hidden"
														name="role"
														value={isAdmin ? "usuario" : "admin"}
													/>
													<ConfirmSubmitButton
														message={
															isAdmin
																? `Retirar el rol de administrador a ${row.email}. Perderá el acceso al panel.`
																: `Dar rol de administrador a ${row.email}. Podrá gestionar todo el contenido, las solicitudes y los roles.`
														}
														className="text-xs text-primary hover:underline"
													>
														{isAdmin
															? "Quitar administrador"
															: "Hacer administrador"}
													</ConfirmSubmitButton>
												</form>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
