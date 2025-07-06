'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/portal';
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'CredentialsSignin') {
      setError('Der Zugangscode ist ungültig. Bitte versuchen Sie es erneut.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    await signIn('credentials', { 
      redirect: true, 
      accessCode: accessCode, 
      callbackUrl 
    });

    setIsLoading(false);
  };

  return (
    // HIER IST DIE ÄNDERUNG: bg-brand-dark
    <main className="bg-brand-dark min-h-screen flex flex-col items-center justify-center p-4" suppressHydrationWarning={true}>
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-subtle border-2 border-brand-gold">
          <div className="text-center mb-6">
            <Image src="/logo-dark.png" alt="KüchenOnline Logo" width={200} height={50} className="mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-brand-dark text-center mb-2">Kundenportal Login</h1>
          <p className="text-center text-gray-500 mb-6">Bitte geben Sie Ihren persönlichen Zugangscode ein.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="accessCode" className="sr-only">Zugangscode</label>
              <input 
                id="accessCode" 
                name="accessCode" 
                type="text" 
                value={accessCode} 
                onChange={(e) => setAccessCode(e.target.value)} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg tracking-widest focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" 
                placeholder="------" 
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-brand-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400"
              >
                {isLoading ? 'Prüfe...' : 'Anmelden'}
              </button>
            </div>
          </form>
        </div>
        <p className="text-center text-gray-300 mt-6 text-sm">Probleme bei der Anmeldung? <a href="https://wa.me/43" className="font-medium text-brand-gold hover:underline">Kontaktieren Sie uns.</a></p>
      </div>
    </main>
  );
}
