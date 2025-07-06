import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import type { Session } from 'next-auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const session: Session | null = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return new NextResponse(JSON.stringify({ error: 'Nicht autorisiert' }), { status: 403 });
  }

  const { projectId, status } = await request.json();

  if (!projectId || !status) {
    return new NextResponse(JSON.stringify({ error: 'Fehlende Projekt-ID oder Status' }), { status: 400 });
  }

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: status },
    });
    return new NextResponse(JSON.stringify({ message: 'Status aktualisiert' }), { status: 200 });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Status:", error);
    return new NextResponse(JSON.stringify({ error: 'Interner Serverfehler' }), { status: 500 });
  }
}
