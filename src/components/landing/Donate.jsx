import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { Heart, CreditCard, Landmark, Smartphone, Check } from 'lucide-react';

const tiers = [5, 25, 100];
// Featured tier: €25 — middle, default selected.
const FEATURED_TIER = 25;

const breakdownData = [
  { key: 'tech',       pct: 40, color: 'bg-primary' },
  { key: 'education',  pct: 25, color: 'bg-foreground/30' },
  { key: 'operations', pct: 20, color: 'bg-deep-blue' },
  { key: 'advocacy',   pct: 15, color: 'bg-light-blue' },
];

export default function Donate() {
  const { t } = useI18n();
  const ref = useScrollReveal();
  const [selected, setSelected] = useState(FEATURED_TIER);
  const [custom, setCustom] = useState('');

  return (
    <section id="donate" ref={ref} className="reveal-section py-24 sm:py-32 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <span className="font-mono text-xs tracking-widest uppercase text-accent">
            12 / 13 · {t('donate.title')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black mt-4 tracking-tightest max-w-3xl">
            {t('donate.title')}
          </h2>
          <p className="mt-4 text-foreground/60 max-w-xl font-body">
            {t('donate.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-px bg-border">
          {/* Donation tiers — cream card */}
          <div className="bg-bone text-obsidian p-8 sm:p-12">
            <p className="font-mono text-[10px] uppercase tracking-widest text-obsidian/55 mb-6">Escolhe um valor</p>

            <div className="grid grid-cols-3 gap-px bg-obsidian/12 mb-3">
              {tiers.map(amount => {
                const isSelected = selected === amount && !custom;
                const isFeatured = amount === FEATURED_TIER;
                return (
                  <button
                    key={amount}
                    onClick={() => { setSelected(amount); setCustom(''); }}
                    className={`relative py-7 text-center font-display text-3xl font-black tracking-tightest transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-bone text-obsidian hover:bg-obsidian/5'
                    } ${!isSelected && isFeatured ? 'pl-1' : ''}`}
                  >
                    {!isSelected && isFeatured && (
                      <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    €{amount}
                    {isFeatured && (
                      <span className={`absolute top-2 right-2 font-mono text-[8px] uppercase tracking-widest ${isSelected ? 'text-primary-foreground/70' : 'text-primary'}`}>
                        Sugerido
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian/45 font-display text-lg">€</span>
              <input
                type="number"
                value={custom}
                onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
                placeholder={t('donate.custom')}
                className="w-full pl-9 pr-4 py-3.5 border border-obsidian/15 bg-transparent text-obsidian font-display text-lg placeholder:text-obsidian/35 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-xs font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Heart className="w-4 h-4" />
              Doar €{custom || selected || 0}
            </button>

            <div className="mt-8 pt-6 border-t border-obsidian/12">
              <p className="font-mono text-[10px] uppercase tracking-widest text-obsidian/55 mb-3">{t('donate.methods')}</p>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 px-3 py-2 border border-obsidian/15 text-xs font-mono uppercase tracking-widest text-obsidian/65">
                  <CreditCard className="w-3.5 h-3.5" /> Stripe
                </div>
                <div className="flex items-center gap-2 px-3 py-2 border border-obsidian/15 text-xs font-mono uppercase tracking-widest text-obsidian/65">
                  <Smartphone className="w-3.5 h-3.5" /> MB Way
                </div>
                <div className="flex items-center gap-2 px-3 py-2 border border-obsidian/15 text-xs font-mono uppercase tracking-widest text-obsidian/65">
                  <Landmark className="w-3.5 h-3.5" /> Transferência
                </div>
              </div>
            </div>
          </div>

          {/* Where money goes — cream card with breakdown */}
          <div className="bg-bone text-obsidian p-8 sm:p-12">
            <p className="font-mono text-[10px] uppercase tracking-widest text-obsidian/55 mb-2">Onde vai o teu dinheiro</p>
            <h3 className="font-display text-2xl font-black tracking-tightest text-obsidian mb-8">{t('donate.where')}</h3>

            <div className="space-y-5">
              {breakdownData.map(item => (
                <div key={item.key}>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-display text-base font-black tracking-tightest text-obsidian">
                      {t(`donate.breakdown.${item.key}`)}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-obsidian/55">{item.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-obsidian/10 overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-1000`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-obsidian/12 flex items-start gap-3">
              <Check className="w-4 h-4 text-primary mt-1 shrink-0" />
              <div>
                <p className="font-display text-base font-black tracking-tightest text-obsidian">100% Transparência</p>
                <p className="text-sm text-obsidian/65 mt-1 leading-relaxed">
                  Todos os gastos são publicados trimestralmente. Relatórios disponíveis para download.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
