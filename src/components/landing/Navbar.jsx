import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const LANGS = ['PT', 'EN', 'ES', 'FR'];

// Bike Bus = the "star" item per brief — always rendered as solid blue.
const NAV_ITEMS = [
  { key: 'manifesto',  href: '#manifesto'  },
  { key: 'dados',      href: '#data'       },
  { key: 'mapa',       href: '#map'        },
  { key: 'comboios',   href: '#bikeBus',  active: true },
  { key: 'comunidade', href: '#community'  },
  { key: 'doar',       href: '#support'    },
];

export default function Navbar({ onJoinClick }) {
  const { lang, setLang, t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langWrapRef = useRef(null);

  // Body scroll lock while the fullscreen menu is open
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [menuOpen]);

  // ESC closes either dropdown
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setLangOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Click outside the lang dropdown closes it
  useEffect(() => {
    if (!langOpen) return;
    const onClick = (e) => {
      if (langWrapRef.current && !langWrapRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [langOpen]);

  const handleJoin = useCallback(() => {
    setMenuOpen(false);
    onJoinClick?.();
  }, [onJoinClick]);

  const pickLang = (l) => {
    setLang(l.toLowerCase());
    setLangOpen(false);
  };

  return (
    <>
      <nav className="bs-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <a href="#" className="flex items-center gap-3">
              <img src="/logo-solid.svg" alt="Bicis Sapiens" width="36" height="36" className="w-9 h-9" />
              <span className="font-display text-lg font-black tracking-tightest text-foreground">
                Bicis <i className="text-primary">Sapiens</i>
              </span>
            </a>

            {/* Desktop nav pills (lg+) */}
            <div className="hidden lg:flex items-center gap-2">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className={`bs-nav-pill ${item.active ? 'bs-nav-pill-active' : ''}`}
                >
                  {t(`nav.${item.key}`)}
                </a>
              ))}
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-2">

              {/* Lang dropdown — always visible on lg+, hidden on mobile (lives inside fullscreen menu instead) */}
              <div className="relative hidden md:block" ref={langWrapRef}>
                <button
                  type="button"
                  className="bs-nav-lang-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={langOpen}
                  onClick={() => setLangOpen((v) => !v)}
                >
                  <Globe size={14} strokeWidth={1.75} />
                  <span>{lang.toUpperCase()}</span>
                  <ChevronDown
                    size={12}
                    strokeWidth={2}
                    style={{
                      transition: 'transform 200ms ease-out',
                      transform: langOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>
                {langOpen && (
                  <div role="listbox" className="bs-nav-lang-panel">
                    {LANGS.map((l) => {
                      const active = lang === l.toLowerCase();
                      return (
                        <button
                          key={l}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => pickLang(l)}
                          className={`bs-nav-lang-option ${active ? 'is-active' : ''}`}
                        >
                          {l}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* CTA — full label on lg+, short on md, hidden on sm */}
              <button
                type="button"
                onClick={handleJoin}
                className="bs-nav-cta hidden md:inline-flex"
              >
                <span className="hidden lg:inline">{t('hero.cta')}</span>
                <span className="hidden md:inline lg:hidden">{t('nav.ctaShort')}</span>
                <span aria-hidden="true">→</span>
              </button>

              {/* Hamburger (lg-) */}
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                className={`bs-nav-hamburger lg:hidden ${menuOpen ? 'is-open' : ''}`}
              >
                <span className="bs-nav-hamburger-icon" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Fullscreen mobile / tablet menu */}
      {menuOpen && (
        <div className="bs-nav-mobile-menu lg:hidden" role="dialog" aria-modal="true">
          <ul className="bs-nav-mobile-list">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`bs-nav-mobile-item ${item.active ? 'is-active' : ''}`}
                >
                  {t(`nav.${item.key}`)}
                </a>
              </li>
            ))}
          </ul>

          <div className="bs-nav-mobile-footer">
            {/* Lang as 4 visible pills inside the menu — there's space here */}
            <div className="bs-nav-mobile-langs" role="radiogroup" aria-label="Language">
              {LANGS.map((l) => {
                const active = lang === l.toLowerCase();
                return (
                  <button
                    key={l}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setLang(l.toLowerCase())}
                    className={`bs-nav-pill ${active ? 'bs-nav-pill-active' : ''}`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={handleJoin} className="bs-nav-mobile-cta">
              {t('hero.cta')}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
