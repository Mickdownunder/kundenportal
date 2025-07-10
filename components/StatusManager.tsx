'use client';
import { useState } from 'react';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN || 'PpLh4sXlyNo3PeiJu8H5oMGSObdGZEnr';

export default function StatusManager({ projectId, currentStatus, onUpdate }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    setLoading(true);
    const newStatus = e.target.value;
    const res = await fetch('/api/admin/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, newStatus }),
    });
    if (res.ok) {
      setStatus(newStatus);
      onUpdate();
    } else {
      alert('Update fehlgeschlagen');
    }
    setLoading(false);
  };

  return (
    <div>
      <h3>Aktueller Status: {status}</h3>
      <select value={status} onChange={handleUpdate} disabled={loading}>
        <option value="PLANNING">Planning</option>
        <option value="PRODUCTION">Production</option>
        <option value="DELIVERY">Delivery</option>
        <option value="INSTALLATION">Installation</option>
        <option value="COMPLETED">Completed</option>
      </select>
      {loading && <p>Lade...</p>}
    </div>
  );
}
