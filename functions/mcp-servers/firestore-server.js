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
  name: "firestore-pm-tools",
  version: "1.0.0"
});

// Tool: Crear Proyecto
mcpServer.registerTool("createProject", {
  title: "Crear Proyecto",
  description: "Crear nuevo proyecto en Firebase con configuración inicial",
  inputSchema: z.object({
    name: z.string().describe("Nombre del proyecto"),
    description: z.string().optional().describe("Descripción del proyecto"),
    ownerId: z.string().describe("ID del usuario propietario"),
    methodology: z.enum(['agile', 'kanban', 'waterfall']).optional().describe("Metodología del proyecto").default('agile'),
  })
}, async ({ name, description, ownerId, methodology }) => {
  try {
    const projectRef = db.collection('projects').doc();
    await projectRef.set({
      name,
      description: description || null,
      ownerId,
      methodology,
      settings: {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Add owner as a member of the project
    await projectRef.collection('members').doc(ownerId).set({
      userId: ownerId,
      role: 'owner',
      joinedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      content: [{
        type: "text",
        text: `✅ Proyecto "${name}" creado exitosamente con ID: ${projectRef.id}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Error al crear proyecto: ${error.message}`
      }],
      isError: true
    };
  }
});

// Tool: Crear Tarea
mcpServer.registerTool("createTask", {
  title: "Crear Tarea",
  description: "Crear nueva tarea en un proyecto específico",
  inputSchema: z.object({
    projectId: z.string().describe("ID del proyecto"),
    title: z.string().describe("Título de la tarea"),
    description: z.string().optional().describe("Descripción detallada"),
    assigneeId: z.string().optional().describe("ID del usuario asignado"),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().describe("Prioridad de la tarea").default('medium'),
    dueDate: z.string().optional().describe("Fecha límite (ISO format)"),
    storyPoints: z.number().optional().describe("Horas estimadas")
  })
}, async ({ projectId, title, description, assigneeId, priority, dueDate, storyPoints }) => {
  try {
    // Verify project exists
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      return {
        content: [{
          type: "text",
          text: `❌ Proyecto con ID ${projectId} no encontrado`
        }],
        isError: true
      };
    }

    const taskRef = db.collection('tasks').doc();
    await taskRef.set({
      projectId,
      title,
      description: description || null,
      status: 'todo',
      assigneeId: assigneeId || null,
      creatorId: null, // This should be set by the calling agent/function
      dueDate: dueDate ? new Date(dueDate) : null,
      priority,
      storyPoints: storyPoints || null,
      externalId: null,
      externalSystem: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      content: [{
        type: "text",
        text: `✅ Tarea "${title}" creada exitosamente en el proyecto ${projectDoc.data().name}. ID: ${taskRef.id}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text", 
        text: `❌ Error al crear tarea: ${error.message}`
      }],
      isError: true
    };
  }
});

// Tool: Obtener Estado del Proyecto  
mcpServer.registerTool("getProjectStatus", {
  title: "Estado del Proyecto",
  description: "Obtener información completa del estado de un proyecto",
  inputSchema: z.object({
    projectId: z.string().describe("ID del proyecto")
  })
}, async ({ projectId }) => {
  try {
    const projectDoc = await db.collection('projects').doc(projectId).get();
    const tasksSnapshot = await db.collection('tasks')
      .where('projectId', '==', projectId)
      .get();

    if (!projectDoc.exists) {
      return {
        content: [{
          type: "text",
          text: `❌ Proyecto con ID ${projectId} no encontrado`
        }],
        isError: true
      };
    }

    const project = projectDoc.data();
    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    const completedTasks = statusCounts.done || 0;
    const totalTasks = tasks.length;
    const progressPercent = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;

    return {
      content: [{
        type: "text",
        text: `📊 **Estado del Proyecto: ${project.name}**\n\n📈 Progreso: ${progressPercent}% completado\n📋 Tareas totales: ${totalTasks}\n✅ Completadas: ${completedTasks}\n🔄 En progreso: ${statusCounts.in_progress || 0}\n⏳ Pendientes: ${statusCounts.todo || 0}\n🚫 Bloqueadas: ${statusCounts.blocked || 0}\n\n📅 Metodología: ${project.methodology}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Error al obtener estado: ${error.message}`
      }],
      isError: true
    };
  }
});

// Initialize MCP Server
async function main() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.log("Firestore MCP Server running...");
}

main().catch(console.error);