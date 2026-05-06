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
  { name: 'Amsterdam', country: 'NL', fact: '#1 cycling city globally' },
  { name: 'Copenhagen', country: 'DK', fact: '49% cycle to work' },
  { name: 'Pontevedra', country: 'ES', fact: '70% less cars in center' },
  { name: 'Sevilla', country: 'ES', fact: 'Built network in 2 years' },
  { name: 'Bogotá', country: 'CO', fact: '550km of ciclovías' },
  { name: 'Paris', country: 'FR', fact: '5th most cyclable city' },
];

export default function Resources() {
  const { t } = useI18n();
  const ref = useScrollReveal();
  const guides = t('resources.guides') || [];

  return (
    <section id="resources" ref={ref} className="reveal-section py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <span className="font-mono text-xs tracking-widest uppercase text-primary">
            09 — {t('resources.title')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mt-4 tracking-tight">
            {t('resources.title')}
          </h2>
        </div>

        {/* Guides grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {Array.isArray(guides) && guides.map((guide, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-500 cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img src={guideImages[i]} alt={guide.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <BookOpen className="w-5 h-5 text-white/80" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  {guide.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{guide.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Inspiring cities */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-display text-xl font-semibold">{t('resources.cities')}</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inspiringCities.map((city, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-semibold">{city.name}</span>
                    <span className="text-xs font-mono text-muted-foreground">{city.country}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{city.fact}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}