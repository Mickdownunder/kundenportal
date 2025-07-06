import Link from "next/link";
import Image from 'next/image';
import { FaRegCalendarAlt, FaUpload, FaFilePdf, FaFileImage, FaRulerCombined, FaCheckCircle, FaExclamationCircle, FaWhatsapp, FaUser, FaCube, FaRegChartBar, FaHardHat, FaWrench, FaBook, FaShippingFast, FaPencilRuler } from "react-icons/fa";
import { IconType } from "react-icons/lib";
import { ReactNode } from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import UserMenu from "@/components/UserMenu";
import { authOptions } from "@/lib/auth";
import { PrismaClient, Document, ProjectStatus } from "@prisma/client";
import MobileSidebar from "@/components/MobileSidebar";
import StatusStepper from "@/components/StatusStepper";
import type { Session } from 'next-auth';

const prisma = new PrismaClient();

const DashboardCard = ({ title, children, className = '' }: { title: string, children: ReactNode; className?: string }) => (
  <div className={`bg-white p-6 rounded-lg shadow-subtle flex flex-col border-t-4 border-brand-gold ${className}`}>
    <h3 className="text-xl font-bold text-brand-dark mb-4">{title}</h3>
    <div className="flex-grow flex flex-col">{children}</div>
  </div>
);

const DocumentListCard = ({ title, documents, icon: Icon, emptyText }: { title: string, documents: Document[], icon: React.ElementType, emptyText: string }) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  return (
    <DashboardCard title={title}>
      <div className="flex-grow">
        {documents.length > 0 ? (
          <ul className="space-y-4">
            {documents.map(doc => {
              const isImage = imageExtensions.some(ext => doc.fileName.toLowerCase().endsWith(ext));
              return (
                <li key={doc.id} className="flex items-start">
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 group">
                    {isImage ? (
                        <Image 
                          src={doc.fileUrl} 
                          alt={doc.fileName} 
                          width={64} 
                          height={64}
                          className="object-cover rounded-md border border-gray-200 flex-shrink-0"
                        />
                    ) : (
                      <Icon className="w-8 h-8 text-brand-primary flex-shrink-0" />
                    )}
                    <span className="text-blue-600 group-hover:underline break-all">{doc.fileName}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 italic">{emptyText}</p>
        )}
      </div>
    </DashboardCard>
  );
};


export default async function PortalPage() {
  const session: Session | null = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'customer') { 
    redirect('/'); 
  }

  const project = await prisma.project.findFirst({
    where: { userId: session.user.id },
    include: { user: true, documents: true, appointments: { orderBy: { date: 'asc' } } }
  });

  if (!project || !project.user) {
    return (<div className="flex h-screen items-center justify-center"><p>Fehler: Kein Projekt für diesen Benutzer gefunden.</p></div>);
  }

  const nextAppointment = project.appointments[0];

  const kaufverträge = project.documents.filter(d => d.fileType === 'kaufvertrag');
  const plaene3d = project.documents.filter(d => d.fileType === '3d-plan');
  const installationsplaene = project.documents.filter(d => d.fileType === 'installationsplan');
  const lieferscheine = project.documents.filter(d => d.fileType === 'lieferschein');
  const allgemeineDocs = project.documents.filter(d => d.fileType === 'allgemein');

  return (
    <div className="flex min-h-screen bg-brand-light font-sans">
      <aside className="w-64 bg-white text-brand-dark flex-shrink-0 flex-col p-4 border-r-2 border-gray-200 hidden lg:flex">
        <div className="px-4 pt-4 pb-10"> 
          <Image src="/logo-dark.png" alt="KüchenOnline Logo" width={200} height={50} priority /> 
        </div>
        <nav className="flex flex-col space-y-1">
          <a href="/portal" className="flex items-center w-full p-3 bg-blue-50 text-brand-primary rounded-lg font-semibold border-l-4 border-brand-gold"> 
            <FaRegChartBar className="mr-3 w-5 text-center" /> Dashboard 
          </a>
          <a href="/welcome" className="flex items-center w-full p-3 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"> 
            <FaUpload className="mr-3 w-5 text-center" /> Uploads 
          </a>
        </nav>
        <div className="mt-auto p-4"> 
          <a href="https://wa.me/43" target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center w-full"> 
            <FaWhatsapp className="mr-2" /> Schnelle Frage? 
          </a> 
        </div>
      </aside>

      <div className="flex-1 flex flex-col bg-brand-dark">
        {/* HIER IST DIE ÄNDERUNG FÜR DIE MOBILE KOPFZEILE */}
        <header className="flex justify-between items-center p-4 bg-brand-dark border-b border-blue-800 lg:p-8 lg:pt-4">
          <div className="lg:hidden text-white">
            <MobileSidebar />
          </div>
          <div>
            <h2 className="text-xl lg:text-3xl font-bold text-white">Willkommen, {project.user.name}!</h2>
            <p className="hidden lg:block text-gray-300">Hier ist die komplette Übersicht über Ihr Küchenprojekt.</p>
          </div>
          <UserMenu userName={project.user.name} />
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
              {nextAppointment ? (
                <DashboardCard title="Nächster Termin">
                  <div className="flex items-center text-xl lg:text-2xl font-light text-brand-primary">
                    <FaRegCalendarAlt className="mr-4 text-brand-gold"/>
                    <span>{new Date(nextAppointment.date).toLocaleDateString('de-DE', {day: '2-digit', month: 'long', year: 'numeric'})}, {new Date(nextAppointment.date).toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})} Uhr: {nextAppointment.type}</span>
                  </div>
                </DashboardCard>
              ) : (
                <DashboardCard title="Nächster Termin">
                  <p className="text-gray-500 italic">Aktuell ist kein Termin geplant.</p>
                </DashboardCard>
              )}
              
              <DocumentListCard title="Kaufvertrag" documents={kaufverträge} icon={FaFilePdf} emptyText="Ihr Kaufvertrag wird hier erscheinen." />
              <DocumentListCard title="3D-Pläne" documents={plaene3d} icon={FaCube} emptyText="Ihre 3D-Pläne werden hier bereitgestellt." />
              <DocumentListCard title="Installationspläne" documents={installationsplaene} icon={FaWrench} emptyText="Die technischen Pläne erscheinen hier." />
              <DocumentListCard title="Lieferscheine" documents={lieferscheine} icon={FaShippingFast} emptyText="Ihre Lieferscheine werden hier hinterlegt." />
              <DocumentListCard title="Allgemeine Dokumente" documents={allgemeineDocs} icon={FaBook} emptyText="Weitere Informationen finden Sie hier." />
            </div>
            
            <div className="flex flex-col gap-8">
              <DashboardCard title="Projekt-Fortschritt" className="flex-grow">
                 <StatusStepper currentStatus={project.status} />
              </DashboardCard>
              <DashboardCard title="Kommunikation">
                <p className="text-gray-600 text-sm mb-4">Haben Sie eine Frage? Unser Team ist für Sie da.</p>
                <Link href="https://wa.me/43" className="mt-auto pt-2 block w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"><FaWhatsapp className="mr-2"/> Frage via WhatsApp</Link>
              </DashboardCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
