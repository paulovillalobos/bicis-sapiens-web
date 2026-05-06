import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { motion } from 'framer-motion';
import { MapPin, Users, Route } from 'lucide-react';

const cities = [
  { name: 'Porto', country: 'PT', routes: 4, families: 85, image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop' },
  { name: 'Matosinhos', country: 'PT', routes: 2, families: 32, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop' },
  { name: 'Lisboa', country: 'PT', routes: 6, families: 120, image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400&h=300&fit=crop' },
  { name: 'Barcelona', country: 'ES', routes: 12, families: 350, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop' },
  { name: 'Amsterdam', country: 'NL', routes: 25, families: 800, image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=300&fit=crop' },
  { name: 'Coimbra', country: 'PT', routes: 1, families: 15, image: 'https://images.unsplash.com/photo-1613336026275-d6d473084e85?w=400&h=300&fit=crop' },
];

export default function BikeBus({ onJoinClick }) {
  const { t } = useI18n();
  const ref = useScrollReveal();

  return (
    <section id="bikeBus" ref={ref} className="reveal-section py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <span className="font-mono text-xs tracking-widest uppercase text-primary">
            05 — {t('bikeBus.title')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mt-4 tracking-tight">
            {t('bikeBus.title')}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            {t('bikeBus.subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city, i) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-500"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h3 className="font-display text-lg font-semibold">{city.name}</h3>
                  <span className="ml-auto text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                    {city.country}
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Route className="w-3.5 h-3.5" />
                    {city.routes} {t('bikeBus.routes')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {city.families} {t('bikeBus.families')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onJoinClick}
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            {t('bikeBus.createCta')}
          </button>
          <button
            onClick={onJoinClick}
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl border border-border text-foreground hover:bg-secondary transition-all"
          >
            {t('bikeBus.joinCta')}
          </button>
        </div>
      </div>
    </section>
  );
}