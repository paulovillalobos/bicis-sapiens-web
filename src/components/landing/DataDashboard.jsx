import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';

// --- KEEP AS-IS: data + sources untouched ---
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

// betterIs: 'higher' = more is better (Porto worse if less)
//           'lower'  = less is better (Porto worse if more)
const META = {
  buses:   { betterIs: 'higher' },
  metro:   { betterIs: 'higher' },
  green:   { betterIs: 'higher' },
  bikes:   { betterIs: 'higher' },
  cars:    { betterIs: 'lower'  },
  commute: { betterIs: 'lower'  },
};

const RUST = '#993C1D';
const HAIRLINE = '#d4d4d0';
const HAIRLINE_SOFT = '#e8e6df';
const HERO_STAT_BG = '#f0eee6';

// "3.2×" or "44%" — magnitude only; the suffix word ("fewer"/"more") is in i18n template.
function deltaShort(portoVal, compareVal, betterIs = 'higher') {
  if (!portoVal || !compareVal) return '—';
  if (betterIs === 'higher') {
    if (portoVal >= compareVal) {
      const pct = Math.round((portoVal / compareVal - 1) * 100);
      return `${pct}%`;
    }
    const ratio = compareVal / portoVal;
    if (ratio >= 2) return `${ratio.toFixed(1).replace(/\.0$/, '')}×`;
    return `${Math.round((1 - portoVal / compareVal) * 100)}%`;
  }
  // betterIs lower → Porto worse if more
  if (portoVal > compareVal) {
    const pct = Math.round((portoVal / compareVal - 1) * 100);
    return `${pct}%`;
  }
  return `${Math.round((1 - portoVal / compareVal) * 100)}%`;
}

function isPortoWorse(metric, portoVal, compareVal) {
  const meta = META[metric] || { betterIs: 'higher' };
  if (meta.betterIs === 'higher') return portoVal < compareVal;
  return portoVal > compareVal;
}

// Bar widths normalized to max(porto, compare) + 10% headroom.
function barPositions(portoVal, compareVal) {
  const max = Math.max(portoVal, compareVal) * 1.1 || 1;
  return {
    portoPct: (portoVal / max) * 100,
    comparePct: (compareVal / max) * 100,
  };
}

// Substitute {0}, {1}, ... in a template string with React nodes.
function interpolate(template, replacements) {
  if (!template) return '';
  return template.split(/(\{\d+\})/g).map((part, i) => {
    const m = part.match(/^\{(\d+)\}$/);
    if (!m) return part;
    const idx = parseInt(m[1], 10);
    return <React.Fragment key={i}>{replacements[idx] ?? ''}</React.Fragment>;
  });
}

const Delta = ({ children }) => (
  <span style={{ color: RUST }} className="font-medium whitespace-nowrap">{children}</span>
);

// --- Component ---

