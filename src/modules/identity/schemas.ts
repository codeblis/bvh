import { z } from "zod";

export const emailSchema = z
	.string()
	.trim()
	.email("Introduce un email válido.")
	.max(254)
	.toLowerCase();
export const passwordSchema = z
	.string()
	.min(8, "La contraseña debe tener al menos 8 caracteres.")
	.max(128, "La contraseña es demasiado larga.");
export const registrationSchema = z
	.object({
		nombre: z.string().trim().min(2, "Introduce tu nombre completo.").max(120),
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: z.string(),
		tipo: z.enum(["individual", "empresa"]),
		aceptaTerminos: z.literal(true, {
			error: "Debes aceptar los términos y condiciones.",
		}),
		newsletter: z.boolean().default(false),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Las contraseñas no coinciden.",
		path: ["confirmPassword"],
	});
export const passwordUpdateSchema = z
	.object({
		password: passwordSchema,
		confirmation: z.string(),
	})
	.refine((data) => data.password === data.confirmation, {
		message: "Las contraseñas no coinciden.",
		path: ["confirmation"],
	});
