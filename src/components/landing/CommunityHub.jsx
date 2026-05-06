import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { MessageCircle, BarChart3, ArrowRight, Clock, ThumbsUp } from 'lucide-react';

const mockTopics = [
  { title: 'Ciclovia da Boavista — análise de segurança', replies: 23, time: '2h', hot: true },
  { title: 'Proposta de sinalização para Matosinhos', replies: 15, time: '5h', hot: false },
  { title: 'Resultados do questionário sobre estacionamento', replies: 42, time: '1d', hot: true },
  { title: 'Reunião com CMP — notas e próximos passos', replies: 8, time: '2d', hot: false },
];

const mockPolls = [
  { question: 'Qual a prioridade para 2025?', options: ['Sinalização', 'Comboios', 'App'], votes: 234 },
  { question: 'Melhor horário para assembleia?', options: ['Sábado manhã', 'Quarta 19h', 'Domingo 10h'], votes: 89 },
];

export default function CommunityHub({ onJoinClick }) {
  const { t } = useI18n();
  const ref = useScrollReveal();

  return (
    <section id="community" ref={ref} className="reveal-section py-24 sm:py-32 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <span className="font-mono text-xs tracking-widest uppercase text-primary">
            07 — {t('community.title')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mt-4 tracking-tight">
            {t('community.title')}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl">
            {t('community.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Topics */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-4 h-4 text-primary" />
              <h3 className="font-display text-lg font-semibold">{t('community.topics')}</h3>
            </div>
            <div className="space-y-2">
              {mockTopics.map((topic, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {topic.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> {topic.replies}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {topic.time}
                        </span>
                      </div>
                    </div>
                    {topic.hot && (
                      <span className="shrink-0 px-2 py-0.5 text-[10px] font-mono font-medium bg-destructive/10 text-destructive rounded-md">
                        HOT
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Polls */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="font-display text-lg font-semibold">{t('community.polls')}</h3>
            </div>
            <div className="space-y-4">
              {mockPolls.map((poll, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5">
                  <h4 className="text-sm font-medium text-foreground mb-3">{poll.question}</h4>
                  <div className="space-y-2">
                    {poll.options.map((opt, j) => (
                      <button
                        key={j}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{poll.votes} votos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onJoinClick}
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            {t('community.cta')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}