export default function DataDashboard() {
  const { t } = useI18n();
  const ref = useScrollReveal();
  const [compareCity, setCompareCity] = useState('Amsterdam');

  const porto = cityData.Porto;
  const compare = cityData[compareCity];

  // Deltas for the thesis sentence
  const dBuses = deltaShort(porto.buses, compare.buses, 'higher');
  const dGreen = deltaShort(porto.green, compare.green, 'higher');
  const dMetro = deltaShort(porto.metro, compare.metro, 'higher');
  const dCars  = deltaShort(porto.cars,  compare.cars,  'lower');

  // WHO benchmark for green (target 9 m²/hab)
  const whoMin = 9;
  const whoDeltaPct = Math.round((1 - porto.green / whoMin) * 100);

  const thesis = interpolate(t('data.thesis'), [
    <Delta>{dBuses}</Delta>,
    <Delta>{dGreen}</Delta>,
    <Delta>{dMetro}</Delta>,
    <strong className="font-medium">{compareCity}</strong>,
  ]);

  const thesisCtx = interpolate(t('data.thesisContext'), [
    <Delta>{dCars}</Delta>,
  ]);

  // Secondary stats row
  const secondaryStats = [
    { metric: 'buses', label: t('data.buses'), porto: porto.buses, compare: compare.buses },
    { metric: 'metro', label: t('data.metro'), porto: porto.metro, compare: compare.metro },
    { metric: 'cars',  label: t('data.cars'),  porto: porto.cars,  compare: compare.cars  },
    { metric: 'bikes', label: t('data.bikes'), porto: porto.bikes, compare: compare.bikes },
  ];

  return (
    <section
      id="data"
      ref={ref}
      className="reveal-section bg-bone text-obsidian"
    >
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 py-16 sm:py-20">

        {/* HEADER */}
        <header
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-6 mb-10"
          style={{ borderBottom: `0.5px solid ${HAIRLINE}` }}
        >
          <div>
            <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-obsidian/55 mb-2">
              Issue 01 · {t('data.issue')}
            </p>
            <h2 className="font-data font-medium leading-[1.1] tracking-tight m-0 max-w-[680px]"
                style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
              {t('data.subtitle')}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap font-mono text-[11px] tracking-[0.1em] uppercase">
            <span className="text-obsidian/55 mr-2">{t('data.compare')}</span>
            {['Amsterdam', 'Paris', 'Copenhagen'].map((city) => (
              <button
                key={city}
                onClick={() => setCompareCity(city)}
                className={`px-3.5 py-1.5 transition-colors ${
                  compareCity === city
                    ? 'bg-obsidian text-bone'
                    : 'bg-transparent text-obsidian hover:bg-obsidian/5'
                }`}
                style={{
                  border: `0.5px solid ${compareCity === city ? '#0A0A0A' : HAIRLINE}`,
                }}
              >
                {city}
              </button>
            ))}
          </div>
        </header>

        {/* HERO ROW */}
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 mb-12 items-start">
          {/* Thesis */}
          <div>
            <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-obsidian/55 mb-3">
              {t('data.thesisLabel')}
            </p>
            <p className="font-data font-medium leading-[1.4] m-0 mb-4"
               style={{ fontSize: 'clamp(20px, 2.4vw, 26px)' }}>
              {thesis}
            </p>
            <p className="text-sm sm:text-[14px] leading-relaxed text-obsidian/65 m-0">
              {thesisCtx}
            </p>
          </div>

          {/* Hero stat — green space + WHO benchmark */}
          <div className="p-7 sm:p-8" style={{ background: HERO_STAT_BG }}>
            <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-obsidian/55 mb-3 m-0">
              {t('data.green')}
            </p>
            <p className="font-data font-medium leading-none m-0"
               style={{ fontSize: 'clamp(56px, 7vw, 72px)' }}>
              {porto.green}
              <sup className="align-super" style={{ fontSize: '0.42em' }}>m²</sup>
            </p>
            <p className="text-sm text-obsidian/55 mt-2 m-0">
              {t('data.perResident')}
            </p>
            <p className="text-[13px] mt-1 m-0 font-medium" style={{ color: RUST }}>
              ↓ {whoDeltaPct}% {t('data.belowWHO')}
            </p>
          </div>
        </div>

        {/* SECONDARY STATS */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4"
          style={{
            borderTop: `0.5px solid ${HAIRLINE}`,
            borderBottom: `0.5px solid ${HAIRLINE}`,
          }}
        >
          {secondaryStats.map((stat, i) => {
            const worse = isPortoWorse(stat.metric, stat.porto, stat.compare);
            const bars = barPositions(stat.porto, stat.compare);
            const isLastInRow = (i + 1) % 4 === 0;        // desktop: last column
            const isLastInRowMobile = (i + 1) % 2 === 0;  // mobile: last column of 2
            const isFirstRow = i < 2;                     // mobile: first row separator
            return (
              <div
                key={stat.metric}
                className="p-5 sm:p-6"
                style={{
                  borderRight: !isLastInRow ? `0.5px solid ${HAIRLINE_SOFT}` : 'none',
                  borderBottom: isFirstRow ? `0.5px solid ${HAIRLINE_SOFT}` : 'none',
                }}
              >
                <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-obsidian/55 m-0 mb-3">
                  {stat.label}
                </p>
                <p
                  className="font-data font-medium leading-none m-0"
                  style={{
                    fontSize: 'clamp(24px, 3vw, 32px)',
                    color: worse ? RUST : '#0A0A0A',
                  }}
                >
                  {stat.porto}
                </p>
                {/* Bar + tick */}
                <div
                  className="relative mt-4 mb-2"
                  style={{ height: '4px', background: HAIRLINE_SOFT }}
                >
                  <div
                    className="absolute left-0 top-0 h-full"
                    style={{ width: `${bars.portoPct}%`, background: RUST }}
                  />
                  <div
                    className="absolute"
                    style={{
                      left: `${bars.comparePct}%`,
                      top: '-2px',
                      width: '1px',
                      height: '8px',
                      background: '#0A0A0A',
                    }}
                  />
                </div>
                <p className="text-[11px] text-obsidian/55 m-0">
                  {compareCity}: {stat.compare}
                </p>
              </div>
            );
          })}
        </div>

        {/* SOURCES */}
        <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-obsidian/55 mt-6 m-0">
          {t('data.source')}: {sources.Porto} / {sources[compareCity]}
        </p>
      </div>
    </section>
  );
}
