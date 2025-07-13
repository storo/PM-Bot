# UC-007: Gestionar Errores y Clarificaciones (Revisado)

- **ID:** UC-007
- **Actor(es):** Cualquier Usuario
- **Descripción:** El asistente maneja de forma elegante situaciones en las que no entiende una solicitud, falta información o comete un error, permitiendo al usuario corregirlo.
- **Precondiciones:** El usuario está interactuando con el bot.

---

### Flujo Principal (Petición de Clarificación)

1.  El usuario escribe un comando ambiguo: "Crea una tarea para el deploy".
2.  PM-Bot detecta que falta la fecha límite.
3.  PM-Bot solicita la información que falta: "Entendido. ¿Para qué fecha límite creo la tarea 'Deploy'?".
4.  El usuario proporciona la información y el bot completa la acción.

---

### Flujos Alternativos

- **Corrección de un Error del Bot:**
    1. Usuario: "Crea tarea para diseñar el home, fecha límite mañana".
    2. PM-Bot (interpreta mal): "Tarea creada: 'Diseñar el home', fecha límite 18 de Julio."
    3. Usuario: "No, la fecha es para el 15".
    4. PM-Bot reconoce la corrección, se disculpa y rectifica: "Mis disculpas. Corregido. La fecha límite para 'Diseñar el home' es ahora el 15 de Julio."

- **El Bot no Entiende la Intención:**
    1. Usuario: (Escribe un comando completamente ininteligible o fuera de dominio).
    2. PM-Bot responde con humildad y ofrece ayuda: "Lo siento, no he entendido esa petición. Recuerda que puedo ayudarte a crear, actualizar y consultar tareas. Puedes escribir 'ayuda' para ver una lista de comandos comunes."

---

- **Postcondiciones:**
    - La acción del usuario se completa a pesar de la ambigüedad.
    - El usuario siente que puede corregir al bot, aumentando la confianza en el sistema.