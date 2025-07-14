import '@jest/globals';
declare const jest: any;
const { execSync } = require('child_process');
const admin = require('firebase-admin');

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
  // Start Firebase emulators (Firestore and Auth)
  console.log('Starting Firebase emulators...');
  try {
    execSync('firebase emulators:start --only firestore,auth --project pm-bot-test --import=./firebase-emulator-data --export-on-exit', { stdio: 'inherit' });
    console.log('Firebase emulators started.');
  } catch (error) {
    console.error('Failed to start Firebase emulators:', error);
    process.exit(1);
  }

  // Seed Firestore with test data
  console.log('Seeding Firestore...');
  try {
    execSync('npm run seed:test-db', { stdio: 'inherit', cwd: './functions' });
    console.log('Firestore seeded.');
  } catch (error) {
    console.error('Failed to seed Firestore:', error);
    process.exit(1);
  }
});

afterAll(async () => {
  // Stop Firebase emulators
  console.log('Stopping Firebase emulators...');
  try {
    execSync('firebase emulators:stop --project pm-bot-test', { stdio: 'inherit' });
    console.log('Firebase emulators stopped.');
  } catch (error) {
    console.error('Failed to stop Firebase emulators:', error);
    process.exit(1);
  }
});

module.exports = { mockFirestoreInstance, mockAuthInstance };