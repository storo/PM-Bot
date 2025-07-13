# CLAUDE.md - PM-Bot Project

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PM-Bot** es un sistema de gestión de proyectos conversacional con inteligencia artificial que combina interfaces de chat naturales con capacidades predictivas avanzadas.

### Características Principales
- Gestión conversacional de proyectos y tareas
- Interfaz híbrida (conversacional + visual)
- IA predictiva para alertas de riesgo y planificación
- Integraciones robustas con herramientas externas (Jira, Slack, etc.)
- Arquitectura de microservicios escalable

## Estructura del Proyecto

```
pm/
├── casos_de_uso/           # Casos de uso del sistema (UC-001 a UC-103)
├── docs/
│   └── analisis/          # Análisis especializados de optimización
│       ├── executive-summary.md              # Resumen ejecutivo integrado
│       ├── ux-ui-optimization.md            # Análisis UX/UI especializado
│       ├── technical-architecture.md        # Arquitectura técnica detallada
│       └── business-process-optimization.md # Optimización de procesos
└── CLAUDE.md              # Este archivo

```

## Análisis de Optimización Disponibles

### 📊 Resumen Ejecutivo
**Archivo:** `docs/analisis/executive-summary.md`
- Visión integrada de los 3 subagentes especialistas
- ROI proyectado: 1,463% en Año 1
- Plan de implementación en 3 fases
- Inversión: $375K, Retorno: $5.8M+ primer año

### 🎨 Optimización UX/UI
**Archivo:** `docs/analisis/ux-ui-optimization.md`
- **Especialista:** UX/UI Optimization Expert
- **Enfoque:** Experiencia híbrida conversacional-visual
- **Hallazgos:** UI híbrida, elementos contextuales, feedback robusto
- **Métricas:** 60-80% reducción en tiempo de tareas administrativas

### ⚙️ Arquitectura Técnica
**Archivo:** `docs/analisis/technical-architecture.md`
- **Especialista:** Senior Software Architect
- **Enfoque:** Sistemas conversacionales, escalabilidad, seguridad
- **Propuesta:** Arquitectura de 10 microservicios especializados
- **Capacidades:** 10K+ usuarios concurrentes, 99.9% uptime

### 📈 Optimización de Procesos
**Archivo:** `docs/analisis/business-process-optimization.md`
- **Especialista:** Business Process Optimization Consultant
- **Enfoque:** Eficiencia, workflows, automatización, KPIs
- **Beneficios:** $5.8M ahorros anuales, 75% reducción tiempo de planning
- **ROI:** Payback en 3-4 semanas

## Casos de Uso Documentados

El directorio `casos_de_uso/` contiene la especificación completa del sistema:

### MVP Core
- **UC-001:** Registro de Nuevo Usuario
- **UC-002:** Inicio de Sesión  
- **UC-003:** Onboarding y Creación del Primer Proyecto
- **UC-004:** Crear Tarea Conversacionalmente
- **UC-005:** Consultar Estado del Proyecto
- **UC-006:** Actualizar Estado de Tarea
- **UC-007:** Gestionar Errores y Clarificaciones

### Post-MVP (IA Avanzada)
- **UC-101:** Recibir Alerta de Riesgo Proactiva
- **UC-102:** Planificar Sprint con Asistencia IA
- **UC-103:** Integrar con Herramienta Externa (Jira)

## Metodología de Análisis

Los análisis fueron generados utilizando **3 subagentes especializados** via Google Gemini MCP Context7:

1. **Subagente UX/UI:** Optimización de experiencia del usuario
2. **Subagente Técnico:** Arquitectura y escalabilidad del sistema  
3. **Subagente Procesos:** Eficiencia organizacional y ROI

Cada subagente analizó los casos de uso desde su perspectiva especializada, generando recomendaciones específicas y planes de implementación detallados.

## Próximos Pasos de Desarrollo

### Fase 1: MVP Foundation (Semanas 1-8)
- Infraestructura de microservicios base
- Autenticación robusta (OAuth + email)
- Motor conversacional con NLU basado en reglas
- UI híbrida conversacional-visual

### Fase 2: Optimization & Integration (Semanas 9-16)  
- Integraciones externas (Jira, Slack, Calendar)
- Performance optimization y caching
- Advanced UX features (undo, confirmaciones)
- Analytics dashboard

