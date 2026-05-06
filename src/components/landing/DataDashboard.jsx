import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import AnimatedCounter from './AnimatedCounter';

const cityData = {
  Porto: { pop: 5736, cars: 0.52, green: 5.2, buses: 1.8, metro: 0.9, commute: 34, bikes: 0.02, parking: 42 },
  Amsterdam: { pop: 5135, cars: 0.23, green: 27.5, buses: 2.4, metro: 1.8, commute: 24, bikes: 0.73, parking: 2800 },
  Paris: { pop: 20169, cars: 0.36, green: 14.5, buses: 3.1, metro: 3.2, commute: 41, bikes: 0.15, parking: 1250 },
  Copenhagen: { pop: 7140, cars: 0.19, green: 39.0, buses: 2.9, metro: 1.5, commute: 21, bikes: 0.67, parking: 3200 },
};

const sources = {
  Porto: 'INE, CMP, STCP 2023',
  Amsterdam: 'CBS, GVB 2023',
  Paris: 'INSEE, RATP 2023',
  Copenhagen: 'DST, DOT 2023',
};

export default function DataDashboard() {
  const { t } = useI18n();
  const ref = useScrollReveal();
  const [compareCity, setCompareCity] = useState(null);

  const statKeys = [
    { key: 'pop', label: 'data.pop_density', decimals: 0 },
    { key: 'cars', label: 'data.cars', decimals: 2 },
    { key: 'green', label: 'data.green', decimals: 1, suffix: ' m²' },
    { key: 'buses', label: 'data.buses', decimals: 1 },
    { key: 'metro', label: 'data.metro', decimals: 1 },
    { key: 'commute', label: 'data.commute', decimals: 0, suffix: ' min' },
    { key: 'bikes', label: 'data.bikes', decimals: 2 },
    { key: 'parking', label: 'data.parking', decimals: 0 },
  ];

  return (
    <section id="data" ref={ref} className="reveal-section py-24 sm:py-32 bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
          <div>
            <span className="font-mono text-xs tracking-widest uppercase text-accent">
              02 — {t('data.title')}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mt-4 tracking-tight">
              {t('data.title')}
            </h2>
            <p className="mt-3 text-lg text-background/60 max-w-xl">
              {t('data.subtitle')}
            </p>
          </div>

          {/* Compare toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-background/60 font-mono">{t('data.compare')}:</span>
            <div className="flex gap-1">
              {['Amsterdam', 'Paris', 'Copenhagen'].map(city => (
                <button
                  key={city}
                  onClick={() => setCompareCity(compareCity === city ? null : city)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                    compareCity === city
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-background/10 text-background/60 hover:bg-background/20'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {statKeys.map(stat => {
            const portoVal = cityData.Porto[stat.key];
            const compVal = compareCity ? cityData[compareCity][stat.key] : null;
            const better = compVal !== null ? portoVal < compVal : null;
            const isBikeOrGreen = ['green', 'bikes', 'parking', 'buses', 'metro'].includes(stat.key);
            const actuallyBetter = isBikeOrGreen ? !better : better;

            return (
              <div key={stat.key} className="stat-card bg-background/5 border border-background/10 rounded-2xl p-5 sm:p-6">
                <p className="text-xs font-mono text-background/40 uppercase tracking-wider mb-4">
                  {t(stat.label)}
                </p>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-display font-bold text-background">
                      <AnimatedCounter value={portoVal} decimals={stat.decimals} suffix={stat.suffix || ''} />
                    </span>
                    <span className="text-xs font-mono text-accent">Porto</span>
                  </div>
                  {compVal !== null && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-display font-medium text-background/50">
                        <AnimatedCounter value={compVal} decimals={stat.decimals} suffix={stat.suffix || ''} />
                      </span>
                      <span className="text-xs font-mono text-background/30">{compareCity}</span>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-[10px] font-mono text-background/20">
                  {t('data.source')}: {compareCity ? `${sources.Porto} / ${sources[compareCity]}` : sources.Porto}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}