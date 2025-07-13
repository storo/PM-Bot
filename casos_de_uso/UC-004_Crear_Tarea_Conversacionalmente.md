# UC-004: Crear una Tarea Conversacionalmente (Revisado)

- **ID:** UC-004
- **Actor(es):** Project Manager, Miembro del Equipo
- **Descripción:** El usuario crea una nueva tarea en el proyecto activo utilizando lenguaje natural. Este es un caso de uso central para el MVP.
- **Precondiciones:**
    - El usuario está autenticado y ha seleccionado un proyecto activo.

---

### Flujo Principal (Éxito)

1.  El usuario introduce un comando para crear una tarea, especificando el título y, opcionalmente, una fecha límite y un asignatario (ej. "Crea una tarea para diseñar el login, asignar a María, fecha límite viernes").
2.  PM-Bot analiza el texto y extrae la intención, el título, el asignatario y la fecha límite.
3.  PM-Bot crea la tarea en el sistema con el estado "Todo" y la asigna a María.
4.  PM-Bot confirma la creación al usuario: "✅ Tarea creada y asignada a María: 'Diseñar el login' con fecha límite para el [fecha del próximo viernes]".

---

### Límites y Fuera de Alcance (MVP)

- **NLP Simplificado:** El motor de NLP del MVP se centrará en extraer **una** acción, **un** título, **un** asignatario y **una** fecha. Comandos con lógica condicional (ej. "...asigna a Juan, pero si no está disponible, a María...") están fuera de alcance para el MVP y devolverán un mensaje de "Lo siento, aún no puedo procesar solicitudes tan complejas".
- **Creación de Subtareas:** La creación de subtareas a través de la conversación se considera Post-MVP.

---

### Requisitos No Funcionales

- **Performance:** El tiempo entre que el usuario envía el comando y el bot responde con la confirmación debe ser inferior a 2 segundos para este caso de uso.

- **Postcondiciones:**
    - Una nueva tarea existe en el proyecto.
    - La conversación se actualiza con la confirmación.