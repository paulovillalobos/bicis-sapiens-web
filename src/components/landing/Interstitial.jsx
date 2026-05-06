import React, { useEffect, useMemo, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';

const STAR_COUNT = 100;
const BRIGHT_STAR_COUNT = 4;

// Static-on-mount starfield. useMemo keeps positions stable across re-renders.
function generateStars() {
  const stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const r = Math.random();
    const size = r < 0.7 ? 1 : r < 0.95 ? 2 : 3;
    const opacityMin = 0.32 + Math.random() * 0.28;        // 0.32..0.60
    const opacityMax = Math.min(opacityMin + 0.3 + Math.random() * 0.25, 1);
    stars.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 70,                                // top 70% of section
      size,
      opacityMin,
      opacityMax,
      duration: 3 + Math.random() * 2,                      // 3..5s
      delay: Math.random() * 5,
      bright: false,
    });
  }
  for (let i = 0; i < BRIGHT_STAR_COUNT; i++) {
    stars.push({
      id: 1000 + i,
      x: 12 + Math.random() * 76,
      y: 8 + Math.random() * 55,
      size: 4,
      opacityMin: 0.5,
      opacityMax: 1,
      duration: 4 + Math.random() * 1.5,
      delay: Math.random() * 4,
      bright: true,
    });
  }
  return stars;
}

// --- Realistic urban signs (inline SVG) ---

function StopSign() {
  return (
    <svg
      className="bs-pause-sign"
      viewBox="0 0 100 170"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* pole */}
      <rect x="46" y="98" width="8" height="72" fill="#2c2c2c" />
      <rect x="46" y="98" width="8" height="3" fill="#3a3a3a" />
      {/* octagon body */}
      <polygon
        points="29,4 71,4 96,29 96,71 71,96 29,96 4,71 4,29"
        fill="#C8102E"
      />
      {/* white outline (inner) */}
      <polygon
        points="32,9 68,9 91,32 91,68 68,91 32,91 9,68 9,32"
        fill="none"
        stroke="#FAFAF7"
        strokeWidth="2.5"
      />
      {/* STOP text */}
      <text
        x="50"
        y="61"
        fontFamily="Helvetica, Arial, sans-serif"
        fontWeight="900"
        fontSize="22"
        fill="#FAFAF7"
        textAnchor="middle"
        letterSpacing="-0.5"
      >
        STOP
      </text>
    </svg>
  );
}

function BikeSign() {
  return (
    <svg
      className="bs-pause-sign"
      viewBox="0 0 100 170"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* pole */}
      <rect x="46" y="98" width="8" height="72" fill="#2c2c2c" />
      <rect x="46" y="98" width="8" height="3" fill="#3a3a3a" />
      {/* blue square body */}
      <rect x="6" y="6" width="88" height="88" fill="#003399" />
      {/* white inner border */}
      <rect
        x="11"
        y="11"
        width="78"
        height="78"
        fill="none"
        stroke="#FAFAF7"
        strokeWidth="2.5"
      />
      {/* bike — clean outline */}
      <g
        stroke="#FAFAF7"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0 -8)"
      >
        <circle cx="32" cy="62" r="13" />
        <circle cx="68" cy="62" r="13" />
        <line x1="32" y1="62" x2="50" y2="62" />
        <line x1="50" y1="62" x2="46" y2="34" />
        <line x1="50" y1="62" x2="65" y2="36" />
        <line x1="46" y1="34" x2="65" y2="36" />
        <line x1="65" y1="36" x2="76" y2="32" />
        <line x1="42" y1="32" x2="51" y2="32" />
      </g>
    </svg>
  );
}

// --- Main component ---

export default function Interstitial() {
  const { t } = useI18n();
  const stars = useMemo(generateStars, []);
  const sectionRef = useScrollReveal();
  const starsRef = useRef(null);

  // Parallax: stars trail page scroll by ~25% — slower than text → depth
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      const layer = starsRef.current;
      if (!section || !layer) return;
      const rect = section.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const progress = -rect.top;
      layer.style.transform = `translate3d(0, ${progress * 0.25}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sectionRef]);

  // Crosswalk stripes — 9 evenly-spaced verticals
  const crosswalkStripes = useMemo(
    () => Array.from({ length: 9 }, (_, i) => ({ id: i, leftPct: ((i + 0.5) / 9) * 100 })),
    []
  );

  return (
    <section
      ref={sectionRef}
      id="pause"
      className="bs-pause"
      aria-label={t('interstitial.eyebrow')}
    >
      {/* Sky region (top ~70%) */}
      <div className="bs-pause-sky" aria-hidden="true">
        <div className="bs-pause-nebula" />
        <div ref={starsRef} className="bs-pause-stars">
          {stars.map((s) => (
            <span
              key={s.id}
              className={s.bright ? 'bs-star bs-star--bright' : 'bs-star'}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                animationDuration: `${s.duration}s`,
                animationDelay: `${s.delay}s`,
                '--bs-o-min': s.opacityMin,
                '--bs-o-max': s.opacityMax,
              }}
            />
          ))}
        </div>
      </div>

      {/* Centered text stack */}
      <div className="bs-pause-content">
        <p className="bs-pause-eyebrow">
          <span aria-hidden="true">——&nbsp;</span>
          {t('interstitial.eyebrow')}
          <span aria-hidden="true">&nbsp;——</span>
        </p>

        <div className="bs-pause-title-row">
          <div className="bs-pause-sign-slot bs-pause-sign-slot--left">
            <StopSign />
          </div>
          <h2 className="bs-pause-title">{t('interstitial.title')}</h2>
          <div className="bs-pause-sign-slot bs-pause-sign-slot--right">
            <BikeSign />
          </div>
        </div>

        <p className="bs-pause-supporting">{t('interstitial.subtitle')}</p>

        <p
          className="bs-pause-hero-word"
          aria-label={t('interstitial.heroWord')}
        >
          {t('interstitial.heroWord')}
        </p>
      </div>

      {/* Crosswalk band at the bottom */}
      <div className="bs-pause-crosswalk" aria-hidden="true">
        <div className="bs-pause-crosswalk-fade" />
        <div className="bs-pause-crosswalk-asphalt">
          {crosswalkStripes.map((s) => (
            <span
              key={s.id}
              className="bs-pause-crosswalk-stripe"
              style={{ left: `${s.leftPct}%` }}
            />
          ))}
        </div>
      </div>

      {/* Continue hint */}
      <a href="#manifesto" className="bs-pause-hint">
        <span>{t('interstitial.hint')}</span>
        <span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
