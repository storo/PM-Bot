const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { db } = require('../utils/firestore');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Helper function to check if the authenticated user has a specific role.
 * Roles are assumed to be stored in custom claims of the Firebase ID token.
 */
const hasRole = (req, role) => {
  return req.user && req.user.customClaims && req.user.customClaims[role] === true;
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
 * Project Management Service
 * Handles CRUD operations for projects and tasks.
 * TASK-BE-013: Project Management Microservice
 */

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
 * Creates a new project.
 * UC-003: Onboarding del Primer Proyecto (part of)
 */
exports.createProject = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await verifyToken(req, res, async () => {
    const { name, description, methodology } = req.body;
    const ownerId = req.user.uid; // Owner is the authenticated user

    if (!name) {
      return res.status(400).json({ message: 'Missing required field: name' });
    }

    try {
      const projectRef = db.collection('projects').doc();
      await projectRef.set({
        name,
        description: description || null,
        ownerId,
        methodology: methodology || 'agile',
        settings: {},
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Add owner as a member of the project
      await projectRef.collection('members').doc(ownerId).set({
        userId: ownerId,
        role: 'owner',
        joinedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(201).json({
        message: 'Project created successfully',
        projectId: projectRef.id,
        project: { id: projectRef.id, name, description, ownerId, methodology }
      });

    } catch (error) {
      console.error('Error creating project:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
});

/**
 * Gets a project by ID.
 */
exports.getProject = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await verifyToken(req, res, async () => {
    const projectId = req.query.id;

    if (!projectId) {
      return res.status(400).json({ message: 'Missing required query parameter: id' });
    }

    try {
      const projectRef = db.collection('projects').doc(projectId);
      const projectDoc = await projectRef.get();

      if (!projectDoc.exists) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const projectData = projectDoc.data();

      // Basic authorization: only owner or member can view
      const memberDoc = await projectRef.collection('members').doc(req.user.uid).get();
      if (!memberDoc.exists) {
        return res.status(403).json({ message: 'Forbidden: Not a member of this project' });
      }

      return res.status(200).json({ id: projectDoc.id, ...projectData });

    } catch (error) {
      console.error('Error getting project:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
});

/**
 * Updates a project by ID.
 */
exports.updateProject = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await verifyToken(req, res, async () => {
    const projectId = req.query.id;
    const updates = req.body;

    if (!projectId) {
      return res.status(400).json({ message: 'Missing required query parameter: id' });
    }

    try {
      const projectRef = db.collection('projects').doc(projectId);
      const projectDoc = await projectRef.get();

      if (!projectDoc.exists) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Authorization: only owner or project_manager can update
      if (projectDoc.data().ownerId !== req.user.uid && !hasRole(req, 'project_manager')) {
        return res.status(403).json({ message: 'Forbidden: Only project owner or a project manager can update' });
      }

      await projectRef.update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(200).json({ message: 'Project updated successfully' });

    } catch (error) {
      console.error('Error updating project:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
});

/**
 * Deletes a project by ID.
 */
exports.deleteProject = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await verifyToken(req, res, async () => {
    const projectId = req.query.id;

    if (!projectId) {
      return res.status(400).json({ message: 'Missing required query parameter: id' });
    }

    try {
      const projectRef = db.collection('projects').doc(projectId);
      const projectDoc = await projectRef.get();

      if (!projectDoc.exists) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Authorization: only owner or project_manager can delete
      if (projectDoc.data().ownerId !== req.user.uid && !hasRole(req, 'project_manager')) {
        return res.status(403).json({ message: 'Forbidden: Only project owner or a project manager can delete' });
      }

      // Delete project and its subcollections (members, tasks, etc.)
      // Note: Deleting subcollections in Firestore requires recursive deletion.
      // For simplicity, this example only deletes the project document.
      // In a production app, you'd use a Cloud Function to recursively delete.
      await projectRef.delete();

      return res.status(200).json({ message: 'Project deleted successfully' });

    } catch (error) {
      console.error('Error deleting project:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
});

/**
 * Lists projects for the authenticated user.
 */
exports.listProjects = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await verifyToken(req, res, async () => {
    const userId = req.user.uid;

    try {
      // Find projects where the user is a member
      const memberProjectsSnapshot = await db.collectionGroup('members')
        .where('userId', '==', userId)
        .get();

      const projectIds = memberProjectsSnapshot.docs.map(doc => doc.ref.parent.parent.id);

      if (projectIds.length === 0) {
        return res.status(200).json({ projects: [] });
      }

      // Fetch project details for the found project IDs
      const projects = [];
      for (const projectId of projectIds) {
        const projectDoc = await db.collection('projects').doc(projectId).get();
        if (projectDoc.exists) {
          projects.push({ id: projectDoc.id, ...projectDoc.data() });
        }
      }

      return res.status(200).json({ projects });

    } catch (error) {
      console.error('Error listing projects:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
});

/**
 * Creates a new task within a project.
 * UC-004: Crear Tarea Conversacionalmente (part of)
 */
exports.createTask = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await verifyToken(req, res, async () => {
    const { projectId, title, description, status, assigneeId, dueDate, priority, storyPoints } = req.body;
    const creatorId = req.user.uid;

    if (!projectId || !title) {
      return res.status(400).json({ message: 'Missing required fields: projectId, title' });
    }

    try {
      // Verify project exists and user is a member
      const projectRef = db.collection('projects').doc(projectId);
      const projectDoc = await projectRef.get();
      if (!projectDoc.exists) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const memberDoc = await projectRef.collection('members').doc(creatorId).get();
      if (!memberDoc.exists) {
        return res.status(403).json({ message: 'Forbidden: Not a member of this project' });
      }

      const taskRef = db.collection('tasks').doc();
      await taskRef.set({
        projectId,
        title,
        description: description || null,
        status: status || 'todo',
        assigneeId: assigneeId || null,
        creatorId,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'medium',
        storyPoints: storyPoints || null,
        externalId: null,
        externalSystem: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(201).json({
        message: 'Task created successfully',
        taskId: taskRef.id,
        task: { id: taskRef.id, projectId, title, creatorId }
      });

    } catch (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
});

/**
 * Gets a task by ID.
 */
exports.getTask = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await verifyToken(req, res, async () => {
    const taskId = req.query.id;

    if (!taskId) {
      return res.status(400).json({ message: 'Missing required query parameter: id' });
    }

    try {
      const taskDoc = await db.collection('tasks').doc(taskId).get();

      if (!taskDoc.exists) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const taskData = taskDoc.data();

      // Basic authorization: user must be a member of the project the task belongs to
      const projectRef = db.collection('projects').doc(taskData.projectId);
      const memberDoc = await projectRef.collection('members').doc(req.user.uid).get();
      if (!memberDoc.exists) {
        return res.status(403).json({ message: 'Forbidden: Not a member of this project' });
      }

      return res.status(200).json({ id: taskDoc.id, ...taskData });

    } catch (error) {
      console.error('Error getting task:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
});

/**
 * Updates a task by ID.
 * UC-006: Actualizar Estado de Tarea
 */
exports.updateTask = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await verifyToken(req, res, async () => {
    const taskId = req.query.id;
    const updates = req.body;

    if (!taskId) {
      return res.status(400).json({ message: 'Missing required query parameter: id' });
    }

    try {
      const taskRef = db.collection('tasks').doc(taskId);
      const taskDoc = await taskRef.get();

      if (!taskDoc.exists) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const taskData = taskDoc.data();

      // Authorization: user must be a member of the project the task belongs to
      const projectRef = db.collection('projects').doc(taskData.projectId);
      const memberDoc = await projectRef.collection('members').doc(req.user.uid).get();
      if (!memberDoc.exists) {
        return res.status(403).json({ message: 'Forbidden: Not a member of this project' });
      }

      await taskRef.update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Log task history (optional, for auditing)
      await db.collection('task_history').add({
        taskId,
        userId: req.user.uid,
        fieldChanged: Object.keys(updates).join(', '),
        oldValue: JSON.stringify(taskData), // Store old data for audit
        newValue: JSON.stringify(updates), // Store new data for audit
        changedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(200).json({ message: 'Task updated successfully' });

    } catch (error) {
      console.error('Error updating task:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
});

/**
 * Deletes a task by ID.
 */
exports.deleteTask = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await verifyToken(req, res, async () => {
    const taskId = req.query.id;

    if (!taskId) {
      return res.status(400).json({ message: 'Missing required query parameter: id' });
    }

    try {
      const taskRef = db.collection('tasks').doc(taskId);
      const taskDoc = await taskRef.get();

      if (!taskDoc.exists) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const taskData = taskDoc.data();

      // Authorization: only creator, project owner, or project_manager can delete
      if (taskData.creatorId !== req.user.uid && projectDoc.data().ownerId !== req.user.uid && !hasRole(req, 'project_manager')) {
        return res.status(403).json({ message: 'Forbidden: Only task creator, project owner, or a project manager can delete' });
      }

      await taskRef.delete();

      return res.status(200).json({ message: 'Task deleted successfully' });

    } catch (error) {
      console.error('Error deleting task:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
});

/**
 * Lists tasks for a given project.
 */
exports.listTasks = functions.https.onRequest(async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await verifyToken(req, res, async () => {
    const projectId = req.query.projectId;
    const status = req.query.status; // Optional filter
    const assigneeId = req.query.assigneeId; // Optional filter

    if (!projectId) {
      return res.status(400).json({ message: 'Missing required query parameter: projectId' });
    }

    try {
      // Verify user is a member of the project
      const projectRef = db.collection('projects').doc(projectId);
      const memberDoc = await projectRef.collection('members').doc(req.user.uid).get();
      if (!memberDoc.exists) {
        return res.status(403).json({ message: 'Forbidden: Not a member of this project' });
      }

      let tasksQuery = db.collection('tasks').where('projectId', '==', projectId);

      if (status) {
        tasksQuery = tasksQuery.where('status', '==', status);
      }
      if (assigneeId) {
        tasksQuery = tasksQuery.where('assigneeId', '==', assigneeId);
      }

      const tasksSnapshot = await tasksQuery.get();
      const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return res.status(200).json({ tasks });

    } catch (error) {
      console.error('Error listing tasks:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
});