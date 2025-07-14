import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 }, // Ramp up to 50 users in 1 minute
    { duration: '3m', target: 50 }, // Stay at 50 users for 3 minutes
    { duration: '1m', target: 0 },  // Ramp down to 0 users in 1 minute
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
    http_req_failed: ['rate<0.01'],   // Error rate should be below 1%
  },
};

export default function () {
  // Test registration endpoint
  const registerRes = http.post('http://localhost:5001/pm-bot-prod/us-central1/register', JSON.stringify({
    email: `test-${__VU}-${__ITER}@example.com`,
    password: 'password123',
    fullName: 'Test User',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(registerRes, { 'register status is 201': (r) => r.status === 201 });
  sleep(1);

  // Test login endpoint
  const loginRes = http.post('http://localhost:5001/pm-bot-prod/us-central1/login', JSON.stringify({
    email: `test-${__VU}-${__ITER}@example.com`,
    password: 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(loginRes, { 'login status is 200': (r) => r.status === 200 });
  sleep(1);

  // Test oauthGoogle endpoint (simplified, as it requires a valid ID token)
  const oauthGoogleRes = http.post('http://localhost:5001/pm-bot-prod/us-central1/oauthGoogle', JSON.stringify({
    idToken: 'mock-google-id-token', // This would be a real ID token in a full test
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(oauthGoogleRes, { 'oauthGoogle status is 200': (r) => r.status === 200 });
  sleep(1);
};