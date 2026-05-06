import React from 'react';
import { useI18n } from '@/lib/i18n';

// --- Theme tokens (match §02 Porto in Numbers / §03 Solution / §04 BikeBus) ---
const YELLOW   = '#d4a017';
const BLUE     = '#1d4ed8';
const HAIRLINE = 'rgba(255, 255, 255, 0.15)';
const MUTED    = 'rgba(255, 255, 255, 0.65)';
const SOFT     = 'rgba(255, 255, 255, 0.7)';
const FAINT    = 'rgba(255, 255, 255, 0.4)';

// =====================================================================
// CONFIGURATION FLAGS — TEAM TO UPDATE BEFORE LAUNCH
// =====================================================================

// ⚠️ Set to true once /public/docs/metodologia.pdf has been uploaded.
//    While false, the secondary CTA renders as a faint, non-clickable
//    label (per brief — never link to a 404).
const METHODOLOGY_PDF_AVAILABLE = false;

// ⚠️ Set to a public URL (news article, press release, official document)
//    once one exists for the Matosinhos partnership. While null, the
//    "VÊ A DOCUMENTAÇÃO PÚBLICA" link is hidden entirely.
const MATOSINHOS_DOC_URL = null;

const CALENDLY_URL = 'https://calendly.com/rivivi/30min';
const METHODOLOGY_PDF_PATH = '/docs/metodologia.pdf';

const PHASES = [
  { key: 'diagnosis', numeral: 'I.'   },
  { key: 'proposal',  numeral: 'II.'  },
  { key: 'execution', numeral: 'III.' },
];

