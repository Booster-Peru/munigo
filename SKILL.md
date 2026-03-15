# Skill: Equipo Booster (Multi-Agente)

Este skill define la operacion obligatoria del equipo Booster para ejecutar trabajo en paralelo por iteraciones.

---

## 1) Activacion obligatoria por iteracion

En cada iteracion de trabajo, el Director (Booster) debe iniciar ciclo con este orden:

1. Leer `specs.md`, `PLAN.md`, `AGENTS.md`.
2. Revisar `.antigravity/team/tasks.json`.
3. Publicar directiva en `.antigravity/team/broadcast.msg` con objetivo de la iteracion.
4. Crear o actualizar tareas para roles (Arquitecto, Backend, Frontend, Revisor).
5. Asignar locks por archivo antes de editar.
6. Ejecutar validaciones y cerrar iteracion con reporte.

Si una iteracion no tiene broadcast, asignacion y cierre, se considera incompleta.

---

## 2) Infraestructura Booster

Ruta de coordinacion:

```
.antigravity/team/
  tasks.json
  mailbox/
  broadcast.msg
  locks/
```

Reglas criticas:

- Nunca editar archivos con lock activo de otro rol.
- No tomar tareas con dependencias pendientes.
- Cerrar tareas terminadas y liberar locks inmediatamente.

---

## 3) Uso de skills globales internos

Booster y sus especialistas deben usar skills locales y globales cuando existan.

Orden de resolucion recomendado:

1. Skill del proyecto (si existe).
2. Skill global corporativo.
3. Convencion por defecto del equipo.

Ubicaciones sugeridas para skills globales:

- Windows: `D:\Antigravity\skills\`
- Linux/macOS: `~/.antigravity/skills/`
- Variable opcional: `ANTIGRAVITY_GLOBAL_SKILLS_DIR`

Convencion:

- Si una tarea coincide con un skill interno, el agente debe cargarlo y aplicarlo antes de implementar.
- Si no existe skill aplicable, continuar con protocolo standard y dejar registro en broadcast.

---

## 4) Script de orquestacion recomendado

Usar `scripts/team_manager.py` para automatizar ciclos de Booster.

Comandos esperados:

- `init`: prepara estructura de equipo.
- `start-iteration`: publica directiva y crea tareas base.
- `lock` / `unlock`: controla semaforos.
- `broadcast`: mensajes globales.
- `done`: cierra tareas.

---

## 5) Flujo rapido operativo

1. Booster ejecuta `start-iteration`.
2. Especialistas reclaman tareas y crean locks.
3. Implementan en paralelo por dominio.
4. Revisor ejecuta validaciones tecnicas.
5. Booster consolida reporte final y abre siguiente iteracion.

---

## 6) Definicion de exito de iteracion

Una iteracion queda en estado `completed` solo si:

- Hay cambios trazables a `specs.md` / `PLAN.md`.
- No quedan locks huerfanos.
- Validaciones tecnicas ejecutadas.
- Broadcast de cierre publicado.
