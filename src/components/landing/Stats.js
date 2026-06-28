'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, BookOpen, Clock, Award } from 'lucide-react';

const stats = [
  { icon: Users, value: 500, suffix: '+', label: 'Active Members', color: 'text-gold' },
  { icon: BookOpen, value: 10000, suffix: '+', label: 'Books & Titles', color: 'text-gold-light' },
  { icon: Clock, value: 15, suffix: '+', label: 'Years of Service', color: 'text-gold' },
  { icon: Award, value: 98, suffix: '%', label: 'Member Satisfaction', color: 'text-gold-light' },
];

function CountUp({ target, suffix, isInView }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span>{count.toLocaleString('en-IN')}{suffix}</span>;
}

export default function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-20 bg-primary relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,161,94,0.1)_0%,transparent_70%)]" />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(rgba(201,161,94,0.5) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
            const { icon: Icon, value, suffix, label, color } = stat;
            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex w-14 h-14 rounded-2xl bg-white/10 items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className={`w-7 h-7 ${color}`} />
                </div>
                <div className={`font-display text-4xl font-bold ${color} mb-1`}>
                  <CountUp target={value} suffix={suffix} isInView={isInView} />
                </div>
                <div className="text-white/60 text-sm font-medium">{label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
