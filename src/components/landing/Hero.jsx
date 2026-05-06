import React from 'react';
import { useI18n } from '@/lib/i18n';
import { ChevronDown } from 'lucide-react';

export default function Hero({ onJoinClick }) {
  const { t } = useI18n();

  return (
    <section id="hero" className="relative min-h-screen flex items-end pb-20 sm:pb-32 overflow-hidden">
      {/* Background — cinematic gradient placeholder for video */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A1F14] via-[#0F3D5C] to-[#0A0A0A]">
        {/* Azulejo pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-deep-blue/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-accent font-mono text-xs tracking-widest uppercase">
              Porto, Portugal
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.1] tracking-tight whitespace-pre-line">
            {t('hero.tagline')}
          </h1>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button
              onClick={onJoinClick}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 transition-all hover:shadow-lg hover:shadow-accent/25"
            >
              {t('hero.cta')}
            </button>
            <a
              href="#manifesto"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all"
            >
              {t('hero.scroll')}
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <a href="#manifesto" className="scroll-indicator block text-white/40">
            <ChevronDown className="w-6 h-6" />
          </a>
        </div>
      </div>
    </section>
  );
}