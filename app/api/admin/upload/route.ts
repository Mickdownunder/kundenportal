import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const session: Session | null = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return new NextResponse(JSON.stringify({ error: 'Nicht autorisiert' }), { status: 403 });
  }

  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;
  const fileType: string | null = data.get('fileType') as string;
  const projectId: string | null = data.get('projectId') as string;

  if (!file || !fileType || !projectId) {
    return new NextResponse(JSON.stringify({ error: 'Fehlende Daten' }), { status: 400 });
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${fileType}_${Date.now()}.${fileExt}`;
  const filePath = `${projectId}/${fileName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('customer-uploads')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Supabase Admin Upload Fehler:', uploadError);
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
        projectId: projectId,
      }
    });
  } catch (dbError) {
    return new NextResponse(JSON.stringify({ error: 'Fehler beim Speichern des Dokumenten-Eintrags' }), { status: 500 });
  }

  return new NextResponse(JSON.stringify({ message: 'Upload erfolgreich' }), { status: 200 });
}
