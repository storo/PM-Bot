const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { db } = require('../utils/firestore');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Helper to handle CORS preflight requests
const handleCors = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return true;
  }
  return false;
};

/**
 * Middleware to verify Firebase Authentication token.
 * Attaches decoded token to req.user if valid.
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
  }
};

/**
 * Project Intelligence Microservice
 * Handles AI-driven analysis and predictions for projects.
 * TASK-BE-026: Project Intelligence Microservice
 */

// Placeholder endpoint for analyzing project risk
exports.analyzeProjectRisk = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await verifyToken(req, res, async () => {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ message: 'Missing required field: projectId' });
    }

    try {
      // Simulate AI analysis
      const riskLevel = ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)];
      const recommendations = [
        'Monitor progress closely.',
        'Consider allocating additional resources.',
        'Review project scope.',
        'Communicate proactively with stakeholders.'
      ];

      return res.status(200).json({
        message: `Risk analysis for project ${projectId} completed.`,
        riskLevel: riskLevel,
        recommendation: recommendations[Math.floor(Math.random() * recommendations.length)]
      });

    } catch (error) {
      console.error('Error analyzing project risk:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
});

// Placeholder endpoint for AI-assisted sprint planning
exports.aiSprintPlanning = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await verifyToken(req, res, async () => {
    const { projectId, sprintGoals } = req.body;

    if (!projectId || !sprintGoals) {
      return res.status(400).json({ message: 'Missing required fields: projectId, sprintGoals' });
    }

    try {
      // Simulate AI sprint planning
      const estimatedVelocity = Math.floor(Math.random() * 20) + 10; // 10-30 story points
      const suggestedTasks = ['Task A', 'Task B', 'Task C'];

      return res.status(200).json({
        message: `AI-assisted sprint planning for project ${projectId} completed.`,
        estimatedVelocity: estimatedVelocity,
        suggestedTasks: suggestedTasks
      });

    } catch (error) {
      console.error('Error during AI sprint planning:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
});