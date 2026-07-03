"use client";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const CONTACT_INFO = [
  {
    icon: Phone,
    label: "Phone",
    value: "+91 7209703947",
    href: "tel:+917209703947",
    color: "bg-green-100 text-green-700",
  },
  {
    icon: WhatsAppIcon,
    label: "WhatsApp",
    value: "+91 7209703947",
    href: "https://wa.me/917209703947",
    color: "bg-green-100 text-green-700",
  },
  // { icon: Mail, label: 'Email', value: 'info@wisdomlibrary.in', href: 'mailto:info@wisdomlibrary.in', color: 'bg-blue-100 text-blue-700' },
  // { icon: AlertCircle, label: 'Complaints / Feedback', value: 'feedback@wisdomlibrary.in', href: 'mailto:feedback@wisdomlibrary.in', color: 'bg-orange-100 text-orange-700' },
  {
    icon: MapPin,
    label: "Location",
    value: "Raja Bagicha, Rafiganj, nearby Lakshwadeep School",
    href: "https://maps.app.goo.gl/W4XV2HV1KUtqabou6",
    color: "bg-primary-100 text-primary",
  },
];

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "general",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSubmitted(true);
    setForm({ name: "", email: "", type: "general", message: "" });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="contact" ref={ref} className="py-24 bg-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest uppercase mb-4">
            Get In Touch
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary mb-4">
            We&apos;re Here to
            <span className="gradient-text-primary block">Help & Listen</span>
          </h2>
          <p className="text-primary-lighter max-w-xl mx-auto">
            Questions, feedback, or complaints — reach out to us. We value every
            member&apos;s voice.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact info + Map */}
          <div className="space-y-6">
            {CONTACT_INFO.map((info, i) => (
              <motion.a
                key={info.label}
                href={info.href}
                target={
                  info.label === "Location" || info.label === "WhatsApp"
                    ? "_blank"
                    : undefined
                }
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-primary-100 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${info.color} group-hover:scale-110 transition-transform`}
                >
                  <info.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-primary-lighter uppercase tracking-wide mb-0.5">
                    {info.label}
                  </div>
                  <div className="text-primary font-medium text-sm">
                    {info.value}
                  </div>
                </div>
              </motion.a>
            ))}

            {/* Map embed placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="rounded-2xl overflow-hidden border border-primary-100 shadow-sm"
              style={{ height: "220px" }}
            >
              <iframe
                src="https://www.google.com/maps?q=Raja+Bagicha,+Rafiganj,+near+Lakshwadeep+School&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "sepia(30%) hue-rotate(10deg)" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Wisdom Library Location"
              />
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl p-8 border border-primary-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="font-display font-bold text-primary">
                  Send a Message
                </h3>
                <p className="text-primary-lighter text-xs">
                  Feedback, complaint, or enquiry
                </p>
              </div>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <h4 className="font-semibold text-primary text-lg">
                  Message Sent!
                </h4>
                <p className="text-primary-lighter text-sm">
                  We&apos;ll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="John Doe"
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      placeholder="you@example.com"
                      className="input-field text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                    className="input-field text-sm"
                  >
                    <option value="general">General Enquiry</option>
                    <option value="membership">Membership Info</option>
                    <option value="complaint">Complaint</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, message: e.target.value }))
                    }
                    placeholder="Write your message here..."
                    className="input-field text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
