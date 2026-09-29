# Flujo de desarrollo y entrega

**Estado:** Objetivo; capacidades actuales parciales  
**Última revisión:** 2026-09-05

## 1. Principios

- `main` es la línea canónica.
- Todo cambio parte de estado conocido, tiene alcance pequeño y deja evidencia.
- Preview y producción no comparten base, secretos ni datos personales.
- Migrar o desplegar no está implícitamente autorizado por editar código.
- La rama o el panel no reemplazan los gates automáticos.

## 2. Estado actual

- **Actual:** `pnpm check` encadena lint, tipos, pruebas y build.
- **Actual:** `pnpm preview` construye y ejecuta OpenNext localmente.
- **Actual:** `pnpm deploy` exige la rama `production` y despliega el entorno `app`.
- **Actual:** OpenSpec 1.12.0 está inicializado con schema `spec-driven` y skills de Codex bajo `.agents/`.
- **Actual:** `deliver-v1-core-platform` captura el contrato y las tareas de la V1 iniciada antes de adoptar OpenSpec.
- **Pendiente:** alinear ese script con `main` y el flujo de promoción aceptado en ADR-012.
- **Pendiente:** preview aislado con Supabase, secretos, correo y dominio propios.
- **Pendiente:** integración y E2E; hoy el gate no los contiene.

## Ciclo OpenSpec

1. Explorar el problema sin editar implementación cuando todavía falte definirlo.
2. Crear un cambio con proposal, specs delta, design cuando aplique y tasks verificables.
3. Revisar y validar el cambio antes de implementar.
4. Aplicar tareas en orden; marcar una tarea solo después de satisfacer su verificación.
5. Si aparece una decisión que cambia alcance o comportamiento, actualizar los artefactos antes de continuar.
6. Ejecutar gates locales, integración, E2E y preview proporcionales al riesgo.
7. Sincronizar y archivar únicamente después de completar evidencia y aceptación.

Comandos de comprobación:

```bash
openspec status --change <cambio>
openspec validate <cambio> --strict --no-interactive
openspec validate --all --strict --no-interactive
```

La validación OpenSpec comprueba el contrato documental. No prueba Postgres, RLS, navegador, proveedor de correo ni despliegue.

## 3. Clasificación por riesgo

| Riesgo | Ejemplos | Gate mínimo |
| --- | --- | --- |
| Bajo | texto, estilo aislado, documentación | lint relevante, revisión visual/enlaces |
| Medio | componente, consulta, formulario sin PII | unitarias, tipos, lint, build, preview |
| Alto | auth, RLS, migración, roles, correo, PII, deploy | todo lo anterior + integración, E2E, revisión de seguridad, rollback y aprobación |

## 4. Ramas y commits

- Rama: `codex/<tema>` o `<tipo>/<tema>` según herramienta/equipo.
- No mezclar refactor amplio con una corrección crítica.
- Commits atómicos con intención verificable.
- Antes de trabajar: `git status --short --branch`; cambios preexistentes se preservan.
- Ningún secreto, respaldo o `.env` entra al commit.

## 5. Flujo normal

1. Confirmar requisito y SPEC/ADR afectado; crear o seleccionar el cambio OpenSpec.
2. Revisar proposal, specs, design y tareas antes de aplicar.
3. Capturar estado de Git y riesgos.
4. Implementar con migración compatible y pruebas, marcando tareas verificadas.
5. Ejecutar gates locales y validación OpenSpec estricta.
6. Revisar diff, accesibilidad, seguridad y estados de error.
7. Desplegar preview aislado con autorización.
8. Ejecutar aceptación funcional con datos sintéticos.
9. Registrar evidencia y actualizar documentación/relevo.
10. Promover exactamente el commit aprobado; observar y revertir si corresponde.
11. Sincronizar y archivar el cambio solo cuando su Definition of Done esté satisfecha.

## 6. Gates locales

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
openspec validate --all --strict --no-interactive
```

`pnpm check` resume esos comandos, pero no reemplaza pruebas de integración/E2E. El build debe funcionar sin depender de descargar Google Fonts en el momento de compilación o debe existir un mecanismo reproducible aprobado.

Para cambios de base:

- revisar SQL y políticas por rol;
- probar migración ascendente en base desechable;
- comprobar datos existentes y restricciones;
- preparar rollback o migración correctiva;
- regenerar tipos y revisar diff.

## 7. Gate de preview

- URL y commit identificables.
- Base y Storage no productivos.
- Resend en modo/dominio de prueba.
- Auth callback apunta al preview.
- Smoke: home, noticias, blog, curso, registro/login, CMS por rol, formularios.
- Sin PII productiva ni secretos en logs.
- Criterios de la SPEC afectada con evidencia.

## 8. Producción

Requiere autorización explícita, backup verificable, migración revisada, rollback preparado y commit aprobado. Después:

- confirmar dominio/TLS y health;
- ejecutar smoke sin operaciones irreversibles;
- revisar errores, latencia y efectos externos;
- registrar fecha, operador, commit, migraciones y resultado en [Infraestructura](INFRAESTRUCTURA.md) o ticket enlazado.

## 9. Rollback y hotfix

- Código: redeploy del último artefacto/commit estable.
- Base: preferir migración correctiva; no borrar datos para “volver atrás”.
- Contenido: despublicar/archivar, no eliminar historial.
- Credencial: revocar/rotar antes de corregir referencias.
- Hotfix parte del estado productivo, modifica solo lo necesario y luego se incorpora a `main`.

## 10. Definition of Done

- SPEC y aceptación satisfechas.
- Gates proporcionales pasan.
- Seguridad, accesibilidad y errores revisados.
- Migraciones, variables y operación documentadas sin valores secretos.
- Preview aprobado; producción verificada si fue parte del encargo.
- Rollback y responsable claros.
- `docs/relevo.md` refleja pendientes reales.
- El cambio OpenSpec queda sincronizado y archivado solo si todas sus tareas están realmente completas.
