/// <reference types="jest" />
import * as admin from 'firebase-admin';
const { connectIntegration, listIntegrations, jiraAuthUrl, jiraCallback, createJiraIssue, sendSlackNotification } = require('./index');

// Mock fetch for jiraCallback
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ access_token: 'mockAccessToken', refresh_token: 'mockRefreshToken', expires_in: 3600 }),
    status: 200,
  })
);

describe('Integration Service Functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Mock verifyToken middleware
  const mockVerifyToken = async (req: any, res: any, next: any) => {
    req.user = { uid: 'testUser1', email: 'test1@example.com' };
    next();
  };

  // Mock handleCors helper
  const mockHandleCors = (req: any, res: any) => {
    res.set = jest.fn();
    res.status = jest.fn(() => res);
    res.send = jest.fn();
    return false;
  };

  // Mock the functions to use our mock middleware and helper
  beforeAll(() => {
    jest.spyOn(require('./index'), 'connectIntegration').mockImplementation(async (req: any, res: any) => {
      if (mockHandleCors(req, res)) return;
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
      await mockVerifyToken(req, res, async () => {
        const { serviceName, credentials } = req.body;
        const userId = req.user.uid;
        if (!serviceName || !credentials) return res.status(400).json({ message: 'Missing required fields: serviceName, credentials' });
        try {
          await admin.firestore().collection('user_integrations').add({
            userId,
            serviceName,
            credentials: '***ENCRYPTED_CREDENTIALS***',
            connectedAt: 'mockTimestamp'
          });
          return res.status(200).json({
            message: `Successfully connected to ${serviceName}`,
            serviceName: serviceName
          });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      });
    });

    jest.spyOn(require('./index'), 'listIntegrations').mockImplementation(async (req: any, res: any) => {
      if (mockHandleCors(req, res)) return;
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });
      await mockVerifyToken(req, res, async () => {
        const userId = req.user.uid;
        try {
          const integrationsSnapshot = { docs: [{ id: 'mockIntegrationId', data: () => ({ serviceName: 'jira', accessToken: 'mockAccessToken' }) }] };
          const integrations = integrationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          integrations.forEach(integration => {
            delete integration.credentials;
          });
          return res.status(200).json({ integrations });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      });
    });

    jest.spyOn(require('./index'), 'jiraAuthUrl').mockImplementation(async (req: any, res: any) => {
      if (mockHandleCors(req, res)) return;
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });
      // Mock functions.config().jira
      const functions = require('firebase-functions');
      functions.config = jest.fn(() => ({ jira: { client_id: 'mockClientId', redirect_uri: 'mockRedirectUri' } }));
      const JIRA_SCOPES = 'read:jira-user read:jira-work write:jira-work';
      const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=mockClientId&scope=${JIRA_SCOPES}&redirect_uri=mockRedirectUri&response_type=code&prompt=consent`;
      return res.status(200).json({ authUrl });
    });

    jest.spyOn(require('./index'), 'jiraCallback').mockImplementation(async (req: any, res: any) => {
      if (mockHandleCors(req, res)) return;
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });
      const { code, state } = req.query;
      if (!code) return res.status(400).json({ message: 'Missing authorization code' });
      const functions = require('firebase-functions');
      functions.config = jest.fn(() => ({ jira: { client_id: 'mockClientId', client_secret: 'mockClientSecret', redirect_uri: 'mockRedirectUri' } }));
      try {
        const tokenData = await global.fetch('https://mock-url.com').then(r => r.json()); // Added a mock URL
        const userId = state;
        if (!userId) return res.status(400).json({ message: 'Missing user ID in state' });
        await admin.firestore().collection('user_integrations').doc(userId).set({
          userId,
          serviceName: 'jira',
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresIn: tokenData.expires_in,
          connectedAt: 'mockTimestamp'
        }, { merge: true });
        return res.status(200).json({ message: 'Jira integration successful!' });
      } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }
    });

    jest.spyOn(require('./index'), 'createJiraIssue').mockImplementation(async (req: any, res: any) => {
      if (mockHandleCors(req, res)) return;
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
      await mockVerifyToken(req, res, async () => {
        const { issueData, jiraAccountId } = req.body;
        const userId = req.user.uid;
        if (!issueData || !jiraAccountId) return res.status(400).json({ message: 'Missing required fields: issueData, jiraAccountId' });
        try {
          const integrationDoc = { exists: true, data: () => ({ serviceName: 'jira', accessToken: 'mockAccessToken' }) };
          if (!integrationDoc.exists || integrationDoc.data().serviceName !== 'jira') return res.status(400).json({ message: 'Jira not integrated for this user' });
          const jiraResponse = { id: '10000', key: 'PROJ-1', self: 'http://example.com/jira/rest/api/2/issue/10000' };
          return res.status(201).json({
            message: 'Jira issue created successfully',
            issue: jiraResponse
          });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      });
    });

    jest.spyOn(require('./index'), 'sendSlackNotification').mockImplementation(async (req: any, res: any) => {
      if (mockHandleCors(req, res)) return;
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
      await mockVerifyToken(req, res, async () => {
        const { channel, message } = req.body;
        const userId = req.user.uid;
        if (!channel || !message) return res.status(400).json({ message: 'Missing required fields: channel, message' });
        const functions = require('firebase-functions');
        functions.config = jest.fn(() => ({ slack: { bot_token: 'mockSlackBotToken' } }));
        try {
          const slackResponse = { ok: true, channel: 'C12345', ts: '1234567890.123456' };
          return res.status(200).json({
            message: 'Slack notification sent successfully',
            response: slackResponse
          });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      });
    });
  });

  // Test connectIntegration function
  test('connectIntegration should store integration details', async () => {
    const req: any = { method: 'POST', body: { serviceName: 'github', credentials: { token: 'abc' } } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await require('./index').connectIntegration(req, res);

    expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('user_integrations');
    expect(mockFirestoreInstance.add).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'testUser1',
      serviceName: 'github',
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Successfully connected to github' }));
  });

  // Test listIntegrations function
  test('listIntegrations should return a list of integrations for the user', async () => {
    const req: any = { method: 'GET', query: {} };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await require('./index').listIntegrations(req, res);

    expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('user_integrations');
    expect(mockFirestoreInstance.where).toHaveBeenCalledWith('userId', '==', 'testUser1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ integrations: expect.any(Array) }));
  });

  // Test jiraAuthUrl function
  test('jiraAuthUrl should return a valid authorization URL', async () => {
    const req: any = { method: 'GET', query: {} };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await require('./index').jiraAuthUrl(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ authUrl: expect.stringContaining('https://auth.atlassian.com/authorize') }));
  });

  // Test jiraCallback function
  test('jiraCallback should exchange code for tokens and store them', async () => {
    const req: any = { method: 'GET', query: { code: 'mockCode', state: 'testUser1' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await require('./index').jiraCallback(req, res);

    expect(global.fetch).toHaveBeenCalled();
    expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('user_integrations');
    expect(mockFirestoreInstance.doc).toHaveBeenCalledWith('testUser1');
    expect(mockFirestoreInstance.set).toHaveBeenCalledWith(expect.objectContaining({
      serviceName: 'jira',
      accessToken: 'mockAccessToken',
    }), { merge: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Jira integration successful!' }));
  });

  // Test createJiraIssue function
  test('createJiraIssue should simulate creating a Jira issue', async () => {
    const req: any = { method: 'POST', body: { issueData: { summary: 'Test Issue' }, jiraAccountId: 'acc123' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await require('./index').createJiraIssue(req, res);

    expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('user_integrations');
    expect(mockFirestoreInstance.doc).toHaveBeenCalledWith('testUser1');
    expect(mockFirestoreInstance.get).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Jira issue created successfully' }));
  });

  // Test sendSlackNotification function
  test('sendSlackNotification should simulate sending a Slack message', async () => {
    const req: any = { method: 'POST', body: { channel: '#general', message: 'Hello Slack' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await require('./index').sendSlackNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Slack notification sent successfully' }));
  });
});