import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Session } from "next-auth";

interface Props {
  params: { id: string }
}

export default async function EmployeeProjectDetailPage({ params }: Props) {
  const session: Session | null = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "employee") {
    redirect("/employee/login");
  }

  // Hole das Projekt (mit User & Dokumenten), aber nur, wenn einer der Termine zu diesem Mitarbeiter gehört
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      documents: true,
      appointments: {
        where: { employeeId: session.user.id }
      }
    }
  });

  if (!project || project.appointments.length === 0) {
    redirect("/employee/dashboard");
  }

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-subtle p-8">
        <h1 className="text-2xl font-bold text-brand-dark mb-4">Projekt-Details</h1>
        <div className="mb-4">
          <strong>Kunde:</strong> {project.user?.name || "Unbekannt"}
        </div>
        <div className="mb-4">
          <strong>Status:</strong> {project.status}
        </div>
        <div className="mb-4">
          <strong>Zugewiesene Termine:</strong>
          <ul className="list-disc ml-6">
            {project.appointments.map(apt => (
              <li key={apt.id}>
                {new Date(apt.date).toLocaleDateString('de-DE')} {new Date(apt.date).toLocaleTimeString('de-DE', { hour: "2-digit", minute: "2-digit" })} Uhr — {apt.type}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <strong>Dokumente:</strong>
          {project.documents.length === 0 ? (
            <div className="text-gray-500">Keine Dokumente vorhanden.</div>
          ) : (
            <ul className="list-disc ml-6">
              {project.documents.map(doc => (
                <li key={doc.id}>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                    {doc.fileName}
                  </a> <span className="text-gray-600">({doc.fileType})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-8">
          <Link href="/employee/dashboard" className="text-brand-gold hover:underline">
            &larr; Zurück zur Terminübersicht
          </Link>
        </div>
      </div>
    </div>
  );
}
