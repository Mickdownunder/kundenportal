'use client';
import { useState } from 'react';

export default function UploadForm({ projectId }) {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !fileType) {
      setMessage('Datei und Type erforderlich');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    formData.append('projectId', projectId);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      setMessage('Upload erfolgreich');
    } else {
      setMessage('Upload fehlgeschlagen');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <input type="text" value={fileType} onChange={(e) => setFileType(e.target.value)} placeholder="File Type" />
      <button type="submit">Upload</button>
      <p>{message}</p>
    </form>
  );
}
