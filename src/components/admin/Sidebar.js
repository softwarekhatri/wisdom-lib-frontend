'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CreditCard, BarChart3, BookOpen,
  LogOut, X, ChevronRight, UserCircle, Armchair
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/students', icon: Users, label: 'Students' },
  { href: '/admin/seats', icon: Armchair, label: 'Seat Map' },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { href: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { href: '/admin/profile', icon: UserCircle, label: 'My Profile' },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-primary-dark to-primary">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center shadow-lg">
            <BookOpen className="w-5 h-5 text-primary-dark" />
          </div>
          <div>
            <div className="text-white font-display font-bold text-base leading-none">Wisdom</div>
            <div className="text-gold/70 text-xs tracking-widest uppercase">Library Admin</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10">
          <div className="w-9 h-9 rounded-lg bg-gold/30 flex items-center justify-center text-gold font-bold text-sm">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-medium truncate">{user?.fullName}</div>
            <div className="text-white/50 text-xs">{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`sidebar-link ${active ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-4 h-4 text-gold/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-6 border-t border-white/10 pt-4">
        <button
          onClick={logout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 flex-shrink-0 h-screen sticky top-0">
        <div className="w-full rounded-r-2xl overflow-hidden shadow-2xl">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-72 z-50 lg:hidden shadow-2xl"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white"
              >
                <X size={16} />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
