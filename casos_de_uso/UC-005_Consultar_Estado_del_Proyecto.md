# UC-005: Consultar el Estado de un Proyecto (Revisado)

- **ID:** UC-005
- **Actor(es):** Project Manager, Miembro del Equipo
- **Descripción:** Un usuario pide un resumen rápido del estado actual del proyecto.
- **Precondiciones:**
    - El usuario está autenticado y dentro de un proyecto activo.

---

### Flujo Principal (Éxito)

1.  El usuario realiza una pregunta general sobre el progreso (ej. "¿Cómo vamos?", "Status del proyecto").
2.  PM-Bot consulta la base de datos para obtener las métricas del proyecto.
3.  PM-Bot presenta un resumen conciso: "📈 El proyecto está 45% completo. Hay 12 de 27 tareas completadas, 3 en progreso y 2 bloqueadas.".
4.  Opcionalmente, PM-Bot puede ofrecer una visualización: "¿Quieres ver el gráfico de Burndown del sprint?".

---

### Flujos de Error

- **Fallo en la Base de Datos:** Si el sistema no puede acceder a los datos del proyecto, PM-Bot debe responder con un mensaje de error claro y amigable: "Lo siento, estoy teniendo problemas para acceder a la información del proyecto en este momento. Por favor, inténtalo de nuevo en unos minutos."

---

### Requisitos No Funcionales

- **Performance:** Para un proyecto con hasta 5,000 tareas, la respuesta a esta consulta debe ser generada y mostrada en menos de 4 segundos.

- **Postcondiciones:**
    - El usuario tiene una visión clara y rápida del estado del proyecto.