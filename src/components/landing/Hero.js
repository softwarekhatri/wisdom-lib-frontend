'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Star, Sparkles } from 'lucide-react';

const PARTICLES = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  size: Math.random() * 6 + 2,
  duration: Math.random() * 12 + 8,
  delay: Math.random() * 6,
  opacity: Math.random() * 0.4 + 0.1,
}));

const WORDS = ['Knowledge', 'Wisdom', 'Excellence', 'Growth', 'Success'];

function TypewriterText() {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = WORDS[index];
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (displayed.length < word.length) {
          setDisplayed(word.slice(0, displayed.length + 1));
        } else {
          setTimeout(() => setDeleting(true), 1800);
        }
      } else {
        if (displayed.length > 0) {
          setDisplayed(displayed.slice(0, -1));
        } else {
          setDeleting(false);
          setIndex((i) => (i + 1) % WORDS.length);
        }
      }
    }, deleting ? 60 : 110);
    return () => clearTimeout(timeout);
  }, [displayed, deleting, index]);

  return (
    <span className="gradient-text inline-block min-w-[200px]">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}

function Book3D() {
  return (
    <div className="relative w-44 h-56 sm:w-52 sm:h-64 select-none">
      <div
        className="book-cover relative w-full h-full rounded-r-lg rounded-l-sm flex flex-col items-center justify-center p-4"
        style={{ transformOrigin: 'center center' }}
      >
        <div className="book-spine" />
        <div className="book-page-lines" />
        <BookOpen className="w-12 h-12 text-gold mb-3 drop-shadow-lg" />
        <div className="text-gold font-display font-bold text-lg text-center leading-tight">Wisdom</div>
        <div className="text-gold/70 text-xs tracking-widest uppercase mt-1">Library</div>
        <div className="absolute inset-0 rounded-r-lg rounded-l-sm bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        {/* Gold ornament lines */}
        <div className="absolute top-3 left-3 right-3 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      </div>
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg blur-3xl bg-gold/10 scale-110 -z-10 animate-pulse-glow" />
    </div>
  );
}

export default function Hero() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg"
    >
      {/* Cinematic overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,161,94,0.08)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(67,51,44,0.6)_0%,transparent_60%)]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(201,161,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,161,94,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gold pointer-events-none"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, bottom: 0, opacity: p.opacity }}
          animate={{ y: [0, -900], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'linear' }}
        />
      ))}

      {/* Floating decorative orbs */}
      <motion.div
        className="absolute top-1/4 left-10 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,161,94,0.15), transparent)' }}
        animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(67,51,44,0.4), transparent)' }}
        animate={{ scale: [1.2, 1, 1.2], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 grid lg:grid-cols-2 gap-12 items-center"
      >
        {/* Left — Text */}
        <div className="text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 border border-gold/20"
          >
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-gold text-xs font-semibold tracking-widest uppercase">Premium Library Experience</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
          >
            Your Journey to
            <br />
            <TypewriterText />
            <br />
            <span className="text-white/90">Starts Here</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg"
          >
            Step into a world where every page opens new horizons. Wisdom Library — your sanctuary of knowledge,
            community, and lifelong learning in the heart of the city.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap gap-4"
          >
            <a
              href="#contact"
              className="btn-gold flex items-center gap-2 text-sm"
            >
              Join Our Family <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all"
            >
              Member Portal
            </Link>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex gap-8 mt-10"
          >
            {[
              { icon: Users, label: 'Members', value: '500+' },
              { icon: BookOpen, label: 'Books', value: '10K+' },
              { icon: Star, label: 'Years', value: '15+' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="text-gold font-bold text-2xl font-display">{value}</div>
                <div className="text-white/50 text-xs mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — 3D Book */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
          className="flex items-center justify-center book-3d"
        >
          <div className="relative">
            <Book3D />

            {/* Floating badges */}
            <motion.div
              className="absolute -top-6 -right-6 glass px-3 py-2 rounded-xl border border-gold/20 text-xs text-gold font-semibold"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              📚 10K+ Books
            </motion.div>
            <motion.div
              className="absolute -bottom-4 -left-8 glass px-3 py-2 rounded-xl border border-white/10 text-xs text-white/80 font-medium"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              ⭐ 500+ Members
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/40 text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          className="w-0.5 h-12 bg-gradient-to-b from-gold/60 to-transparent"
          animate={{ scaleY: [0, 1, 0], transformOrigin: 'top' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}
