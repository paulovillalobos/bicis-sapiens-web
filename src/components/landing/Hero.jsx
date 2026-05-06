import React from 'react';
import { useI18n } from '@/lib/i18n';
import { ChevronDown } from 'lucide-react';

export default function Hero({ onJoinClick }) {
  const { t } = useI18n();

  return (
    <section id="hero" className="relative min-h-screen flex items-end pb-20 sm:pb-32 overflow-hidden bg-background">
      {/* Background — solid obsidian, institutional. No gradient. */}
      <div className="absolute inset-0">
        {/* Azulejo pattern overlay */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FAFAF7' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        {/* Subtle EU-blue institutional block on the right */}
        <div className="absolute top-0 right-0 bottom-0 w-1/3 bg-primary/8" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 bg-accent" />
            <span className="text-accent font-mono text-xs tracking-widest uppercase">
              Porto · Portugal
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground leading-[1.05] tracking-tightest whitespace-pre-line">
            {t('hero.tagline')}
          </h1>

          <div className="mt-12 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onJoinClick}
              className="inline-flex items-center justify-center px-8 py-4 text-xs font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t('hero.cta')}
            </button>
            <a
              href="#manifesto"
              className="inline-flex items-center justify-center px-8 py-4 text-xs font-mono uppercase tracking-widest border border-foreground/25 text-foreground hover:bg-foreground/5 transition-colors"
            >
              {t('hero.scroll')}
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <a href="#manifesto" className="scroll-indicator block text-foreground/40">
            <ChevronDown className="w-6 h-6" />
          </a>
        </div>
      </div>
    </section>
  );
}