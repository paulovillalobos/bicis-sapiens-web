import React, { useEffect, useMemo, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';

const STAR_COUNT = 130;
const BRIGHT_STAR_COUNT = 3;

// Deterministic-ish but random-looking starfield. Computed once on mount.
function generateStars() {
  const stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const r = Math.random();
    // 70% small (1px), 25% medium (2px), 5% large (3px)
    const size = r < 0.7 ? 1 : r < 0.95 ? 2 : 3;
    const opacityMin = 0.18 + Math.random() * 0.22;       // 0.18..0.40
    const opacityMax = opacityMin + 0.35 + Math.random() * 0.3; // +0.35..+0.65
    stars.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size,
      opacityMin,
      opacityMax: Math.min(opacityMax, 0.95),
      duration: 3 + Math.random() * 3,                     // 3..6s pulse
      delay: Math.random() * 6,
      bright: false,
    });
  }
  // A handful of brighter, more visibly twinkling stars.
  for (let i = 0; i < BRIGHT_STAR_COUNT; i++) {
    stars.push({
      id: 1000 + i,
      x: 10 + Math.random() * 80,    // keep bright stars away from edges
      y: 10 + Math.random() * 80,
      size: 4,
      opacityMin: 0.45,
      opacityMax: 1,
      duration: 4 + Math.random() * 2,
      delay: Math.random() * 4,
      bright: true,
    });
  }
  return stars;
}

export default function Interstitial() {
  const { t } = useI18n();
  const stars = useMemo(generateStars, []);
  const sectionRef = useScrollReveal();
  const starsRef = useRef(null);

  // Parallax: stars trail page scroll by ~30%, so they appear to move
  // slower than the foreground type — gives the depth effect.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      const layer = starsRef.current;
      if (!section || !layer) return;
      const rect = section.getBoundingClientRect();
      // Skip work when section is well outside the viewport.
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const progress = -rect.top;
      layer.style.transform = `translate3d(0, ${progress * 0.3}px, 0)`;
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

  return (
    <section
      ref={sectionRef}
      id="pause"
      className="bs-interstitial"
      aria-label={t('interstitial.eyebrow')}
    >
      {/* Subtle nebula — very dark blue/violet radial gradients */}
      <div className="bs-interstitial-nebula" aria-hidden="true" />

      {/* Starfield (parallax layer) */}
      <div ref={starsRef} className="bs-interstitial-stars" aria-hidden="true">
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

      {/* Centered text stack */}
      <div className="bs-interstitial-content">
        <p className="bs-interstitial-eyebrow">
          <span aria-hidden="true">——&nbsp;</span>
          {t('interstitial.eyebrow')}
          <span aria-hidden="true">&nbsp;——</span>
        </p>
        <h2 className="bs-interstitial-title">{t('interstitial.title')}</h2>
        <p className="bs-interstitial-supporting">{t('interstitial.subtitle')}</p>
      </div>

      {/* Scroll hint at bottom */}
      <a href="#manifesto" className="bs-interstitial-hint">
        <span>{t('interstitial.hint')}</span>
        <span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
