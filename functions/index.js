const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Cloud Function for PM-Bot Conversational Engine
 * Handles conversational AI interactions for the project management bot
 */
exports.conversationalHandler = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  try {
    // Log the incoming request
    console.log('Conversational Handler called:', {
      method: req.method,
      body: req.body,
      headers: req.headers
    });

    // Basic response for now - will be expanded with actual AI logic
    const response = {
      message: 'PM-Bot Conversational Engine is running',
      timestamp: new Date().toISOString(),
      status: 'success',
      version: '1.0.0'
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error in conversational handler:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});