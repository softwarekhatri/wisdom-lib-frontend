'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, UserCircle } from 'lucide-react';

const links = [
  { href: '#about', label: 'About' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#features', label: 'Services' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-3 bg-primary/95 backdrop-blur-xl shadow-2xl' : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform overflow-hidden">
            <img src="/logo/wisdom-logo.png" alt="Wisdom Library" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-white font-display font-bold text-lg leading-none">Wisdom</div>
            <div className="text-gold-light text-xs tracking-widest uppercase leading-none">Library</div>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-white/80 hover:text-gold-light text-sm font-medium tracking-wide transition-colors relative group"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-primary-dark font-semibold text-sm hover:bg-gold-light transition-all duration-200 shadow-lg hover:shadow-gold/40"
          >
            <UserCircle className="w-4 h-4" />
            Member Login
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-primary-dark/98 backdrop-blur-xl border-t border-white/10"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-white/80 hover:text-gold-light text-base font-medium py-2 border-b border-white/10 transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gold text-primary-dark font-semibold"
              >
                <UserCircle className="w-4 h-4" />
                Member Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
