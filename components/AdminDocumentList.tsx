'use client'

import { Document } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { FaFilePdf, FaCube, FaWrench, FaFile, FaRegFolderOpen, FaTrash, FaSpinner, FaShippingFast, FaBook } from 'react-icons/fa';

const DeletableDocumentItem = ({ doc }: { doc: Document }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
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
      if (!response.ok) throw new Error('Fehler beim Löschen');
      
      router.refresh(); // Lädt die Server-Daten der übergeordneten Seite neu

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

export default function AdminDocumentList({ documents }: { documents: Document[] }) {
  const kaufverträge = documents.filter(d => d.fileType === 'kaufvertrag');
  const plaene3d = documents.filter(d => d.fileType === '3d-plan');
  const installationsplaene = documents.filter(d => d.fileType === 'installationsplan');
  const lieferscheine = documents.filter(d => d.fileType === 'lieferschein');
  const allgemeineDocs = documents.filter(d => d.fileType === 'allgemein');
  const kundenDokumente = documents.filter(d => ['grundriss', 'skizze', 'fotos'].includes(d.fileType));

  const Section = ({ title, docs, icon: Icon }: { title: string, docs: Document[], icon: React.ElementType }) => (
    <div className="bg-brand-light p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-brand-dark flex items-center mb-3">
            <Icon className="mr-3 text-brand-gold" /> {title}
        </h4>
        {docs.length > 0 ? (
            <ul className="space-y-1 pl-1">
                {docs.map(doc => <DeletableDocumentItem key={doc.id} doc={doc} />)}
            </ul>
        ) : <p className="text-gray-500 italic pl-1">Keine Dokumente vorhanden.</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-700 flex items-center"><FaRegFolderOpen className="mr-2 text-brand-dark" /> Dokumentenübersicht</h3>
      <Section title="Kaufverträge" docs={kaufverträge} icon={FaFilePdf} />
      <Section title="Lieferscheine" docs={lieferscheine} icon={FaShippingFast} />
      <Section title="3D-Pläne" docs={plaene3d} icon={FaCube} />
      <Section title="Installationspläne" docs={installationsplaene} icon={FaWrench} />
      <Section title="Allgemeine Dokumente" docs={allgemeineDocs} icon={FaBook} />
      <hr />
      <div className="pt-4">
        <Section title="Vom Kunden bereitgestellt" docs={kundenDokumente} icon={FaFile} />
      </div>
    </div>
  );
}
