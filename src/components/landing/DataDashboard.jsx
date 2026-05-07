import React, { useState, useEffect, useRef } from 'react';
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
const SHORT_NAMES = { Amsterdam: 'AMS', Paris: 'PAR', Copenhagen: 'CPH' };

// --- Theme tokens ---
const YELLOW         = '#d4a017';
const BLUE           = '#1d4ed8';
const CORAL          = '#b14545';   // Porto WORSE — burgundy/coral, fits palette
const HAIRLINE       = 'rgba(255, 255, 255, 0.15)';
const HAIRLINE_SOFT  = 'rgba(255, 255, 255, 0.08)';
const SURFACE        = 'rgba(255, 255, 255, 0.04)';
const SURFACE_BORDER = 'rgba(255, 255, 255, 0.10)';

// City identity colors — flag-rooted, distinct against obsidian.
// The whole dashboard "wears" the active city's color: bottom bar fill,
// city-name labels, and active pill background all draw from this map.
const CITY_COLORS = {
  Paris:      '#0055A4',  // French flag blue
  Amsterdam:  '#F36C21',  // Dutch royal orange
  Copenhagen: '#C60C30',  // Danish flag red
};

// --- Helpers ---
function deltaPct(porto, compare, inverse = false) {
  if (!porto || !compare) return null;
  if (inverse) return Math.round(((porto - compare) / compare) * 100);
  const ratio = compare / porto;
  if (ratio >= 2) return ratio;       // returned as ratio (e.g. 2.8 means 2.8×)
  return Math.round(((compare - porto) / compare) * 100);
}
function fmtDelta(d) {
  if (d == null) return '—';
  if (d >= 2) {
    const f = d.toFixed(1);
    return `${f.endsWith('.0') ? f.slice(0, -2) : f}×`;
  }
  return `${d}%`;
}

// betterIs: 'higher' (more = better) | 'lower' (less = better)
function isPortoWorse(metric, porto, compare) {
  const lowerIsBetter = metric === 'cars' || metric === 'commute';
  return lowerIsBetter ? porto > compare : porto < compare;
}

function makeBars(porto, compare) {
  const max = Math.max(porto, compare) || 1;
  return { porto: (porto / max) * 100, compare: (compare / max) * 100 };
}

// --- Reduced-motion preference ---
function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// --- Custom count-up hook (no deps) ---
// Animates `target` from the previously displayed value over `duration` ms.
function useCountUp(target, duration = 800) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(target);
      return;
    }
    cancelAnimationFrame(rafRef.current);
    fromRef.current = display;
    startRef.current = performance.now();
    const tick = (now) => {
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);   // cubic ease-out
      setDisplay(fromRef.current + (target - fromRef.current) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}

// Format a number to N decimals; integers render without decimal point.
function fmtNum(value, decimals) {
  if (decimals === 0) return Math.round(value).toString();
  return value.toFixed(decimals);
}

// --- Atom: animated count-up text ---
function CountUp({ value, decimals = 0, suffix = '' }) {
  const animated = useCountUp(value, 800);
  return <>{fmtNum(animated, decimals)}{suffix}</>;
}

// --- Atom: italic blue inline delta with brief flash on content change ---
const Delta = ({ children, deps }) => (
  <span
    key={String(deps)}
    className="bs-data-delta whitespace-nowrap"
    style={{ color: BLUE, fontStyle: 'italic' }}
  >
    {children}
  </span>
);

// --- Atom: bar row (track + animated fill + label) ---
function BarRow({ pct, color, label, labelColor, delayMs, pulsing }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="bs-data-bar-track flex-1 relative"
        style={{ height: 4, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 2 }}
      >
        <div
          className={`bs-data-bar-fill absolute left-0 top-0 h-full ${pulsing ? 'is-pulsing' : ''}`}
          style={{
            width: `${pct}%`,
            background: color,
            borderRadius: 2,
            transitionDelay: `${delayMs}ms`,
          }}
        />
      </div>
      <span
        className="font-mono uppercase"
        style={{
          fontSize: 10,
          letterSpacing: '0.05em',
          minWidth: 32,
          color: labelColor,
          opacity: 0.9,
          transition: 'color 600ms ease-out',
        }}
      >
        {label}
      </span>
    </div>
  );
}

