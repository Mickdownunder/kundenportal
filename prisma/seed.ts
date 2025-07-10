import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed User (Kunde)
  const user = await prisma.user.create({
    data: {
      id: 'test-user-id-1',
      name: 'Test Kunde',
      email: 'kunde@example.com',
      role: 'USER',
    },
  });

  // Seed Project
  const project = await prisma.project.create({
    data: {
      id: 'test-project-id-1',
      name: 'Test Projekt',
      status: 'PLANNING',
      userId: user.id,
    },
  });

  // Seed Document
  await prisma.document.create({
    data: {
      id: 'test-doc-id-1',
      fileName: 'test.pdf',
      fileUrl: 'http://localhost/test.pdf',
      fileType: 'grundriss',
      projectId: project.id,
    },
  });

  // Seed Appointment
  await prisma.appointment.create({
    data: {
      id: 'test-app-id-1',
      date: new Date(),
      type: 'Beratung',
      projectId: project.id,
    },
  });

  console.log('Test-Daten geseedet!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
