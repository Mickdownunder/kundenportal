'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import AdminUploadForm from '@/components/AdminUploadForm';
import DocumentList from '@/components/DocumentList';
import StatusManager from '@/components/StatusManager';

interface Project {
  id: string;
  name: string;
  status: string;
  accessCode: string;
  user: {
    name: string;
  };
  documents: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
  }[];
}

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN || 'PpLh4sXlyNo3PeiJu8H5oMGSObdGZEnr';

export default function AdminProjectPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProject = useCallback(async () => {
    const res = await fetch(`${DIRECTUS_URL}/items/Project/${id}?fields=*,user.*,documents.*`, {
      headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
    });
    const { data } = await res.json();
    setProject(data);
    setDocuments(data.documents || []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if ((session?.user as any)?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    fetchProject();
  }, [session, router, fetchProject]);

  if (loading) return <div>Lade...</div>;

  if (!project) return <div>Projekt nicht gefunden</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-brand-dark">Projekt von: {project.user.name}</h2>
        <p className="font-mono text-sm text-gray-500 mt-1">Zugangscode: {project.accessCode}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4">Dokumente</h3>
          <DocumentList projectId={id} onRefresh={fetchProject} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4">Dokument hochladen</h3>
          <AdminUploadForm projectId={id} onUpdate={fetchProject} />
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold mb-4">Status Manager</h3>
        <StatusManager projectId={id} currentStatus={project.status} onUpdate={fetchProject} />
      </div>
    </div>
  );
}
