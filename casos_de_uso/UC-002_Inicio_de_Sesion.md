# UC-002: Inicio de Sesión (Revisado)

- **ID:** UC-002
- **Actor Principal:** Usuario Registrado
- **Descripción:** Un usuario con una cuenta existente accede a la plataforma.
- **Precondiciones:** El usuario ya tiene una cuenta en PM-Bot.
- **Disparador:** El usuario navega a la página de "Iniciar Sesión".

---

### Flujo Principal (Inicio de Sesión Social)

1.  El usuario selecciona el método de inicio de sesión social que utilizó para registrarse.
2.  El sistema lo redirige al proveedor para autenticarse.
3.  Tras la confirmación del proveedor, el sistema crea una sesión y redirige al usuario a su dashboard.

---

### Flujos Alternativos

- **Inicio de Sesión con Email y Contraseña:**
    1. El usuario introduce su email y contraseña.
    2. El sistema valida las credenciales contra la base de datos.
    3. Si son correctas, el sistema crea una sesión y redirige al usuario a su dashboard.
    4. Si no son correctas, muestra un error de "Credenciales inválidas".

- **Flujo de "Olvidé mi Contraseña":**
    1. El usuario hace clic en "¿Olvidaste tu contraseña?".
    2. El sistema le pide su email.
    3. Se envía un email con un enlace de un solo uso para restablecer la contraseña.

- **Fallo del Proveedor Social:** Si la API del proveedor no responde, se muestra un mensaje de error y se sugiere iniciar sesión con email si la cuenta está vinculada.

---

### Requisitos No Funcionales

- **Seguridad:** Implementar protección contra ataques de fuerza bruta (ej. limitación de intentos, CAPTCHA).
- **Performance:** El tiempo desde que el usuario envía sus credenciales hasta que es redirigido al dashboard no debe superar los 3 segundos.

- **Postcondiciones:**
    - El usuario está autenticado en la plataforma.
    - El usuario tiene acceso a sus proyectos.