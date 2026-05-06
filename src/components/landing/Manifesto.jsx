import React from 'react';
import { useI18n } from '@/lib/i18n';

// One principle = one full-screen poster panel.
// Background image fills 100vw x 100vh, dim overlay sits above it,
// centered text-stack sits above overlay.
function Principle({ chapter, eyebrow, mega, supporting, src, alt }) {
  return (
    <article className="bs-principle">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="bs-principle-bg"
      />
      <div className="bs-principle-overlay" aria-hidden="true" />

      <div className="bs-principle-content">
        <span className="bs-principle-chapter">{chapter}</span>
        <p className="bs-principle-eyebrow">{eyebrow}</p>
        <h2 className="bs-principle-mega">{mega}</h2>
        <p className="bs-principle-supporting">{supporting}</p>
      </div>
    </article>
  );
}

export default function Manifesto() {
  const { t } = useI18n();
  const beliefs = t('manifesto.beliefs') || [];

  return (
    <section id="manifesto" className="bs-manifesto">
      <Principle
        chapter="01 / 03"
        eyebrow="Identidade · O espaço público"
        mega={
          <>
            A rua pertence às <em>crianças.</em>
          </>
        }
        supporting={
          <>
            Aos idosos, às famílias. Não a quem passa por ela mais depressa.
          </>
        }
        src="/images/manifesto/manifesto-01-crianca-bicicleta.webp"
        alt="Criança a atravessar uma rua de Porto em bicicleta clássica"
      />

      <Principle
        chapter="02 / 03"
        eyebrow="Posição · Sem obras"
        mega={
          <>
            A bicicleta não precisa de <em>infraestrutura.</em>
          </>
        }
        supporting={
          <>
            {beliefs[5] || 'A bicicleta não precisa de infraestrutura dedicada para ser segura.'}
            {' '}Precisa de respeito.
          </>
        }
        src="/images/manifesto/manifesto-02-ciclista-rua-partilhada.webp"
        alt="Ciclista numa rua partilhada do Porto, sem ciclovia dedicada"
      />

      <Principle
        chapter="03 / 03"
        eyebrow="Visão · Mobilidade humana"
        mega={
          <>
            Mobilidade humana, em <em>família.</em>
          </>
        }
        supporting={
          <>
            {beliefs[6] || 'Cidade silenciosa, com árvores, com espaço para crianças jogarem na rua.'}
          </>
        }
        src="/images/manifesto/manifesto-03-cargo-bike-familia.webp"
        alt="Cargo bike a subir uma rua do Porto com pai e duas crianças, azulejos ao fundo"
      />

      <div className="bs-manifesto-colophon">
        <p>
          <span className="bs-manifesto-colophon-mark">§</span>
          02 / 13 &middot; Bicis Sapiens &middot; movimento cívico &middot; bicisapiens.org &middot; {new Date().getFullYear()}
        </p>
      </div>
    </section>
  );
}
