import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';

// ⚠️ PLACEHOLDER — REPLACE WITH REAL FORM URL.
// Tally / Typeform / Google Forms / native route — whatever the team
// picks for collecting volunteer signups. Until set, the CTA is a
// disabled-looking link that #scrolls to nowhere meaningful.
//
// When Bicis Sapiens registers as associação, re-add the donation
// block ABOVE this volunteer block. Use namespace `donations.*` for
// the new strings to keep `support.*` stable.
const VOLUNTEER_FORM_URL = '#';

export default function Support() {
  const { t } = useI18n();
  const ref = useScrollReveal();

  return (
    <section
      id="support"
      ref={ref}
      className="reveal-section bg-background py-20 sm:py-24"
    >
      <div className="max-w-[1100px] mx-auto px-6 sm:px-8">

        {/* 1 · KICKER */}
        <div className="flex items-center gap-3 mb-10">
          <span aria-hidden="true" className="block w-8 h-px" style={{ background: '#d4a017' }} />
          <span
            className="font-mono uppercase font-medium"
            style={{ fontSize: 11, letterSpacing: '0.3em', color: '#d4a017' }}
          >
            {t('support.kicker')}
          </span>
        </div>

        {/* 2 · HEADER — two-column, stacks below lg */}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8 lg:gap-12 items-end mb-6">
          <h2
            className="font-data leading-[1.05] font-normal text-white max-w-2xl m-0"
            style={{ fontSize: 'clamp(32px, 4vw, 44px)' }}
          >
            {t('support.headline.pre')}
            <em className="italic font-normal" style={{ color: '#1d4ed8' }}>
              {t('support.headline.accent')}
            </em>
            {t('support.headline.post')}
          </h2>
          <p
            className="font-data italic m-0"
            style={{ fontSize: 17, lineHeight: 1.6, color: '#ffffff' }}
          >
            {t('support.tagline')}
          </p>
        </div>
        <div className="border-t border-white/15 mb-16" />

        {/* 3 · MAIN BLOCK — VOLUNTEER */}
        <div className="max-w-[720px] mx-auto pt-8 pb-12">
          <p
            className="font-mono uppercase font-medium m-0 mb-4 text-center"
            style={{ fontSize: 11, letterSpacing: '0.3em', color: '#d4a017' }}
          >
            {t('support.volunteer.kicker')}
          </p>

          <h3
            className="font-data leading-[1.2] font-normal text-white m-0 mb-6 text-center"
            style={{ fontSize: 'clamp(24px, 3vw, 32px)' }}
          >
            {t('support.volunteer.headline')}
          </h3>

          <p
            className="m-0 mb-6"
            style={{ fontSize: 16, lineHeight: 1.7, color: '#ffffff' }}
          >
            {t('support.volunteer.body')}
          </p>

          <p
            className="font-data italic m-0 mb-10"
            style={{ fontSize: 17, lineHeight: 1.6, color: '#ffffff' }}
          >
            {t('support.volunteer.roles')}
          </p>

          <div className="flex flex-col items-center gap-4">
            <a
              href={VOLUNTEER_FORM_URL}
              className="inline-flex items-center justify-center gap-2 transition-colors"
              style={{
                width: 280,
                maxWidth: '100%',
                padding: '1.25rem 1.5rem',
                fontSize: 16,
                fontWeight: 500,
                background: '#1d4ed8',
                color: '#ffffff',
                borderRadius: 4,
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1944c0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#1d4ed8'; }}
            >
              {t('support.volunteer.cta')} <span aria-hidden="true">→</span>
            </a>

            <p
              className="font-mono uppercase m-0 text-center"
              style={{ fontSize: 11, letterSpacing: '0.3em', color: '#d4a017' }}
            >
              {t('support.volunteer.trustLine')}
            </p>
          </div>
        </div>

        {/* 4 · FUTURE TRANSPARENCY NOTE */}
        <div
          className="max-w-[600px] mx-auto mt-16 pt-10 text-center"
          style={{ borderTop: '0.5px solid rgba(255,255,255,0.15)' }}
        >
          <p
            className="font-data italic m-0"
            style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}
          >
            {t('support.future')}
          </p>
        </div>

      </div>
    </section>
  );
}
