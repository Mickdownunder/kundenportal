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
    return false;
  }
  console.log(`Success at ${endpoint}:`, data);
  return true;
}

async function collectionExists(collection) {
  const response = await fetch(`${DIRECTUS_URL}/collections/${collection}`, {
    headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` },
  });
  return response.ok;
}

async function setPermissions(collection) {
  const actions = ['create', 'read', 'update', 'delete'];
  for (const action of actions) {
    await apiCall('/permissions', 'POST', {
      policy: '53575e35-a5bb-4719-834b-5887be98222a', // Administrator Policy ID
      collection: collection,
      action: action,
      permissions: {},
      validation: {},
      presets: {},
      fields: ['*'],
    });
  }
  console.log(`Permissions for ${collection} set!`);
}

async function main() {
  const collections = [
    {
      name: 'User',
      comment: 'Benutzer',
      fields: [
        { field: 'id', type: 'uuid', meta: { interface: 'input', hidden: true }, schema: { is_primary_key: true, default_value: 'uuid_generate_v4()' } },
        { field: 'name', type: 'string', meta: { interface: 'input' } },
        { field: 'email', type: 'string', meta: { interface: 'input' }, schema: { is_unique: true } },
        { field: 'role', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'USER', value: 'USER' }, { text: 'ADMIN', value: 'ADMIN' }, { text: 'SELLER', value: 'SELLER' }] } } },
        { field: 'createdAt', type: 'timestamp', meta: { interface: 'datetime' }, schema: { default_value: 'CURRENT_TIMESTAMP' } },
        { field: 'updatedAt', type: 'timestamp', meta: { interface: 'datetime' }, schema: { default_value: 'CURRENT_TIMESTAMP' } },
      ],
    },
    {
      name: 'Project',
      comment: 'Projekte',
      fields: [
        { field: 'id', type: 'uuid', meta: { interface: 'input', hidden: true }, schema: { is_primary_key: true, default_value: 'uuid_generate_v4()' } },
        { field: 'name', type: 'string', meta: { interface: 'input' } },
        { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'PLANNING', value: 'PLANNING' }, { text: 'PRODUCTION', value: 'PRODUCTION' }, { text: 'DELIVERY', value: 'DELIVERY' }, { text: 'INSTALLATION', value: 'INSTALLATION' }, { text: 'COMPLETED', value: 'COMPLETED' }] } } },
        { field: 'userId', type: 'uuid', meta: { interface: 'm2o', options: { collection: 'User', value_field: 'id', display_field: 'name' } } },
        { field: 'accessCode', type: 'string', meta: { interface: 'input' }, schema: { is_unique: true } },
        { field: 'createdAt', type: 'timestamp', meta: { interface: 'datetime' }, schema: { default_value: 'CURRENT_TIMESTAMP' } },
        { field: 'updatedAt', type: 'timestamp', meta: { interface: 'datetime' }, schema: { default_value: 'CURRENT_TIMESTAMP' } },
      ],
    },
    {
      name: 'Document',
      comment: 'Dokumente',
      fields: [
        { field: 'id', type: 'uuid', meta: { interface: 'input', hidden: true }, schema: { is_primary_key: true, default_value: 'uuid_generate_v4()' } },
        { field: 'fileName', type: 'string', meta: { interface: 'input' } },
        { field: 'fileUrl', type: 'string', meta: { interface: 'input' } },
        { field: 'fileType', type: 'string', meta: { interface: 'input' } },
        { field: 'projectId', type: 'uuid', meta: { interface: 'm2o', options: { collection: 'Project', value_field: 'id', display_field: 'name' } } },
        { field: 'createdAt', type: 'timestamp', meta: { interface: 'datetime' }, schema: { default_value: 'CURRENT_TIMESTAMP' } },
        { field: 'updatedAt', type: 'timestamp', meta: { interface: 'datetime' }, schema: { default_value: 'CURRENT_TIMESTAMP' } },
      ],
    },
    {
      name: 'Appointment',
      comment: 'Termine',
      fields: [
        { field: 'id', type: 'uuid', meta: { interface: 'input', hidden: true }, schema: { is_primary_key: true, default_value: 'uuid_generate_v4()' } },
        { field: 'date', type: 'timestamp', meta: { interface: 'datetime' } },
        { field: 'type', type: 'string', meta: { interface: 'input' } },
        { field: 'projectId', type: 'uuid', meta: { interface: 'm2o', options: { collection: 'Project', value_field: 'id', display_field: 'name' } } },
        { field: 'createdAt', type: 'timestamp', meta: { interface: 'datetime' }, schema: { default_value: 'CURRENT_TIMESTAMP' } },
        { field: 'updatedAt', type: 'timestamp', meta: { interface: 'datetime' }, schema: { default_value: 'CURRENT_TIMESTAMP' } },
      ],
    },
  ];

  for (const col of collections) {
    if (!await collectionExists(col.name)) {
      await apiCall('/collections', 'POST', { collection: col.name, schema: { comment: col.comment } });
    } else {
      console.log(`Collection ${col.name} exists, skipping create.`);
    }
    for (const field of col.fields) {
      await apiCall(`/fields/${col.name}`, 'POST', field);
    }
    if (col.name === 'Project') {
      await apiCall('/relations', 'POST', { collection: 'Project', field: 'userId', related_collection: 'User', schema: { on_delete: 'SET NULL' } });
    }
    if (col.name === 'Document') {
      await apiCall('/relations', 'POST', { collection: 'Document', field: 'projectId', related_collection: 'Project', schema: { on_delete: 'CASCADE' } });
    }
    if (col.name === 'Appointment') {
      await apiCall('/relations', 'POST', { collection: 'Appointment', field: 'projectId', related_collection: 'Project', schema: { on_delete: 'CASCADE' } });
    }
    await setPermissions(col.name);
  }
  console.log('Alle erstellt!');
}

main().catch(console.error);
