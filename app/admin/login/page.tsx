'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('admin-credentials', {
        redirect: false,
        username: username,
        password: password,
      });

      if (result?.ok) {
        router.push('/admin/dashboard');
      } else {
        setError('Benutzername oder Passwort ungültig.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login-Fehler:", error);
      setError('Ein unerwarteter Fehler ist aufgetreten.');
      setIsLoading(false);
    }
  };

  return (
    // HIER IST DIE ÄNDERUNG: bg-brand-dark
    <main className="bg-brand-dark min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white p-8 rounded-xl shadow-subtle">
          <div className="text-center mb-6">
            <Image src="/logo-dark.png" alt="KüchenOnline Logo" width={200} height={50} className="mx-auto" />
          </div>
          <h1 className="text-xl font-bold text-brand-dark text-center mb-6">Admin Login</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Benutzername</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Passwort</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-brand-primary hover:opacity-90 disabled:bg-gray-400"
              >
                {isLoading ? 'Prüfe...' : 'Anmelden'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
