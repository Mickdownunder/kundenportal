import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { execa } from "execa";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import type { Session } from 'next-auth';

const prisma = new PrismaClient();
const PROJECTS_PER_PAGE = 15;

async function getSystemStatus() {
  try {
    const { stdout } = await execa('pm2', ['jlist']);
    const processes = JSON.parse(stdout);
    const appStatus = processes.find((p: any) => p.name === 'kundenportal');
    return appStatus || null;
  } catch (error) {
    return null;
  }
}

async function getPaginatedProjects(page = 1) {
  const skip = (page - 1) * PROJECTS_PER_PAGE;
  try {
    const [projects, totalCount] = await prisma.$transaction([
      prisma.project.findMany({
        skip: skip,
        take: PROJECTS_PER_PAGE,
        include: { user: true },
        orderBy: { user: { name: 'asc' } }
      }),
      prisma.project.count(),
    ]);
    return { projects, totalCount };
  } catch (error) {
    return { projects: [], totalCount: 0 };
  }
}

export default async function AdminDashboardPage({ searchParams }: { searchParams: { page?: string } }) {
  const session: Session | null = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    redirect("/admin/login");
  }

  const currentPage = Number(searchParams?.page) || 1;

  const [status, { projects, totalCount }] = await Promise.all([
    getSystemStatus(),
    getPaginatedProjects(currentPage)
  ]);

  const totalPages = Math.ceil(totalCount / PROJECTS_PER_PAGE);

  return (
    <div className="flex min-h-screen bg-brand-dark font-sans">
      <aside className="w-64 bg-brand-gold text-brand-dark p-4 flex-shrink-0">
        <h1 className="font-bold text-xl">Admin-Menü</h1>
        <nav className="mt-6">
          <a href="/admin/dashboard" className="block p-2 rounded bg-white/20 font-semibold">Kundenübersicht</a>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>

        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Live System-Status</h3>
          {status ? (
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`text-lg font-bold ${status.pm2_env.status === 'online' ? 'text-green-500' : 'text-red-500'}`}>
                  {status.pm2_env.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">CPU</p>
                <p className="text-lg font-bold text-gray-800">{status.monit.cpu}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Speicher</p>
                <p className="text-lg font-bold text-gray-800">{(status.monit.memory / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            </div>
          ) : (
            <p className="text-red-500">System-Status konnte nicht geladen werden.</p>
          )}
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Kundenprojekte ({totalCount} gesamt)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-sm font-semibold text-gray-600">Kunde</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Projekt-Status</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Zugangscode</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(project => (
                  <tr key={project.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-gray-800">{project.user.name || 'N/A'}</td>
                    {/* HIER IST DIE KORREKTUR */}
                    <td className="p-3 text-gray-600">{project.status}</td>
                    <td className="p-3 font-mono text-sm text-gray-600">{project.accessCode}</td>
                    <td className="p-3">
                      <Link href={`/admin/project/${project.id}`} className="text-blue-600 hover:underline font-semibold">Verwalten</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Seite {currentPage} von {totalPages}
              </p>
            </div>
            <div className="flex space-x-2">
              {currentPage > 1 && (
                <Link href={`/admin/dashboard?page=${currentPage - 1}`} className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">
                  Zurück
                </Link>
              )}
              {currentPage < totalPages && (
                <Link href={`/admin/dashboard?page=${currentPage + 1}`} className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">
                  Weiter
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
