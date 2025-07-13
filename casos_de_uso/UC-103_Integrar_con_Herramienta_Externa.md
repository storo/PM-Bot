# UC-103: Integrar con una Herramienta Externa (Jira) (Revisado)

- **ID:** UC-103
- **Versión:** Post-MVP (V1.0)
- **Actor(es):** Project Manager
- **Descripción:** El PM conecta un proyecto de PM-Bot con un proyecto en Jira. Este caso de uso reconoce la complejidad del proceso y lo desglosa.
- **Precondiciones:**
    - El usuario tiene permisos de administrador en ambos sistemas.
- **Disparador:** El PM inicia el comando: "Conectar este proyecto con Jira".

---

### Flujo Principal (Configuración Guiada)

1.  **Autenticación:** El bot guía al usuario a través de la autenticación OAuth con su cuenta de Atlassian.
2.  **Selección de Proyecto:** El bot pide al usuario que seleccione el proyecto de Jira a vincular.
3.  **Mapeo de Usuarios (Paso Crítico):**
    - PM-Bot muestra una interfaz de mapeo: "Necesito entender qué usuario en PM-Bot corresponde a qué usuario en Jira".
    - Presenta una lista de usuarios de PM-Bot y menús desplegables con los usuarios de Jira para que el PM los vincule (ej. "Usuario de PM-Bot: 'Robert' → Usuario de Jira: 'robert.smith@email.com'").
4.  **Mapeo de Estados (Paso Crítico):**
    - PM-Bot muestra otra interfaz: "Ahora, vamos a mapear los estados de las tareas".
    - Presenta los estados de PM-Bot ("Todo", "In-Progress", "Done") y permite al PM mapearlos a los estados correspondientes del flujo de trabajo de Jira ("Backlog", "In Progress", "Resolved", "Closed").
5.  **Configuración de Sincronización:** El usuario elige la dirección de la sincronización (bidireccional es el default).
6.  **Confirmación y Primera Sincronización:** El bot confirma la configuración y comienza la sincronización inicial.

---

### Flujos de Error y Casos Límite

- **Manejo de Conflictos:** La política por defecto es "el cambio más reciente gana". Si dos actualizaciones ocurren con una diferencia de menos de 2 segundos, se notifica al PM para que resuelva el conflicto manualmente.
- **Fallo de Sincronización:** Si la API de Jira falla, la actualización se encola en un sistema de reintentos por hasta 1 hora. Si el fallo persiste, se notifica al PM: "No he podido sincronizar una actualización con Jira. Lo intentaré de nuevo más tarde".

---

- **Postcondiciones:**
    - La integración es robusta y las expectativas del usuario están bien gestionadas.
    - Se reduce la probabilidad de errores de sincronización.