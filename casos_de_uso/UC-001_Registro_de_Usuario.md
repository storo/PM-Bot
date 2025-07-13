# UC-001: Registro de Nuevo Usuario (Revisado)

- **ID:** UC-001
- **Actor Principal:** Nuevo Usuario
- **Descripción:** Un nuevo usuario crea una cuenta en PM-Bot para poder acceder al servicio, ya sea mediante un proveedor social o con su email.
- **Precondiciones:** El usuario ha navegado a la página de inicio de PM-Bot.
- **Disparador:** El usuario hace clic en el botón "Registrarse" o "Empezar Gratis".

---

### Flujo Principal (Registro con Proveedor Social)

1.  El usuario selecciona una opción de registro social (ej. "Registrarse con Google").
2.  El sistema redirige al usuario a la página de autenticación del proveedor.
3.  El usuario autoriza a PM-Bot a acceder a la información básica de su perfil.
4.  El sistema recibe la confirmación, crea una nueva cuenta de usuario y asocia el método de login social.
5.  El sistema inicia sesión automáticamente para el usuario y lo redirige al flujo de Onboarding (UC-003).

---

### Flujos Alternativos

- **Registro con Email y Contraseña:**
    1. El usuario elige la opción "Registrarse con email".
    2. El usuario proporciona un nombre, email y una contraseña segura.
    3. El sistema valida los datos y crea la cuenta con un estado "pendiente de verificación".
    4. El sistema envía un email de verificación a la dirección proporcionada.
    5. El usuario hace clic en el enlace del email, verificando la cuenta y siendo redirigido para iniciar sesión.

- **El usuario ya tiene una cuenta:** Si el email (ya sea del proveedor social o introducido manualmente) ya está registrado, el sistema informa al usuario y le sugiere "Iniciar Sesión".

- **Fallo del Proveedor Social:** Si la API del proveedor social no responde o devuelve un error, el sistema muestra un mensaje amigable: "Hubo un problema al conectar con [Proveedor]. Por favor, inténtalo de nuevo o regístrate con tu email".

---

### Requisitos No Funcionales

- **Seguridad:** Las contraseñas de los usuarios deben ser hasheadas usando un algoritmo robusto (ej. Argon2, bcrypt). Toda la comunicación debe realizarse sobre HTTPS. Los tokens de sesión deben ser seguros y tener una caducidad razonable.

- **Postcondiciones:**
    - Se ha creado una nueva cuenta de usuario en el sistema.
    - El usuario está autenticado o listo para verificar su email.