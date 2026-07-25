import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const InstagramIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center overflow-hidden">
                <img
                  src="/logo/wisdom-logo.png"
                  alt="Wisdom Library"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-white font-display font-bold text-xl leading-none">
                  Wisdom Library
                </div>
                <div className="text-gold/70 text-xs tracking-widest uppercase">
                  Knowledge is Power
                </div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              A sanctuary for learners since 2026. We believe every book is a
              doorway to a new world, and every reader is a lifelong explorer.
              Join our family today.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://www.instagram.com/wisdomlibrary_rfg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-pink-500 hover:to-purple-600 flex items-center justify-center transition-all duration-300 group"
                title="@wisdomlibrary_rfg"
              >
                <InstagramIcon className="w-4 h-4 text-white/70 group-hover:text-white" />
              </a>
              <a
                href="https://wa.me/917209703947"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-green-600 flex items-center justify-center transition-all duration-300 group"
                title="WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4 text-white/70 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gold mb-4 text-sm tracking-wide uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "#about", label: "About Us" },
                { href: "#features", label: "Services" },
                { href: "#gallery", label: "Gallery" },
                { href: "#contact", label: "Contact" },
                { href: "/login", label: "Member Login" },
              ].map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-white/60 hover:text-gold text-sm transition-colors hover:pl-1 duration-200 block"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gold mb-4 text-sm tracking-wide uppercase">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/60 text-sm">
                <Phone className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" />
                <a
                  href="tel:+917209703947"
                  className="hover:text-gold transition-colors"
                >
                  +91 7209703947
                </a>
              </li>
              <li className="flex items-start gap-2 text-white/60 text-sm">
                <WhatsAppIcon className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" />
                <a
                  href="https://wa.me/917209703947"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  +91 7209703947 (WhatsApp)
                </a>
              </li>
              {/* <li className="flex items-start gap-2 text-white/60 text-sm">
                <Mail className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" />
                <span>info@wisdomlibrary.in</span>
              </li>
              <li className="flex items-start gap-2 text-white/60 text-sm">
                <Mail className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" />
                <span>feedback@wisdomlibrary.in</span>
              </li> */}
              <li className="flex items-start gap-2 text-white/60 text-sm">
                <Mail className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" />
                <a
                  href="mailto:wisdomlibraryrfg@gmail.com"
                  className="hover:text-gold transition-colors"
                >
                  wisdomlibraryrfg@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-white/60 text-sm">
                <InstagramIcon className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" />
                <a
                  href="https://www.instagram.com/wisdomlibrary_rfg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  @wisdomlibrary_rfg
                </a>
              </li>
              <li className="flex items-start gap-2 text-white/60 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" />
                <span>Raja Bagicha, Rafiganj, nearby Lakshwadeep School</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Wisdom Library. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">
            Deisgn & Developed by{" "}
            <a
              href="https://khatri-software.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/70 hover:text-gold underline underline-offset-2 transition-colors"
            >
              KHATRI SOFTWARE
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
