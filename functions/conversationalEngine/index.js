const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { db } = require('../utils/firestore');
const { pmBotEngine } = require('./engine'); // Import the PMBotConversationalEngine

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Helper to handle CORS preflight requests
const handleCors = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return true;
  }
  return false;
};

/**
 * Conversational Engine Microservice
 * Handles conversational AI interactions for the project management bot
 * TASK-BE-009: Conversational Engine Microservice
 */
exports.handleMessage = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId, message, sessionId } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ message: 'Missing required fields: userId, message' });
  }

  try {
    const result = await pmBotEngine.processMessage({
      userId,
      message,
      sessionId
    });

    return res.status(200).json({
      message: result.response,
      sessionId: result.context.sessionId,
      status: 'success',
      agent: result.agent
    });

  } catch (error) {
    console.error('Error in conversational engine:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});