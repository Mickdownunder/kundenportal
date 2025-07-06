'use client';

import { useState, useRef, useEffect } from 'react';

// Wir fügen hier die 'onUpdate' Funktion hinzu
export default function AdminUploadForm({ projectId, onUpdate }: { projectId: string, onUpdate: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState('kaufvertrag');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => setStatus('idle'), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Bitte wählen Sie eine Datei aus.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    formData.append('projectId', projectId);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Upload fehlgeschlagen');
      }

      setStatus('success');
      setMessage(`Dokument '${file.name}' erfolgreich hochgeladen.`);
      setFile(null);
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // HIER RUFEN WIR DIE NEUE FUNKTION AUF
      onUpdate();

    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage((error as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === 'success' && <div className="p-3 rounded-md bg-green-100 text-green-800 border border-green-200">{message}</div>}
      {status === 'error' && <div className="p-3 rounded-md bg-red-100 text-red-800 border border-red-200">{message}</div>}

      <div>
        <label htmlFor="fileType" className="block text-sm font-medium text-gray-700">Dokumententyp</label>
        <select
          id="fileType"
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md"
        >
          <option value="kaufvertrag">Kaufvertrag</option>
          <option value="3d-plan">3D-Plan</option>
          <option value="installationsplan">Installationsplan</option>
          <option value="lieferschein">Lieferschein</option>
          <option value="allgemein">Allgemeines Dokument (z.B. Pflegeanleitung)</option>
        </select>
      </div>
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-gray-700">Datei auswählen</label>
        <input
          id="file"
          type="file"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          required
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-gray-100 file:text-brand-primary hover:file:bg-blue-100"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:opacity-80 disabled:bg-gray-400"
        >
          {status === 'loading' ? 'Lade hoch...' : 'Dokument hochladen'}
        </button>
      </div>
    </form>
  );
}
