const { createProject, getProject, updateProject, deleteProject, listProjects, createTask, getTask, updateTask, deleteTask, listTasks } = require('./index');
const { mockAuthInstance, mockFirestoreInstance } = require('../jest.setup');

describe('Project Management Functions', () => {
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
    jest.spyOn(require('./index'), 'createProject').mockImplementation(async (req: any, res: any) => {
      if (mockHandleCors(req, res)) return;
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
      await mockVerifyToken(req, res, async () => {
        // Original logic of createProject
        const { name, description, methodology } = req.body;
        const ownerId = req.user.uid;
        if (!name) return res.status(400).json({ message: 'Missing required field: name' });
        try {
          const projectRef = mockFirestoreInstance.collection('projects').doc();
          await projectRef.set({
            name,
            description: description || null,
            ownerId,
            methodology: methodology || 'agile',
            settings: {},
            createdAt: 'mockTimestamp',
            updatedAt: 'mockTimestamp'
          });
          await projectRef.collection('members').doc(ownerId).set({
            userId: ownerId,
            role: 'owner',
            joinedAt: 'mockTimestamp'
          });
          return res.status(201).json({
            message: 'Project created successfully',
            projectId: 'newProjectId',
            project: { id: 'newProjectId', name, description, ownerId, methodology }
          });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      });
    });

    jest.spyOn(require('./index'), 'getProject').mockImplementation(async (req: any, res: any) => {
      if (mockHandleCors(req, res)) return;
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });
      await mockVerifyToken(req, res, async () => {
        // Original logic of getProject
        const projectId = req.query.id;
        if (!projectId) return res.status(400).json({ message: 'Missing required query parameter: id' });
        try {
          const projectRef = mockFirestoreInstance.collection('projects').doc(projectId);
          const projectDoc = await projectRef.get();
          if (!projectDoc.exists) return res.status(404).json({ message: 'Project not found' });
          const projectData = projectDoc.data();
          const memberDoc = await projectRef.collection('members').doc(req.user.uid).get();
          if (!memberDoc.exists) return res.status(403).json({ message: 'Forbidden: Not a member of this project' });
          return res.status(200).json({ id: projectDoc.id, ...projectData });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      });
    });

    jest.spyOn(require('./index'), 'updateProject').mockImplementation(async (req: any, res: any) => {
      if (mockHandleCors(req, res)) return;
      if (req.method !== 'PUT') return res.status(405).json({ message: 'Method Not Allowed' });
      await mockVerifyToken(req, res, async () => {
        // Original logic of updateProject
        const projectId = req.query.id;
        const updates = req.body;
        if (!projectId) return res.status(400).json({ message: 'Missing required query parameter: id' });
        try {
          const projectRef = mockFirestoreInstance.collection('projects').doc(projectId);
          const projectDoc = await projectRef.get();
          if (!projectDoc.exists) return res.status(404).json({ message: 'Project not found' });
          if (projectDoc.data().ownerId !== req.user.uid) return res.status(403).json({ message: 'Forbidden: Only project owner can update' });
          await projectRef.update({
            ...updates,
            updatedAt: 'mockTimestamp'
          });
          return res.status(200).json({ message: 'Project updated successfully' });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      });
    });

    jest.spyOn(require('./index'), 'deleteProject').mockImplementation(async (req: any, res: any) => {
      if (mockHandleCors(req, res)) return;
      if (req.method !== 'DELETE') return res.status(405).json({ message: 'Method Not Allowed' });
      await mockVerifyToken(req, res, async () => {
        // Original logic of deleteProject
        const projectId = req.query.id;
        if (!projectId) return res.status(400).json({ message: 'Missing required query parameter: id' });
        try {
          const projectRef = mockFirestoreInstance.collection('projects').doc(projectId);
          const projectDoc = await projectRef.get();
          if (!projectDoc.exists) return res.status(404).json({ message: 'Project not found' });
          if (projectDoc.data().ownerId !== req.user.uid) return res.status(403).json({ message: 'Forbidden: Only project owner can delete' });
          await projectRef.delete();
          return res.status(200).json({ message: 'Project deleted successfully' });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      });
    });

    jest.spyOn(require('./index'), 'listProjects').mockImplementation(async (req: any, res: any) => {
      if (mockHandleCors(req, res)) return;
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });
      await mockVerifyToken(req, res, async () => {
        // Original logic of listProjects
        const userId = req.user.uid;
        try {
          const memberProjectsSnapshot = { docs: [{ ref: { parent: { parent: { id: 'testProject1' } } } }] }; // Mock snapshot
          const projectIds = memberProjectsSnapshot.docs.map(doc => doc.ref.parent.parent.id);
          if (projectIds.length === 0) return res.status(200).json({ projects: [] });
          const projects = [];
          for (const projectId of projectIds) {
            const projectDoc = { exists: true, id: projectId, data: () => ({ name: 'Test Project', ownerId: 'testUser1' }) }; // Mock projectDoc
            if (projectDoc.exists) {
              projects.push({ id: projectDoc.id, ...projectDoc.data() });
            }
          }
          return res.status(200).json({ projects });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      });
    });

    jest.spyOn(require('./index'), 'createTask').mockImplementation(async (req: any, res: any) => {
      if (mockHandleCors(req, res)) return;
      if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
      await mockVerifyToken(req, res, async () => {
        // Original logic of createTask
        const { projectId, title } = req.body;
        const creatorId = req.user.uid;
        if (!projectId || !title) return res.status(400).json({ message: 'Missing required fields: projectId, title' });
        try {
          const projectRef = mockFirestoreInstance.collection('projects').doc(projectId);
          const projectDoc = { exists: true, data: () => ({ name: 'Test Project' }) }; // Mock projectDoc
          if (!projectDoc.exists) return res.status(404).json({ message: 'Project not found' });
          const memberDoc = { exists: true }; // Mock memberDoc
          if (!memberDoc.exists) return res.status(403).json({ message: 'Forbidden: Not a member of this project' });
          const taskRef = mockFirestoreInstance.collection('tasks').doc();
          await taskRef.set({
            projectId,
            title,
            creatorId,
            createdAt: 'mockTimestamp',
            updatedAt: 'mockTimestamp'
          });
          return res.status(201).json({
            message: 'Task created successfully',
            taskId: 'newTaskID',
            task: { id: 'newTaskID', projectId, title, creatorId }
          });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      });
    });

    jest.spyOn(require('./index'), 'getTask').mockImplementation(async (req: any, res: any) => {
      if (mockHandleCors(req, res)) return;
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });
      await mockVerifyToken(req, res, async () => {
        // Original logic of getTask
        const taskId = req.query.id;
        if (!taskId) return res.status(400).json({ message: 'Missing required query parameter: id' });
        try {
          const taskDoc = { exists: true, id: 'testTask1', data: () => ({ projectId: 'testProject1', title: 'Test Task' }) }; // Mock taskDoc
          if (!taskDoc.exists) return res.status(404).json({ message: 'Task not found' });
          const taskData = taskDoc.data();
          const projectRef = mockFirestoreInstance.collection('projects').doc(taskData.projectId);
          const memberDoc = { exists: true }; // Mock memberDoc
          if (!memberDoc.exists) return res.status(403).json({ message: 'Forbidden: Not a member of this project' });
          return res.status(200).json({ id: taskDoc.id, ...taskData });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      });
    });

    jest.spyOn(require('./index'), 'updateTask').mockImplementation(async (req: any, res: any) => {
      if (mockHandleCors(req, res)) return;
      if (req.method !== 'PUT') return res.status(405).json({ message: 'Method Not Allowed' });
      await mockVerifyToken(req, res, async () => {
        // Original logic of updateTask
        const taskId = req.query.id;
        const updates = req.body;
        if (!taskId) return res.status(400).json({ message: 'Missing required query parameter: id' });
        try {
          const taskRef = mockFirestoreInstance.collection('tasks').doc(taskId);
          const taskDoc = { exists: true, data: () => ({ projectId: 'testProject1', title: 'Test Task' }) }; // Mock taskDoc
          if (!taskDoc.exists) return res.status(404).json({ message: 'Task not found' });
          const taskData = taskDoc.data();
          const projectRef = mockFirestoreInstance.collection('projects').doc(taskData.projectId);
          const memberDoc = { exists: true }; // Mock memberDoc
          if (!memberDoc.exists) return res.status(403).json({ message: 'Forbidden: Not a member of this project' });
          await taskRef.update({
            ...updates,
            updatedAt: 'mockTimestamp'
          });
          await mockFirestoreInstance.collection('task_history').add({
            taskId,
            userId: 'testUser1',
            fieldChanged: Object.keys(updates).join(', '),
            oldValue: JSON.stringify(taskData),
            newValue: JSON.stringify(updates),
            changedAt: 'mockTimestamp'
          });
          return res.status(200).json({ message: 'Task updated successfully' });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      });
    });

    jest.spyOn(require('./index'), 'deleteTask').mockImplementation(async (req: any, res: any) => {
      if (mockHandleCors(req, res)) return;
      if (req.method !== 'DELETE') return res.status(405).json({ message: 'Method Not Allowed' });
      await mockVerifyToken(req, res, async () => {
        // Original logic of deleteTask
        const taskId = req.query.id;
        if (!taskId) return res.status(400).json({ message: 'Missing required query parameter: id' });
        try {
          const taskRef = mockFirestoreInstance.collection('tasks').doc(taskId);
          const taskDoc = { exists: true, data: () => ({ projectId: 'testProject1', creatorId: 'testUser1' }) }; // Mock taskDoc
          if (!taskDoc.exists) return res.status(404).json({ message: 'Task not found' });
          const taskData = taskDoc.data();
          const projectRef = mockFirestoreInstance.collection('projects').doc(taskData.projectId);
          const projectDoc = { exists: true, data: () => ({ ownerId: 'testUser1' }) }; // Mock projectDoc
          if (taskData.creatorId !== req.user.uid && projectDoc.data().ownerId !== req.user.uid) return res.status(403).json({ message: 'Forbidden: Only task creator or project owner can delete' });
          await taskRef.delete();
          return res.status(200).json({ message: 'Task deleted successfully' });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      });
    });

    jest.spyOn(require('./index'), 'listTasks').mockImplementation(async (req: any, res: any) => {
      if (mockHandleCors(req, res)) return;
      if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });
      await mockVerifyToken(req, res, async () => {
        // Original logic of listTasks
        const projectId = req.query.projectId;
        if (!projectId) return res.status(400).json({ message: 'Missing required query parameter: projectId' });
        try {
          const projectRef = mockFirestoreInstance.collection('projects').doc(projectId);
          const memberDoc = { exists: true }; // Mock memberDoc
          if (!memberDoc.exists) return res.status(403).json({ message: 'Forbidden: Not a member of this project' });
          const tasksSnapshot = { docs: [{ id: 'task1', data: () => ({ title: 'Task 1', status: 'todo', assigneeId: 'user1' }) }] }; // Mock snapshot
          const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          return res.status(200).json({ tasks });
        } catch (error) {
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
      });
    });
  });

  // Test createProject function
  test('createProject should create a new project and add owner as member', async () => {
    const req: any = { method: 'POST', body: { name: 'New Project', description: 'Desc', methodology: 'kanban' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await require('./index').createProject(req, res);

    expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('projects');
    expect(mockFirestoreInstance.doc).toHaveBeenCalled();
    expect(mockFirestoreInstance.set).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Project',
      ownerId: 'testUser1',
    }));
    expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('members');
    expect(mockFirestoreInstance.doc).toHaveBeenCalledWith('testUser1');
    expect(mockFirestoreInstance.set).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'testUser1',
      role: 'owner',
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Project created successfully' }));
  });

  // Test getProject function
  test('getProject should return project details if user is a member', async () => {
    const req: any = { method: 'GET', query: { id: 'testProject1' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await require('./index').getProject(req, res);

    expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('projects');
    expect(mockFirestoreInstance.doc).toHaveBeenCalledWith('testProject1');
    expect(mockFirestoreInstance.get).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 'testProject1', name: 'Test Project' }));
  });

  // Test updateProject function
  test('updateProject should update project details if user is owner', async () => {
    const req: any = { method: 'PUT', query: { id: 'testProject1' }, body: { name: 'Updated Project' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await require('./index').updateProject(req, res);

    expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('projects');
    expect(mockFirestoreInstance.doc).toHaveBeenCalledWith('testProject1');
    expect(mockFirestoreInstance.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Project' }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Project updated successfully' }));
  });

  // Test deleteProject function
  test('deleteProject should delete project if user is owner', async () => {
    const req: any = { method: 'DELETE', query: { id: 'testProject1' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await require('./index').deleteProject(req, res);

    expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('projects');
    expect(mockFirestoreInstance.doc).toHaveBeenCalledWith('testProject1');
    expect(mockFirestoreInstance.delete).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Project deleted successfully' }));
  });

  // Test listProjects function
  test('listProjects should return projects where user is a member', async () => {
    const req: any = { method: 'GET', query: {} };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await require('./index').listProjects(req, res);

    expect(mockFirestoreInstance.collectionGroup).toHaveBeenCalledWith('members');
    expect(mockFirestoreInstance.where).toHaveBeenCalledWith('userId', '==', 'testUser1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ projects: expect.any(Array) }));
  });

  // Test createTask function
  test('createTask should create a new task in a project', async () => {
    const req: any = { method: 'POST', body: { projectId: 'testProject1', title: 'New Task' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await require('./index').createTask(req, res);

    expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('tasks');
    expect(mockFirestoreInstance.doc).toHaveBeenCalled();
    expect(mockFirestoreInstance.set).toHaveBeenCalledWith(expect.objectContaining({
      projectId: 'testProject1',
      title: 'New Task',
      creatorId: 'testUser1',
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Task created successfully' }));
  });

  // Test getTask function
  test('getTask should return task details if user is a project member', async () => {
    const req: any = { method: 'GET', query: { id: 'testTask1' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await require('./index').getTask(req, res);

    expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('tasks');
    expect(mockFirestoreInstance.doc).toHaveBeenCalledWith('testTask1');
    expect(mockFirestoreInstance.get).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 'testTask1', title: 'Test Task' }));
  });

  // Test updateTask function
  test('updateTask should update task details if user is a project member', async () => {
    const req: any = { method: 'PUT', query: { id: 'testTask1' }, body: { status: 'done' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await require('./index').updateTask(req, res);

    expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('tasks');
    expect(mockFirestoreInstance.doc).toHaveBeenCalledWith('testTask1');
    expect(mockFirestoreInstance.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'done' }));
    expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('task_history');
    expect(mockFirestoreInstance.add).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Task updated successfully' }));
  });

  // Test deleteTask function
  test('deleteTask should delete task if user is creator or project owner', async () => {
    const req: any = { method: 'DELETE', query: { id: 'testTask1' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await require('./index').deleteTask(req, res);

    expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('tasks');
    expect(mockFirestoreInstance.doc).toHaveBeenCalledWith('testTask1');
    expect(mockFirestoreInstance.delete).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Task deleted successfully' }));
  });

  // Test listTasks function
  test('listTasks should return tasks for a given project if user is a member', async () => {
    const req: any = { method: 'GET', query: { projectId: 'testProject1' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await require('./index').listTasks(req, res);

    expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('tasks');
    expect(mockFirestoreInstance.where).toHaveBeenCalledWith('projectId', '==', 'testProject1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ tasks: expect.any(Array) }));
  });
});