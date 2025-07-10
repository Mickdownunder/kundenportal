import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Session } from "next-auth";

export default async function EmployeeDashboardPage() {
  const session: Session | null = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "employee") {
    redirect("/employee/login");
  }

  // Alle Termine mit zugehörigem Projekt und Kunde, die diesem Mitarbeiter zugeordnet sind
  const appointments = await prisma.appointment.findMany({
    where: { employeeId: session.user.id },
    include: {
      project: {
        include: { user: true }
      }
    },
    orderBy: { date: "asc" }
  });

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-subtle p-8">
        <h1 className="text-2xl font-bold text-brand-dark mb-8">Ihre Termine</h1>
        {appointments.length === 0 ? (
          <p className="text-gray-600">Ihnen sind aktuell keine Termine zugewiesen.</p>
        ) : (
          <ul className="space-y-6">
            {appointments.map(appointment => (
              <li key={appointment.id} className="border-l-4 border-brand-gold pl-4 py-4 bg-blue-50 rounded">
                <div className="text-gray-900 font-semibold text-lg">
                  {new Date(appointment.date).toLocaleDateString('de-DE', { day: "2-digit", month: "long", year: "numeric" })}, {new Date(appointment.date).toLocaleTimeString('de-DE', { hour: "2-digit", minute: "2-digit" })} Uhr
                </div>
                <div className="text-gray-700">
                  <strong>Typ:</strong> {appointment.type}
                </div>
                <div className="text-gray-700">
                  <strong>Kunde:</strong> {appointment.project?.user?.name || "Unbekannt"}
                </div>
                <div className="text-gray-700">
                  <strong>Projektstatus:</strong> {appointment.project?.status}
                </div>
                <div className="mt-2">
                  <Link
                    href={`/employee/project/${appointment.projectId}`}
                    className="text-brand-primary hover:underline"
                  >
                    Projektdetails ansehen
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
