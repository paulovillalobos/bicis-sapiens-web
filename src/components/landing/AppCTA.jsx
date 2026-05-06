import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { base44 } from '@/api/base44Client';
import { Smartphone, Check, ArrowRight, Bike } from 'lucide-react';
import { toast } from 'sonner';

export default function AppCTA() {
  const { t, lang } = useI18n();
  const ref = useScrollReveal();
  const [email, setEmail] = useState('');
  const [type, setType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const bullets = t('app.bullets') || [];

  const handleSubmit = async (subType) => {
    if (!email) return;
    setSubmitting(true);
    setType(subType);
    await base44.entities.Subscriber.create({
      email,
      type: subType,
      consent_given: true,
      language: lang,
    });
    setSubmitting(false);
    setSuccess(true);
    setEmail('');
    toast.success(t('join.success'));
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <section id="app" ref={ref} className="reveal-section py-24 sm:py-32 bg-background text-foreground overflow-hidden border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div>
            <span className="font-mono text-xs tracking-widest uppercase text-accent">
              06 — {t('app.title')}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mt-4 tracking-tight">
              {t('app.headline')}
            </h2>

            <div className="mt-8 space-y-4">
              {Array.isArray(bullets) && bullets.map((bullet, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <p className="text-white/80 text-lg">{bullet}</p>
                </div>
              ))}
            </div>

            {/* Email capture */}
            <div className="mt-10 space-y-3">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSubmit('app_waitlist')}
                  disabled={submitting || !email}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {t('app.waitlist')} <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSubmit('app_backer')}
                  disabled={submitting || !email}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-mono uppercase tracking-widest border border-foreground/30 text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-50"
                >
                  {t('app.support')}
                </button>
              </div>
              {success && (
                <p className="text-accent text-sm font-medium">{t('join.success')}</p>
              )}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative flex justify-center">
            <div className="relative w-64 sm:w-72">
              {/* Phone frame */}
              <div className="bg-foreground/5 backdrop-blur-sm rounded-[3rem] p-3 border border-foreground/15">
                <div className="bg-primary rounded-[2.5rem] overflow-hidden aspect-[9/19.5]">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-8 pt-4 pb-2">
                    <span className="text-[10px] text-white/60 font-mono">9:41</span>
                    <div className="w-20 h-5 bg-black rounded-full" />
                    <span className="text-[10px] text-white/60">100%</span>
                  </div>
                  {/* App content mockup */}
                  <div className="px-6 pt-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Bike className="w-5 h-5 text-accent" />
                      <span className="font-display text-sm font-semibold text-white">Bicis Sapiens</span>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 mb-4">
                      <div className="w-full h-32 bg-white/5 rounded-xl mb-3 flex items-center justify-center">
                        <span className="text-white/30 text-xs font-mono">Mapa de rota</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <span className="text-white/80 text-xs">Casa → Escola da Constituição</span>
                      </div>
                      <div className="flex gap-4 mt-2 text-[10px] text-white/50 font-mono">
                        <span>2.4 km</span>
                        <span>12 min</span>
                        <span>Seguro</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-white/10 rounded w-3/4" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Glow */}
              <div className="absolute -inset-10 bg-accent/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}