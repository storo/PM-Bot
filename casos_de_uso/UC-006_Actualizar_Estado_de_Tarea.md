# UC-006: Actualizar el Estado de una Tarea (Revisado)

- **ID:** UC-006
- **Actor(es):** Miembro del Equipo, Project Manager
- **Descripción:** Un usuario actualiza el estado de una tarea usando un comando conversacional.
- **Precondiciones:**
    - La tarea a actualizar existe en el sistema.

---

### Flujo Principal (Éxito)

1.  Un miembro del equipo escribe: "He terminado la tarea de la API de autenticación".
2.  PM-Bot identifica la tarea "API de Autenticación" y la intención de completarla.
3.  PM-Bot actualiza el estado de la tarea a "Done".
4.  PM-Bot confirma la acción: "¡Genial! He marcado la tarea 'API de Autenticación' como completada.".

---

### Resolución de Ambigüedad (Reglas de Contexto)

- **Escenario:** Un usuario tiene asignadas 3 tareas y dice "Marca la tarea como completada".
- **Regla de Resolución:**
    1.  **Contexto Inmediato:** El bot primero comprueba si la tarea fue mencionada en los últimos 2 mensajes de la conversación. Si es así, actúa sobre esa.
    2.  **Prioridad por Urgencia:** Si no hay contexto inmediato, el bot busca si alguna de las tareas del usuario vence hoy. Si solo una lo hace, pregunta para confirmar: "¿Te refieres a la tarea 'Revisar Documentación' que vence hoy?".
    3.  **Petición de Clarificación:** Si ninguna de las reglas anteriores resuelve la ambigüedad, el bot pide al usuario que sea más específico: "Tienes varias tareas asignadas. ¿A cuál te refieres? Puedes decirme parte del título."

---

- **Postcondiciones:**
    - El estado de la tarea se actualiza en tiempo real en el sistema.