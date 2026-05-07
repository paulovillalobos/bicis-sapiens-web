import React from 'react';
import { useI18n } from '@/lib/i18n';

// --- Theme tokens (this section uses the same dark editorial palette
// as §02 — Porto in Numbers — to match the new visual system) ---
const YELLOW   = '#d4a017';
const BLUE     = '#1d4ed8';
const HAIRLINE = 'rgba(255, 255, 255, 0.15)';

const PILLARS = [
  { key: 'info',      numeral: 'I.'   },
  { key: 'consensus', numeral: 'II.'  },
  { key: 'proposal',  numeral: 'III.' },
];

export default function Solution3Cs() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <section
      id="solution"
      style={{ background: '#0a0a0a', color: '#fff' }}
    >
      <div className="max-w-[1100px] mx-auto px-6 sm:px-8" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>

        {/* KICKER — yellow line + label */}
        <div className="flex items-center gap-3 mb-8">
          <span aria-hidden="true" style={{ width: 32, height: 1, background: YELLOW }} />
          <span
            className="font-mono uppercase font-medium m-0"
            style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}
          >
            {t('solution.kicker')}
          </span>
        </div>

        {/* HEADER — headline (italic blue accent) + tagline */}
        <header
          className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-end pb-6 mb-12"
          style={{ borderBottom: `0.5px solid ${HAIRLINE}` }}
        >
          <h2
            className="font-data leading-[1.1] tracking-tight m-0"
            style={{ fontSize: 'clamp(32px, 4.5vw, 44px)', fontWeight: 400, color: '#fff' }}
          >
            {t('solution.headline.prefix')}{' '}
            <span style={{ fontStyle: 'italic', color: BLUE }}>
              {t('solution.headline.accent')}
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
              {t('solution.tagline.line1')}
              <br />
              {t('solution.tagline.line2')}
            </p>
          </div>
        </header>

        {/* THREE PILLARS — typography only, no cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {PILLARS.map(({ key, numeral }) => {
            const bullets = t(`solution.${key}.bullets`) || [];
            return (
              <div key={key}>

                {/* META: roman numeral + role sub-label */}
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
                    style={{
                      fontSize: 12,
                      letterSpacing: '0.2em',
                      fontWeight: 500,
                      color: '#d4a017',
                    }}
                  >
                    {t(`solution.${key}.role`)}
                  </span>
                </div>

                {/* TITLE — declarative period */}
                <h3
                  className="font-data m-0 mb-4"
                  style={{
                    fontSize: 'clamp(24px, 2.6vw, 28px)',
                    fontWeight: 400,
                    color: '#fff',
                    lineHeight: 1.15,
                    letterSpacing: '-0.005em',
                  }}
                >
                  {t(`solution.${key}.title`)}.
                </h3>

                {/* DESCRIPTION */}
                <p
                  className="m-0 mb-6"
                  style={{
                    fontSize: 17,
                    lineHeight: 1.65,
                    color: '#ffffff',
                  }}
                >
                  {t(`solution.${key}.desc`)}
                </p>

                {/* HAIRLINE */}
                <div style={{ borderTop: `0.5px solid ${HAIRLINE}` }} className="mb-5" />

                {/* DELIVERABLES — unstyled, no bullets, no icons */}
                <ul className="list-none m-0 p-0">
                  {Array.isArray(bullets) && bullets.map((item, j) => (
                    <li
                      key={j}
                      style={{
                        fontSize: 16,
                        lineHeight: 1.85,
                        color: '#ffffff',
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>

              </div>
            );
          })}
        </div>

        {/* SIGNATURE — closes the section like a manifesto */}
        <div
          className="text-center"
          style={{ borderTop: `0.5px solid ${HAIRLINE}`, paddingTop: '3rem' }}
        >
          <p
            className="font-mono uppercase m-0"
            style={{
              fontSize: 12,
              letterSpacing: '0.2em',
              fontWeight: 500,
              color: '#d4a017',
              marginBottom: '0.75rem',
            }}
          >
            {t('solution.signature.signed')} &middot; Porto, {year}
          </p>
          <p
            className="font-data m-0"
            style={{
              fontSize: 20,
              fontStyle: 'italic',
              fontWeight: 400,
              color: '#fff',
            }}
          >
            {t('solution.signature.name')}
          </p>
        </div>

      </div>
    </section>
  );
}
