'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle, BookOpen } from 'lucide-react';

const pillars = [
  'A peaceful, distraction-free study environment',
  'Over 10,000 books across every genre and discipline',
  'Flexible membership plans for students and professionals',
  'Expert librarians to guide your reading journey',
  'Regular cultural and intellectual events',
  'State-of-the-art reading infrastructure',
];

export default function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="about" ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary-light to-gold-dark h-96 flex items-center justify-center">
              <div className="text-center p-8">
                <BookOpen className="w-20 h-20 text-gold mx-auto mb-4 opacity-80" />
                <p className="text-white/80 font-display text-xl italic">&ldquo;Reading is to the mind what exercise is to the body.&rdquo;</p>
                <p className="text-gold/70 text-sm mt-2">— Joseph Addison</p>
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,161,94,0.2),transparent_60%)]" />
            </div>

            {/* Floating card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-primary-100"
            >
              <div className="text-2xl font-display font-bold text-primary">15+</div>
              <div className="text-primary-lighter text-xs">Years of Excellence</div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -top-6 -left-6 bg-primary rounded-2xl p-4 shadow-xl"
            >
              <div className="text-2xl font-display font-bold text-gold">500+</div>
              <div className="text-white/60 text-xs">Happy Members</div>
            </motion.div>
          </motion.div>

          {/* Right text */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest uppercase mb-5">
              About Us
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary mb-5 leading-tight">
              More Than a Library —<br />
              <span className="gradient-text-primary">A Way of Life</span>
            </h2>
            <p className="text-primary-lighter leading-relaxed mb-4">
              Founded in 2009, Wisdom Library was born from a simple belief: that access to knowledge should be beautiful, comfortable, and community-driven. Today, we are home to hundreds of dedicated readers, students, and professionals.
            </p>
            <p className="text-primary-lighter leading-relaxed mb-8">
              We don&apos;t just provide books — we create an environment where minds flourish, friendships form, and goals are achieved. Become part of our ever-growing family.
            </p>

            <ul className="space-y-3 mb-8">
              {pillars.map((p, i) => (
                <motion.li
                  key={p}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-3 text-sm text-primary"
                >
                  <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <span>{p}</span>
                </motion.li>
              ))}
            </ul>

            <a href="#contact" className="btn-primary inline-flex items-center gap-2">
              Join Our Family Today
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
