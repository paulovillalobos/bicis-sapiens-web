import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import AnimatedCounter from './AnimatedCounter';
import { Building2, Download, Calendar, ArrowRight } from 'lucide-react';

export default function Municipalities() {
  const { t } = useI18n();
  const ref = useScrollReveal();

  return (
    <section id="municipalities" ref={ref} className="reveal-section py-24 sm:py-32 bg-deep-blue text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="font-mono text-xs tracking-widest uppercase text-light-blue">
              08 — {t('municipalities.title')}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mt-4 tracking-tight">
              {t('municipalities.title')}
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-lg">
              {t('municipalities.subtitle')}
            </p>

            <div className="mt-10 flex gap-8">
              <div>
                <span className="font-display text-4xl font-bold text-light-blue">
                  <AnimatedCounter value={12} />
                </span>
                <p className="text-sm text-white/50 mt-1">{t('municipalities.engaged')}</p>
              </div>
              <div>
                <span className="font-display text-4xl font-bold text-light-blue">
                  <AnimatedCounter value={5} />
                </span>
                <p className="text-sm text-white/50 mt-1">{t('municipalities.proposals')}</p>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium rounded-xl bg-white text-deep-blue hover:bg-white/90 transition-all">
                <Download className="w-4 h-4" />
                {t('municipalities.download')}
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all">
                <Calendar className="w-4 h-4" />
                {t('municipalities.meeting')}
              </button>
            </div>
          </div>

          {/* Institutional visual */}
          <div className="relative">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-6 h-6 text-light-blue" />
                <span className="font-display text-xl font-semibold">Dossier Municipal</span>
              </div>
              <div className="space-y-4">
                {['Diagnóstico de mobilidade', 'Proposta de sinalização', 'Mapa de escolas e rotas', 'Plano de implementação', 'Cronograma e métricas'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-light-blue/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-mono text-light-blue font-medium">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <span className="text-sm text-white/80">{item}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/30 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -inset-8 bg-light-blue/5 rounded-3xl -z-10 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}