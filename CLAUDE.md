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

*Para información detallada sobre cualquier aspecto específico, consultar los análisis especializados en `docs/analisis/`.*