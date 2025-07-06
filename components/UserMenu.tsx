'use client';

import { signOut } from 'next-auth/react';
import { FaSignOutAlt, FaCog, FaBell, FaUser } from 'react-icons/fa';

interface UserMenuProps {
  userName?: string | null;
}

export default function UserMenu({ userName }: UserMenuProps) {
  const initial = userName?.charAt(0).toUpperCase() || <FaUser />;

  return (
    <div className="flex items-center space-x-4">
      <FaBell className="text-gray-400 hover:text-brand-primary cursor-pointer" size={22} />
      <FaCog className="text-gray-400 hover:text-brand-primary cursor-pointer" size={22} />
      <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-lg">{initial}</div>
      <button 
        onClick={() => signOut({ callbackUrl: '/' })} 
        className="flex items-center text-sm text-gray-500 hover:text-brand-primary font-semibold transition-colors"
      >
        <FaSignOutAlt className="mr-2" />
        Logout
      </button>
    </div>
  );
}
