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
  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Nicht autorisiert' }), { status: 401 });
  }

  const userId = session.user.id;
  
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;
  const fileType: string | null = data.get('fileType') as string;

  if (!file || !fileType) {
    return new NextResponse(JSON.stringify({ error: 'Datei oder Dateityp fehlt' }), { status: 400 });
  }
  
  const project = await prisma.project.findFirst({
    where: { userId: userId },
  });

  if (!project) {
    return new NextResponse(JSON.stringify({ error: 'Kein Projekt für diesen Benutzer gefunden' }), { status: 404 });
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${fileType}_${Date.now()}.${fileExt}`;
  const filePath = `${project.id}/${fileName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('customer-uploads')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Supabase Upload Fehler:', uploadError);
    return new NextResponse(JSON.stringify({ error: `Fehler beim Datei-Upload: ${uploadError.message}` }), { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('customer-uploads')
    .getPublicUrl(filePath);

  try {
    await prisma.document.create({
      data: {
        fileName: fileName,
        fileUrl: publicUrl,
        fileType: fileType,
        projectId: project.id,
      }
    });
  } catch (dbError) {
    console.error('Datenbank Fehler:', dbError);
    return new NextResponse(JSON.stringify({ error: 'Fehler beim Speichern des Dokumenten-Eintrags' }), { status: 500 });
  }

  return new NextResponse(JSON.stringify({ message: 'Upload erfolgreich', url: publicUrl }), { status: 200 });
}
