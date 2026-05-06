import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { User, Briefcase } from 'lucide-react';

const advisors = [
  { name: 'Dr. Ana Mendes', role: 'Urbanista', org: 'FEUP' },
  { name: 'Dr. João Pereira', role: 'Pediatra', org: 'Hospital São João' },
  { name: 'Eng. Sofia Costa', role: 'Eng. de Transportes', org: 'LNEC' },
  { name: 'Prof. Miguel Santos', role: 'Sociologia Urbana', org: 'UP' },
];

export default function AboutTeam() {
  const { t } = useI18n();
  const ref = useScrollReveal();

  return (
    <section id="about" ref={ref} className="reveal-section py-24 sm:py-32 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <span className="font-mono text-xs tracking-widest uppercase text-primary">
            10 — {t('about.title')}
          </span>
        </div>

        {/* Founder */}
        <div className="grid lg:grid-cols-3 gap-12 mb-20">
          <div className="lg:col-span-1">
            <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-deep-blue/20 rounded-2xl flex items-center justify-center border border-border">
              <div className="text-center">
                <User className="w-16 h-16 text-primary/40 mx-auto" />
                <p className="mt-3 text-xs font-mono text-muted-foreground">Foto de perfil</p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 flex flex-col justify-center">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
              Ricardo Villalobos
            </h2>
            <p className="mt-2 text-lg text-primary font-medium">
              {t('about.founderRole')}
            </p>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
              {t('about.founderBio')}
            </p>
          </div>
        </div>

        {/* Advisors */}
        <div className="mb-16">
          <h3 className="font-display text-2xl font-semibold mb-8">{t('about.advisors')}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {advisors.map((advisor, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Briefcase className="w-5 h-5 text-primary/60" />
                </div>
                <h4 className="font-display text-base font-semibold">{advisor.name}</h4>
                <p className="text-sm text-muted-foreground">{advisor.role}</p>
                <p className="text-xs font-mono text-primary/60 mt-1">{advisor.org}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Allies */}
        <div>
          <h3 className="font-display text-2xl font-semibold mb-8">{t('about.allies')}</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/2] bg-card border border-border rounded-xl flex items-center justify-center">
                <span className="text-xs font-mono text-muted-foreground/40">Logo {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}