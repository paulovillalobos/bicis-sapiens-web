import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { motion } from 'framer-motion';
import { BookOpen, Users, FileText } from 'lucide-react';

const icons = [BookOpen, Users, FileText];
const keys = ['info', 'consensus', 'proposal'];

export default function Solution3Cs() {
  const { t } = useI18n();
  const ref = useScrollReveal();

  return (
    <section id="solution" ref={ref} className="reveal-section py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <span className="font-mono text-xs tracking-widest uppercase text-primary">
            03 — {t('solution.title')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mt-4 tracking-tight text-foreground">
            {t('solution.title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {keys.map((key, i) => {
            const Icon = icons[i];
            const section = t(`solution.${key}`) || {};
            const bullets = section.bullets || [];

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="group relative bg-card border border-border rounded-2xl p-8 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
                  {section.title}
                </h3>
                <p className="text-muted-foreground mb-6">{section.desc}</p>
                <ul className="space-y-3">
                  {bullets.map((bullet, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-foreground/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                {/* Number watermark */}
                <span className="absolute top-6 right-8 font-display text-8xl font-bold text-primary/[0.04] select-none">
                  {i + 1}
                </span>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-12 text-center font-display text-xl sm:text-2xl text-muted-foreground italic">
          {t('solution.subtitle')}
        </p>
      </div>
    </section>
  );
}