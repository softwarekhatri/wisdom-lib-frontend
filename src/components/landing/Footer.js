import Link from 'next/link';
import { BookOpen, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-dark" />
              </div>
              <div>
                <div className="text-white font-display font-bold text-xl leading-none">Wisdom Library</div>
                <div className="text-gold/70 text-xs tracking-widest uppercase">Knowledge is Power</div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              A sanctuary for learners since 2009. We believe every book is a doorway to a new world,
              and every reader is a lifelong explorer. Join our family today.
            </p>
            <div className="mt-6 flex gap-3">
              {['📘', '📷', '🐦', '▶️'].map((emoji, i) => (
                <button key={i} className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm transition-colors">
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gold mb-4 text-sm tracking-wide uppercase">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { href: '#about', label: 'About Us' },
                { href: '#features', label: 'Services' },
                { href: '#gallery', label: 'Gallery' },
                { href: '#contact', label: 'Contact' },
                { href: '/login', label: 'Member Login' },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-white/60 hover:text-gold text-sm transition-colors hover:pl-1 duration-200 block">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gold mb-4 text-sm tracking-wide uppercase">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/60 text-sm">
                <Phone className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2 text-white/60 text-sm">
                <Mail className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" />
                <span>info@wisdomlibrary.in</span>
              </li>
              <li className="flex items-start gap-2 text-white/60 text-sm">
                <Mail className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" />
                <span>feedback@wisdomlibrary.in</span>
              </li>
              <li className="flex items-start gap-2 text-white/60 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" />
                <span>Library Road, Knowledge Nagar</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">© {new Date().getFullYear()} Wisdom Library. All rights reserved.</p>
          <p className="text-white/30 text-xs">Crafted with ❤️ for knowledge seekers</p>
        </div>
      </div>
    </footer>
  );
}
