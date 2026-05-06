import React from 'react';
import { useI18n } from '@/lib/i18n';

// Full-bleed editorial spread image (70vh tall, edge-to-edge)
function ManifestoSpread({ src, alt }) {
  return (
    <figure className="bs-manifesto-spread">
      <img src={src} alt={alt} loading="lazy" decoding="async" />
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

      {/* PRINCIPLE 01 — text first, image follows. Left-aligned. */}
      <article className="bs-principle bs-principle--left">
        <span aria-hidden="true" className="bs-principle-watermark">01</span>
        <p className="bs-principle-eyebrow">Identidade · O espaço público</p>
        <h2 className="bs-principle-mega">
          A rua pertence às <em>crianças.</em>
        </h2>
        <p className="bs-principle-supporting">
          Aos idosos, às famílias. Não a quem passa por ela mais depressa.
          {beliefs[0] ? ` ${beliefs[0]}` : ''}
        </p>
      </article>

      <ManifestoSpread
        src="/images/manifesto/manifesto-01-crianca-bicicleta.webp"
        alt="Criança a atravessar uma rua de Porto em bicicleta clássica"
      />

      {/* PRINCIPLE 02 — image first, text follows. Right-aligned. */}
      <ManifestoSpread
        src="/images/manifesto/manifesto-02-ciclista-rua-partilhada.webp"
        alt="Ciclista numa rua partilhada do Porto, sem ciclovia dedicada"
      />

      <article className="bs-principle bs-principle--right">
        <span aria-hidden="true" className="bs-principle-watermark">02</span>
        <p className="bs-principle-eyebrow">Posição · Sem obras</p>
        <h2 className="bs-principle-mega">
          A bicicleta não precisa de <em>infraestrutura.</em>
        </h2>
        <p className="bs-principle-supporting">
          {beliefs[5] || 'A bicicleta não precisa de infraestrutura dedicada para ser segura.'}
          {' '}
          Precisa de respeito.
          {beliefs[4] ? ` ${beliefs[4]}` : ' Opomo-nos a decisões sem análise nem consenso.'}
        </p>
      </article>

      {/* PRINCIPLE 03 — text first, image follows. Centered. */}
      <article className="bs-principle bs-principle--center">
        <span aria-hidden="true" className="bs-principle-watermark">03</span>
        <p className="bs-principle-eyebrow">Visão · Mobilidade humana</p>
        <h2 className="bs-principle-mega">
          Mobilidade humana, em <em>família.</em>
        </h2>
        <p className="bs-principle-supporting">
          {beliefs[6] || 'Cidade silenciosa, com árvores, com espaço para crianças jogarem na rua.'}
        </p>
      </article>

      <ManifestoSpread
        src="/images/manifesto/manifesto-03-cargo-bike-familia.webp"
        alt="Cargo bike a subir uma rua do Porto com pai e duas crianças, azulejos ao fundo"
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