export default function Municipalities() {
  const { t } = useI18n();

  return (
    <section id="municipalities" style={{ background: '#0a0a0a', color: '#fff' }}>
      <div
        className="max-w-[1100px] mx-auto px-6 sm:px-8"
        style={{ paddingTop: '5rem', paddingBottom: '5rem' }}
      >

        {/* KICKER — yellow line + label */}
        <div className="flex items-center gap-3 mb-8">
          <span aria-hidden="true" style={{ width: 32, height: 1, background: YELLOW }} />
          <span
            className="font-mono uppercase font-medium m-0"
            style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}
          >
            {t('municipalities.kicker')}
          </span>
        </div>

        {/* HEADER — headline (italic blue accent) + italic tagline */}
        <header
          className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-end pb-6 mb-16"
          style={{ borderBottom: `0.5px solid ${HAIRLINE}` }}
        >
          <h2
            className="font-data leading-[1.1] tracking-tight m-0"
            style={{ fontSize: 'clamp(32px, 4.5vw, 44px)', fontWeight: 400, color: '#fff' }}
          >
            {t('municipalities.headline.prefix')}{' '}
            <span style={{ fontStyle: 'italic', color: BLUE }}>
              {t('municipalities.headline.accent')}
            </span>{' '}
            {t('municipalities.headline.suffix')}
          </h2>

          <div className="lg:justify-self-end lg:text-right">
            <p
              className="font-data m-0"
              style={{
                fontSize: 17,
                fontStyle: 'italic',
                fontWeight: 400,
                lineHeight: 1.45,
                color: SOFT,
              }}
            >
              {t('municipalities.tagline.line1')}
              <br />
              {t('municipalities.tagline.line2')}
            </p>
          </div>
        </header>

        {/* BLOCK 1 — O QUE OFERECEMOS · three-phase methodology */}
        <div className="mb-16">

          <div className="flex items-baseline gap-4 mb-10 flex-wrap">
            <span
              className="font-mono uppercase font-medium m-0"
              style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}
            >
              {t('municipalities.offering.kicker')}
            </span>
            <span
              className="font-data italic m-0"
              style={{ fontSize: 13, color: FAINT, fontWeight: 400 }}
            >
              {t('municipalities.offering.subkicker')}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-12">
            {PHASES.map(({ key, numeral }) => (
              <div key={key}>

                {/* numeral + role sub-label */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span
                    className="font-data"
                    style={{
                      fontSize: 22,
                      fontWeight: 400,
                      fontStyle: 'italic',
                      color: YELLOW,
                      lineHeight: 1,
                    }}
                  >
                    {numeral}
                  </span>
                  <span
                    className="font-mono uppercase"
                    style={{ fontSize: 10, letterSpacing: '0.25em', color: FAINT }}
                  >
                    {t(`municipalities.phases.${key}.role`)}
                  </span>
                </div>

                {/* phase title */}
                <h3
                  className="font-data m-0 mb-3"
                  style={{
                    fontSize: 'clamp(24px, 2.6vw, 26px)',
                    fontWeight: 400,
                    color: '#fff',
                    lineHeight: 1.15,
                    letterSpacing: '-0.005em',
                  }}
                >
                  {t(`municipalities.phases.${key}.title`)}
                </h3>

                {/* duration */}
                <p
                  className="font-mono uppercase m-0 mb-4"
                  style={{ fontSize: 10, letterSpacing: '0.25em', color: FAINT }}
                >
                  {t(`municipalities.phases.${key}.duration`)}
                </p>

                {/* description */}
                <p
                  className="m-0"
                  style={{ fontSize: 14, lineHeight: 1.6, color: MUTED }}
                >
                  {t(`municipalities.phases.${key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/*
          BLOCK 2 — JÁ TRABALHAMOS COM (Matosinhos credibility anchor).
          The only block on this section that uses a card surface — its
          singularity is what gives Matosinhos rhetorical weight.
        */}
        <div
          className="mb-16"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '0.5px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 8,
            padding: '2.5rem',
          }}
        >
          {/* card kicker */}
          <span
            className="font-mono uppercase font-medium m-0 block mb-6"
            style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}
          >
            {t('municipalities.partner.kicker')}
          </span>

          {/* name + partner tag */}
          <div className="flex items-baseline gap-4 flex-wrap mb-5">
            <h3
              className="font-data m-0"
              style={{
                fontSize: 'clamp(36px, 5vw, 52px)',
                fontWeight: 400,
                color: '#fff',
                lineHeight: 1,
                letterSpacing: '-0.01em',
              }}
            >
              {t('municipalities.partner.name')}
            </h3>
            <span
              className="font-mono uppercase"
              style={{ fontSize: 10, letterSpacing: '0.3em', color: YELLOW }}
            >
              {t('municipalities.partner.tag')}
            </span>
          </div>

          <div style={{ borderTop: `0.5px solid ${HAIRLINE}`, marginBottom: '1.25rem' }} />

          {/*
            ⚠️ PLACEHOLDER — REPLACE WITH REAL DESCRIPTION OF WORK DONE WITH
                MATOSINHOS (1-2 sentences, factual, with measurable outcome
                if possible). Edit in src/lib/i18n.jsx under
                municipalities.partner.description for ALL 4 LANGUAGES.

            Optional 1–3 result-metric row goes RIGHT AFTER this paragraph.
            Match the number/label pattern of §02 and §04. Do NOT fake
            numbers — if no metric is concrete yet, keep this block out.
          */}
          <p
            className="font-data m-0"
            style={{ fontSize: 16, lineHeight: 1.5, color: '#fff' }}
          >
            {t('municipalities.partner.description')}
          </p>

          {/*
            Optional public-doc link — hidden entirely while
            MATOSINHOS_DOC_URL is null (per brief: never link to nothing).
            ⚠️ Set the constant at the top of this file once a public
            document exists.
          */}
          {MATOSINHOS_DOC_URL && (
            <a
              href={MATOSINHOS_DOC_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono uppercase mt-6 inline-block transition-opacity hover:opacity-80"
              style={{ fontSize: 10, letterSpacing: '0.3em', color: YELLOW }}
            >
              {t('municipalities.partner.docLink')}
            </a>
          )}
        </div>

        {/* BLOCK 3 — A EQUIPA TÉCNICA */}
        <div className="mb-16">
          <span
            className="font-mono uppercase font-medium m-0 block mb-6"
            style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}
          >
            {t('municipalities.team.kicker')}
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-start">
            <h3
              className="font-data m-0"
              style={{
                fontSize: 'clamp(24px, 3.4vw, 32px)',
                fontWeight: 400,
                color: '#fff',
                lineHeight: 1.2,
                letterSpacing: '-0.005em',
              }}
            >
              {t('municipalities.team.headline')}
            </h3>
            {/*
              ⚠️ PLACEHOLDER — Refine wording before launch only if specific
                universities (FEUP, ISCTE, etc.) are confirmed in writing.
                Edit in src/lib/i18n.jsx under municipalities.team.description
                for ALL 4 LANGUAGES.
            */}
            <p
              className="m-0"
              style={{ fontSize: 14, lineHeight: 1.7, color: SOFT }}
            >
              {t('municipalities.team.description')}
            </p>
          </div>
        </div>

        {/* CTA BLOCK — single dominant action */}
        <div style={{ borderTop: `0.5px solid ${HAIRLINE}`, paddingTop: '4rem' }}>

          {/* Primary CTA — Calendly */}
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="block w-full text-center transition-opacity hover:opacity-90"
            style={{
              background: BLUE,
              color: '#fff',
              padding: '1.5rem',
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            {t('municipalities.cta.primary')}
          </a>

          {/* Secondary — methodology PDF (disabled until file exists) */}
          <div className="text-center mt-6">
            {METHODOLOGY_PDF_AVAILABLE ? (
              <a
                href={METHODOLOGY_PDF_PATH}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono uppercase inline-block transition-opacity hover:opacity-80"
                style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}
              >
                {t('municipalities.cta.secondary')}
              </a>
            ) : (
              <span
                className="font-mono uppercase inline-block cursor-not-allowed select-none"
                aria-disabled="true"
                style={{ fontSize: 11, letterSpacing: '0.3em', color: FAINT }}
              >
                {t('municipalities.cta.secondary')}
              </span>
            )}
          </div>

          {/* Trust line — addresses the two main objections of municipal officers */}
          <p
            className="font-mono uppercase text-center mt-4 m-0"
            style={{ fontSize: 10, letterSpacing: '0.3em', color: FAINT }}
          >
            {t('municipalities.cta.trust')}
          </p>
        </div>

      </div>
    </section>
  );
}
