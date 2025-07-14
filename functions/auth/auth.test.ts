/// <reference types="jest" />
import * as admin from 'firebase-admin';
const { register, login, oauthGoogle, forgotPassword, resetPassword } = require('./index');

describe('Authentication Functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test register function
  test('register should create a new user and store data in Firestore', async () => {
    const req: any = { method: 'POST', body: { email: 'test@example.com', password: 'password123', fullName: 'Test User' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await register(req, res);

    expect(admin.auth().createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User',
    });
    expect(admin.firestore().collection).toHaveBeenCalledWith('users');
    expect(admin.firestore().doc).toHaveBeenCalledWith('testUid');
    expect(admin.firestore().set).toHaveBeenCalledWith({
      email: 'test@example.com',
      fullName: 'Test User',
      avatarUrl: null, // Default avatar URL
      emailVerified: false,
      createdAt: 'mockTimestamp',
      updatedAt: 'mockTimestamp',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User registered successfully' }));
  });

  // Test login function
  test('login should return a custom token for a valid user', async () => {
    const req: any = { method: 'POST', body: { email: 'test@example.com', password: 'password123' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await login(req, res);

    expect(admin.auth().getUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(admin.auth().createCustomToken).toHaveBeenCalledWith('testUid');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ customToken: 'mockCustomToken' }));
  });

  // Test oauthGoogle function
  test('oauthGoogle should handle new user registration via Google', async () => {
    const req: any = { method: 'POST', body: { idToken: 'mockIdToken' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await oauthGoogle(req, res);

    expect(admin.auth().verifyIdToken).toHaveBeenCalledWith('mockIdToken');
    expect(admin.auth().createUser).toHaveBeenCalled();
    expect(admin.firestore().collection).toHaveBeenCalledWith('users');
    expect(admin.firestore().doc).toHaveBeenCalledWith('testUid');
    expect(admin.firestore().set).toHaveBeenCalledWith(expect.objectContaining({ email: 'test@example.com' }), { merge: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Google OAuth successful' }));
  });

  // Test forgotPassword function
  test('forgotPassword should send a password reset link', async () => {
    const req: any = { method: 'POST', body: { email: 'test@example.com' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await forgotPassword(req, res);

    expect(admin.auth().generatePasswordResetLink).toHaveBeenCalledWith('test@example.com');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Password reset email sent (check logs for link)' }));
  });

  // Test resetPassword function
  test('resetPassword should confirm password reset', async () => {
    const req: any = { method: 'POST', body: { oobCode: 'mockOobCode', newPassword: 'newPassword123' } };
    const res: any = { status: jest.fn(() => res), json: jest.fn() };

    await resetPassword(req, res);

    expect(admin.auth().confirmPasswordReset).toHaveBeenCalledWith('mockOobCode', 'newPassword123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Password has been reset successfully.' }));
  });
});