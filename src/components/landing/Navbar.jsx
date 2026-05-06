import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Menu, X } from 'lucide-react';

const LANGS = ['PT', 'EN', 'ES', 'FR'];

export default function Navbar({ onJoinClick }) {
  const { lang, setLang, t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navItems = [
    { key: 'manifesto', href: '#manifesto' },
    { key: 'dados', href: '#data' },
    { key: 'mapa', href: '#map' },
    { key: 'comboios', href: '#bikeBus' },
    { key: 'comunidade', href: '#community' },
    { key: 'doar', href: '#donate' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-background/90 backdrop-blur-xl shadow-sm border-b border-border/50'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <img src="/logo-solid.svg" alt="Bicis Sapiens" width="36" height="36" className="w-9 h-9" />
            <span className="font-display text-lg font-black tracking-tightest text-foreground">
              Bicis <i className="text-primary">Sapiens</i>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <a
                key={item.key}
                href={item.href}
                className={`px-3 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${
                  scrolled
                    ? 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
                }`}
              >
                {t(`nav.${item.key}`)}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language selector */}
            <div className="hidden sm:flex items-center gap-0.5 bg-secondary/50 backdrop-blur p-0.5 border border-border">
              {LANGS.map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l.toLowerCase())}
                  className={`px-2 py-1 text-xs font-mono uppercase tracking-widest transition-all ${
                    lang === l.toLowerCase()
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={onJoinClick}
              className="hidden md:inline-flex items-center px-4 py-2.5 text-xs font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t('hero.cta')}
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-foreground transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="px-4 py-4 space-y-1">
            {navItems.map(item => (
              <a
                key={item.key}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 text-xs font-mono uppercase tracking-widest text-foreground hover:bg-secondary"
              >
                {t(`nav.${item.key}`)}
              </a>
            ))}
            <div className="pt-3 border-t border-border mt-3">
              <div className="flex items-center gap-1 mb-3">
                {LANGS.map(l => (
                  <button
                    key={l}
                    onClick={() => { setLang(l.toLowerCase()); setMenuOpen(false); }}
                    className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest transition-all ${
                      lang === l.toLowerCase()
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground bg-secondary'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { onJoinClick(); setMenuOpen(false); }}
                className="w-full px-4 py-3 text-xs font-mono uppercase tracking-widest bg-primary text-primary-foreground"
              >
                {t('hero.cta')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}