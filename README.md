# PM-Bot: Asistente Conversacional de IA para Gestión de Proyectos

Este repositorio contiene el código fuente para PM-Bot, un asistente de IA conversacional diseñado para transformar la gestión de proyectos.

## Visión del Producto

PM-Bot es el asistente de IA conversacional diseñado para ser el más inteligente y proactivo, transformando la gestión de proyectos de una tarea administrativa compleja en una experiencia natural y fluida.

## Estado del Proyecto

Actualmente, el proyecto se encuentra en la **Fase 1: Fundación del MVP**. Las tareas iniciales de infraestructura y configuración del repositorio están en progreso.

## Empezando

*Próximamente se añadirán instrucciones detalladas sobre cómo configurar el entorno de desarrollo.*

## Estrategia de Ramificación

- **`main`**: Contiene el código de producción estable. Las fusiones a esta rama se realizan únicamente desde `develop` después de una aprobación y un despliegue exitoso en staging.
- **`develop`**: Es la rama principal de desarrollo. Contiene las últimas características completadas y estables. Las nuevas características se fusionan aquí para ser probadas juntas.
- **`feature/*`**: Cada nueva característica o corrección de error se desarrolla en su propia rama (ej. `feature/task-creation`, `bugfix/login-error`). Estas ramas se crean a partir de `develop` y se fusionan de nuevo en `develop` a través de un Pull Request.
