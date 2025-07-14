const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'pm-bot-test', // Use a test project ID for emulator
  });
}

const db = admin.firestore();

const seedData = {
  users: [
    {
      id: 'testUser1',
      email: 'test1@example.com',
      fullName: 'Test User One',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      id: 'testUser2',
      email: 'test2@example.com',
      fullName: 'Test User Two',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ],
  projects: [
    {
      id: 'testProject1',
      name: 'Test Project One',
      description: 'A project for testing purposes.',
      ownerId: 'testUser1',
      methodology: 'agile',
      settings: {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ],
  tasks: [
    {
      id: 'testTask1',
      projectId: 'testProject1',
      title: 'Implement unit tests',
      description: 'Write unit tests for authentication module.',
      status: 'todo',
      assigneeId: 'testUser1',
      creatorId: 'testUser1',
      dueDate: new Date('2025-07-30'),
      priority: 'high',
      storyPoints: 5,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      id: 'testTask2',
      projectId: 'testProject1',
      title: 'Setup CI/CD pipeline',
      description: 'Configure GitHub Actions for automated deployments.',
      status: 'in_progress',
      assigneeId: 'testUser2',
      creatorId: 'testUser1',
      dueDate: new Date('2025-08-15'),
      priority: 'medium',
      storyPoints: 8,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ],
};

async function seedFirestore() {
  console.log('Seeding Firestore with test data...');

  // Clear existing data (optional, but good for consistent tests)
  // In a real scenario, you might use the Firebase CLI to clear data:
  // firebase emulators:exec "echo 'clearing data'" --only firestore

  for (const collectionName in seedData) {
    const collectionRef = db.collection(collectionName);
    for (const docData of seedData[collectionName]) {
      const docRef = collectionRef.doc(docData.id);
      await docRef.set(docData);

      // Add subcollections if they exist in seedData
      if (collectionName === 'projects' && docData.id === 'testProject1') {
        await docRef.collection('members').doc('testUser1').set({
          userId: 'testUser1',
          role: 'owner',
          joinedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        await docRef.collection('members').doc('testUser2').set({
          userId: 'testUser2',
          role: 'member',
          joinedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
  }

  console.log('Firestore seeding complete.');
}

seedFirestore().catch(console.error);
