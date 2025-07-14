const { createSwarm } = require("@langchain/langgraph-swarm");const { createReactAgent } = require("@langchain/langgraph/prebuilt");const { MultiServerMCPClient } = require("@langchain/mcp-adapters");const { GoogleGenAI } = require("@google/genai");const admin = require('firebase-admin');if (!admin.apps.length) {  admin.initializeApp();}const db = admin.firestore();class PMBotConversationalEngine {  constructor() {    this.model = null;    this.mcpClient = null;    this.swarm = null;    this.initialize();  }  async initialize() {    const API_KEY = process.env.GEMINI_API_KEY || functions.config().gemini.api_key;    this.model = new GoogleGenAI({      apiKey: API_KEY    }).getGenerativeModel({      model: 'gemini-2.0-flash',      generationConfig: {        temperature: 0.7,        topP: 0.8,        maxOutputTokens: 2048,      },      safetySettings: [        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }      ]    });    this.mcpClient = new MultiServerMCPClient({      mcpServers: {
        "firestore-tools": {
          command: "node",
          args: ["./mcp-servers/firestore-server.js"],
          transport: "stdio"
        },
        "pm-tools": {
          command: "node",
          args: ["./mcp-servers/pm-tools-server.js"],
          transport: "stdio"
        },
        "risk-analysis": {
          command: "node",
          args: ["./mcp-servers/risk-analysis-server.js"],
          transport: "stdio"
        },
      }    });    await this.mcpClient.init();    const tools = await this.mcpClient.getTools();    const projectManagerAgent = createReactAgent({      llm: this.model,      tools: tools.filter(tool => 
        ['createProject', 'createTask', 'getProjectStatus', 'updateTaskStatus', 'assignTask', 'listTasksByProjectAndStatus'].includes(tool.name)
      ),      name: "project_manager",      prompt: `Eres el gerente de proyecto principal de PM-Bot.
               ESPECIALIZACIÓN: Gestión de proyectos, creación de tareas, asignación de recursos.
               
               INSTRUCCIONES:
               - Responde en español de manera natural y amigable
               - Para crear tareas, usa la herramienta 'createTask' con todos los parámetros requeridos
               - Para consultar estado, usa 'getProjectStatus'
               - Si necesitas análisis de riesgos o métricas de proyecto, transfiere a 'risk_analyst'
               - Siempre confirma las acciones importantes antes de ejecutarlas
               
               CONTEXTO: Eres parte de un sistema multi-agente especializado.`    });

    const riskAnalysisAgent = createReactAgent({
      llm: this.model,
      tools: tools.filter(tool => 
        ['analyzeProjectRisk', 'getProjectMetrics'].includes(tool.name)
      ),
      name: "risk_analyst",
      prompt: `Eres el especialista en análisis de riesgos de PM-Bot.
               ESPECIALIZACIÓN: Análisis predictivo, detección de riesgos, métricas de proyecto.
               
               INSTRUCCIONES:
               - Analiza datos de proyecto para identificar posibles problemas
               - Proporciona recomendaciones accionables y específicas
               - Usa gráficos y métricas cuando sea apropiado
               - Si necesitas gestionar tareas o proyectos, transfiere a 'project_manager'
               
               CONTEXTO: Ayudas a equipos a anticipar y mitigar riesgos de proyecto.`
    });

    this.swarm = createSwarm({
      agents: [projectManagerAgent, riskAnalysisAgent],
      defaultActiveAgent: "project_manager"
    }).compile();  }  async processMessage(input) {    const { message, sessionId, userId, projectId } = input;    try {      let context = await this.getConversationContext(sessionId, userId);            context.messageHistory.push({        role: "user",        content: message,        timestamp: admin.firestore.FieldValue.serverTimestamp()      });      context.updatedAt = admin.firestore.FieldValue.serverTimestamp();      const result = await this.swarm.stream({        messages: [          ...this.buildContextMessages(context),          { role: "user", content: message }        ]      });      let response = "";      let activeAgent = context.currentAgent;            for await (const chunk of result) {        if (chunk.messages && chunk.messages.length > 0) {          const lastMessage = chunk.messages[chunk.messages.length - 1];          if (lastMessage.content) {            response = lastMessage.content;          }          if (lastMessage.name && lastMessage.name !== activeAgent) {            activeAgent = lastMessage.name;          }        }      }      context.messageHistory.push({        role: "assistant",         content: response,        agent: activeAgent,        timestamp: admin.firestore.FieldValue.serverTimestamp()      });      context.currentAgent = activeAgent;      await this.saveConversationContext(context);      return {        response,        agent: activeAgent,        context: context      };    } catch (error) {      console.error('Error in conversational engine:', error);      return {        response: "Lo siento, hubo un error procesando tu mensaje. ¿Podrías intentar de nuevo?",        agent: "project_manager",        context: await this.getConversationContext(sessionId, userId)      };    }  }  async getConversationContext(sessionId, userId) {    try {      const doc = await db.collection('conversation_contexts').doc(sessionId).get();      if (doc.exists) {        return doc.data();      }    } catch (error) {      console.error('Error getting conversation context:', error);    }    return {      sessionId,      userId,      messageHistory: [],      currentAgent: "project_manager",      entityCarryover: {},      createdAt: admin.firestore.FieldValue.serverTimestamp(),      updatedAt: admin.firestore.FieldValue.serverTimestamp()    };  }  async saveConversationContext(context) {    try {      await db.collection('conversation_contexts').doc(context.sessionId).set(context);    } catch (error) {      console.error('Error saving conversation context:', error);    }  }  buildContextMessages(context) {    const recentHistory = context.messageHistory.slice(-5);    return recentHistory.map(msg => ({      role: msg.role,      content: msg.content    }));  }  async close() {    if (this.mcpClient) {      await this.mcpClient.close();    }  }}const pmBotEngine = new PMBotConversationalEngine();module.exports = { pmBotEngine };