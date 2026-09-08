# Operaciones periódicas

**Estado:** Objetivo  
**Inicio propuesto:** antes de producción

## 1. Responsabilidad

Antes del lanzamiento deben asignarse propietario principal y suplente para dominio/Cloudflare, Supabase, Resend, seguridad y contenido. Sin propietario, la tarea queda pendiente.

## 2. Cadencia

### Semanal

- Revisar errores 5xx, auth, base y correo.
- Revisar solicitudes persistidas con envío fallido.
- Revisar spam/abuso y falsos positivos.
- Confirmar que noticias, blog y cursos publicados cargan y que el CMS autentica.
- Revisar inscripciones cercanas a cupo y ofertas próximas.

### Mensual

- Revisar usuarios privilegiados y últimos cambios de rol.
- Comprobar dominio, TLS, callbacks y correo transaccional.
- Revisar consumo/coste de Cloudflare, Supabase, Storage y Resend.
- Actualizar dependencias de seguridad con prueba completa.
- Ejecutar prueba de backup o verificar evidencia automática.
- Revisar accesibilidad de contenido nuevo: headings, alt, enlaces y contraste.

### Trimestral

- Ensayar restauración completa en entorno aislado.
- Revisar políticas RLS por rol y endpoints públicos.
- Revisar retención y eliminación de PII.
- Rotar credenciales de alto impacto según política o proveedor.
- Probar rollback del artefacto productivo.
- Revisar ADR, SPEC y runbooks contra el sistema real.

### Anual o ante cambio material

- Revisar privacidad, cookies, términos, avisos financieros y accesibilidad con responsables competentes.
- Revisar propiedad y renovación de dominio.
- Revisar continuidad: cuentas de emergencia, suplentes y recuperación MFA.
- Hacer evaluación de amenaza y dependencia de proveedores.

## 3. Inventario de credenciales

Registrar solo metadatos:

| Sistema | Propietario | Entorno | Última rotación | Próxima revisión | Recuperación probada |
| --- | --- | --- | --- | --- | --- |
| Cloudflare | Pendiente | producción | Pendiente | Pendiente | Pendiente |
| Supabase | Pendiente | todos | Pendiente | Pendiente | Pendiente |
| Resend | Pendiente | todos | Bloqueado: rotación urgente | Inmediata | Pendiente |
| Turnstile | Pendiente | preview/prod | No creado | Al crear | Pendiente |

Nunca añadir valores, códigos MFA ni enlaces privados a esta tabla.

## 4. Procedimiento común de rotación

1. Confirmar propietario, alcance y rollback.
2. Crear credencial nueva en el gestor apropiado.
3. Actualizar un entorno no productivo y verificar.
4. Actualizar producción con autorización.
5. Ejecutar smoke y observar errores.
6. Revocar la credencial anterior.
7. Confirmar que la anterior falla y la nueva funciona.
8. Registrar metadatos y evidencia, no valores.

Ante exposición conocida, revocar primero según riesgo; no esperar la cadencia normal.

## 5. Registro de ejecución

Cada tarea periódica registra:

```text
Fecha UTC:
Operador:
Área:
Comprobaciones:
Hallazgos:
Acciones:
Evidencia:
Próxima fecha:
```

Los hallazgos críticos se convierten en incidente y siguen el [runbook](RUNBOOK-OPERACION.md).

