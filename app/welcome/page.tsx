import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import WelcomeClientPage from "./WelcomeClientPage";
import type { Session } from 'next-auth';

const prisma = new PrismaClient();

export default async function WelcomePage() {
  const session: Session | null = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/');
  }

  const project = await prisma.project.findFirst({
    where: { userId: session.user.id },
    include: {
      user: true,
      appointments: {
        orderBy: { date: 'asc' },
      },
    },
  });

  if (!project || !project.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Fehler: Für diesen Benutzer wurde kein Projekt gefunden.</p>
      </div>
    );
  }

  const nextAppointment = project.appointments[0] || null;

  return (
    <WelcomeClientPage
      user={{ name: project.user.name }}
      appointment={nextAppointment}
    />
  );
}
