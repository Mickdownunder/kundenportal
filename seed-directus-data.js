const fetch = require('node-fetch');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = 'PpLh4sXlyNo3PeiJu8H5oMGSObdGZEnr';

async function apiCall(endpoint, method, body) {
  const response = await fetch(`${DIRECTUS_URL}${endpoint}`, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    console.error(`API Error at ${endpoint}:`, data);
    return null;
  }
  console.log(`Success at ${endpoint}:`, data);
  return data.data;
}

async function main() {
  // Seed User (Kunde)
  const user = await apiCall('/items/User', 'POST', {
    name: 'Test Kunde',
    email: 'kunde@example.com',
    role: 'USER',
  });

  // Seed Project mit Zugangscode
  const project = await apiCall('/items/Project', 'POST', {
    name: 'Test Projekt',
    status: 'PLANNING',
    userId: user.id,
    accessCode: 'ABC123',  // Dein Zugangscode - passe an, wenn Field nicht existiert
  });

  // Seed Document
  await apiCall('/items/Document', 'POST', {
    fileName: 'test_grundriss.pdf',
    fileUrl: 'http://localhost/uploads/test.pdf',
    fileType: 'grundriss',
    projectId: project.id,
  });

  // Seed Appointment
  await apiCall('/items/Appointment', 'POST', {
    date: new Date().toISOString(),
    type: 'Beratung',
    projectId: project.id,
  });

  console.log('Test-Daten geseedet! Zugangscode: ABC123 für Test Kunde');
}

main().catch(console.error);
