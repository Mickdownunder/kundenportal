import { useEffect, useState } from 'react';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN || 'PpLh4sXlyNo3PeiJu8H5oMGSObdGZEnr';

export default function DocumentList({ projectId, onRefresh }) {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    async function fetchDocuments() {
      const res = await fetch(`${DIRECTUS_URL}/items/Document?filter[projectId][_eq]=${projectId}`, {
        headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
      });
      const { data } = await res.json();
      setDocuments(data);
    }
    fetchDocuments();
  }, [projectId]);

  return (
    <div>
      <h3>Dokumente</h3>
      <ul>
        {documents.map((doc) => (
          <li key={doc.id}>
            {doc.fileName} ({doc.fileType}) - <a href={doc.fileUrl} target="_blank">Download</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
