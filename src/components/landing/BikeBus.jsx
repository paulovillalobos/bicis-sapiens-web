import React from 'react';
import { useI18n } from '@/lib/i18n';
import { ArrowRight } from 'lucide-react';

// --- Theme tokens (same dark editorial system as §02 / §03) ---
const YELLOW    = '#d4a017';
const BLUE      = '#1d4ed8';
const HAIRLINE  = 'rgba(255, 255, 255, 0.15)';
const GRID_GAP  = 'rgba(255, 255, 255, 0.08)';
const SECTION_BG = '#0a0a0a';

// --- Data (untouched values, restructured into PT vs INTL) ---
const PT_CITIES = [
  { name: 'Porto',      routes: 4, families: 85,  isHQ: true },
  { name: 'Matosinhos', routes: 2, families: 32 },
  { name: 'Lisboa',     routes: 6, families: 120 },
  { name: 'Coimbra',    routes: 1, families: 15 },
];

const INTL_CITIES = [
  { name: 'Amsterdam', countryKey: 'NL', quoteKey: 'amsterdam', routes: 25, families: 800 },
  { name: 'Barcelona', countryKey: 'ES', quoteKey: 'barcelona', routes: 12, families: 350 },
];

// --- Helper: substitute {0} {1} {2} placeholders in i18n strings ---
function format(template, values) {
  if (!template) return '';
  return String(template).replace(/\{(\d+)\}/g, (_, idx) => {
    const v = values[parseInt(idx, 10)];
    return v == null ? '' : String(v);
  });
}

// --- Sub-components --------------------------------------------------------

