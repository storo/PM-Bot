import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { 
  auth, 
  functions, 
  googleProvider 
} from './firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import OnboardingFlow from './components/OnboardingFlow'; // Import OnboardingFlow
import BurndownChart from './components/BurndownChart'; // Import BurndownChart
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false); // New state for onboarding
  const [onboardingCompleted, setOnboardingCompleted] = useState(false); // New state to track onboarding completion

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      if (user) {
        setMessage(`Logged in as ${user.email}`);
        setSessionId(user.uid);
        // Simulate checking if onboarding is needed
        // In a real app, you'd fetch user data from Firestore to check onboarding status
        // For now, assume new logins need onboarding unless explicitly completed
        setShowOnboarding(!onboardingCompleted); 
      } else {
        setMessage('Logged out');
        setSessionId(null);
        setChatHistory([]);
        setShowOnboarding(false);
        setOnboardingCompleted(false); // Reset on logout
      }
    });
    return () => unsubscribe();
  }, [onboardingCompleted]); // Add onboardingCompleted to dependencies

  const handleRegister = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const registerUser = httpsCallable(functions, 'register');
      await registerUser({ email, fullName, uid: userCredential.user.uid });
      setMessage('Registration successful!');
      setShowOnboarding(true); 
      setOnboardingCompleted(false); // New user, onboarding not completed yet
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('Login successful!');
      // In a real app, check Firestore for onboarding status
      setShowOnboarding(!onboardingCompleted); 
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const oauthGoogle = httpsCallable(functions, 'oauthGoogle');
      await oauthGoogle({ idToken: await result.user.getIdToken() });
      setMessage('Google login successful!');
      // In a real app, check Firestore for onboarding status
      setShowOnboarding(!onboardingCompleted); 
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await signOut(auth);
      setMessage('Logged out successfully!');
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setOnboardingCompleted(true); // Mark onboarding as completed
    setMessage('Onboarding completed! You can now use the chat.');
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    if (!user) {
      setError('Please log in to send messages to the conversational engine.');
      return;
    }

    const userMessage = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMessage }]);
    setChatInput('');
    setLoading(true);
    setError('');

    try {
      const handleMessage = httpsCallable(functions, 'handleMessage');
      const response = await handleMessage({
        userId: user.uid,
        message: userMessage,
        sessionId: sessionId
      });
      setChatHistory(prev => [...prev, { sender: 'bot', text: response.data.message }]);
      setSessionId(response.data.sessionId); // Update session ID if a new one was generated
    } catch (err) {
      console.error('Conversational engine error:', err);
      setError(err.message);
      setChatHistory(prev => [...prev, { sender: 'bot', text: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>PM-Bot Frontend</h1>
        {!user ? (
          <>
            <h2>Register</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <button onClick={handleRegister} disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>

            <h2>Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging In...' : 'Login'}
            </button>
            <button onClick={handleGoogleLogin} disabled={loading}>
              {loading ? 'Logging In with Google...' : 'Login with Google'}
            </button>
          </>
        ) : (
          <>
            <h2>Welcome, {user.email}!</h2>
            <button onClick={handleLogout} disabled={loading}>
              {loading ? 'Logging Out...' : 'Logout'}
            </button>

            {showOnboarding ? (
              <OnboardingFlow onComplete={handleOnboardingComplete} />
            ) : (
              <>
                <div className="chat-container" style={{ marginTop: '20px', width: '80%', maxWidth: '600px', border: '1px solid #61dafb', borderRadius: '8px', padding: '10px', height: '300px', overflowY: 'scroll', display: 'flex', flexDirection: 'column' }}>
                  {chatHistory.map((msg, index) => (
                    <div key={index} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.sender === 'user' ? '#61dafb' : '#444', color: 'white', padding: '8px', borderRadius: '5px', margin: '5px', maxWidth: '70%' }}>
                      <strong>{msg.sender === 'user' ? 'You' : 'PM-Bot'}:</strong> {msg.text}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', marginTop: '10px', width: '80%', maxWidth: '600px' }}>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                    style={{ flexGrow: 1, padding: '8px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '10px', color: 'black' }}
                  />
                  <button onClick={handleSendMessage} disabled={loading}>
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </div>
                <BurndownChart />
              </>
            )}
          </>
        )}

        {message && <p style={{ color: 'lightgreen' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </header>
    </div>
  );
}

export default App;
