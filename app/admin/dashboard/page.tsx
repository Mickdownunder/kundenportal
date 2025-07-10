'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: string;
  status: string;
  accessCode: string;
  user: {
    name: string;
  };
}

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN || 'PpLh4sXlyNo3PeiJu8H5oMGSObdGZEnr';

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ((session?.user as any)?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    async function fetchProjects() {
      const res = await fetch(`${DIRECTUS_URL}/items/Project?fields=*,user.*`, {
        headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
      });
      const { data } = await res.json();
      setProjects(data);
      setLoading(false);
    }

    fetchProjects();
  }, [session, router]);

  if (loading) return <div>Lade...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <h2 className="text-2xl font-semibold mb-4">Live System-Status</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p>Status: <span className="text-green-600">online</span></p>
          <p>CPU: 0%</p>
          <p>Speicher: 66.3 MB</p>
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Kundenprojekte ({projects.length} gesamt)</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="p-3 text-left">Kunde</th>
            <th className="p-3 text-left">Projekt-Status</th>
            <th className="p-3 text-left">Zugangscode</th>
            <th className="p-3 text-left">Aktion</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-t">
              <td className="p-3 text-gray-600">{project.user.name}</td>
              <td className="p-3 text-gray-600">{project.status}</td>
              <td className="p-3 font-mono text-sm text-gray-600">{project.accessCode || 'Kein Code'}</td>
              <td className="p-3">
                <Link href={`/admin/project/${project.id}`} className="text-blue-600 hover:underline font-semibold">Verwalten</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-gray-500">Seite 1 von 1</p>
    </div>
  );
}
