'use client';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Wifi, Snowflake, Newspaper, Feather, Droplets, Camera, Plug,
} from 'lucide-react';

const features = [
  { icon: Wifi, title: 'High Speed Wi-Fi', desc: 'Blazing fast internet for seamless research, online courses, and digital exploration.', color: 'from-blue-500 to-cyan-400' },
  { icon: Snowflake, title: 'Fully Air Conditioned', desc: 'A cool, comfortable, fully air-conditioned library — ideal for long hours of focused study.', color: 'from-cyan-500 to-blue-400' },
  { icon: Newspaper, title: 'Daily Newspaper', desc: 'Stay updated with fresh daily newspapers available for every member.', color: 'from-amber-500 to-orange-400' },
  { icon: Feather, title: 'Peaceful Environment', desc: 'A calm, quiet, and distraction-free space designed to help you focus and learn better.', color: 'from-green-600 to-emerald-400' },
  { icon: Droplets, title: 'Purified Drinking Water (RO)', desc: 'Clean, purified RO drinking water available at all times for every member.', color: 'from-sky-500 to-blue-400' },
  { icon: Camera, title: 'CCTV Surveillance', desc: 'Round-the-clock CCTV surveillance ensuring a safe and secure environment for everyone.', color: 'from-red-500 to-pink-400' },
  { icon: Plug, title: 'Individual Power Socket & Study Light', desc: 'Every seat comes with its own power socket and study light for a personalized, hassle-free study experience.', color: 'from-gold-dark to-gold' },
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
