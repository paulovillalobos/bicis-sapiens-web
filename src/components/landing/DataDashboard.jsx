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

// The thesis stat of the movement: bikes per inhabitant.
// One card gets the inverted obsidian treatment to draw the eye.
const FEATURED_KEY = 'bikes';

export default function DataDashboard() {
  const { t } = useI18n();
  const ref = useScrollReveal();
  const [compareCity, setCompareCity] = useState(null);

  const statKeys = [
    { key: 'pop',     label: 'data.pop_density', decimals: 0, betterIs: 'neutral' },
    { key: 'cars',    label: 'data.cars',        decimals: 2, betterIs: 'lower' },
    { key: 'green',   label: 'data.green',       decimals: 1, suffix: ' m²', benchmark: 'OMS · 9 m²/hab', betterIs: 'higher' },
    { key: 'buses',   label: 'data.buses',       decimals: 1, betterIs: 'higher' },
    { key: 'metro',   label: 'data.metro',       decimals: 1, betterIs: 'higher' },
    { key: 'commute', label: 'data.commute',     decimals: 0, suffix: ' min', betterIs: 'lower' },
    { key: 'bikes',   label: 'data.bikes',       decimals: 2, betterIs: 'higher' },
    { key: 'parking', label: 'data.parking',     decimals: 0, betterIs: 'higher' },
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

        {/* Stats grid — physical platforms, EU-blue offset shadows on obsidian */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statKeys.map(stat => {
            const portoVal = cityData.Porto[stat.key];
            const compVal = compareCity ? cityData[compareCity][stat.key] : null;
            const isFeatured = stat.key === FEATURED_KEY;

            // Delta math + good/bad coloring
            let deltaPct = null;
            let portoIsWorse = false;
            if (compVal !== null && compVal !== 0) {
              deltaPct = Math.round(((portoVal - compVal) / compVal) * 100);
              if (stat.betterIs === 'higher') portoIsWorse = portoVal < compVal;
              if (stat.betterIs === 'lower')  portoIsWorse = portoVal > compVal;
            }

            // Card surface — featured inverted, rest bone with subtle blue shadow
            const cardSurface = isFeatured
              ? 'bg-obsidian text-bone shadow-[8px_8px_0_0_#003399] hover:shadow-[12px_12px_0_0_#003399]'
              : 'bg-bone text-obsidian shadow-[4px_4px_0_0_rgba(0,51,153,0.45)] hover:shadow-[8px_8px_0_0_rgba(0,51,153,0.65)]';

            const labelColor   = isFeatured ? 'text-bone/55'    : 'text-obsidian/55';
            const numberColor  = isFeatured ? 'text-bone'       : 'text-obsidian';
            const captionColor = isFeatured ? 'text-bone/45'    : 'text-obsidian/45';
            const dividerColor = isFeatured ? 'border-bone/15'  : 'border-obsidian/12';
            const compNumberColor = isFeatured ? 'text-eu-yellow' : 'text-eu-blue';
            const deltaColor = portoIsWorse
              ? 'text-eu-yellow'
              : (isFeatured ? 'text-bone/40' : 'text-obsidian/40');

            return (
              <div
                key={stat.key}
                className={`relative p-8 sm:p-10 flex flex-col min-h-[280px] transition-all duration-300 ease-out hover:-translate-y-1 ${cardSurface}`}
              >
                {/* Eyebrow / label */}
                <p className={`font-mono text-[10px] uppercase tracking-widest mb-8 ${labelColor}`}>
                  {t(stat.label)}
                </p>

                {/* Porto value */}
                <div>
                  <span className={`font-data text-5xl sm:text-6xl font-black tracking-tightest leading-none ${numberColor}`}>
                    <AnimatedCounter value={portoVal} decimals={stat.decimals} suffix={stat.suffix || ''} />
                  </span>
                  {stat.benchmark && (
                    <p className={`font-mono text-[9px] uppercase tracking-widest mt-3 ${captionColor}`}>
                      vs {stat.benchmark}
                    </p>
                  )}
                </div>

                {/* Spacer pushes comparison block to bottom */}
                <div className="flex-1" />

                {/* Comparison block — only when a city is selected */}
                {compVal !== null && (
                  <div className={`mt-6 pt-5 border-t ${dividerColor}`}>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className={`font-data text-2xl sm:text-3xl font-black tracking-tightest leading-none ${compNumberColor}`}>
                        <AnimatedCounter value={compVal} decimals={stat.decimals} suffix={stat.suffix || ''} />
                      </span>
                      {deltaPct !== null && stat.betterIs !== 'neutral' && (
                        <span className={`font-mono text-[10px] uppercase tracking-widest ${deltaColor}`}>
                          {deltaPct > 0 ? '+' : ''}{deltaPct}%
                        </span>
                      )}
                    </div>
                    <p className={`font-mono text-[9px] uppercase tracking-widest mt-2 ${captionColor}`}>
                      {compareCity}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sources — single section footer instead of repeated per-card */}
        <div className="mt-10 pt-6 border-t border-foreground/10">
          <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">
            {t('data.sources_label') || 'Sources'}: {sources.Porto}
            {compareCity ? ` · ${sources[compareCity]}` : ''}
          </p>
        </div>
      </div>
    </section>
  );
}
