# Plan de Monitoreo y Alertas (MVP)

Este documento detalla la estrategia de monitoreo, logging y alertas para la fase MVP de PM-Bot, correspondiente a las tareas `TASK-MONITOR-001` y `TASK-MONITOR-002`.

---

## 1. Logging Centralizado (Cloud Logging)

### 1.1. Estrategia de Logging Estructurado

Todos los logs generados por la aplicación (tanto backend como frontend) deben ser logs estructurados (JSON). Esto permite un filtrado y análisis mucho más potente en Cloud Logging.

**Ejemplo de Log de Backend (Cloud Function):**
```json
{
  "severity": "INFO",
  "message": "Tarea creada exitosamente",
  "context": {
    "functionName": "createTask",
    "userId": "user123",
    "projectId": "project456",
    "taskId": "task789"
  },
  "trace": "projects/your-project-id/traces/trace-id"
}
```

**Ejemplo de Log de Frontend (Error de UI):**
```json
{
  "severity": "ERROR",
  "message": "Error al renderizar el componente de Tareas",
  "context": {
    "component": "TaskList",
    "errorMessage": "Cannot read properties of undefined (reading 'map')",
    "userId": "user123",
    "projectId": "project456"
  }
}
```

### 1.2. Políticas de Retención
- **Logs de Producción:** 90 días.
- **Logs de Staging/Desarrollo:** 30 días.

---

## 2. Monitoreo y Dashboards (Cloud Monitoring)

Se creará un dashboard principal en Cloud Monitoring llamado **"PM-Bot - Visión General del MVP"** con los siguientes widgets:

### 2.1. Métricas de Backend (Cloud Functions)

- **Invocaciones de Funciones:** Gráfico de series temporales con el número de invocaciones por función.
- **Latencia de Ejecución (p95):** Gráfico de latencia para las funciones más críticas (ej. `createTask`, `getProjectStatus`).
- **Tasa de Errores:** Porcentaje de ejecuciones que resultan en error, por función.
- **Uso de Memoria:** Gráfico del uso de memoria por función.

### 2.2. Métricas de Base de Datos (Firestore)

- **Operaciones de Lectura/Escritura/Borrado:** Gráfico de series temporales del número de operaciones.
- **Uso de Almacenamiento:** Tamaño total de la base de datos a lo largo del tiempo.

### 2.3. Métricas de API (Gemini)

- **Latencia de la API de Gemini:** Tiempo de respuesta de las llamadas a la API de IA.
- **Tasa de Errores de la API de Gemini:** Porcentaje de llamadas que fallan.

---

## 3. Estrategia de Alertas (Cloud Monitoring)

Se configurarán los siguientes canales de notificación: **Email** para alertas de prioridad media y **Slack** (a un canal `#alerts-prod`) para las de alta prioridad.

### 3.1. Alertas de Alta Prioridad (🔴 CRÍTICAS)

- **Tasa de Errores de Funciones > 5%:** Si cualquier Cloud Function tiene una tasa de errores superior al 5% durante un período de 5 minutos.
- **Latencia de API de Gemini > 5s:** Si la latencia p95 de la API de Gemini supera los 5 segundos durante 10 minutos.
- **Errores de Autenticación de Firebase > 10%:** Si el porcentaje de intentos de inicio de sesión fallidos es anormalmente alto.

### 3.2. Alertas de Prioridad Media (🟡 ALTA)

- **Latencia de Funciones > 3s:** Si la latencia p95 de cualquier función crítica supera los 3 segundos durante 10 minutos.
- **Uso de Memoria de Funciones > 90%:** Si una función utiliza consistentemente más del 90% de la memoria asignada.
- **Alerta de Presupuesto:** Si el gasto del proyecto GCP alcanza el 50%, 75% y 90% del presupuesto mensual definido.
