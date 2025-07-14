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
 * Integration Service Base
 * Handles external integrations like Jira, Slack, etc.
 * TASK-BE-021: Integration Service Base
 */

// Placeholder endpoint for connecting to an external service
exports.connectIntegration = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await verifyToken(req, res, async () => {
    const { serviceName, credentials } = req.body;
    const userId = req.user.uid;

    if (!serviceName || !credentials) {
      return res.status(400).json({ message: 'Missing required fields: serviceName, credentials' });
    }

    try {
      // In a real implementation, this would involve OAuth flows, API key storage, etc.
      // For now, just simulate a successful connection.
      console.log(`User ${userId} attempting to connect to ${serviceName} with credentials:`, credentials);

      // Store integration details in Firestore (e.g., in a 'user_integrations' collection)
      await db.collection('user_integrations').add({
        userId,
        serviceName,
        credentials: '***ENCRYPTED_CREDENTIALS***', // Store securely in production
        connectedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(200).json({
        message: `Successfully connected to ${serviceName}`,
        serviceName: serviceName
      });

    } catch (error) {
      console.error('Error connecting integration:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
});

// Placeholder endpoint for listing active integrations
exports.listIntegrations = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await verifyToken(req, res, async () => {
    const userId = req.user.uid;

    try {
      const integrationsSnapshot = await db.collection('user_integrations')
        .where('userId', '==', userId)
        .get();

      const integrations = integrationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Remove sensitive credentials before sending to client
      integrations.forEach(integration => {
        delete integration.credentials;
      });

      return res.status(200).json({ integrations });

    } catch (error) {
      console.error('Error listing integrations:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
});

/**
 * Generates Jira OAuth authorization URL.
 * TASK-BE-022: Jira Integration Core (UC-103)
 */
exports.jiraAuthUrl = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // In a real scenario, you would get these from Secret Manager
  const JIRA_CLIENT_ID = functions.config().jira.client_id;
  const JIRA_REDIRECT_URI = functions.config().jira.redirect_uri;
  const JIRA_SCOPES = 'read:jira-user read:jira-work write:jira-work'; // Example scopes

  const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${JIRA_CLIENT_ID}&scope=${JIRA_SCOPES}&redirect_uri=${JIRA_REDIRECT_URI}&response_type=code&prompt=consent`;

  return res.status(200).json({ authUrl });
});

/**
 * Handles Jira OAuth callback and exchanges code for tokens.
 * TASK-BE-022: Jira Integration Core (UC-103)
 */
exports.jiraCallback = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ message: 'Missing authorization code' });
  }

  // In a real scenario, you would get these from Secret Manager
  const JIRA_CLIENT_ID = functions.config().jira.client_id;
  const JIRA_CLIENT_SECRET = functions.config().jira.client_secret;
  const JIRA_REDIRECT_URI = functions.config().jira.redirect_uri;

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: JIRA_CLIENT_ID,
        client_secret: JIRA_CLIENT_SECRET,
        code: code,
        redirect_uri: JIRA_REDIRECT_URI
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Jira token exchange error:', tokenData.error_description);
      return res.status(400).json({ message: 'Failed to exchange token', error: tokenData.error_description });
    }

    // Store tokens securely in Firestore, linked to the user
    // For simplicity, assuming state contains userId. In production, use a more robust state management.
    const userId = state; // This is a simplification. 'state' should be a cryptographically secure random string.
    if (!userId) {
      return res.status(400).json({ message: 'Missing user ID in state' });
    }

    await db.collection('user_integrations').doc(userId).set({
      userId,
      serviceName: 'jira',
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      connectedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return res.status(200).json({ message: 'Jira integration successful!' });

  } catch (error) {
    console.error('Error during Jira OAuth callback:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

/**
 * Creates a Jira issue.
 * TASK-BE-022: Jira Integration Core (UC-103)
 */
exports.createJiraIssue = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await verifyToken(req, res, async () => {
    const { issueData, jiraAccountId } = req.body;
    const userId = req.user.uid;

    if (!issueData || !jiraAccountId) {
      return res.status(400).json({ message: 'Missing required fields: issueData, jiraAccountId' });
    }

    try {
      // Retrieve Jira access token for the user
      const integrationDoc = await db.collection('user_integrations').doc(userId).get();
      if (!integrationDoc.exists || integrationDoc.data().serviceName !== 'jira') {
        return res.status(400).json({ message: 'Jira not integrated for this user' });
      }
      const accessToken = integrationDoc.data().accessToken;

      // Simulate Jira API call
      console.log(`Creating Jira issue for account ${jiraAccountId}:`, issueData);
      // In a real scenario, you would use a Jira API client library here

      const jiraResponse = { id: '10000', key: 'PROJ-1', self: 'http://example.com/jira/rest/api/2/issue/10000' }; // Mock response

      return res.status(201).json({
        message: 'Jira issue created successfully',
        issue: jiraResponse
      });

    } catch (error) {
      console.error('Error creating Jira issue:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
});

/**
 * Sends a Slack notification.
 * TASK-BE-023: Slack Integration (Notifications)
 */
exports.sendSlackNotification = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await verifyToken(req, res, async () => {
    const { channel, message } = req.body;
    const userId = req.user.uid;

    if (!channel || !message) {
      return res.status(400).json({ message: 'Missing required fields: channel, message' });
    }

    try {
      // In a real scenario, you would retrieve the Slack bot token for the user/workspace
      // from Firestore or Secret Manager.
      const slackBotToken = functions.config().slack.bot_token; // Example

      // Simulate Slack API call
      console.log(`Sending Slack message to ${channel} for user ${userId}:`, message);
      // In a real scenario, you would use a Slack API client library here

      const slackResponse = { ok: true, channel: 'C12345', ts: '1234567890.123456' }; // Mock response

      return res.status(200).json({
        message: 'Slack notification sent successfully',
        response: slackResponse
      });

    } catch (error) {
      console.error('Error sending Slack notification:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
});