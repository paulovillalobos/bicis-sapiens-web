import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';

// --- Data layer (untouched) ---
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
const SHORT_NAMES = {
  Amsterdam:  'AMS',
  Paris:      'PAR',
  Copenhagen: 'CPH',
};

// --- Theme tokens (this section only) ---
const YELLOW   = '#d4a017';                  // kicker + "Porto worse" stat
const BLUE     = '#1d4ed8';                  // deltas, primary bars, headline accent, active pill
const HAIRLINE = 'rgba(255, 255, 255, 0.15)';
const HAIRLINE_SOFT = 'rgba(255, 255, 255, 0.08)';
const SURFACE  = 'rgba(255, 255, 255, 0.04)';
const SURFACE_BORDER = 'rgba(255, 255, 255, 0.10)';

// --- Helpers (per spec) ---
function computeDelta(portoVal, compareVal, inverse = false) {
  if (!portoVal || !compareVal) return '—';
  if (inverse) {
    const pct = ((portoVal - compareVal) / compareVal) * 100;
    return `${Math.round(pct)}%`;
  }
  const ratio = compareVal / portoVal;
  if (ratio >= 2) {
    const fixed = ratio.toFixed(1);
    return `${fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed}×`;
  }
  const pct = ((compareVal - portoVal) / compareVal) * 100;
  return `${Math.round(pct)}%`;
}

function computeBarPair(portoVal, compareVal) {
  const max = Math.max(portoVal, compareVal) || 1;
  return {
    portoPct:   (portoVal   / max) * 100,
    comparePct: (compareVal / max) * 100,
  };
}

function computeWhoDelta(portoGreenM2) {
  return Math.round(((9 - portoGreenM2) / 9) * 100);
}

// Italic blue inline delta, used inside the thesis sentence.
const Delta = ({ children }) => (
  <span style={{ color: BLUE, fontStyle: 'italic' }} className="whitespace-nowrap">{children}</span>
);

