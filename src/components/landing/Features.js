'use client';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  BookOpen, Clock, Wifi, Coffee, Shield, Users, Star, Lightbulb,
  Headphones, MapPin, BookMarked, Award
} from 'lucide-react';

const features = [
  { icon: BookOpen, title: 'Vast Collection', desc: 'Over 10,000 titles spanning literature, science, history, and beyond — curated for every kind of mind.', color: 'from-amber-500 to-orange-400' },
  { icon: Clock, title: 'Extended Hours', desc: 'Open from dawn to dusk, every day of the week — because great ideas don\'t follow a schedule.', color: 'from-primary to-primary-light' },
  { icon: Wifi, title: 'High-Speed Wi-Fi', desc: 'Blazing fast internet for seamless research, online courses, and digital exploration.', color: 'from-blue-500 to-cyan-400' },
  { icon: Coffee, title: 'Reading Café', desc: 'Enjoy artisanal coffee and snacks in our cozy reading café — the perfect companion to a good book.', color: 'from-yellow-600 to-amber-400' },
  { icon: Shield, title: 'Safe Environment', desc: 'A secure, peaceful sanctuary with 24/7 CCTV, lockers, and attentive staff for your comfort.', color: 'from-green-600 to-emerald-400' },
  { icon: Users, title: 'Community Events', desc: 'Weekly author talks, book clubs, group study sessions, and intellectual community gatherings.', color: 'from-purple-600 to-violet-400' },
  { icon: Lightbulb, title: 'Study Zones', desc: 'Dedicated silent zones, collaborative areas, and private cubicles for every study style.', color: 'from-pink-500 to-rose-400' },
  { icon: Award, title: 'Membership Rewards', desc: 'Earn points for your visits, get milestone badges, and celebrate reading achievements with us.', color: 'from-gold-dark to-gold' },
  { icon: BookMarked, title: 'Reserve & Borrow', desc: 'Reserve books online, track your reading list, and manage your library account with ease.', color: 'from-indigo-500 to-blue-400' },
  { icon: Headphones, title: 'Audiobook Corner', desc: 'A curated audiobook library for those who love to listen — perfect for multitasking learners.', color: 'from-teal-500 to-cyan-400' },
  { icon: Star, title: 'Premium Comfort', desc: 'Ergonomic seating, natural lighting, air conditioning — designed for hours of focused study.', color: 'from-orange-500 to-amber-400' },
  { icon: MapPin, title: 'Prime Location', desc: 'Centrally located with easy access — right in the heart of the city for all members.', color: 'from-red-500 to-pink-400' },
];

function FeatureCard({ feature, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { icon: Icon, title, desc, color } = feature;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
      className="tilt-card group bg-white rounded-2xl p-6 border border-primary-100 hover:border-primary-200 transition-all duration-300"
      style={{ boxShadow: '0 4px 20px rgba(67,51,44,0.06)' }}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-display font-semibold text-primary text-lg mb-2">{title}</h3>
      <p className="text-primary-lighter text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default function Features() {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true });

  return (
    <section id="features" className="py-24 bg-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest uppercase mb-4">
            What We Offer
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Everything You Need to
            <span className="gradient-text-primary block">Learn & Grow</span>
          </h2>
          <p className="text-primary-lighter text-lg max-w-2xl mx-auto">
            Wisdom Library is more than a library — it&apos;s a complete ecosystem designed to nurture curiosity, fuel ambition, and build community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
