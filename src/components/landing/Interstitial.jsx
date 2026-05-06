import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';

function BikeIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5L5.5 17.5 12 6l5 5" />
    </svg>
  );
}

export default function Interstitial() {
  const { t, lang } = useI18n();
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef}
      id="pause"
      lang={lang}
      className="bs-pause reveal-section"
      aria-label={t('pausa.kicker')}
    >
      <div className="bs-pause-inner">

        {/* KICKER */}
        <div className="bs-pause-kicker">
          <span className="bs-pause-kicker-line" aria-hidden="true" />
          <span className="bs-pause-kicker-label">{t('pausa.kicker')}</span>
        </div>

        {/* HEADLINE + SIGNS */}
        <div className="bs-pause-headline-row">
          <div className="bs-pause-signs">
            <div className="bs-pause-sign bs-pause-sign-stop">
              {t('pausa.signs.stop')}
            </div>
            <div className="bs-pause-sign bs-pause-sign-bike">
              <BikeIcon />
            </div>
          </div>

          <h2 className="bs-pause-headline">
            {t('pausa.headline.line1')}
            <br />
            <span className="bs-pause-headline-accent">
              {t('pausa.headline.line2')}
            </span>
          </h2>
        </div>

        {/* PULL QUOTE */}
        <blockquote className="bs-pause-quote">
          <p>
            {t('pausa.quote.line1')}<br />
            {t('pausa.quote.line2')}<br />
            {t('pausa.quote.line3')}
          </p>
        </blockquote>

        {/* BIG OUTLINED ITALIC WORD */}
        <div className="bs-pause-bigword-wrap">
          <p className="bs-pause-bigword">{t('pausa.bigword')}</p>
        </div>

        {/* FULL-BLEED CROSSWALK DIVIDER */}
        <div className="bs-pause-crosswalk" aria-hidden="true" />

      </div>
    </section>
  );
}
