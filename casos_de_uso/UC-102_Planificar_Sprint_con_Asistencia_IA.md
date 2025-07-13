# UC-102: Planificar un Sprint con Asistencia de IA (Revisado)

- **ID:** UC-102
- **Versión:** Post-MVP (V1.0)
- **Actor(es):** Project Manager
- **Descripción:** El PM planifica el próximo sprint y PM-Bot ofrece sugerencias inteligentes, adaptándose a la metodología del equipo.
- **Precondiciones:**
    - El proyecto tiene un backlog de tareas pendientes.
- **Disparador:** El PM inicia el proceso de planificación: "Vamos a planificar el próximo sprint".

---

### Flujo Principal (Flexible)

1.  El PM inicia el comando de planificación.
2.  **(Paso de Adaptación)** Si es la primera vez, PM-Bot pregunta cómo mide el trabajo el equipo: "Para poder ayudarte mejor, ¿cómo mide tu equipo el esfuerzo? (ej. Puntos de historia, Número de tareas, Horas estimadas)". La respuesta se guarda para futuras planificaciones.
3.  Basado en la metodología guardada, PM-Bot ofrece asistencia relevante:
    - **Si es por Puntos:** "La velocidad promedio de tu equipo es de 34 puntos. Recomiendo planificar entre 32 y 36 puntos."
    - **Si es por Nº de Tareas:** "Tu equipo completa un promedio de 15 tareas por sprint. Recomiendo planificar un número similar."
4.  El PM selecciona las prioridades.
5.  PM-Bot analiza las tareas y sugiere una asignación basada en la carga de trabajo (ej. "He asignado 5 tareas a Juan y 6 a María para mantener la carga balanceada").
6.  El PM aprueba o modifica las sugerencias.

---

- **Postcondiciones:**
    - El sprint se planifica de forma más rápida y basada en los datos y metodología propios del equipo.
    - La funcionalidad es útil para una gama más amplia de equipos, no solo los que usan Scrum puro.