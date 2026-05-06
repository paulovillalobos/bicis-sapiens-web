import React from 'react';
import { useI18n } from '@/lib/i18n';

export default function Hero({ onJoinClick }) {
  const { t } = useI18n();
  return (
    <section id="hero" className="bs-hero">
      <div className="bs-hero-bg">
        <picture>
          <source media="(max-width: 768px)" srcSet="/images/hero-bridge-mobile.webp" />
          <img
            src="/images/hero-bridge.webp"
            alt="Famílias e ciclistas a atravessar a Ponte Dom Luís I, Porto"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            width="1264"
            height="832"
          />
        </picture>
        <div className="bs-hero-overlay" aria-hidden="true" />
      </div>

      <div className="bs-hero-content">
        <p className="bs-hero-counter">01 / 13 · {t('hero.counter')}</p>
        <p className="bs-hero-eyebrow">— {t('hero.eyebrow')}</p>

        <h1
          className="bs-hero-title"
          dangerouslySetInnerHTML={{ __html: t('hero.tagline_html') }}
        />

        <p className="bs-hero-lead">{t('hero.lead')}</p>

        <div className="bs-hero-cta">
          <button
            type="button"
            onClick={onJoinClick}
            className="bs-btn bs-btn-primary"
          >
            {t('hero.cta')} <span aria-hidden="true">→</span>
          </button>
          <a href="#data" className="bs-btn bs-btn-secondary">
            {t('hero.ctaSecondary')} <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      <div className="bs-hero-ticker" aria-hidden="true">
        <div className="bs-ticker-track">
          <span className="bs-ticker-item">{t('hero.ticker')}</span>
          <span className="bs-ticker-item">{t('hero.ticker')}</span>
        </div>
      </div>
    </section>
  );
}
