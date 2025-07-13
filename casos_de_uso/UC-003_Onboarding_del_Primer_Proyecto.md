# UC-003: Onboarding y Creación del Primer Proyecto (Revisado)

- **ID:** UC-003
- **Actor Principal:** Nuevo Usuario Registrado
- **Descripción:** El usuario es guiado por el asistente en sus primeros pasos, permitiéndole crear un proyecto, unirse a uno existente o explorar la herramienta.
- **Precondiciones:** El usuario acaba de completar el registro (UC-001) y no tiene proyectos.
- **Disparador:** El usuario es redirigido a la pantalla de bienvenida después del registro.

---

### Flujo Principal (Éxito - Flexible)

1.  PM-Bot da la bienvenida al usuario: "¡Hola! Soy tu asistente de proyectos. ¿Qué te gustaría hacer para empezar?".
2.  PM-Bot presenta opciones claras:
    - **A) Crear un nuevo proyecto.**
    - **B) Ver si tienes invitaciones a proyectos existentes.**
    - **C) Hacer un tour rápido de la interfaz.**
3.  El usuario elige una opción.

---

### Sub-flujos

- **Si el usuario elige A (Crear un nuevo proyecto):**
    1. El bot pregunta: "Genial. ¿En qué proyecto estás trabajando?".
    2. El usuario lo describe (ej. "Una campaña de marketing para el Q4").
    3. El bot crea el proyecto y continúa con la invitación opcional del equipo, como en la versión anterior.

- **Si el usuario elige B (Ver invitaciones):**
    1. El sistema busca invitaciones pendientes para el email del usuario.
    2. Si encuentra invitaciones, las muestra: "¡Buenas noticias! Has sido invitado a unirte a los proyectos 'Campaña Q4' y 'Rediseño Web'. ¿A cuál quieres acceder primero?".
    3. Si no encuentra, informa: "De momento no tienes ninguna invitación. ¿Quieres crear un nuevo proyecto?".

- **Si el usuario elige C (Hacer un tour):**
    1. El bot inicia un tour interactivo por la interfaz, explicando los elementos clave sin forzar la creación de un proyecto.

---

- **Postcondiciones:**
    - El usuario ha tomado una primera acción significativa (crear, unirse o explorar).
    - El usuario no se siente forzado a un único camino y tiene el control de su experiencia inicial.