### Fase 3: AI & Predictive Features (Semanas 17-24)
- Project Intelligence Service
- Risk detection models (UC-101)
- AI-assisted sprint planning (UC-102)
- Predictive analytics

## Comandos de Desarrollo

*Pendiente: Una vez que se establezca la stack tecnológica, actualizar con:*
- Comandos de build y test
- Scripts de deployment
- Configuración de desarrollo local
- Guidelines de contribución

## Tecnologías Propuestas

### Backend
- **Arquitectura:** Microservicios
- **API Gateway:** Kong/NGINX
- **Services:** Node.js/Python/Go
- **Database:** PostgreSQL + Redis
- **Message Queue:** Kafka/RabbitMQ

### Frontend  
- **Framework:** React/Vue.js
- **UI Components:** Híbridos conversacional-visual
- **Real-time:** WebSockets
- **Mobile:** Progressive Web App

### AI/ML
- **NLU:** Rasa/Custom + Transformers evolution
- **ML Platform:** Python + scikit-learn/TensorFlow
- **Deployment:** Docker + Kubernetes

## Métricas de Éxito

### Técnicas
- Latencia API: <200ms (95th percentile)
- Uptime: 99.9%
- Usuarios concurrentes: 10K+ sin degradación

### Negocio
- ROI Año 1: >1,400%
- User adoption: >85% organizacional
- Time savings: 60-80% tareas administrativas
- Project success rate: >90% entregados a tiempo

---

## Registro de Avances (Log de Trabajo)

### Fecha: 2025-07-13

**Hito: Configuración Inicial del Proyecto y Entorno de Desarrollo**

#### Tareas Completadas:

- **Análisis y Refinamiento de Documentos:**
    - Se realizó una revisión crítica de los 10 casos de uso generados.
    - Se actualizaron todos los casos de uso para incluir flujos de error, requisitos no funcionales y para resolver ambigüedades.

- **TASK-DEVOPS-001: Configuración del Repositorio Git**
    - Se inicializó el repositorio de Git (`git init`).
    - Se creó un `README.md` con la descripción del proyecto y la estrategia de ramificación.
    - Se añadió un archivo `.gitignore` optimizado para proyectos Node.js/React.

- **TASK-DEVOPS-002 & 003: Creación de Pipelines CI/CD**
    - Se creó la estructura de directorios `.github/workflows`.
    - Se crearon los archivos base `frontend-ci-cd.yml` y `backend-ci-cd.yml` utilizando las mejores prácticas (Workload Identity Federation).

- **TASK-INFRA-001: Configuración del Proyecto Google Cloud y Firebase**
    - Se habilitaron las APIs necesarias: Firebase, Firebase Auth, Firestore, Cloud Functions, Vertex AI.

- **TASK-INFRA-002: Aprovisionamiento de Firestore y Reglas de Seguridad**
    - Se creó la base de datos de Firestore en la región `nam5`.
    - Se creó el archivo de reglas de seguridad `firestore.rules` con la configuración inicial para el MVP.
    - Se documentó el esquema de la base de datos en `firestore.schema.md`.

- **TASK-INFRA-003: Aprovisionamiento de Redis (Memorystore)**
    - Se creó la instancia de Memorystore Redis `pm-bot-redis` en la región `us-central1`.

- **TASK-SECURITY-001: Gestión de Secretos**
    - Se creó el archivo `.env.example` para definir las variables de entorno necesarias para el desarrollo local.

- **TASK-MONITOR-001 & 002: Plan de Monitoreo**
    - Se creó el documento `MONITORING_PLAN.md` detallando la estrategia de logging, dashboards y alertas.

- **Configuración de `gcloud` CLI:**
    - Se descargó, instaló y configuró el SDK de Google Cloud.
    - Se realizó la autenticación mediante una cuenta de servicio (`gemini-cli-runner`).
    - Se habilitó la API de `cloudresourcemanager`.
    - Se configuró el proyecto por defecto a `pm-bot-prod`.

#### Commits Realizados:

1.  `feat(devops): initialize repository and CI/CD workflows`
2.  `feat(config): add firestore rules, schema, and env template`
3.  `docs(observability): create monitoring and alerting plan`
4.  `feat(infra): provision core GCP services (Firestore, Redis, APIs)`

--- 

*Para información detallada sobre cualquier aspecto específico, consultar los análisis especializados en `docs/analisis/`.*