// --- Stat cell ---
function StatCell({ label, metric, decimals, portoVal, compareVal, compareShort, compareName, cityColor, staggerIndex, transitioning, pulsing, displayedCity }) {
  const bars = makeBars(portoVal, compareVal);
  const portoWorse = isPortoWorse(metric, portoVal, compareVal);
  const portoBarColor = portoWorse ? CORAL : BLUE;
  const portoTextColor = portoWorse ? CORAL : '#fff';
  const delayMs = staggerIndex * 80;

  return (
    <div
      className="p-5 sm:p-6"
      style={{ borderRight: `0.5px solid ${HAIRLINE_SOFT}` }}
    >
      <p
        className="font-mono uppercase mb-3 m-0"
        style={{ fontSize: 11, letterSpacing: '0.15em', color: '#d4a017' }}
      >
        {label}
      </p>
      <p
        className="font-data leading-none m-0 mb-4"
        style={{ fontSize: 32, fontWeight: 500, color: portoTextColor }}
      >
        {portoVal}
      </p>

      <div
        className={`flex flex-col gap-1.5 bs-data-bars ${transitioning ? 'is-transitioning' : ''}`}
      >
        <BarRow pct={bars.porto}   color={portoBarColor} label="Porto"        labelColor="rgba(255,255,255,0.6)" delayMs={delayMs} pulsing={pulsing} />
        <BarRow pct={bars.compare} color={cityColor}     label={compareShort} labelColor={cityColor}             delayMs={delayMs} pulsing={pulsing} />
      </div>

      <p
        key={`${displayedCity}-${metric}`}
        className="bs-data-fade-in m-0"
        style={{ fontSize: 11, color: '#ffffff', marginTop: '0.5rem' }}
      >
        <span style={{ color: cityColor, transition: 'color 600ms ease-out' }}>
          {compareName}
        </span>
        : <CountUp value={compareVal} decimals={decimals} />
      </p>
    </div>
  );
}

// --- Component ---

