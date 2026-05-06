import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { motion } from 'framer-motion';
import { MapPin, Users, Route } from 'lucide-react';

const cities = [
  { name: 'Porto',      country: 'PT', routes: 4,  families: 85,  image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=300&fit=crop' },
  { name: 'Matosinhos', country: 'PT', routes: 2,  families: 32,  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop' },
  { name: 'Lisboa',     country: 'PT', routes: 6,  families: 120, image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400&h=300&fit=crop' },
  { name: 'Barcelona',  country: 'ES', routes: 12, families: 350, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop' },
  { name: 'Amsterdam',  country: 'NL', routes: 25, families: 800, image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=300&fit=crop' },
  { name: 'Coimbra',    country: 'PT', routes: 1,  families: 15,  image: 'https://images.unsplash.com/photo-1613336026275-d6d473084e85?w=400&h=300&fit=crop' },
];

// Featured: Porto — home base, anchor city.
const FEATURED_NAME = 'Porto';

export default function BikeBus({ onJoinClick }) {
  const { t } = useI18n();
  const ref = useScrollReveal();

  return (
    <section id="bikeBus" ref={ref} className="reveal-section py-24 sm:py-32 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <span className="font-mono text-xs tracking-widest uppercase text-accent">
            06 / 13 · {t('bikeBus.title')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black mt-4 tracking-tightest max-w-3xl">
            {t('bikeBus.title')}
          </h2>
          <p className="mt-4 text-foreground/60 max-w-2xl font-body">
            {t('bikeBus.subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {cities.map((city, i) => {
            const isFeatured = city.name === FEATURED_NAME;
            return (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                className={`group relative bg-bone text-obsidian overflow-hidden transition-transform duration-500 hover:-translate-y-0.5 ${isFeatured ? 'pl-1' : ''}`}
              >
                {isFeatured && (
                  <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-primary z-10" />
                )}

                <div className="aspect-[4/3] overflow-hidden bg-obsidian/5">
                  <img
                    src={city.image}
                    alt={city.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="p-6 sm:p-7">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-obsidian/45">
                      {city.country}
                    </p>
                    {isFeatured && (
                      <p className="font-mono text-[9px] uppercase tracking-widest text-primary">
                        Sede
                      </p>
                    )}
                  </div>

                  <h3 className="font-display text-2xl font-black tracking-tightest text-obsidian mb-5 leading-none">
                    {city.name}
                  </h3>

                  <div className="pt-4 border-t border-obsidian/12 grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-display text-2xl font-black tracking-tightest text-obsidian leading-none">
                        {city.routes}
                      </div>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-obsidian/45 mt-1.5">
                        {t('bikeBus.routes')}
                      </p>
                    </div>
                    <div>
                      <div className="font-display text-2xl font-black tracking-tightest text-obsidian leading-none">
                        {city.families}
                      </div>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-obsidian/45 mt-1.5">
                        {t('bikeBus.families')}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-start">
          <button
            onClick={onJoinClick}
            className="inline-flex items-center justify-center px-6 py-4 text-xs font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t('bikeBus.createCta')}
          </button>
          <button
            onClick={onJoinClick}
            className="inline-flex items-center justify-center px-6 py-4 text-xs font-mono uppercase tracking-widest border border-foreground/25 text-foreground hover:bg-foreground/5 transition-colors"
          >
            {t('bikeBus.joinCta')}
          </button>
        </div>
      </div>
    </section>
  );
}
