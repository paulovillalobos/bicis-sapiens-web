import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { motion } from 'framer-motion';
import { BookOpen, Users, FileText } from 'lucide-react';

const icons = [BookOpen, Users, FileText];
const keys = ['info', 'consensus', 'proposal'];
// Featured: Consenso — the differentiator of the movement (per brief).
const FEATURED_INDEX = 1;

export default function Solution3Cs() {
  const { t } = useI18n();
  const ref = useScrollReveal();

  return (
    <section id="solution" ref={ref} className="reveal-section py-24 sm:py-32 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <span className="font-mono text-xs tracking-widest uppercase text-accent">
            03 / 13 · {t('solution.title')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black mt-4 tracking-tightest text-foreground max-w-3xl">
            {t('solution.title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border">
          {keys.map((key, i) => {
            const Icon = icons[i];
            const section = t(`solution.${key}`) || {};
            const bullets = section.bullets || [];
            const isFeatured = i === FEATURED_INDEX;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true }}
                className={`group relative bg-bone text-obsidian p-8 sm:p-10 transition-transform duration-500 hover:-translate-y-0.5 ${isFeatured ? 'pl-9 sm:pl-11' : ''}`}
              >
                {isFeatured && (
                  <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                )}

                <div className="w-11 h-11 bg-primary/10 flex items-center justify-center mb-8">
                  <Icon className="w-5 h-5 text-primary" />
                </div>

                <p className="font-mono text-[10px] uppercase tracking-widest text-obsidian/55 mb-3">
                  0{i + 1}
                </p>

                <h3 className="font-display text-2xl sm:text-3xl font-black tracking-tightest text-obsidian mb-4 leading-[1.05]">
                  {section.title}
                </h3>
                <p className="text-obsidian/65 mb-6 font-body leading-relaxed">{section.desc}</p>

                <ul className="space-y-2.5 pt-5 border-t border-obsidian/12">
                  {bullets.map((bullet, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-obsidian/80">
                      <div className="w-1.5 h-1.5 bg-primary mt-2 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* Watermark number, very subtle */}
                <span aria-hidden="true" className="absolute top-6 right-8 font-display text-7xl font-black tracking-tightest text-obsidian/[0.05] select-none leading-none">
                  {i + 1}
                </span>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-12 max-w-3xl font-display text-xl sm:text-2xl text-foreground/60 italic leading-relaxed">
          {t('solution.subtitle')}
        </p>
      </div>
    </section>
  );
}
