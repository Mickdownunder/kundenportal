'use client';

import Link from "next/link";
import { useState } from "react";
import { FaRegCalendarAlt, FaFileImage, FaRulerCombined, FaFileSignature, FaArrowRight, FaHardHat, FaCheckCircle, FaSpinner } from "react-icons/fa";

// Typ-Definitionen für die Daten, die wir von der Server-Seite bekommen
interface User {
  name?: string | null;
}
interface Appointment {
  date: Date;
  type: string;
}
interface WelcomePageProps {
  user: User;
  appointment: Appointment | null;
}

// Kleine Helfer-Komponente für den Upload-Status
const UploadButton = ({ onUpload, file, setFile, fileType, uploadStatus, label }: {
  onUpload: (fileType: string) => void,
  file: File | null,
  setFile: (file: File | null) => void,
  fileType: string,
  uploadStatus: { [key: string]: string },
  label: string,
}) => {
  const status = uploadStatus[fileType];
  return (
    <div className="border rounded-lg p-4">
        <label htmlFor={fileType} className="flex items-center space-x-3 mb-2 font-medium text-gray-700">{label}</label>
        <div className="flex items-center justify-between">
            <input
                id={fileType}
                name={fileType}
                type="file"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand-primary hover:file:bg-blue-100"
            />
            {file && (
                <button
                    onClick={() => onUpload(fileType)}
                    disabled={status === 'loading' || status === 'success'}
                    className="ml-4 px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:opacity-90 disabled:bg-gray-400"
                >
                    {status === 'loading' && <FaSpinner className="animate-spin" />}
                    {status === 'success' && <FaCheckCircle />}
                    {!status && 'Upload'}
                </button>
            )}
        </div>
         {status === 'error' && <p className="text-red-500 text-xs mt-2">Fehler beim Upload!</p>}
    </div>
  );
};


export default function WelcomeClientPage({ user, appointment }: WelcomePageProps) {
  const [grundrissFile, setGrundrissFile] = useState<File | null>(null);
  const [skizzeFile, setSkizzeFile] = useState<File | null>(null);
  const [fotosFile, setFotosFile] = useState<File | null>(null);

  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: 'loading' | 'success' | 'error' }>({});

  const handleUpload = async (fileType: string) => {
    let fileToUpload: File | null = null;
    if (fileType === 'grundriss') fileToUpload = grundrissFile;
    if (fileType === 'skizze') fileToUpload = skizzeFile;
    if (fileType === 'fotos') fileToUpload = fotosFile;

    if (!fileToUpload) {
      alert("Bitte wählen Sie zuerst eine Datei aus.");
      return;
    }

    setUploadStatus(prev => ({ ...prev, [fileType]: 'loading' }));

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('fileType', fileType);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload fehlgeschlagen');
      }

      setUploadStatus(prev => ({ ...prev, [fileType]: 'success' }));

    } catch (error) {
      console.error(error);
      setUploadStatus(prev => ({ ...prev, [fileType]: 'error' }));
    }
  };

  return (
    <main className="bg-brand-light min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-subtle p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Vielen Dank für Ihre Buchung, {user?.name || 'Kunde'}!</h1>
          <p className="text-gray-600 mt-2">Für eine optimale Vorbereitung auf Ihren Planungstermin bitten wir Sie, uns vorab einige Unterlagen zur Verfügung zu stellen. Keine Sorge, Sie können dies auch später in Ihrem persönlichen Kundenportal nachholen.</p>
        </div>

        {appointment && (
            <div className="bg-blue-50 p-5 rounded-lg border-2 border-brand-primary">
                <h2 className="font-bold text-brand-dark mb-2">Ihr gebuchter Planungstermin</h2>
                <div className="flex items-center text-2xl font-light text-brand-primary">
                    <FaRegCalendarAlt className="mr-4 text-brand-gold"/>
                    <span>{new Date(appointment.date).toLocaleDateString('de-DE', {day: '2-digit', month: 'long', year: 'numeric'})} um {new Date(appointment.date).toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})} Uhr</span>
                </div>
            </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-brand-dark mb-4">Ihre Unterlagen</h2>
          <div className="space-y-4">
            <UploadButton onUpload={handleUpload} file={grundrissFile} setFile={setGrundrissFile} fileType="grundriss" uploadStatus={uploadStatus} label="Grundriss" />
            <UploadButton onUpload={handleUpload} file={skizzeFile} setFile={setSkizzeFile} fileType="skizze" uploadStatus={uploadStatus} label="Handskizze"/>
            <UploadButton onUpload={handleUpload} file={fotosFile} setFile={setFotosFile} fileType="fotos" uploadStatus={uploadStatus} label="Fotos vom Raum (optional)"/>
          </div>
        </div>

        <div className="bg-brand-gold bg-opacity-10 p-5 rounded-lg border border-brand-gold border-opacity-30 text-center">
          <FaHardHat className="text-brand-gold text-2xl mx-auto mb-2"/>
          <h3 className="font-bold text-brand-dark">Keine Pläne zur Hand?</h3>
          <p className="text-sm text-gray-700 mt-1">Buchen Sie unseren professionellen Ausmess-Service für pauschal 200 €. Dieser Betrag wird Ihnen beim Kauf Ihrer Küche vollständig gutgeschrieben.</p>
          <a href="/ausmess-service" className="mt-4 inline-block bg-brand-gold text-white font-bold py-2 px-5 rounded-lg hover:opacity-90 transition-opacity text-sm">Ausmess-Service buchen</a>
        </div>

        <div className="text-center border-t pt-6">
          <p className="text-sm text-gray-500 mb-4">Ihre hochgeladenen Dokumente sind jederzeit im Kundenportal für Sie einsehbar.</p>
          <Link href="/portal" className="inline-flex items-center justify-center bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
            Weiter zum Kundenportal <FaArrowRight className="ml-2"/>
          </Link>
        </div>
      </div>
    </main>
  );
}
