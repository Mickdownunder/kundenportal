'use client';

import { useState, useEffect } from 'react';
import { ProjectStatus } from '@prisma/client';

interface AdminStatusManagerProps {
  projectId: string;
  currentStatus: ProjectStatus;
  onUpdate: () => void; // HIER IST DIE WICHTIGE ÄNDERUNG
}

export default function AdminStatusManager({ projectId, currentStatus, onUpdate }: AdminStatusManagerProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, status }),
      });
      if (!response.ok) throw new Error('Update fehlgeschlagen');
      
      setMessage('Status erfolgreich aktualisiert!');
      onUpdate(); // Wir rufen die onUpdate-Funktion der Hauptseite auf

    } catch (error) {
      setMessage('Fehler beim Update.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label htmlFor="status" className="block text-sm font-medium text-gray-700">Projekt-Status ändern</label>
      <div className="flex items-center space-x-2">
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          className="flex-grow block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md"
        >
          {Object.values(ProjectStatus).map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button
          onClick={handleStatusChange}
          disabled={isLoading || status === currentStatus}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:opacity-80 disabled:bg-gray-400"
        >
          {isLoading ? 'Speichere...' : 'Speichern'}
        </button>
      </div>
      {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
    </div>
  );
}
