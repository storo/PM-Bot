/// <reference types="jest" />
import * as admin from 'firebase-admin';
const { pmBotEngine } = require('./engine');

describe('Conversational Engine', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('processMessage should handle user input and return bot response', async () => {
    const input = {
      userId: 'user123',
      message: 'Hello PM-Bot',
      sessionId: 'session123',
    };

    const result = await pmBotEngine.processMessage(input);

    expect(result.response).toBe('Mocked bot response');
    expect(result.agent).toBe('project_manager'); // Default agent
    expect(result.context.messageHistory).toHaveLength(2); // User message + bot response
    expect(admin.firestore().collection).toHaveBeenCalledWith('conversation_contexts');
    expect(admin.firestore().doc).toHaveBeenCalledWith('session123');
    expect(admin.firestore().set).toHaveBeenCalled();
  });

  test('processMessage should create a new session if sessionId is not provided', async () => {
    const input = {
      userId: 'user456',
      message: 'Create a new project',
    };

    const result = await pmBotEngine.processMessage(input);

    expect(result.response).toBe('Mocked bot response');
    expect(result.context.sessionId).toBeDefined(); // New session ID should be generated
    expect(admin.firestore().collection).toHaveBeenCalledWith('conversation_contexts');
    expect(admin.firestore().doc).toHaveBeenCalledWith(result.context.sessionId);
    expect(admin.firestore().set).toHaveBeenCalled();
  });

  test('processMessage should handle errors gracefully', async () => {
    // Simulate an error during processing
    jest.spyOn(pmBotEngine, 'getConversationContext').mockImplementationOnce(() => {
      throw new Error('Failed to get context');
    });

    const input = {
      userId: 'user789',
      message: 'Some message',
      sessionId: 'session789',
    };

    const result = await pmBotEngine.processMessage(input);

    expect(result.response).toContain('Lo siento, hubo un error');
    expect(result.agent).toBe('project_manager');
    expect(result.context.sessionId).toBe('session789'); // Context should still be returned
  });
});