# Documentación del proyecto BVH

**Estado:** Actual  
**Última revisión:** 2026-09-05

Este directorio conserva decisiones, especificaciones y procedimientos verificables. No sustituye el código ni presenta planes como hechos.

## Autoridad documental

No se resuelve una contradicción fingiendo que no existe:

1. Las instrucciones expresas del propietario y la [SPEC V1](SPEC-V1-BVH.md) definen la aceptación de la primera entrega.
2. Las specs base de `openspec/specs/` definen el comportamiento vigente después de archivar un cambio aceptado.
3. Un cambio activo en `openspec/changes/` define comportamiento propuesto o en implementación; no demuestra que esté desplegado.
4. El código, las migraciones y la configuración son evidencia del estado ejecutable. Si contradicen una spec aceptada, existe un defecto o la spec necesita un nuevo cambio explícito.
5. El [ADR de arquitectura](ADR-Arquitectura-BVH.md) explica decisiones y consecuencias; no reemplaza requisitos observables.
6. Las [specs históricas por módulo](specs/) conservan detalle previo a OpenSpec hasta completar la migración documental.
7. [Infraestructura](INFRAESTRUCTURA.md), [Roadmap](ROADMAP-V1.md) y [Relevo](relevo.md) registran entorno y estado, no contratos funcionales.
8. El [PRD original](../PRD.md) conserva la visión. Sus detalles técnicos históricos quedan subordinados a ADR, SPEC V1 y OpenSpec.

## OpenSpec

OpenSpec es obligatorio para cambios funcionales o arquitectónicos nuevos:

```text
explorar → proponer → revisar artefactos → aplicar tareas
         → validar → probar/promover → sincronizar y archivar
```

- Configuración del proyecto: [`../openspec/config.yaml`](../openspec/config.yaml).
- Cambio V1 activo: [`../openspec/changes/deliver-v1-core-platform/`](../openspec/changes/deliver-v1-core-platform/).
- Trazabilidad entre código y contrato: [Trazabilidad OpenSpec V1](TRAZABILIDAD-OPEN-SPEC-V1.md).
- `openspec validate --all --strict --no-interactive` valida forma y coherencia, pero no sustituye pruebas ni evidencia de entorno.
- No se archiva un cambio con tareas, aceptación o dependencias externas pendientes.

## Estados usados

| Estado | Significado |
| --- | --- |
| **Actual** | Hay evidencia en el repositorio o entorno verificado. |
| **Objetivo** | Decisión aprobada todavía no completada. |
| **Pendiente** | Trabajo identificado, sin aprobación o ejecución completa. |
| **Bloqueado** | Requiere autoridad, credencial o decisión externa. |

En los ADR se usan además `Propuesta`, `Aceptada`, `Reemplazada` y `Descartada` para la decisión. El campo de implementación indica el estado real.

## Índice

- [ADR de arquitectura](ADR-Arquitectura-BVH.md)
- [Especificación de la V1](SPEC-V1-BVH.md)
- [Contenido: noticias y blog](specs/CONTENIDO.md)
- [Cursos](specs/CURSOS.md)
- [Autenticación y roles](specs/AUTH-Y-ROLES.md)
- [CMS](specs/CMS.md)
- [Formularios y correo](specs/FORMULARIOS-Y-CORREO.md)
- [Flujo de desarrollo](FLUJO-DESARROLLO.md)
- [Infraestructura](INFRAESTRUCTURA.md)
- [Puesta en marcha de la V1](PUESTA-EN-MARCHA.md)
- [Lanzamiento del MVP editorial](LANZAMIENTO-EDITORIAL.md)
- [Operaciones periódicas](OPERACIONES-PERIODICAS.md)
- [Runbook de operación](RUNBOOK-OPERACION.md)
- [Roadmap V1](ROADMAP-V1.md)
- [Relevo](relevo.md)
- [Revisión legal y accesibilidad](REVISION-LEGAL-Y-ACCESIBILIDAD.md)
- [Trazabilidad OpenSpec V1](TRAZABILIDAD-OPEN-SPEC-V1.md)
- [Revisión de migraciones V1](REVISION-MIGRACIONES-V1.md)
- [Pruebas E2E locales V1](PRUEBAS-E2E-V1.md)

## Reglas de mantenimiento

- Un ADR aceptado no se reescribe para ocultar una decisión nueva: se agrega otro ADR que lo reemplace.
- Los números de ADR no se reutilizan ni se reordenan.
- Cada cambio funcional debe partir de un cambio OpenSpec revisado y actualizar sus criterios de aceptación en la misma entrega.
- Un cambio OpenSpec archivado no se reescribe para ocultar comportamiento nuevo: se crea otro delta.
- Infraestructura y runbooks llevan fecha y evidencia. Si algo no fue comprobado, figura como pendiente.
- Nunca se registran valores de claves, tokens, contraseñas, cookies o datos personales. Solo nombres de variables y ubicación del gestor de secretos.
- Los comandos destructivos, migraciones productivas, rotaciones y despliegues requieren autorización explícita y evidencia posterior.
