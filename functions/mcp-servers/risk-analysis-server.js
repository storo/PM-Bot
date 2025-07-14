const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const mcpServer = new McpServer({
  name: "risk-analysis-tools",
  version: "1.0.0"
});

// Tool: Analyze Project Risk
mcpServer.registerTool("analyzeProjectRisk", {
  title: "Analizar Riesgo de Proyecto",
  description: "Analiza el riesgo de un proyecto y proporciona una evaluación basada en el estado de las tareas.",
  inputSchema: z.object({
    projectId: z.string().describe("ID del proyecto a analizar"),
  })
}, async ({ projectId }) => {
  try {
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      return {
        content: [{
          type: "text",
          text: `❌ Proyecto con ID ${projectId} no encontrado para análisis de riesgo.`
        }],
        isError: true
      };
    }

    const tasksSnapshot = await db.collection('tasks')
      .where('projectId', '==', projectId)
      .get();
    const tasks = tasksSnapshot.docs.map(doc => doc.data());

    const totalTasks = tasks.length;
    const overdueTasks = tasks.filter(task => task.dueDate && new Date(task.dueDate.toDate()) < new Date() && task.status !== 'done').length;
    const blockedTasks = tasks.filter(task => task.status === 'blocked').length;

    let riskLevel = 'Bajo';
    let recommendations = ['El proyecto parece estar en buen camino.'];

    if (totalTasks > 0) {
      const overduePercentage = (overdueTasks / totalTasks) * 100;
      const blockedPercentage = (blockedTasks / totalTasks) * 100;

      if (overduePercentage > 20 || blockedPercentage > 10) {
        riskLevel = 'Alto';
        recommendations = ['Revisar tareas atrasadas y bloqueadas.', 'Identificar cuellos de botella.'];
      } else if (overduePercentage > 5 || blockedPercentage > 3) {
        riskLevel = 'Medio';
        recommendations = ['Monitorear de cerca el progreso de las tareas.', 'Comunicarse con los asignados.'];
      }
    }

    return {
      content: [{
        type: "text",
        text: `📊 Análisis de Riesgo para el proyecto "${projectDoc.data().name}":\nNivel de Riesgo: **${riskLevel}**\nTareas Atrasadas: ${overdueTasks}\nTareas Bloqueadas: ${blockedTasks}\nRecomendaciones: ${recommendations.join('\n- ')}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Error al analizar riesgo del proyecto: ${error.message}`
      }],
      isError: true
    };
  }
});

// Tool: Get Project Metrics
mcpServer.registerTool("getProjectMetrics", {
  title: "Obtener Métricas de Proyecto",
  description: "Obtiene métricas clave de un proyecto (progreso, tareas, etc.).",
  inputSchema: z.object({
    projectId: z.string().describe("ID del proyecto para obtener métricas"),
  })
}, async ({ projectId }) => {
  try {
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      return {
        content: [{
          type: "text",
          text: `❌ Proyecto con ID ${projectId} no encontrado para métricas.`
        }],
        isError: true
      };
    }

    const tasksSnapshot = await db.collection('tasks')
      .where('projectId', '==', projectId)
      .get();
    const tasks = tasksSnapshot.docs.map(doc => doc.data());

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
    const blockedTasks = tasks.filter(task => task.status === 'blocked').length;
    const todoTasks = tasks.filter(task => task.status === 'todo').length;
    const overdueTasks = tasks.filter(task => task.dueDate && new Date(task.dueDate.toDate()) < new Date() && task.status !== 'done').length;

    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      content: [{
        type: "text",
        text: `📈 Métricas para el proyecto "${projectDoc.data().name}":\nProgreso: ${completionPercentage}% completado\nTotal de Tareas: ${totalTasks}\nCompletadas: ${completedTasks}\nEn Progreso: ${inProgressTasks}\nPendientes: ${todoTasks}\nBloqueadas: ${blockedTasks}\nCon Atraso: ${overdueTasks}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Error al obtener métricas del proyecto: ${error.message}`
      }],
      isError: true
    };
  }
});

// Initialize MCP Server
async function main() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.log("Risk Analysis MCP Server running...");
}

main().catch(console.error);