function StatBlock({ value, label, italicBlue }) {
  return (
    <div>
      <p
        className="font-data m-0"
        style={{
          fontSize: 32,
          fontWeight: 500,
          color: italicBlue ? BLUE : '#fff',
          fontStyle: italicBlue ? 'italic' : 'normal',
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p
        className="font-mono m-0 uppercase"
        style={{
          fontSize: 9,
          letterSpacing: '0.25em',
          color: '#d4a017',
          marginTop: '0.5rem',
        }}
      >
        {label}
      </p>
    </div>
  );
}

function PortugueseCell({ city, t }) {
  return (
    <div
      className="relative"
      style={{
        background: SECTION_BG,
        padding: '2rem 1.75rem',
        borderTop: city.isHQ ? `2px solid ${YELLOW}` : 'none',
      }}
    >
      {/* HQ tag (Porto only) — empty-but-reserved on other cities so cells align */}
      <p
        className="font-mono m-0 uppercase"
        style={{
          fontSize: 9,
          letterSpacing: '0.3em',
          color: YELLOW,
          minHeight: 14,
          marginBottom: '0.75rem',
        }}
      >
        {city.isHQ ? t('bikeBus.sede') : ' '}
      </p>

      {/* City name */}
      <h3
        className="font-data m-0"
        style={{
          fontSize: 32,
          fontWeight: 400,
          color: '#fff',
          lineHeight: 1,
          marginBottom: '1.25rem',
        }}
      >
        {city.name}
      </h3>

      {/* Hairline */}
      <div style={{ borderTop: `0.5px solid ${HAIRLINE}`, marginBottom: '1.25rem' }} />

      {/* Stats */}
      <div className="flex gap-8">
        <StatBlock value={city.routes}   label={t('bikeBus.routes')}   italicBlue={false} />
        <StatBlock value={city.families} label={t('bikeBus.families')} italicBlue={false} />
      </div>
    </div>
  );
}

function InternationalCell({ city, t }) {
  return (
    <div
      className="sm:col-span-2"
      style={{ background: SECTION_BG, padding: '2rem 1.75rem' }}
    >
      {/* City name + country tag */}
      <div className="flex items-baseline gap-3 mb-3 flex-wrap">
        <h3
          className="font-data m-0"
          style={{ fontSize: 28, fontWeight: 400, color: '#fff', lineHeight: 1 }}
        >
          {city.name}
        </h3>
        <span
          className="font-mono uppercase"
          style={{
            fontSize: 9,
            letterSpacing: '0.3em',
            color: '#d4a017',
          }}
        >
          {t(`bikeBus.countries.${city.countryKey}`)}
        </span>
      </div>

      {/* Italic quote */}
      <p
        className="font-data m-0"
        style={{
          fontSize: 13,
          fontStyle: 'italic',
          color: '#ffffff',
          lineHeight: 1.5,
          marginBottom: '1.5rem',
          maxWidth: '52ch',
        }}
      >
        {t(`bikeBus.quotes.${city.quoteKey}`)}
      </p>

      {/* Hairline */}
      <div style={{ borderTop: `0.5px solid ${HAIRLINE}`, marginBottom: '1.25rem' }} />

      {/* Stats — italic blue numbers signal "reference, not ours" */}
      <div className="flex gap-8">
        <StatBlock value={city.routes}   label={t('bikeBus.routes')}   italicBlue={true} />
        <StatBlock value={city.families} label={t('bikeBus.families')} italicBlue={true} />
      </div>
    </div>
  );
}

// --- Main component --------------------------------------------------------

export default function BikeBus({ onJoinClick }) {
  const { t } = useI18n();

  // Aggregate over Portuguese cities only
  const ptRoutes   = PT_CITIES.reduce((s, c) => s + c.routes,   0);
  const ptFamilies = PT_CITIES.reduce((s, c) => s + c.families, 0);
  const aggregate  = format(t('bikeBus.aggregate'), [ptRoutes, ptFamilies, PT_CITIES.length]);

  return (
    <section
      id="bikeBus"
      style={{ background: SECTION_BG, color: '#fff' }}
    >
      <div className="max-w-[1100px] mx-auto px-6 sm:px-8" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>

        {/* KICKER */}
        <div className="flex items-center gap-3 mb-8">
          <span aria-hidden="true" style={{ width: 32, height: 1, background: YELLOW }} />
          <span
            className="font-mono uppercase font-medium"
            style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}
          >
            {t('bikeBus.kicker')}
          </span>
        </div>

        {/* HEADER ROW */}
        <header
          className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-end pb-6"
          style={{ borderBottom: `0.5px solid ${HAIRLINE}` }}
        >
          <h2
            className="font-data leading-[1.1] tracking-tight m-0"
            style={{ fontSize: 'clamp(32px, 4.5vw, 44px)', fontWeight: 400, color: '#fff' }}
          >
            {t('bikeBus.headline.prefix')}{' '}
            <span style={{ fontStyle: 'italic', color: BLUE }}>
              {t('bikeBus.headline.accent')}
            </span>
          </h2>

          <div className="lg:justify-self-end lg:text-right">
            <p
              className="font-data m-0"
              style={{
                fontSize: 17,
                fontStyle: 'italic',
                fontWeight: 400,
                lineHeight: 1.45,
                color: '#ffffff',
              }}
            >
              {t('bikeBus.tagline.line1')}
              <br />
              {t('bikeBus.tagline.line2')}
            </p>
          </div>
        </header>

        {/* AGGREGATE STAT — small one-liner under the header, right-aligned */}
        <p
          className="font-mono uppercase text-right m-0"
          style={{
            fontSize: 11,
            letterSpacing: '0.25em',
            color: '#ffffff',
            marginTop: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          {aggregate}
        </p>

        {/* CITIES GRID — single hairline grid (4 cols at lg, 2 at sm, 1 mobile)
            PT cells take 1 col always; INTL cells take 2 cols at sm+ so they
            visually widen vs the Portuguese row above. */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-12"
          style={{ gap: 1, background: GRID_GAP }}
        >
          {PT_CITIES.map((city) => (
            <PortugueseCell key={city.name} city={city} t={t} />
          ))}
          {INTL_CITIES.map((city) => (
            <InternationalCell key={city.name} city={city} t={t} />
          ))}
        </div>

        {/* CTAs — primary blue, secondary outline. Sentence case (NOT all-caps
            tracked) per spec; 4px radius (deviates from system radius:0 — but
            spec'd explicitly for these buttons). */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-3"
          style={{ borderTop: `0.5px solid ${HAIRLINE}`, paddingTop: '2.5rem' }}
        >
          <button
            onClick={onJoinClick}
            type="button"
            className="inline-flex items-center justify-between transition-colors"
            style={{
              background: BLUE,
              color: '#fff',
              padding: '1.25rem 1.5rem',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1638b3'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = BLUE; }}
          >
            <span>{t('bikeBus.cta.primary')}</span>
            <ArrowRight className="w-4 h-4" style={{ color: '#fff' }} />
          </button>

          <button
            onClick={onJoinClick}
            type="button"
            className="inline-flex items-center justify-between transition-colors"
            style={{
              background: 'transparent',
              color: '#fff',
              padding: '1.25rem 1.5rem',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 4,
              border: '0.5px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
          >
            <span>{t('bikeBus.cta.secondary')}</span>
            <ArrowRight className="w-4 h-4" style={{ color: '#ffffff' }} />
          </button>
        </div>

      </div>
    </section>
  );
}
