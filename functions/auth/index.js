const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { db } = require('../utils/firestore');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Handles user registration with email and password.
 * UC-001: Registro de Usuario
 */
exports.register = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ message: 'Missing required fields: email, password, fullName' });
  }

  try {
    // 1. Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: fullName,
    });

    // 2. Store additional user data in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: email,
      fullName: fullName,
      avatarUrl: null, // Default avatar URL
      emailVerified: userRecord.emailVerified,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 3. Send email verification (optional, but good practice)
    // const actionCodeSettings = {
    //   url: 'https://www.example.com/finishSignUp?cartId=1234',
    //   handleCodeInApp: true,
    // };
    // await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
    // console.log('Email verification link sent to:', email);

    return res.status(201).json({
      message: 'User registered successfully',
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified
    });

  } catch (error) {
    console.error('Error during user registration:', error);

    let errorMessage = 'Internal server error';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'The provided email is already in use by an existing user.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'The provided email is not a valid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'The password is too weak.';
    }

    return res.status(400).json({ message: errorMessage, code: error.code });
  }
});

/**
 * Handles Google OAuth 2.0 integration for user registration and login.
 * UC-001, UC-002: Integración OAuth 2.0 Google
 */
exports.oauthGoogle = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'Missing Google ID token' });
  }

  try {
    // Verify the ID token received from the client
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;
    const fullName = decodedToken.name || email;
    const avatarUrl = decodedToken.picture || null;

    // Check if the user already exists in Firebase Auth
    let userRecord;
    try {
      userRecord = await admin.auth().getUser(uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // User does not exist, create a new one
        userRecord = await admin.auth().createUser({
          uid: uid,
          email: email,
          displayName: fullName,
          photoURL: avatarUrl,
          emailVerified: decodedToken.email_verified,
        });
      } else {
        throw error;
      }
    }

    // Store/update user data in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      fullName: userRecord.displayName,
      avatarUrl: userRecord.photoURL,
      emailVerified: userRecord.emailVerified,
      createdAt: userRecord.metadata.creationTime ? new Date(userRecord.metadata.creationTime) : admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true }); // Use merge to update existing fields without overwriting the whole document

    // Generate a custom token for the client to sign in with Firebase SDK
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    return res.status(200).json({
      message: 'Google OAuth successful',
      uid: userRecord.uid,
      email: userRecord.email,
      customToken: customToken,
      isNewUser: userRecord.metadata.creationTime === userRecord.metadata.lastSignInTime // Simple check for new user
    });

  } catch (error) {
    console.error('Error during Google OAuth:', error);
    return res.status(400).json({ message: 'Authentication failed', code: error.code });
  }
});

/**
 * Handles password reset request by sending a password reset email.
 * UC-002: Password Reset Flow
 */
exports.forgotPassword = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Missing email field' });
  }

  try {
    // Generate a password reset link
    const link = await admin.auth().generatePasswordResetLink(email);

    // In a real application, you would send this link via an email service
    // For now, we'll just log it.
    console.log('Password reset link for', email, ':', link);

    return res.status(200).json({
      message: 'Password reset email sent (check logs for link)',
      email: email
    });

  } catch (error) {
    console.error('Error during password reset request:', error);

    let errorMessage = 'Internal server error';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'The provided email does not correspond to an existing user.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'The provided email is not a valid email address.';
    }

    return res.status(400).json({ message: errorMessage, code: error.code });
  }
});

/**
 * Handles password reset using a reset code and new password.
 * UC-002: Password Reset Flow
 */
exports.resetPassword = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { oobCode, newPassword } = req.body;

  if (!oobCode || !newPassword) {
    return res.status(400).json({ message: 'Missing required fields: oobCode, newPassword' });
  }

  try {
    // Verify the password reset code and update the user's password
    await admin.auth().confirmPasswordReset(oobCode, newPassword);

    return res.status(200).json({
      message: 'Password has been reset successfully.'
    });

  } catch (error) {
    console.error('Error during password reset:', error);

    let errorMessage = 'Internal server error';
    if (error.code === 'auth/invalid-action-code') {
      errorMessage = 'The password reset code is invalid or has expired.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'The user account has been disabled.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'The new password is too weak.';
    }

    return res.status(400).json({ message: errorMessage, code: error.code });
  }
});