export default function DataDashboard() {
  const { t } = useI18n();
  const ref = useScrollReveal();

  // Two-phase city change for dramatic feedback:
  //   selectedCity → button highlight (immediate)
  //   displayedCity → actual values (after 200ms fade dip)
  //   pulsing → 200ms saturation boost right after values land
  const [selectedCity, setSelectedCity] = useState('Amsterdam');
  const [displayedCity, setDisplayedCity] = useState('Amsterdam');
  const [pulsing, setPulsing] = useState(false);
  const transitioning = selectedCity !== displayedCity;

  useEffect(() => {
    if (selectedCity === displayedCity) return;
    const swap = setTimeout(() => {
      setDisplayedCity(selectedCity);
      setPulsing(true);
    }, 200);
    return () => clearTimeout(swap);
  }, [selectedCity, displayedCity]);

  useEffect(() => {
    if (!pulsing) return;
    const id = setTimeout(() => setPulsing(false), 200);
    return () => clearTimeout(id);
  }, [pulsing]);

  const cityColor = CITY_COLORS[displayedCity] || 'rgba(255, 255, 255, 0.4)';

  const porto = cityData.Porto;
  const compare = cityData[displayedCity];
  const compareShort = SHORT_NAMES[displayedCity] || displayedCity.slice(0, 3).toUpperCase();

  const dBuses = deltaPct(porto.buses, compare.buses, false);
  const dGreen = deltaPct(porto.green, compare.green, false);
  const dMetro = deltaPct(porto.metro, compare.metro, false);
  const dCars  = deltaPct(porto.cars,  compare.cars,  true);
  const whoDelta = Math.round(((9 - porto.green) / 9) * 100);
  const greenRatio = (compare.green / porto.green).toFixed(1).replace(/\.0$/, '');

  const statsConfig = [
    { metric: 'buses', label: t('numbers.metrics.buses'), portoVal: porto.buses, compareVal: compare.buses, decimals: 1 },
    { metric: 'metro', label: t('numbers.metrics.metro'), portoVal: porto.metro, compareVal: compare.metro, decimals: 1 },
    { metric: 'cars',  label: t('numbers.metrics.cars'),  portoVal: porto.cars,  compareVal: compare.cars,  decimals: 2 },
    { metric: 'bikes', label: t('numbers.metrics.bikes'), portoVal: porto.bikes, compareVal: compare.bikes, decimals: 2 },
  ];

  return (
    <section
      id="data"
      ref={ref}
      className="reveal-section bs-data"
      style={{ background: '#0a0a0a', color: '#fff' }}
    >
      {/* Top progress bar — yellow line that fills 800ms when city changes */}
      <div className={`bs-data-progress ${transitioning ? 'is-active' : ''}`} aria-hidden="true" />

      <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-20 sm:py-24">

        {/* KICKER — swaps to 'Atualizando dados...' during transition */}
        <div className="flex items-center gap-3 mb-6">
          <span aria-hidden="true" style={{ width: 32, height: 1, background: YELLOW }} />
          <span
            key={transitioning ? 'updating' : 'kicker'}
            className="bs-data-fade-in font-mono uppercase font-medium m-0"
            style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}
          >
            {transitioning ? t('numbers.updating') : t('numbers.kicker')}
          </span>
        </div>

        {/* HEADER — headline + comparison pills */}
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
            <span style={{ color: '#d4a017', marginRight: 8 }}>
              {t('numbers.compareWith')}
            </span>
            {['Amsterdam', 'Paris', 'Copenhagen'].map((city) => {
              const active = selectedCity === city;
              const activeColor = CITY_COLORS[city];
              return (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`bs-data-pill font-mono uppercase ${active ? 'is-active' : ''} ${active && pulsing ? 'is-pulsing' : ''}`}
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    color: '#fff',
                    background: active ? activeColor : undefined,
                    borderColor: active ? activeColor : undefined,
                    boxShadow: active ? `0 0 20px ${activeColor}4D` : undefined,
                  }}
                >
                  {city}
                  {active && <span className="bs-data-pill-dot" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </header>

        {/* HERO ROW: thesis (1.5fr) + green-space card (1fr) */}
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 mb-12 items-start">

          {/* THESIS — fully re-mounts on city change for fade+slide animation */}
          <div key={`thesis-${displayedCity}`} className="bs-data-thesis">
            <p
              className="font-mono uppercase m-0 mb-4"
              style={{ fontSize: 11, letterSpacing: '0.15em', color: '#d4a017' }}
            >
              {t('numbers.analysis')}
            </p>
            <p
              className="font-data leading-[1.4] m-0 mb-5"
              style={{ fontSize: 'clamp(20px, 2.4vw, 26px)', color: '#fff' }}
            >
              {t('numbers.thesis.prefix')}{' '}
              <Delta deps={`${displayedCity}-buses`}>{fmtDelta(dBuses)}</Delta>{' '}
              {t('numbers.thesis.buses')}{' '}
              <Delta deps={`${displayedCity}-green`}>{fmtDelta(dGreen)}</Delta>{' '}
              {t('numbers.thesis.green')}{' '}
              <Delta deps={`${displayedCity}-metro`}>{fmtDelta(dMetro)}</Delta>{' '}
              {t('numbers.thesis.metro')}{' '}
              <span className="bs-data-city-name">{displayedCity}</span>.
            </p>
            <p
              className="m-0 leading-relaxed"
              style={{ fontSize: 14, color: '#ffffff' }}
            >
              {t('numbers.context.prefix')}{' '}
              <Delta deps={`${displayedCity}-cars`}>{fmtDelta(dCars)}</Delta>{' '}
              {t('numbers.context.suffix')}
            </p>
          </div>

          {/* HERO STAT CARD — green space + WHO benchmark + comparison line */}
          <div
            className="p-6 sm:p-7"
            style={{ background: SURFACE, border: `0.5px solid ${SURFACE_BORDER}`, borderRadius: 12 }}
          >
            <p
              className="font-mono uppercase m-0 mb-3"
              style={{ fontSize: 11, letterSpacing: '0.15em', color: '#d4a017' }}
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
            <p className="m-0 mt-2" style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>
              {t('numbers.greenSpace.caption')}
            </p>
            <p className="bs-data-oms-line m-0 mt-2" style={{ fontSize: 13, color: YELLOW }}>
              <span className="bs-data-oms-arrow" aria-hidden="true">↓ </span>
              {whoDelta}{t('numbers.greenSpace.whoBelow')}
            </p>
            {/* Always-on comparison line — slides in with the displayed city */}
            <p
              key={`gcompare-${displayedCity}`}
              className="bs-data-fade-in m-0 mt-3 pt-3"
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.9)',
                borderTop: `0.5px solid ${HAIRLINE_SOFT}`,
              }}
            >
              vs{' '}
              <span style={{ color: cityColor, transition: 'color 600ms ease-out' }}>
                {displayedCity}
              </span>
              : <CountUp value={compare.green} decimals={1} suffix="m²" />
              {' — '}
              {t('numbers.greenSpace.portoHas')}{' '}
              <span style={{ color: BLUE, fontStyle: 'italic' }}>{greenRatio}×</span>{' '}
              {t('numbers.greenSpace.lessGreen')}
            </p>
          </div>
        </div>

        {/* SECONDARY STATS — 4 cells with staggered bar animation */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4"
          style={{
            borderTop:    `0.5px solid ${HAIRLINE}`,
            borderBottom: `0.5px solid ${HAIRLINE}`,
          }}
        >
          {statsConfig.map((stat, i) => {
            const isLastDesktop = (i + 1) % 4 === 0;
            const firstRowMobile = i < 2;
            return (
              <div
                key={stat.metric}
                style={{
                  borderRight: isLastDesktop ? 'none' : `0.5px solid ${HAIRLINE_SOFT}`,
                  borderBottom: firstRowMobile ? `0.5px solid ${HAIRLINE_SOFT}` : 'none',
                }}
                className="lg:!border-b-0"
              >
                <StatCell
                  label={stat.label}
                  metric={stat.metric}
                  decimals={stat.decimals}
                  portoVal={stat.portoVal}
                  compareVal={stat.compareVal}
                  compareShort={compareShort}
                  compareName={displayedCity}
                  cityColor={cityColor}
                  staggerIndex={i}
                  transitioning={transitioning}
                  pulsing={pulsing}
                  displayedCity={displayedCity}
                />
              </div>
            );
          })}
        </div>

        {/* SOURCES — keyed cross-fade */}
        <p
          key={`sources-${displayedCity}`}
          className="bs-data-fade-in font-mono uppercase m-0 mt-6"
          style={{ fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.85)' }}
        >
          {t('data.source')}: {sources.Porto} / {sources[displayedCity]}
        </p>

      </div>
    </section>
  );
}
