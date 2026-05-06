import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { User, Briefcase } from 'lucide-react';

const advisors = [
  { name: 'Dr. Ana Mendes',     role: 'Urbanista',          org: 'FEUP' },
  { name: 'Dr. João Pereira',   role: 'Pediatra',           org: 'Hospital São João' },
  { name: 'Eng. Sofia Costa',   role: 'Eng. de Transportes', org: 'LNEC' },
  { name: 'Prof. Miguel Santos', role: 'Sociologia Urbana', org: 'UP' },
];

export default function AboutTeam() {
  const { t } = useI18n();
  const ref = useScrollReveal();

  return (
    <section id="about" ref={ref} className="reveal-section py-24 sm:py-32 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <span className="font-mono text-xs tracking-widest uppercase text-accent">
            11 / 13 · {t('about.title')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black mt-4 tracking-tightest max-w-3xl">
            {t('about.title')}
          </h2>
        </div>

        {/* Founder — featured cream card */}
        <div className="grid lg:grid-cols-3 gap-px bg-border mb-20">
          <div className="lg:col-span-1 bg-bone p-8 sm:p-10 flex items-center justify-center">
            <div className="aspect-[3/4] w-full bg-primary flex items-center justify-center">
              <div className="text-center">
                <User className="w-16 h-16 text-bone/70 mx-auto" />
                <p className="mt-3 font-mono text-[9px] uppercase tracking-widest text-bone/55">
                  Foto de perfil
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 relative bg-bone text-obsidian p-8 sm:p-12 pl-9 sm:pl-14 flex flex-col justify-center">
            <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-obsidian/55 mb-4">
              Fundador
            </p>
            <h3 className="font-display text-3xl sm:text-4xl font-black tracking-tightest text-obsidian">
              Ricardo Villalobos
            </h3>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-primary">
              {t('about.founderRole')}
            </p>
            <p className="mt-6 text-obsidian/70 leading-relaxed max-w-2xl font-body">
              {t('about.founderBio')}
            </p>
          </div>
        </div>

        {/* Advisors */}
        <div className="mb-20">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="w-4 h-4 text-foreground/55" />
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground/55">
              {t('about.advisors')}
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {advisors.map((advisor, i) => (
              <div key={i} className="bg-bone text-obsidian p-6 sm:p-7">
                <div className="w-10 h-10 bg-primary/10 grid place-items-center mb-6">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-obsidian/45 mb-2">
                  {advisor.org}
                </p>
                <h4 className="font-display text-lg font-black tracking-tightest text-obsidian leading-snug">
                  {advisor.name}
                </h4>
                <p className="text-sm text-obsidian/60 mt-1">{advisor.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Allies */}
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground/55 mb-6">
            {t('about.allies')}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-px bg-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/2] bg-bone flex items-center justify-center">
                <span className="font-mono text-[9px] uppercase tracking-widest text-obsidian/30">
                  Logo {i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
