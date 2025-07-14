import { beforeAll, afterAll, jest } from '@jest/globals';
const { execSync } = require('child_process');

// Mock Firebase Admin SDK before any modules that use it are loaded
const mockFirestoreInstance = {
  collection: jest.fn(() => mockFirestoreInstance),
  doc: jest.fn(() => mockFirestoreInstance),
  set: jest.fn(() => Promise.resolve()),
  get: jest.fn(() => Promise.resolve({
    exists: true,
    data: () => ({ ownerId: 'testUser1', name: 'Test Project' }),
    docs: [
      { data: jest.fn(() => ({ status: 'todo', dueDate: new Date('2025-07-01') })) },
      { data: jest.fn(() => ({ status: 'done', dueDate: new Date('2025-07-05') })) },
      { data: jest.fn(() => ({ status: 'in_progress', dueDate: new Date('2025-07-10') })) },
      { data: jest.fn(() => ({ status: 'blocked', dueDate: new Date('2025-07-15') })) },
      { data: jest.fn(() => ({ status: 'todo', dueDate: new Date('2025-07-20') })) },
    ],
    map: jest.fn((callback: (doc: any) => any) => mockFirestoreInstance.get().docs.map(callback)),
  })),
  add: jest.fn(() => Promise.resolve({ id: 'mockDocId' })),
  update: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
  collectionGroup: jest.fn(() => mockFirestoreInstance),
  where: jest.fn(() => mockFirestoreInstance),
  FieldValue: { serverTimestamp: jest.fn(() => 'mockTimestamp') },
};

const mockAuthInstance = {
  createUser: jest.fn(() => Promise.resolve({ uid: 'testUid', email: 'test@example.com', emailVerified: false })),
  getUserByEmail: jest.fn(() => Promise.resolve({ uid: 'testUid', email: 'test@example.com' })),
  createCustomToken: jest.fn(() => Promise.resolve('mockCustomToken')),
  verifyIdToken: jest.fn(() => Promise.resolve({ uid: 'testUid', email: 'test@example.com', name: 'Test User', picture: 'url', email_verified: true })),
  generatePasswordResetLink: jest.fn(() => Promise.resolve('mockResetLink')),
  confirmPasswordReset: jest.fn(() => Promise.resolve()),
};

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  auth: jest.fn(() => mockAuthInstance),
  firestore: jest.fn(() => mockFirestoreInstance),
  apps: [], // Mock admin.apps to prevent 'length' error
}));

// Mock firebase-functions
jest.mock('firebase-functions', () => ({
  https: {
    onRequest: jest.fn((handler: (req: any, res: any) => void) => handler),
  },
  config: jest.fn(() => ({
    gemini: { api_key: 'mock-gemini-api-key' },
    jira: { client_id: 'mockClientId', redirect_uri: 'mockRedirectUri', client_secret: 'mockClientSecret' },
    slack: { bot_token: 'mockSlackBotToken' },
  })),
}));

beforeAll(async () => {
  // Setup test environment
  console.log('Setting up test environment...');
  // Mock environment variables
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
});

afterAll(async () => {
  // Cleanup test environment
  console.log('Cleaning up test environment...');
  delete process.env.FIRESTORE_EMULATOR_HOST;
  delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
});

module.exports = { mockFirestoreInstance, mockAuthInstance };