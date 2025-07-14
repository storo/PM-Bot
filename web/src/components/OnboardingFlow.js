import React from 'react';

function OnboardingFlow({ onComplete }) {
  return (
    <div style={{ padding: '20px', border: '1px solid #61dafb', borderRadius: '8px', marginTop: '20px', maxWidth: '600px', width: '80%' }}>
      <h2>Welcome to PM-Bot!</h2>
      <p>Let's get you set up. This is your onboarding flow.</p>
      <p>Here you would create your first project, invite team members, and set up your preferences.</p>
      <button onClick={onComplete} style={{ marginTop: '15px' }}>Complete Onboarding</button>
    </div>
  );
}

export default OnboardingFlow;