// One bar row inside a stat — track + fill + small uppercase label
function BarRow({ pct, color, label, muted }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 relative"
        style={{ height: 4, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 2 }}
      >
        <div
          className="absolute left-0 top-0 h-full"
          style={{ width: `${pct}%`, background: color, borderRadius: 2 }}
        />
      </div>
      <span
        className="font-mono uppercase"
        style={{
          fontSize: 10,
          letterSpacing: '0.05em',
          minWidth: 32,
          color: muted ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function StatCell({ label, portoVal, compareVal, compareShort, compareName, isWarn }) {
  const bars = computeBarPair(portoVal, compareVal);
  const fillColor = isWarn ? YELLOW : BLUE;
  return (
    <div
      className="p-5 sm:p-6"
      style={{ borderRight: `0.5px solid ${HAIRLINE_SOFT}` }}
    >
      <p
        className="font-mono uppercase mb-3 m-0"
        style={{ fontSize: 11, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)' }}
      >
        {label}
      </p>
      <p
        className="font-data leading-none m-0 mb-4"
        style={{
          fontSize: 32,
          fontWeight: 500,
          color: isWarn ? YELLOW : '#fff',
        }}
      >
        {portoVal}
      </p>

      <div className="flex flex-col gap-1.5">
        <BarRow pct={bars.portoPct}   color={fillColor}                   label="Porto"        muted={false} />
        <BarRow pct={bars.comparePct} color="rgba(255, 255, 255, 0.4)"   label={compareShort} muted={true}  />
      </div>

      <p
        className="m-0"
        style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}
      >
        {compareName}: {compareVal}
      </p>
    </div>
  );
}

// --- Component ---

export default function DataDashboard() {
  const { t } = useI18n();
  const ref = useScrollReveal();
  const [compareCity, setCompareCity] = useState('Amsterdam');

  const porto = cityData.Porto;
  const compare = cityData[compareCity];
  const compareShort = SHORT_NAMES[compareCity] || compareCity.slice(0, 3).toUpperCase();

  // Deltas for the thesis (Porto WORSE on buses/green/metro vs all 3 cities)
  const dBuses = computeDelta(porto.buses, compare.buses, false);
  const dGreen = computeDelta(porto.green, compare.green, false);
  const dMetro = computeDelta(porto.metro, compare.metro, false);
  // Cars: Porto has MORE → inverse delta
  const dCars  = computeDelta(porto.cars,  compare.cars,  true);

  const whoDelta = computeWhoDelta(porto.green);

  // Secondary stats config — cars is the "warn" stat
  const statsConfig = [
    { metric: 'buses', label: t('numbers.metrics.buses'), portoVal: porto.buses, compareVal: compare.buses, isWarn: false },
    { metric: 'metro', label: t('numbers.metrics.metro'), portoVal: porto.metro, compareVal: compare.metro, isWarn: false },
    { metric: 'cars',  label: t('numbers.metrics.cars'),  portoVal: porto.cars,  compareVal: compare.cars,  isWarn: true  },
    { metric: 'bikes', label: t('numbers.metrics.bikes'), portoVal: porto.bikes, compareVal: compare.bikes, isWarn: false },
  ];

  return (
    <section
      id="data"
      ref={ref}
      className="reveal-section"
      style={{ background: '#0a0a0a', color: '#fff' }}
    >
      <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-20 sm:py-24">

        {/* KICKER — yellow line + label */}
        <div className="flex items-center gap-3 mb-6">
          <span aria-hidden="true" style={{ width: 32, height: 1, background: YELLOW }} />
          <span
            className="font-mono uppercase font-medium m-0"
            style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}
          >
            {t('numbers.kicker')}
          </span>
        </div>

        {/* HEADER — headline (with italic blue accent) + city pills */}
        <header
          className="flex justify-between items-end gap-8 flex-wrap pb-6 mb-10"
          style={{ borderBottom: `0.5px solid ${HAIRLINE}` }}
        >
          <h2
            className="font-data leading-[1.1] tracking-tight m-0 max-w-[680px]"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, color: '#fff' }}
          >
            {t('numbers.headline.line1')}
            <br />
            {t('numbers.headline.line2_prefix')}{' '}
            <span style={{ fontStyle: 'italic', color: BLUE }}>
              {t('numbers.headline.line2_accent')}
            </span>
          </h2>

          <div
            className="flex items-center gap-1.5 flex-wrap font-mono uppercase"
            style={{ fontSize: 11, letterSpacing: '0.1em' }}
          >
            <span style={{ color: 'rgba(255,255,255,0.4)', marginRight: 8 }}>
              {t('numbers.compareWith')}
            </span>
            {['Amsterdam', 'Paris', 'Copenhagen'].map((city) => {
              const active = compareCity === city;
              return (
                <button
                  key={city}
                  onClick={() => setCompareCity(city)}
                  className="font-mono uppercase transition-colors"
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    background: active ? BLUE : 'transparent',
                    border: `0.5px solid ${active ? BLUE : 'rgba(255,255,255,0.2)'}`,
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                >
                  {city}
                </button>
              );
            })}
          </div>
        </header>

        {/* HERO ROW: thesis (1.5fr) + green-space card (1fr) */}
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 mb-12 items-start">

          {/* THESIS */}
          <div>
            <p
              className="font-mono uppercase m-0 mb-4"
              style={{ fontSize: 11, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)' }}
            >
              {t('numbers.analysis')}
            </p>
            <p
              className="font-data leading-[1.4] m-0 mb-5"
              style={{ fontSize: 'clamp(20px, 2.4vw, 26px)', color: '#fff' }}
            >
              {t('numbers.thesis.prefix')}{' '}
              <Delta>{dBuses}</Delta>{' '}
              {t('numbers.thesis.buses')}{' '}
              <Delta>{dGreen}</Delta>{' '}
              {t('numbers.thesis.green')}{' '}
              <Delta>{dMetro}</Delta>{' '}
              {t('numbers.thesis.metro')} {compareCity}.
            </p>
            <p
              className="m-0 leading-relaxed"
              style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}
            >
              {t('numbers.context.prefix')}{' '}
              <Delta>{dCars}</Delta>{' '}
              {t('numbers.context.suffix')}
            </p>
          </div>

          {/* HERO STAT CARD — green space + WHO benchmark */}
          <div
            className="p-6 sm:p-7"
            style={{ background: SURFACE, border: `0.5px solid ${SURFACE_BORDER}`, borderRadius: 12 }}
          >
            <p
              className="font-mono uppercase m-0 mb-3"
              style={{ fontSize: 11, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)' }}
            >
              {t('numbers.greenSpace.label')}
            </p>
            <p
              className="font-data leading-none m-0"
              style={{ fontSize: 'clamp(48px, 6.5vw, 64px)', fontWeight: 500, color: '#fff' }}
            >
              {porto.green}
              <sup className="align-super" style={{ fontSize: '0.45em' }}>m²</sup>
            </p>
            <p className="m-0 mt-2" style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              {t('numbers.greenSpace.caption')}
            </p>
            <p
              className="m-0 mt-2"
              style={{ fontSize: 13, color: YELLOW }}
            >
              ↓ {whoDelta}{t('numbers.greenSpace.whoBelow')}
            </p>
          </div>
        </div>

        {/* SECONDARY STATS — 4 cells, double parallel bars per cell */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4"
          style={{
            borderTop:    `0.5px solid ${HAIRLINE}`,
            borderBottom: `0.5px solid ${HAIRLINE}`,
          }}
        >
          {statsConfig.map((stat, i) => {
            // Hide right-border on the last cell of each row (responsive)
            const isLastDesktop = (i + 1) % 4 === 0;
            const isLastMobile  = (i + 1) % 2 === 0;
            const firstRowMobile = i < 2;
            return (
              <div
                key={stat.metric}
                style={{
                  borderRight: isLastDesktop
                    ? 'none'
                    : (isLastMobile
                      ? `0.5px solid ${HAIRLINE_SOFT}`
                      : `0.5px solid ${HAIRLINE_SOFT}`),
                  borderBottom: firstRowMobile ? `0.5px solid ${HAIRLINE_SOFT}` : 'none',
                }}
                className="lg:!border-b-0"
              >
                <StatCell
                  label={stat.label}
                  portoVal={stat.portoVal}
                  compareVal={stat.compareVal}
                  compareShort={compareShort}
                  compareName={compareCity}
                  isWarn={stat.isWarn}
                />
              </div>
            );
          })}
        </div>

        {/* SOURCES */}
        <p
          className="font-mono uppercase m-0 mt-6"
          style={{ fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)' }}
        >
          {t('data.source')}: {sources.Porto} / {sources[compareCity]}
        </p>

      </div>
    </section>
  );
}
