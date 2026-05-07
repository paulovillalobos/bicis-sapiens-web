import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';

// ⚠️ ADVISOR REGISTRY — TO ADD A NEW ADVISOR:
//   1. Drop a B&W portrait at /public/team/{slug}.webp
//      (use cwebp-bin, target ~1200px tall, q82, ~5:6 portrait crop)
//   2. Append { slug, initial, hasPhoto: true } here
//   3. Add about.advisors.{slug} block to all 4 i18n locales
//
// hasPhoto controls whether we render an <img> or the initial fallback.
// Set to false until the file exists — avoids a 404 in the network panel.
const ADVISORS = [
  { slug: 'paulo', initial: 'P', hasPhoto: true },
];
// 3-column grid (was 4) — gives each advisor cell ~33% width on desktop,
// roughly 1.3× the prior footprint. Bigger photo, more breathing room,
// still clearly a "card" not a profile section.
const ADVISOR_GRID_COLS = 3;

// --- Atoms -----------------------------------------------------------------

function AdvisorCell({ slug, initial, hasPhoto, role, name, subtitle, desc1, desc2, pullQuote }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const showInitial = !hasPhoto || photoFailed;

  return (
    <div>
      <div
        className="aspect-[5/6] w-full flex items-center justify-center overflow-hidden bg-white/[0.04]"
        style={{ border: '0.5px solid rgba(255,255,255,0.10)' }}
      >
        {!showInitial && (
          <img
            src={`/team/${slug}.webp`}
            alt={name}
            loading="lazy"
            decoding="async"
            onError={() => setPhotoFailed(true)}
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(1)' }}
          />
        )}
        {showInitial && (
          <span
            aria-hidden="true"
            className="font-data leading-none"
            style={{ fontSize: 72, fontWeight: 400, color: 'rgba(255,255,255,0.85)' }}
          >
            {initial}
          </span>
        )}
      </div>

      <p
        className="font-mono uppercase font-medium m-0 mt-5"
        style={{ fontSize: 11, letterSpacing: '0.3em', color: '#d4a017' }}
      >
        {role}
      </p>

      <h4
        className="font-data leading-tight font-normal text-white m-0 mt-2"
        style={{ fontSize: 26 }}
      >
        {name}
      </h4>

      {subtitle && (
        <p
          className="font-mono uppercase m-0 mt-2"
          style={{ fontSize: 11, letterSpacing: '0.15em', color: '#1d4ed8' }}
        >
          {subtitle}
        </p>
      )}

      {desc1 && (
        <p
          className="m-0 mt-4"
          style={{ fontSize: 14, lineHeight: 1.65, color: '#ffffff' }}
        >
          {desc1}
        </p>
      )}
      {desc2 && (
        <p
          className="m-0 mt-3"
          style={{ fontSize: 14, lineHeight: 1.65, color: '#ffffff' }}
        >
          {desc2}
        </p>
      )}

      {/* Pull quote — same blue-italic-with-left-border treatment as
          Ricardo's, but smaller (16px vs 24px) and tighter so the card
          stays an "advisor card", not a "profile section". */}
      {pullQuote && (
        <blockquote
          className="font-data italic font-normal m-0 mt-5 pl-4"
          style={{
            fontSize: 16,
            lineHeight: 1.4,
            color: '#1d4ed8',
            borderLeft: '2px solid #1d4ed8',
          }}
        >
          {pullQuote}
        </blockquote>
      )}
    </div>
  );
}

// --- Section ---------------------------------------------------------------

