/// <reference types="jest" />
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { mockFirestoreInstance } = require('../jest.setup');

describe('Risk Analysis MCP Server Tools', () => {
  let mcpServer;
  let analyzeProjectRisk;
  let getProjectMetrics;

  beforeAll(async () => {
    // Dynamically import the server to get access to its registered tools
    const riskAnalysisServer = require('./risk-analysis-server.js');
    mcpServer = riskAnalysisServer.mcpServer; // Assuming mcpServer is exported

    // Extract the tool functions directly from the server's registered tools
    analyzeProjectRisk = mcpServer.getTool('analyzeProjectRisk').handler;
    getProjectMetrics = mcpServer.getTool('getProjectMetrics').handler;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('analyzeProjectRisk should return risk analysis for a project', async () => {
    const projectId = 'testProject1';
    const result = await analyzeProjectRisk({ projectId });

    expect(result.content[0].text).toContain('Análisis de Riesgo para el proyecto');
    expect(result.content[0].text).toContain('Nivel de Riesgo:');
    expect(result.content[0].text).toContain('Tareas Atrasadas:');
    expect(result.content[0].text).toContain('Tareas Bloqueadas:');
    expect(result.content[0].text).toContain('Recomendaciones:');
    expect(result.isError).toBeUndefined();
  });

  test('analyzeProjectRisk should return error if project not found', async () => {
    mockFirestoreInstance.doc.mockReturnValueOnce({ get: jest.fn(() => Promise.resolve({ exists: false })) });
    const projectId = 'nonExistentProject';
    const result = await analyzeProjectRisk({ projectId });

    expect(result.content[0].text).toContain(`Proyecto con ID ${projectId} no encontrado`);
    expect(result.isError).toBe(true);
  });

  test('getProjectMetrics should return project metrics', async () => {
    const projectId = 'testProject1';
    const result = await getProjectMetrics({ projectId });

    expect(result.content[0].text).toContain('Métricas para el proyecto');
    expect(result.content[0].text).toContain('Progreso:');
    expect(result.content[0].text).toContain('Total de Tareas:');
    expect(result.content[0].text).toContain('Completadas:');
    expect(result.content[0].text).toContain('En Progreso:');
    expect(result.content[0].text).toContain('Pendientes:');
    expect(result.content[0].text).toContain('Bloqueadas:');
    expect(result.content[0].text).toContain('Con Atraso:');
    expect(result.isError).toBeUndefined();
  });

  test('getProjectMetrics should return error if project not found', async () => {
    mockFirestoreInstance.doc.mockReturnValueOnce({ get: jest.fn(() => Promise.resolve({ exists: false })) });
    const projectId = 'nonExistentProject';
    const result = await getProjectMetrics({ projectId });

    expect(result.content[0].text).toContain(`Proyecto con ID ${projectId} no encontrado`);
    expect(result.isError).toBe(true);
  });
});