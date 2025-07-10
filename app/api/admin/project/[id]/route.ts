import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session: Session | null = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return new NextResponse(JSON.stringify({ error: 'Nicht autorisiert' }), { status: 403 });
  }

  const { id } = params;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { user: true, documents: true },
    });

    if (!project) {
      return new NextResponse(JSON.stringify({ error: 'Projekt nicht gefunden' }), { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Interner Serverfehler' }), { status: 500 });
  }
}
