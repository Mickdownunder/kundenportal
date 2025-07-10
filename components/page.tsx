'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN || 'PpLh4sXlyNo3PeiJu8H5oMGSObdGZEnr';

export default function VerkaeuferProjectsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role !== 'SELLER') {
      router.push('/verkaeufer/login');
      return;
    }

    async function fetchProjects() {
      const res = await fetch(`${DIRECTUS_URL}/items/Project?filter[userId][_eq]=${session.user.id}`, {  // Filter for seller's leads
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
    <div>
      <h1>Deine Projekte</h1>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            {project.name} - Status: {project.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
