import React from 'react';
import { useI18n } from '@/lib/i18n';

// Inline minimal bike mark — used inside placeholder figures.
// Same anatomy as logo-solid.svg (bike only, no tile/border).
function BikeMark() {
  return (
    <svg
      className="bs-bike"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="#FAFAF7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="32" cy="62" r="13" />
        <circle cx="68" cy="62" r="13" />
        <line x1="32" y1="62" x2="50" y2="62" />
        <line x1="50" y1="62" x2="46" y2="33" />
        <line x1="50" y1="62" x2="65" y2="36" />
        <line x1="46" y1="33" x2="65" y2="36" />
        <line x1="65" y1="36" x2="76" y2="33" />
        <line x1="42" y1="31" x2="51" y2="31" />
      </g>
    </svg>
  );
}

// Renders a real <img> at /images/manifesto-XX.webp; falls back to an
// EU-blue placeholder with bike silhouette + prompt caption when 404.
// Image fades in via `is-loaded` class only on successful onLoad — so
// during the 404 attempt, the placeholder is already visible underneath.
function ManifestoFigure({ id, prompt, src }) {
  return (
    <figure className="bs-manifesto-figure" aria-label={`${id}: ${prompt}`}>
      <img
        src={src}
        alt={prompt}
        loading="lazy"
        decoding="async"
        onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      <div className="bs-manifesto-placeholder">
        <BikeMark />
        <figcaption className="bs-manifesto-figcaption">
          <span className="bs-manifesto-figcaption-id">{id}</span>
          <span>{prompt}</span>
        </figcaption>
      </div>
    </figure>
  );
}

export default function Manifesto() {
  const { t } = useI18n();
  const beliefs = t('manifesto.beliefs') || [];

  return (
    <section id="manifesto" className="bs-manifesto">
      <div className="bs-manifesto-header">
        <span className="font-mono text-xs tracking-widest uppercase text-accent">
          02 / 13 · {t('manifesto.title')}
        </span>
      </div>

      {/* PRINCIPLE 01 — IDENTIDADE / left-aligned */}
      <article className="bs-principle bs-principle--left">
        <span aria-hidden="true" className="bs-principle-watermark">01</span>
        <p className="bs-principle-eyebrow">Identidade</p>
        <h2 className="bs-principle-mega">
          Somos <em>humanos</em>.
        </h2>
        <p className="bs-principle-supporting">
          {beliefs[2] || 'A rua pertence às crianças, aos idosos, às famílias.'}
        </p>
      </article>

      <ManifestoFigure
        id="IMG_01"
        prompt="niño 8 anos · bici clássica · calçada portuguesa · hora dorada"
        src="/images/manifesto-01.webp"
      />

      {/* PRINCIPLE 02 — POSIÇÃO / right-aligned */}
      <article className="bs-principle bs-principle--right">
        <span aria-hidden="true" className="bs-principle-watermark">02</span>
        <p className="bs-principle-eyebrow">Posição</p>
        <h2 className="bs-principle-mega">
          O carro não é <em>indispensável</em>.
        </h2>
        <p className="bs-principle-supporting">
          {beliefs[5] || 'A bicicleta não precisa de infraestrutura dedicada para ser segura.'}
          {' '}
          {beliefs[4] || 'Opomo-nos a decisões sem análise nem consenso.'}
        </p>
      </article>

      <ManifestoFigure
        id="IMG_02"
        prompt="anciana com bastão · paso de cebra · autos parados · respeito"
        src="/images/manifesto-02.webp"
      />

      {/* PRINCIPLE 03 — VISÃO / centered */}
      <article className="bs-principle bs-principle--center">
        <span aria-hidden="true" className="bs-principle-watermark">03</span>
        <p className="bs-principle-eyebrow">Visão · 25 anos</p>
        <h2 className="bs-principle-mega">
          Uma cidade <em>silenciosa</em>.
        </h2>
        <p className="bs-principle-supporting">
          {beliefs[6] || 'Visão a 25 anos: cidade silenciosa, com árvores, com espaço para crianças.'}
        </p>
      </article>

      <ManifestoFigure
        id="IMG_03"
        prompt="cargo bike · pai com 2 crianças · cuesta de Porto · azulejos ao fundo"
        src="/images/manifesto-03.webp"
      />

      <div className="bs-manifesto-colophon">
        <p>
          <span className="bs-manifesto-colophon-mark">§</span>
          Bicis Sapiens &middot; movimento cívico &middot; bicisapiens.org &middot; {new Date().getFullYear()}
        </p>
      </div>
    </section>
  );
}
