# UC-101: Recibir una Alerta de Riesgo Proactiva (Revisado)

- **ID:** UC-101
- **Versión:** Post-MVP (V1.0)
- **Actor(es):** Project Manager
- **Descripción:** PM-Bot identifica un riesgo potencial y alerta proactivamente al PM, permitiendo feedback para mejorar la precisión futura.
- **Precondiciones:**
    - El sistema tiene definidas las dependencias entre tareas.
    - Una tarea en la ruta crítica se retrasa.
- **Disparador:** Evento automático del sistema que monitorea la salud del proyecto.

---

### Flujo Principal (Éxito)

1.  El sistema detecta que una tarea crítica está retrasada y que impacta a otras 3 tareas.
2.  PM-Bot envía una notificación proactiva: "⚠️ **Alerta de Riesgo:** La tarea 'Aprobación de Diseño' está retrasada, lo que pone en riesgo la entrega del sprint. ¿Quieres que analice el impacto?".
3.  El PM responde: "Sí".
4.  PM-Bot presenta un resumen del impacto y opciones de mitigación.

---

### Flujos Alternativos

- **Manejo de Falsos Positivos (Feedback del Usuario):**
    1. PM-Bot envía una alerta de riesgo.
    2. El PM evalúa la situación y determina que no es un riesgo real.
    3. El PM tiene la opción de descartar la alerta y dar feedback: puede hacer clic en un botón "No es un riesgo" o escribir "Esta alerta no es relevante".
    4. PM-Bot registra este feedback: "Entendido. Gracias por el feedback. No te volveré a alertar sobre esta situación específica. Usaré esta información para mejorar mis futuras predicciones."

---

### Requisitos No Funcionales

- **Precisión del Modelo:** El objetivo inicial es que >70% de las alertas de riesgo sean consideradas relevantes por los usuarios.
- **Entrenamiento:** El feedback de los usuarios sobre las alertas debe ser almacenado y utilizado para reentrenar el modelo de detección de riesgos periódicamente.

- **Postcondiciones:**
    - El PM es consciente de un riesgo potencial.
    - El sistema de IA aprende y mejora con el tiempo, reduciendo la fatiga por alertas.