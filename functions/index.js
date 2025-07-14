const { db } = require('./utils/firestore');
const authFunctions = require('./auth');
const projectManagementFunctions = require('./projectManagement');
const conversationalEngineFunctions = require('./conversationalEngine');
const integrationServiceFunctions = require('./integrationService');
const projectIntelligenceFunctions = require('./projectIntelligence');

// Export authentication functions
exports.register = authFunctions.register;
exports.login = authFunctions.login;
exports.oauthGoogle = authFunctions.oauthGoogle;
exports.forgotPassword = authFunctions.forgotPassword;
exports.resetPassword = authFunctions.resetPassword;

// Export project management functions
exports.createProject = projectManagementFunctions.createProject;
exports.getProject = projectManagementFunctions.getProject;
exports.updateProject = projectManagementFunctions.updateProject;
exports.deleteProject = projectManagementFunctions.deleteProject;
exports.listProjects = projectManagementFunctions.listProjects;
exports.createTask = projectManagementFunctions.createTask;
exports.getTask = projectManagementFunctions.getTask;
exports.updateTask = projectManagementFunctions.updateTask;
exports.deleteTask = projectManagementFunctions.deleteTask;
exports.listTasks = projectManagementFunctions.listTasks;

// Export conversational engine functions
exports.handleMessage = conversationalEngineFunctions.handleMessage;

// Export integration service functions
exports.connectIntegration = integrationServiceFunctions.connectIntegration;
exports.listIntegrations = integrationServiceFunctions.listIntegrations;
exports.jiraAuthUrl = integrationServiceFunctions.jiraAuthUrl;
exports.jiraCallback = integrationServiceFunctions.jiraCallback;
exports.createJiraIssue = integrationServiceFunctions.createJiraIssue;
exports.sendSlackNotification = integrationServiceFunctions.sendSlackNotification;

// Export project intelligence functions
exports.analyzeProjectRisk = projectIntelligenceFunctions.analyzeProjectRisk;
exports.aiSprintPlanning = projectIntelligenceFunctions.aiSprintPlanning;

// You can add other top-level functions here as needed
// For example, if you have a project management service:
// exports.projectManagement = require('./projectManagement');