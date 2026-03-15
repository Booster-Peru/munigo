# AGENTS.md - Guia operativa para agentes IA

> Este archivo define el protocolo obligatorio para cualquier agente que trabaje en MuniGo.

---

## 1. Principios de trabajo

1. El proyecto se rige por `specs.md` como fuente de verdad funcional.
2. Cualquier cambio de alcance debe reflejarse primero en `specs.md` y `PLAN.md`.
3. Aplicar el cambio minimo necesario y mantener trazabilidad por requerimiento.
4. No ejecutar acciones destructivas ni `push` sin solicitud explicita del usuario.

---

## 2. Flujo obligatorio por tarea

1. Leer `specs.md` y `AGENTS.md` al inicio.
2. Revisar estado de equipo en `.antigravity/team/tasks.json`.
3. Verificar locks en `.antigravity/team/locks/` antes de editar.
4. Implementar cambios dentro del alcance solicitado.
5. Ejecutar validaciones tecnicas.
6. Reportar archivos impactados y resultado de validacion.

---

## 3. Comandos de proyecto

### 3.1 Setup

```bash
npm install
```

### 3.2 Desarrollo

```bash
npm run start
npm run android
npm run ios
npm run web
```

### 3.3 Calidad obligatoria

```bash
npm run lint
npm run test
npm run test:coverage
npm run typecheck
```

---

## 4. Stack actual y objetivo

### 4.1 Implementado

- Mobile: React Native + Expo + TypeScript.
- Navegacion: React Navigation.
- Mock services para auth y reportes.

### 4.2 Objetivo de plataforma

- Mobile ciudadano (iOS/Android).
- Web de gestion municipal (separada del cliente mobile).
- Backend productivo con datos geoespaciales y autenticacion real.

---

## 5. Integracion con Stitch y GitHub por MCP

Cuando MCP este disponible en el entorno del agente:

1. Consultar proyecto Stitch y extraer inventario de pantallas/flows.
2. Comparar contra codigo actual y registrar gaps en `PLAN.md`.
3. Actualizar `specs.md` con cambios funcionales confirmados.
4. Registrar decisiones de arquitectura y prioridades.

Reglas:

- Nunca escribir llaves/tokens en archivos del repositorio.
- Nunca exponer credenciales en logs o commits.
- Cualquier secreto debe vivir en variables de entorno.

---

## 6. Seguridad no negociable

- JWT con access token maximo de 15 minutos.
- Autorizacion por recurso (evitar IDOR).
- Validacion de inputs con schemas.
- TLS 1.2+ en toda comunicacion productiva.
- Redaccion de PII/tokens en logging.
- Prohibido commitear `.env`, claves o credenciales.

---

## 7. Reglas de implementacion

- Priorizar funciones pequenas, tipadas y reutilizables.
- Evitar codigo muerto y comentarios de codigo deshabilitado.
- No usar `console.log` en rutas de produccion.
- Mantener convenciones: `kebab-case` archivos, `camelCase` funciones, `PascalCase` componentes.

---

## 8. Coordinacion del Equipo Booster

Infraestructura compartida:

```
.antigravity/team/
  tasks.json
  mailbox/
  broadcast.msg
  locks/
```

Reglas:

- Revisar dependencias de tareas antes de tomar trabajo nuevo.
- No editar un archivo con lock activo.
- Al terminar, actualizar estado y liberar locks.
- Informar por broadcast o mailbox cuando haya cambios de alcance.
- Activar Booster en cada iteracion (inicio, asignacion, cierre).
- Si existe un skill interno aplicable (proyecto/global), cargarlo antes de implementar.

Checklist por iteracion:

1. Publicar objetivo en `broadcast.msg`.
2. Crear/actualizar tareas en `tasks.json`.
3. Asignar locks por archivo.
4. Ejecutar implementacion en paralelo por rol.
5. Ejecutar validaciones.
6. Publicar cierre y liberar locks.

---

## 9. Estandar de reporte final del agente

Toda respuesta final debe incluir:

1. Que se cambio y por que.
2. Archivos afectados con ruta.
3. Comandos de validacion ejecutados y resultado.
4. Riesgos, pendientes o siguientes pasos concretos.

---

## 10. Regla de alcance

No modificar areas no solicitadas. Si existe ambiguedad que cambie arquitectura, seguridad o costos, detener ejecucion y pedir una unica aclaracion puntual.
