import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { Heart, CreditCard, Landmark, Smartphone, Check } from 'lucide-react';

const tiers = [5, 25, 100];

const breakdownData = [
  { key: 'tech', pct: 40, color: 'bg-primary' },
  { key: 'education', pct: 25, color: 'bg-accent' },
  { key: 'operations', pct: 20, color: 'bg-deep-blue' },
  { key: 'advocacy', pct: 15, color: 'bg-light-blue' },
];

export default function Donate() {
  const { t } = useI18n();
  const ref = useScrollReveal();
  const [selected, setSelected] = useState(25);
  const [custom, setCustom] = useState('');

  return (
    <section id="donate" ref={ref} className="reveal-section py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <span className="font-mono text-xs tracking-widest uppercase text-primary">
            11 — {t('donate.title')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mt-4 tracking-tight">
            {t('donate.title')}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl">
            {t('donate.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Donation tiers */}
          <div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {tiers.map(amount => (
                <button
                  key={amount}
                  onClick={() => { setSelected(amount); setCustom(''); }}
                  className={`py-4 rounded-xl text-center font-display text-xl font-semibold transition-all border ${
                    selected === amount && !custom
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                      : 'bg-card border-border text-foreground hover:border-primary/30'
                  }`}
                >
                  €{amount}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-display text-lg">€</span>
              <input
                type="number"
                value={custom}
                onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
                placeholder={t('donate.custom')}
                className="w-full pl-8 pr-4 py-3.5 rounded-xl border border-border bg-card text-foreground font-display text-lg placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <button className="w-full mt-6 inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              <Heart className="w-5 h-5" />
              Doar €{custom || selected || 0}
            </button>

            {/* Payment methods */}
            <div className="mt-6">
              <p className="text-xs font-mono text-muted-foreground mb-3">{t('donate.methods')}</p>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4" /> Stripe
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground">
                  <Smartphone className="w-4 h-4" /> MB Way
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground">
                  <Landmark className="w-4 h-4" /> Transferência
                </div>
              </div>
            </div>
          </div>

          {/* Where money goes */}
          <div>
            <h3 className="font-display text-xl font-semibold mb-6">{t('donate.where')}</h3>
            <div className="space-y-4">
              {breakdownData.map(item => (
                <div key={item.key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {t(`donate.breakdown.${item.key}`)}
                    </span>
                    <span className="text-sm font-mono text-muted-foreground">{item.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-card border border-border rounded-xl">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">100% Transparência</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Todos os gastos são publicados trimestralmente. Relatórios disponíveis para download.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}