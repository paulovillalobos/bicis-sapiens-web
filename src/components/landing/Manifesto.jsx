import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { motion } from 'framer-motion';

export default function Manifesto() {
  const { t } = useI18n();
  const ref = useScrollReveal();
  const beliefs = t('manifesto.beliefs') || [];

  return (
    <section id="manifesto" ref={ref} className="reveal-section py-24 sm:py-32 lg:py-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <span className="font-mono text-xs tracking-widest uppercase text-accent">
            01 — {t('manifesto.title')}
          </span>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {Array.isArray(beliefs) && beliefs.map((belief, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              viewport={{ once: true, margin: '-50px' }}
              className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.2] tracking-tight text-foreground"
            >
              <span className="text-primary/30 font-mono text-base mr-4 align-top">
                {String(i + 1).padStart(2, '0')}
              </span>
              {belief}
            </motion.p>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <p className="font-mono text-sm text-muted-foreground">
            bicisapiens.org — {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </section>
  );
}