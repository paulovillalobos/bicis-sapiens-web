import React from 'react';
import { useI18n } from '@/lib/i18n';

const IMAGES = [
  {
    src: '/images/manifesto/manifesto-01-crianca-bicicleta.webp',
    alt: 'Criança a atravessar uma rua de Porto em bicicleta clássica',
  },
  {
    src: '/images/manifesto/manifesto-02-ciclista-rua-partilhada.webp',
    alt: 'Ciclista numa rua partilhada do Porto, sem ciclovia dedicada',
  },
  {
    src: '/images/manifesto/manifesto-03-cargo-bike-familia.webp',
    alt: 'Cargo bike a subir uma rua do Porto com pai e duas crianças, azulejos ao fundo',
  },
];

function Principle({ index, t, src, alt }) {
  const base = `manifesto.principles.${index}`;
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

      <div className="bs-principle-content bs-glass">
        <span className="bs-principle-chapter">{t(`${base}.chapter`)}</span>
        <p className="bs-principle-eyebrow">{t(`${base}.eyebrow`)}</p>
        <h2
          className="bs-principle-mega"
          dangerouslySetInnerHTML={{ __html: t(`${base}.mega_html`) }}
        />
        <p className="bs-principle-supporting">{t(`${base}.supporting`)}</p>
      </div>
    </article>
  );
}

export default function Manifesto() {
  const { t } = useI18n();

  return (
    <section id="manifesto" className="bs-manifesto">
      {IMAGES.map((img, i) => (
        <Principle key={i} index={i} t={t} src={img.src} alt={img.alt} />
      ))}

      <div className="bs-manifesto-colophon">
        <p>
          <span className="bs-manifesto-colophon-mark">§</span>
          02 / 13 &middot; {t('manifesto.colophon')} &middot; {new Date().getFullYear()}
        </p>
      </div>
    </section>
  );
}
