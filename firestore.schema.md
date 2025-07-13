# Firestore Schema Documentation (MVP)

Este documento describe la estructura de datos para las colecciones de Firestore en la fase MVP de PM-Bot.

---

### Colección: `users`

Almacena el perfil de cada usuario registrado.

- **ID del Documento:** `userId` (el mismo que el UID de Firebase Auth)

- **Campos:**
    - `email` (string): Email del usuario.
    - `displayName` (string): Nombre para mostrar del usuario.
    - `photoURL` (string): URL del avatar del usuario.
    - `createdAt` (timestamp): Fecha de creación de la cuenta.

---

### Colección: `projects`

Almacena la información de cada proyecto creado.

- **ID del Documento:** `projectId` (autogenerado por Firestore)

- **Campos:**
    - `name` (string): Nombre del proyecto.
    - `description` (string): Descripción del proyecto.
    - `ownerId` (string): `userId` del creador del proyecto.
    - `members` (array of strings): Lista de `userId` de los miembros del proyecto.
    - `createdAt` (timestamp): Fecha de creación del proyecto.

---

### Colección: `tasks`

Almacena cada tarea individual.

- **ID del Documento:** `taskId` (autogenerado por Firestore)

- **Campos:**
    - `projectId` (string): ID del proyecto al que pertenece la tarea.
    - `title` (string): Título de la tarea.
    - `status` (string): Estado actual de la tarea (`Todo`, `InProgress`, `Done`, `Blocked`).
    - `assigneeId` (string, nullable): `userId` del miembro del equipo asignado.
    - `dueDate` (timestamp, nullable): Fecha de vencimiento de la tarea.
    - `createdAt` (timestamp): Fecha de creación de la tarea.

---

### Colección: `conversations`

Almacena el historial de interacciones con el bot para cada proyecto.

- **ID del Documento:** `conversationId` (autogenerado por Firestore)

- **Campos:**
    - `projectId` (string): ID del proyecto asociado a la conversación.
    - `userId` (string): ID del usuario que interactuó.
    - `message` (string): El mensaje literal del usuario.
    - `response` (string): La respuesta literal del bot.
    - `timestamp` (timestamp): Marca de tiempo de la interacción.
    - `intents` (array of strings): Las intenciones detectadas por el NLP.
