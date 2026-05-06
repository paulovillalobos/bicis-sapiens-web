import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import AnimatedCounter from './AnimatedCounter';
import { Building2, Download, Calendar, ArrowRight } from 'lucide-react';

const dossierItems = [
  'Diagnóstico de mobilidade',
  'Proposta de sinalização',
  'Mapa de escolas e rotas',
  'Plano de implementação',
  'Cronograma e métricas',
];

export default function Municipalities() {
  const { t } = useI18n();
  const ref = useScrollReveal();

  return (
    <section id="municipalities" ref={ref} className="reveal-section py-24 sm:py-32 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left — copy */}
          <div>
            <span className="font-mono text-xs tracking-widest uppercase text-accent">
              09 / 13 · {t('municipalities.title')}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black mt-4 tracking-tightest">
              {t('municipalities.title')}
            </h2>
            <p className="mt-4 text-foreground/60 max-w-lg font-body">
              {t('municipalities.subtitle')}
            </p>

            {/* Stats grid (2 cells, 1 featured) */}
            <div className="mt-12 grid grid-cols-2 gap-px bg-border">
              <div className="relative bg-bone text-obsidian p-6 sm:p-8 pl-7 sm:pl-9">
                <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                <div className="font-display text-4xl sm:text-5xl font-black tracking-tightest text-obsidian leading-none">
                  <AnimatedCounter value={12} />
                </div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-obsidian/55 mt-3">
                  {t('municipalities.engaged')}
                </p>
              </div>
              <div className="bg-bone text-obsidian p-6 sm:p-8">
                <div className="font-display text-4xl sm:text-5xl font-black tracking-tightest text-obsidian leading-none">
                  <AnimatedCounter value={5} />
                </div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-obsidian/55 mt-3">
                  {t('municipalities.proposals')}
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <button className="inline-flex items-center justify-center gap-2 px-6 py-4 text-xs font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Download className="w-4 h-4" />
                {t('municipalities.download')}
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-6 py-4 text-xs font-mono uppercase tracking-widest border border-foreground/25 text-foreground hover:bg-foreground/5 transition-colors">
                <Calendar className="w-4 h-4" />
                {t('municipalities.meeting')}
              </button>
            </div>
          </div>

          {/* Right — Dossier panel as a single cream card */}
          <div className="bg-bone text-obsidian p-8 sm:p-10 border-l-[1px] border-border">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-obsidian/55" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-obsidian/55">
                Documento institucional
              </p>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-black tracking-tightest text-obsidian mb-8">
              Dossier Municipal
            </h3>

            <div className="space-y-px bg-obsidian/10 border-y border-obsidian/10">
              {dossierItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-bone hover:bg-obsidian/5 transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 grid place-items-center border border-obsidian/15 shrink-0">
                    <span className="font-mono text-[10px] tracking-widest text-obsidian/65">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="font-display text-base font-black tracking-tightest text-obsidian flex-1">
                    {item}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-obsidian/30 group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
