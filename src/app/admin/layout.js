'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login');
      else if (user.role === 'STUDENT') router.replace('/student/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary rounded-full animate-spin" />
          <p className="text-primary-lighter text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-primary-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-primary-100 px-4 sm:px-6 py-3 flex items-center gap-3 shadow-sm flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors flex-shrink-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Branding shown only on mobile (desktop has sidebar) */}
          <div className="lg:hidden flex items-center gap-2 flex-1 min-w-0">
            <span className="font-display font-bold text-primary text-sm truncate">Wisdom Library</span>
            <span className="text-primary-lighter text-xs hidden sm:inline">Admin</span>
          </div>

          <div className="hidden lg:block flex-1" />

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-primary-50 text-primary-lighter hover:text-primary relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-gold font-bold text-sm cursor-pointer hover:bg-primary-dark transition-colors">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <motion.main
          key={Math.random()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
