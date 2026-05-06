import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import AnimatedCounter from './AnimatedCounter';

const cityData = {
  Porto:      { pop: 5736,  cars: 0.52, green: 5.2,  buses: 1.8, metro: 0.9, commute: 34, bikes: 0.02, parking: 42 },
  Amsterdam:  { pop: 5135,  cars: 0.23, green: 27.5, buses: 2.4, metro: 1.8, commute: 24, bikes: 0.73, parking: 2800 },
  Paris:      { pop: 20169, cars: 0.36, green: 14.5, buses: 3.1, metro: 3.2, commute: 41, bikes: 0.15, parking: 1250 },
  Copenhagen: { pop: 7140,  cars: 0.19, green: 39.0, buses: 2.9, metro: 1.5, commute: 21, bikes: 0.67, parking: 3200 },
};

const sources = {
  Porto:      'INE · CMP · STCP 2023',
  Amsterdam:  'CBS · GVB 2023',
  Paris:      'INSEE · RATP 2023',
  Copenhagen: 'DST · DOT 2023',
};

// Most damning stat per the brief — Porto sits far below WHO target (9 m²/hab).
// One card per section gets the institutional EU-blue accent.
const FEATURED_KEY = 'green';

export default function DataDashboard() {
  const { t } = useI18n();
  const ref = useScrollReveal();
  const [compareCity, setCompareCity] = useState(null);

  const statKeys = [
    { key: 'pop',     label: 'data.pop_density', decimals: 0 },
    { key: 'cars',    label: 'data.cars',        decimals: 2 },
    { key: 'green',   label: 'data.green',       decimals: 1, suffix: ' m²', benchmark: 'OMS · 9 m²/hab' },
    { key: 'buses',   label: 'data.buses',       decimals: 1 },
    { key: 'metro',   label: 'data.metro',       decimals: 1 },
    { key: 'commute', label: 'data.commute',     decimals: 0, suffix: ' min' },
    { key: 'bikes',   label: 'data.bikes',       decimals: 2 },
    { key: 'parking', label: 'data.parking',     decimals: 0 },
  ];

  return (
    <section id="data" ref={ref} className="reveal-section py-24 sm:py-32 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div>
            <span className="font-mono text-xs tracking-widest uppercase text-accent">
              02 / 13 · {t('data.title')}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black mt-4 tracking-tightest text-foreground max-w-3xl">
              {t('data.title')}
            </h2>
            <p className="mt-4 text-foreground/60 max-w-xl font-body">
              {t('data.subtitle')}
            </p>
          </div>

          {/* Compare toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">
              {t('data.compare')}
            </span>
            <div className="flex gap-1">
              {['Amsterdam', 'Paris', 'Copenhagen'].map(city => (
                <button
                  key={city}
                  onClick={() => setCompareCity(compareCity === city ? null : city)}
                  className={`px-3 py-2 text-[10px] font-mono uppercase tracking-widest border transition-colors ${
                    compareCity === city
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent text-foreground/60 border-border hover:border-foreground hover:text-foreground'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats grid — bone cards on obsidian, hairline grid via gap-px */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {statKeys.map(stat => {
            const portoVal = cityData.Porto[stat.key];
            const compVal = compareCity ? cityData[compareCity][stat.key] : null;
            const isFeatured = stat.key === FEATURED_KEY;
            return (
              <div
                key={stat.key}
                className={`relative bg-bone text-obsidian p-8 sm:p-10 flex flex-col min-h-[260px] transition-transform duration-300 hover:-translate-y-0.5 ${isFeatured ? 'pl-9 sm:pl-11' : ''}`}
              >
                {isFeatured && (
                  <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                )}

                {/* Eyebrow / label */}
                <p className="font-mono text-[10px] uppercase tracking-widest text-obsidian/55 mb-8">
                  {t(stat.label)}
                </p>

                {/* Porto value */}
                <div>
                  <span className="font-display text-5xl sm:text-6xl font-black tracking-tightest text-obsidian leading-none">
                    <AnimatedCounter value={portoVal} decimals={stat.decimals} suffix={stat.suffix || ''} />
                  </span>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-obsidian/45 mt-2">
                    Porto{isFeatured && stat.benchmark ? ` · vs ${stat.benchmark}` : ''}
                  </p>
                </div>

                {/* Comparison value (when active) */}
                {compVal !== null && (
                  <div className="mt-5">
                    <span className="font-display text-2xl sm:text-3xl font-black tracking-tightest text-primary leading-none">
                      <AnimatedCounter value={compVal} decimals={stat.decimals} suffix={stat.suffix || ''} />
                    </span>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-obsidian/45 mt-1">
                      {compareCity}
                    </p>
                  </div>
                )}

                {/* Spacer pushes source to bottom */}
                <div className="flex-1" />

                {/* Source */}
                <div className="pt-5 mt-6 border-t border-obsidian/12">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-obsidian/40">
                    {compareCity ? `${sources.Porto} / ${sources[compareCity]}` : sources.Porto}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
