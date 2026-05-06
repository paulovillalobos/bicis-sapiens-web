import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { motion } from 'framer-motion';
import { BookOpen, ArrowUpRight, Globe } from 'lucide-react';

const guideImages = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
];

const inspiringCities = [
  { name: 'Pontevedra', country: 'ES', fact: '70% menos coches no centro' },
  { name: 'Amsterdam',  country: 'NL', fact: '#1 cycling city globally' },
  { name: 'Copenhagen', country: 'DK', fact: '49% cycle to work' },
  { name: 'Sevilla',    country: 'ES', fact: 'Built network in 2 years' },
  { name: 'Bogotá',     country: 'CO', fact: '550km of ciclovías' },
  { name: 'Paris',      country: 'FR', fact: '5th most cyclable city' },
];

// Featured: Bike Bus guide (most actionable for the movement).
const FEATURED_GUIDE_INDEX = 2;
// Featured city: Pontevedra (the brief's anchor model — closest to Bicis Sapiens thesis).
const FEATURED_CITY_NAME = 'Pontevedra';

export default function Resources() {
  const { t } = useI18n();
  const ref = useScrollReveal();
  const guides = t('resources.guides') || [];

  return (
    <section id="resources" ref={ref} className="reveal-section py-24 sm:py-32 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <span className="font-mono text-xs tracking-widest uppercase text-accent">
            09 / 13 · {t('resources.title')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black mt-4 tracking-tightest max-w-3xl">
            {t('resources.title')}
          </h2>
        </div>

        {/* Guides grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border mb-20">
          {Array.isArray(guides) && guides.map((guide, i) => {
            const isFeatured = i === FEATURED_GUIDE_INDEX;
            return (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                className={`group relative bg-bone text-obsidian overflow-hidden cursor-pointer transition-transform duration-500 hover:-translate-y-0.5 ${isFeatured ? 'pl-1' : ''}`}
              >
                {isFeatured && (
                  <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-primary z-10" />
                )}
                <div className="aspect-[4/3] overflow-hidden relative bg-obsidian/5">
                  <img
                    src={guideImages[i]}
                    alt={guide.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <BookOpen className="w-5 h-5 text-bone/85" />
                  </div>
                </div>
                <div className="p-6 sm:p-7">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-obsidian/45 mb-3">
                    Guia 0{i + 1}
                  </p>
                  <h3 className="font-display text-lg sm:text-xl font-black tracking-tightest text-obsidian leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-obsidian/65 mt-2 leading-relaxed">{guide.desc}</p>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Inspiring cities */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-4 h-4 text-foreground/55" />
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground/55">
              {t('resources.cities')}
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {inspiringCities.map((city, i) => {
              const isFeatured = city.name === FEATURED_CITY_NAME;
              return (
                <a
                  key={i}
                  href="#"
                  className={`relative flex items-center justify-between p-6 sm:p-7 bg-bone text-obsidian transition-transform duration-300 hover:-translate-y-0.5 group ${isFeatured ? 'pl-7 sm:pl-8' : ''}`}
                >
                  {isFeatured && (
                    <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-display text-xl font-black tracking-tightest text-obsidian">{city.name}</span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-obsidian/45">{city.country}</span>
                    </div>
                    <p className="text-sm text-obsidian/65 leading-snug">{city.fact}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-obsidian/35 group-hover:text-primary transition-colors shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
