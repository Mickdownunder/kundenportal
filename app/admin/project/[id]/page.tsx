'use client' 

import { useState, useEffect, useCallback } from 'react';
import { Prisma, Document } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import AdminUploadForm from "@/components/AdminUploadForm";
import AdminStatusManager from "@/components/AdminStatusManager";
import { FaFilePdf, FaCube, FaWrench, FaFile, FaRegFolderOpen, FaTrash, FaSpinner, FaShippingFast, FaBook } from 'react-icons/fa';

type ProjectWithDetails = Prisma.ProjectGetPayload<{
  include: { user: true, documents: true }
}>

const DeletableDocumentItem = ({ doc, onUpdate }: { doc: Document, onUpdate: () => void }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const isImage = imageExtensions.some(ext => doc.fileName.toLowerCase().endsWith(ext));

  const handleDelete = async () => {
    if (!confirm(`Soll die Datei "${doc.fileName}" wirklich endgültig gelöscht werden?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch('/api/admin/delete-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          documentId: doc.id, 
          filePath: `${doc.projectId}/${doc.fileName}` 
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Löschen');
      }
      onUpdate(); 
    } catch (error) {
      console.error(error);
      alert('Löschen fehlgeschlagen.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <li className="flex items-center justify-between hover:bg-gray-50 p-1 rounded">
        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 group flex-grow min-w-0">
          {isImage ? (
             <Image src={doc.fileUrl} alt={doc.fileName} width={40} height={40} className="object-cover rounded-md border border-gray-200 flex-shrink-0" />
          ) : (
            <FaFile className="mr-2 text-gray-400 flex-shrink-0 w-5 h-5" />
          )}
          <span className="text-blue-600 group-hover:underline truncate">
            {doc.fileName}
          </span>
        </a>
        <button onClick={handleDelete} disabled={isDeleting} className="ml-4 p-2 text-gray-400 hover:text-red-600 disabled:text-gray-300 flex-shrink-0">
            {isDeleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
        </button>
    </li>
  );
}

const DocumentList = ({ title, documents, icon: Icon, onUpdate }: { title: string, documents: Document[], icon: React.ElementType, onUpdate: () => void }) => (
  <div className="bg-blue-50 p-4 rounded-lg">
    <h4 className="text-lg font-semibold text-brand-dark flex items-center mb-3"> <Icon className="mr-3 text-brand-gold" /> {title} </h4>
    {documents.length > 0 ? (
      <ul className="space-y-1 pl-1">
        {documents.map(doc => <DeletableDocumentItem key={doc.id} doc={doc} onUpdate={onUpdate} />)}
      </ul>
    ) : ( <p className="text-gray-500 italic pl-1">Keine Dokumente vorhanden.</p> )}
  </div>
);

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProject = useCallback(async () => {
    setIsLoading(true);
    try {
        const response = await fetch(`/api/admin/project/${params.id}`);
        if (response.ok) {
            const data = await response.json();
            setProject(data);
        } else {
            setProject(null);
        }
    } catch (error) {
        console.error("Failed to fetch project", error);
        setProject(null);
    } finally {
        setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-brand-dark"><p className="text-white">Lade Projekt...</p></div>
  }

  if (!project) {
    return ( <div className="flex h-screen items-center justify-center bg-brand-dark"><p className="text-white">Projekt nicht gefunden.</p></div> );
  }

  const kaufverträge = project.documents.filter(d => d.fileType === 'kaufvertrag');
  const plaene3d = project.documents.filter(d => d.fileType === '3d-plan');
  const installationsplaene = project.documents.filter(d => d.fileType === 'installationsplan');
  const lieferscheine = project.documents.filter(d => d.fileType === 'lieferschein');
  const allgemeineDocs = project.documents.filter(d => d.fileType === 'allgemein');
  const kundenDokumente = project.documents.filter(d => ['grundriss', 'skizze', 'fotos'].includes(d.fileType));

  return (
    <div className="flex min-h-screen bg-brand-dark font-sans">
      <aside className="w-64 bg-brand-gold text-brand-dark p-4 flex-shrink-0">
        <h1 className="font-bold text-xl">Admin-Menü</h1>
        <nav className="mt-6"> <Link href="/admin/dashboard" className="block p-2 rounded hover:bg-white/20">Kundenübersicht</Link> </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Link href="/admin/dashboard" className="text-brand-gold hover:underline mb-6 block font-semibold">&larr; Zurück zur Übersicht</Link>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-brand-dark">Projekt von: {project.user.name}</h2>
          <p className="font-mono text-sm text-gray-500 mt-1">Zugangscode: {project.accessCode}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Status Management</h3>
              <AdminStatusManager projectId={project.id} currentStatus={project.status} onUpdate={fetchProject} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Dokumente für Kunden hochladen</h3>
              <AdminUploadForm projectId={project.id} onUpdate={fetchProject} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 flex items-center"><FaRegFolderOpen className="mr-2 text-brand-dark" /> Dokumentenübersicht</h3>
            <DocumentList title="Kaufverträge" documents={kaufverträge} icon={FaFilePdf} onUpdate={fetchProject} />
            <DocumentList title="Lieferscheine" documents={lieferscheine} icon={FaShippingFast} onUpdate={fetchProject} />
            <DocumentList title="3D-Pläne" documents={plaene3d} icon={FaCube} onUpdate={fetchProject} />
            <DocumentList title="Installationspläne" documents={installationsplaene} icon={FaWrench} onUpdate={fetchProject} />
            <DocumentList title="Allgemeine Dokumente" documents={allgemeineDocs} icon={FaBook} onUpdate={fetchProject} />
            <hr/>
            <div className="pt-4">
              <DocumentList title="Vom Kunden bereitgestellt" documents={kundenDokumente} icon={FaFile} onUpdate={fetchProject} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
