'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaRegChartBar, FaUpload, FaCube, FaWrench, FaHardHat } from 'react-icons/fa';
import Link from 'next/link';

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const sidebarVariants = {
    closed: { x: '-100%' },
    open: { x: 0 },
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Hamburger Button */}
      <button onClick={toggleSidebar} className="text-brand-dark z-50">
        <FaBars size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            />

            {/* Die Seitenleiste */}
            <motion.aside
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-64 bg-white z-50 flex flex-col p-4 border-r-2 border-brand-primary"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="font-bold text-lg text-brand-dark">Menü</h2>
                <button onClick={toggleSidebar} className="text-brand-dark">
                  <FaTimes size={24} />
                </button>
              </div>
              <nav className="flex flex-col space-y-1">
                <Link href="/portal" className="flex items-center w-full p-3 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"> <FaRegChartBar className="mr-3 w-5 text-center" /> Dashboard </Link>
                <Link href="/portal/uploads" className="flex items-center w-full p-3 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"> <FaUpload className="mr-3 w-5 text-center" /> Uploads </Link>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