export default function AboutTeam() {
  const { t } = useI18n();
  const ref = useScrollReveal();
  const emptyCells = Math.max(0, ADVISOR_GRID_COLS - ADVISORS.length);

  return (
    <section
      id="about"
      ref={ref}
      className="reveal-section bg-background py-24 sm:py-32"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 1 · KICKER */}
        <div className="flex items-center gap-3 mb-10">
          <span aria-hidden="true" className="block w-8 h-px" style={{ background: '#d4a017' }} />
          <span
            className="font-mono uppercase font-medium"
            style={{ fontSize: 11, letterSpacing: '0.3em', color: '#d4a017' }}
          >
            {t('about.kicker')}
          </span>
        </div>

        {/* 2 · HEADER */}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8 lg:gap-12 items-end mb-6">
          <h2
            className="font-data leading-[1.05] font-normal text-white max-w-2xl m-0"
            style={{ fontSize: 'clamp(32px, 4.5vw, 48px)' }}
          >
            {t('about.headline.pre')}
            <em className="italic font-normal" style={{ color: '#1d4ed8' }}>
              {t('about.headline.accent')}
            </em>
            {t('about.headline.post')}
          </h2>
          <p
            className="font-data italic m-0"
            style={{ fontSize: 17, lineHeight: 1.6, color: '#ffffff' }}
          >
            {t('about.taglineLine1')}<br />
            {t('about.taglineLine2')}
          </p>
        </div>
        <div className="border-t border-white/15 mb-16" />

        {/* 3 · FOUNDER BLOCK — portrait + bio, both on solid black */}
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center mb-24">

          {/* LEFT — portrait, no frame, no border, no shadow */}
          <div className="max-w-[360px] mx-auto lg:max-w-none lg:mx-0 w-full">
            <img
              src="/images/ricardo-villalobos.webp"
              alt="Ricardo Villalobos"
              width="1128"
              height="1400"
              loading="lazy"
              decoding="async"
              className="block w-full"
            />
            <p
              className="font-mono uppercase m-0 mt-3"
              style={{ fontSize: 11, letterSpacing: '0.3em', color: '#d4a017' }}
            >
              {t('about.founder.photoCaption')}
            </p>
          </div>

          {/* RIGHT — bio */}
          <div>
            <p
              className="font-mono uppercase font-medium m-0 mb-3"
              style={{ fontSize: 11, letterSpacing: '0.3em', color: '#d4a017' }}
            >
              {t('about.founder.role')}
            </p>
            <h3
              className="font-data leading-[1.05] font-normal text-white m-0 mb-3"
              style={{ fontSize: 'clamp(32px, 4vw, 44px)' }}
            >
              {t('about.founder.name')}
            </h3>
            <p
              className="font-mono uppercase m-0 mb-8"
              style={{ fontSize: 13, letterSpacing: '0.15em', color: '#1d4ed8' }}
            >
              {t('about.founder.epithet')}
            </p>

            {/* Pull quote — same treatment as §03 */}
            <blockquote
              className="font-data italic font-normal m-0 mb-8 pl-5"
              style={{
                fontSize: 24,
                lineHeight: 1.3,
                color: '#1d4ed8',
                borderLeft: '2px solid #1d4ed8',
              }}
            >
              {t('about.founder.pullQuote')}
            </blockquote>

            {/* Bio narrative — REVIEW WITH RICARDO BEFORE LAUNCH */}
            <div className="flex flex-col gap-4 max-w-prose">
              <p className="m-0" style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)' }}>
                {t('about.founder.bio.paragraph1')}
              </p>
              <p className="m-0" style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)' }}>
                {t('about.founder.bio.paragraph2')}
              </p>
              <p className="m-0" style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)' }}>
                {t('about.founder.bio.paragraph3')}
              </p>
            </div>

            {/* Metadata footer — ⚠️ PLACEHOLDERS, RICARDO TO FILL:
                  - sinceValue: real year of arrival in Porto
                  - beforeValue: 1-3 word professional context
                If preferred, drop the [year] / [context] entries entirely
                and keep only Origem · México · Base · Porto. */}
            <div
              className="mt-8 pt-6 border-t border-white/15 flex flex-wrap gap-x-6 gap-y-2 font-mono uppercase"
              style={{ fontSize: 11, letterSpacing: '0.2em', color: '#d4a017' }}
            >
              <span>
                {t('about.founder.metadata.originLabel')}{' · '}
                <span style={{ color: '#ffffff' }}>
                  {t('about.founder.metadata.originValue')}
                </span>
              </span>
              <span>
                {t('about.founder.metadata.sinceLabel')}{' · '}
                <span style={{ color: '#ffffff' }}>
                  {t('about.founder.metadata.sinceValue')}
                </span>
              </span>
              <span>
                {t('about.founder.metadata.beforeLabel')}{' · '}
                <span style={{ color: '#ffffff' }}>
                  {t('about.founder.metadata.beforeValue')}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* 4 · ADVISORS — single advisor + intentional empty space */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden="true" className="block w-8 h-px" style={{ background: '#d4a017' }} />
            <span
              className="font-mono uppercase font-medium"
              style={{ fontSize: 11, letterSpacing: '0.3em', color: '#d4a017' }}
            >
              {t('about.advisors.kicker')}
            </span>
          </div>
          <h3
            className="font-data leading-tight font-normal text-white m-0 mb-6"
            style={{ fontSize: 'clamp(22px, 2.6vw, 28px)' }}
          >
            {t('about.advisors.headline')}
          </h3>
          <div className="border-t border-white/15 mb-10" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {ADVISORS.map((adv) => (
              <AdvisorCell
                key={adv.slug}
                slug={adv.slug}
                initial={adv.initial}
                hasPhoto={adv.hasPhoto}
                role={t(`about.advisors.${adv.slug}.role`)}
                name={t(`about.advisors.${adv.slug}.name`)}
                subtitle={t(`about.advisors.${adv.slug}.subtitle`)}
                desc1={t(`about.advisors.${adv.slug}.desc1`)}
                desc2={t(`about.advisors.${adv.slug}.desc2`)}
                pullQuote={t(`about.advisors.${adv.slug}.pullQuote`)}
              />
            ))}
            {/* Intentional empty grid cells. No border, no bg, no '+ Add'.
                Communicates 'there's room for more' without faking presence.
                Hidden on mobile so the single column doesn't have huge gaps. */}
            {Array.from({ length: emptyCells }).map((_, i) => (
              <div key={`empty-${i}`} aria-hidden="true" className="hidden lg:block" />
            ))}
          </div>

          <p
            className="mt-6 text-right font-mono uppercase m-0"
            style={{ fontSize: 11, letterSpacing: '0.3em', color: '#d4a017' }}
          >
            {t('about.advisors.growing')}
          </p>
        </div>

      </div>
    </section>
  );
}
