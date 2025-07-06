import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';
import type { Session } from 'next-auth';

const prisma = new PrismaClient();
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const session: Session | null = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return new NextResponse(JSON.stringify({ error: 'Nicht autorisiert' }), { status: 403 });
  }

  const { documentId, filePath } = await request.json();

  if (!documentId || !filePath) {
    return new NextResponse(JSON.stringify({ error: 'Fehlende Daten' }), { status: 400 });
  }

  try {
    await supabaseAdmin.storage
      .from('customer-uploads')
      .remove([filePath]);
    
    await prisma.document.delete({
      where: { id: documentId },
    });

    return new NextResponse(JSON.stringify({ message: 'Dokument gelöscht' }), { status: 200 });

  } catch (error) {
    console.error("Fehler beim Löschen des Dokuments:", error);
    return new NextResponse(JSON.stringify({ error: 'Interner Serverfehler' }), { status: 500 });
  }
}
