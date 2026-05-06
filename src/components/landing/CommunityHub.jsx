import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { MessageCircle, BarChart3, ArrowRight, Clock, ThumbsUp } from 'lucide-react';

const mockTopics = [
  { title: 'Resultados do questionário sobre estacionamento', replies: 42, time: '1d', hot: true },
  { title: 'Ciclovia da Boavista — análise de segurança',     replies: 23, time: '2h', hot: true },
  { title: 'Proposta de sinalização para Matosinhos',          replies: 15, time: '5h', hot: false },
  { title: 'Reunião com CMP — notas e próximos passos',        replies: 8,  time: '2d', hot: false },
];

const mockPolls = [
  { question: 'Qual a prioridade para 2025?',     options: ['Sinalização', 'Comboios', 'App'], votes: 234 },
  { question: 'Melhor horário para assembleia?',  options: ['Sábado manhã', 'Quarta 19h', 'Domingo 10h'], votes: 89 },
];

export default function CommunityHub({ onJoinClick }) {
  const { t } = useI18n();
  const ref = useScrollReveal();

  return (
    <section id="community" ref={ref} className="reveal-section py-24 sm:py-32 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <span className="font-mono text-xs tracking-widest uppercase text-accent">
            07 / 13 · {t('community.title')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black mt-4 tracking-tightest max-w-3xl">
            {t('community.title')}
          </h2>
          <p className="mt-4 text-foreground/60 max-w-xl font-body">
            {t('community.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-px bg-border">
          {/* Topics column */}
          <div className="lg:col-span-3 bg-background p-px">
            <div className="grid gap-px bg-border">
              <div className="bg-background px-6 sm:px-8 py-5 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-foreground/55" />
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground/55">
                  {t('community.topics')}
                </h3>
              </div>
              {mockTopics.map((topic, i) => {
                const isFeatured = i === 0;  // most-replied + hot
                return (
                  <article
                    key={i}
                    className={`relative bg-bone text-obsidian p-6 sm:p-7 cursor-pointer transition-transform duration-300 hover:-translate-y-0.5 ${isFeatured ? 'pl-7 sm:pl-8' : ''}`}
                  >
                    {isFeatured && (
                      <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-display text-lg font-black tracking-tightest text-obsidian leading-snug">
                          {topic.title}
                        </h4>
                        <div className="flex items-center gap-4 mt-3 font-mono text-[10px] uppercase tracking-widest text-obsidian/45">
                          <span className="flex items-center gap-1.5">
                            <MessageCircle className="w-3 h-3" /> {topic.replies}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> {topic.time}
                          </span>
                        </div>
                      </div>
                      {topic.hot && (
                        <span className="shrink-0 px-2 py-1 text-[9px] font-mono uppercase tracking-widest bg-destructive/15 text-destructive">
                          Hot
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Polls column */}
          <div className="lg:col-span-2 bg-background p-px">
            <div className="grid gap-px bg-border">
              <div className="bg-background px-6 sm:px-8 py-5 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-foreground/55" />
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-foreground/55">
                  {t('community.polls')}
                </h3>
              </div>
              {mockPolls.map((poll, i) => (
                <article key={i} className="bg-bone text-obsidian p-6 sm:p-7">
                  <h4 className="font-display text-base font-black tracking-tightest text-obsidian mb-4 leading-snug">
                    {poll.question}
                  </h4>
                  <div className="space-y-2">
                    {poll.options.map((opt, j) => (
                      <button
                        key={j}
                        className="w-full text-left px-4 py-2.5 text-sm border border-obsidian/15 text-obsidian/80 hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 mt-4 font-mono text-[10px] uppercase tracking-widest text-obsidian/45">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{poll.votes} votos</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-start">
          <button
            onClick={onJoinClick}
            className="inline-flex items-center gap-2 px-6 py-4 text-xs font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t('community.cta')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
