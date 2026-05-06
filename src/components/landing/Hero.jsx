import React from 'react';

// PT-PT first per brief. TODO: re-introduce i18n keys when copy stabilizes.
export default function Hero({ onJoinClick }) {
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
        <p className="bs-hero-counter">01 / 13 · O MANIFESTO</p>
        <p className="bs-hero-eyebrow">— PORTO · PORTUGAL</p>

        <h1 className="bs-hero-title">
          O espaço público<br />
          é de <em>todos</em>.<br />
          A cidade também.
        </h1>

        <p className="bs-hero-lead">
          O Porto pode ser 100% ciclável. Sem obras. Com pessoas.
        </p>

        <div className="bs-hero-cta">
          <button
            type="button"
            onClick={onJoinClick}
            className="bs-btn bs-btn-primary"
          >
            Junta-te ao movimento <span aria-hidden="true">→</span>
          </button>
          <a href="#data" className="bs-btn bs-btn-secondary">
            Ver os dados <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      <div className="bs-hero-ticker" aria-hidden="true">
        <div className="bs-ticker-track">
          <span className="bs-ticker-item">BICIS SAPIENS · MOVIMENTO CÍVICO · PORTO · MMXXVI · 100% CICLÁVEL · SEM OBRAS · COM PESSOAS · </span>
          <span className="bs-ticker-item">BICIS SAPIENS · MOVIMENTO CÍVICO · PORTO · MMXXVI · 100% CICLÁVEL · SEM OBRAS · COM PESSOAS · </span>
        </div>
      </div>
    </section>
  );
}
