# Runbook de operación BVH

**Estado:** Objetivo; validar antes de producción  
**Última revisión:** 2026-09-04  
**Regla:** no contiene secretos

## 1. Antes de operar

- Confirmar entorno y dominio visibles.
- Confirmar rol y motivo de acceso.
- Usar datos sintéticos en preview.
- Para producción, registrar ticket/cambio y rollback.
- No usar Supabase Studio como flujo editorial normal.

Los accesos de emergencia, propietarios y canales deben registrarse en un gestor autorizado, no en Git.

## 2. Publicar noticia o blog

1. Entrar al CMS y elegir tipo correcto.
2. Completar título, slug, extracto, categoría, Markdown, portada y alt.
3. Guardar borrador; confirmar mensaje real de persistencia.
4. Abrir preview autenticado y revisar móvil, escritorio, enlaces, headings y metadata.
5. Publicar; anotar actor y fecha.
6. Verificar índice, detalle, canonical, sitemap y ausencia en el módulo contrario.
7. Si falla, despublicar; conservar el registro y revisar logs/request ID.

## 3. Despublicar o corregir contenido

- Corrección menor: editar, guardar y verificar invalidación.
- Error material/legal: despublicar primero, verificar 404/noindex y luego corregir.
- No borrar salvo obligación documentada. Conservar auditoría.
- Si cambió slug publicado, crear plan de redirección antes de retirar el anterior.

## 4. Crear curso y oferta

1. Crear/editar catálogo en borrador.
2. Crear oferta con zona horaria, modalidad, fechas, moneda, precio y cupo.
3. Validar coherencia y contenido público; nunca publicar URL privada de clase.
4. Activar curso y abrir oferta.
5. Verificar catálogo, detalle e inscripción con usuario de prueba.
6. Verificar idempotencia y decremento/cálculo atómico de cupo.

Cerrar o cancelar no elimina inscripciones. Registrar motivo, estado y notificación.

## 5. Gestionar inscripción

- Buscar por identificador/email solo con rol permitido.
- Cambiar estado; confirmar auditoría.
- Si email falló, reintentar una vez desde acción idempotente y revisar resultado.
- No exportar PII salvo necesidad aprobada. Neutralizar fórmulas CSV y registrar exportación.

## 6. Newsletter y formularios

- Revisar registros persistidos, estado de entrega y spam.
- Una baja valida token, cambia estado y conserva evidencia mínima de cumplimiento.
- No reactivar una baja sin consentimiento nuevo.
- Fallo de Resend: no reenviar a ciegas; comprobar registro, idempotencia, dominio y logs.
- Picos de abuso: endurecer rate limit/Turnstile; no bloquear permanentemente sin revisar falsos positivos.

## 7. Usuario y roles

- Solo admin cambia roles mediante flujo confiable.
- Confirmar usuario objetivo y rol anterior/nuevo.
- Evitar autoascenso y conservar al menos un admin recuperable.
- Registrar actor, motivo y fecha.
- Si se sospecha escalación: revocar sesiones, corregir RLS, revisar auditoría y tratarlo como incidente.

## 8. Incidentes

### Severidad

- **SEV-1:** fuga/alteración de datos, escalación, sitio/auth totalmente caído.
- **SEV-2:** módulo obligatorio caído, publicación incorrecta, inscripciones o correo degradados.
- **SEV-3:** defecto sin pérdida ni exposición, con alternativa operativa.

### Respuesta

1. Declarar incidente, hora UTC, entorno y responsable.
2. Contener: despublicar, desactivar acción, revocar clave o revertir artefacto según caso.
3. Preservar logs/evidencia sin copiar secretos ni PII innecesaria.
4. Diagnosticar desde último cambio, estado de proveedores y request IDs.
5. Recuperar con el cambio mínimo seguro.
6. Verificar flujos y observar.
7. Documentar causa, impacto, cronología y acciones preventivas.

### Clave expuesta

Revocar/rotar en proveedor, actualizar secretos por entorno, desplegar, verificar clave nueva y comprobar que la antigua falla. Investigar uso indebido. Borrar el texto del último commit no sustituye revocación.

## 9. Rollback

- Aplicación: promover último commit/artefacto estable.
- Base: aplicar migración correctiva revisada; no hacer reset destructivo.
- Contenido: despublicar o archivar.
- Integración: desactivar efecto externo conservando persistencia.

Después, verificar home, contenido, curso, auth, CMS, formularios y logs. Registrar versión recuperada.

## 10. Restauración

Restaurar primero en entorno aislado. Comprobar conteos, relaciones, RLS, medios y flujos críticos. La promoción a producción requiere autorización específica y plan de reconciliación de datos posteriores al backup.

## 11. Evidencia mínima

```text
Fecha/hora UTC:
Entorno:
Operador:
Acción o incidente:
Commit/migración/recurso:
Resultado de verificación:
Rollback disponible:
Ticket/evidencia:
```

