import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';

// ⚠️ PLACEHOLDER — REPLACE WITH REAL TEAM-CURATED POLL BEFORE LAUNCH.
// The pollId encodes the week. Bumping it changes the localStorage key,
// so a new question starts at zero votes for every device. In Part B
// this becomes a server-curated active poll fetched from the polls table.
const POLL_ID = 'porto-priority-bike-lane-2026-w19';
const POLL_OPTION_KEYS = ['boavista', 'santaCatarina', 'douro', 'other'];
const POLL_STORAGE_KEY = `bs:poll:${POLL_ID}`;

// ⚠️ PLACEHOLDER — REPLACE WITH REAL TEAM-CURATED THREADS BEFORE LAUNCH.
// Three editorial prompts the team posts every Monday. Static for now;
// Part B fetches from threads table where is_team_prompt=true.
const TEAM_THREAD_KEYS = ['parking', 'bikeBusPrivate', 'boavistaCritical'];

// localStorage shape, per device:
//   { selectedOption: string|null, votedAt: ISO, tally: { [optKey]: number } }
// Local tally only until Part B (Supabase or Base44) provides server-side
// aggregation. Each device sees its own count; that's intentional honesty.
function emptyPoll() {
  const tally = {};
  POLL_OPTION_KEYS.forEach((k) => { tally[k] = 0; });
  return { selectedOption: null, votedAt: null, tally };
}
function loadPoll() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(POLL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function savePoll(state) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(POLL_STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export default function CommunityHub({ onJoinClick }) {
  const { t } = useI18n();
  const ref = useScrollReveal();
  const [poll, setPoll] = useState(emptyPoll);

  useEffect(() => {
    const stored = loadPoll();
    if (stored) setPoll(stored);
  }, []);

  const totalVotes = Object.values(poll.tally).reduce((a, b) => a + b, 0);
  const hasVoted = !!poll.selectedOption;
  const threadCount = TEAM_THREAD_KEYS.length;
  const voteWord =
    totalVotes === 1 ? t('community.poll.voteSingular') : t('community.poll.votePlural');

  const handleVote = useCallback((optionKey) => {
    if (hasVoted) return;
    const next = {
      selectedOption: optionKey,
      votedAt: new Date().toISOString(),
      tally: { ...poll.tally, [optionKey]: (poll.tally[optionKey] || 0) + 1 },
    };
    savePoll(next);
    setPoll(next);
  }, [hasVoted, poll]);

  return (
    <section id="community" ref={ref} className="reveal-section bg-background py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 1 · KICKER */}
        <div className="flex items-center gap-3 mb-10">
          <span aria-hidden="true" className="block w-8 h-px bg-[#d4a017]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#d4a017] font-medium">
            {t('community.kicker')}
          </span>
        </div>

        {/* 2 · HEADER — two columns on lg, stack below */}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8 lg:gap-12 items-end mb-6">
          <h2 className="font-data text-[32px] lg:text-[44px] leading-[1.05] font-normal text-white max-w-2xl m-0">
            {t('community.headline.pre')}
            <em className="italic font-normal text-[#1d4ed8]">
              {t('community.headline.accent')}
            </em>
            {t('community.headline.post')}
          </h2>
          <p className="font-data italic text-[17px] leading-[1.6] text-white/70 m-0">
            {t('community.taglineLine1')}<br />
            {t('community.taglineLine2')}
          </p>
        </div>

        {/* Hairline + weekly stat line */}
        <div className="border-t border-white/15 pt-3 mb-12 flex justify-end">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/65">
            {totalVotes} {t('community.statsVoicesLabel')}
            <span aria-hidden="true"> · </span>
            {threadCount} {t('community.statsThreadsLabel')}
          </p>
        </div>

        {/* 3 · BLOCK 1 — DECISÃO EM ABERTO (anonymous voting) */}
        <div className="bg-white/[0.04] border-[0.5px] border-white/15 rounded-[8px] p-8 mb-16">
          <div className="flex items-baseline justify-between mb-5 font-mono text-[11px] uppercase tracking-[0.3em]">
            <span className="text-[#d4a017] font-medium">{t('community.poll.kicker')}</span>
            <span className="text-white/40">{t('community.poll.thisWeek')}</span>
          </div>

          <h3 className="font-data text-[26px] leading-[1.25] font-normal text-white m-0 mb-6">
            {t('community.poll.question')}
          </h3>

          <ul className="flex flex-col gap-4 list-none p-0 m-0">
            {POLL_OPTION_KEYS.map((key) => {
              const count = poll.tally[key] || 0;
              const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              const isSelected = poll.selectedOption === key;
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => handleVote(key)}
                    disabled={hasVoted && !isSelected}
                    aria-pressed={isSelected}
                    className={`w-full text-left flex items-start gap-3 px-2 py-2 transition-colors ${
                      hasVoted ? 'cursor-default' : 'cursor-pointer hover:bg-white/[0.03]'
                    } ${isSelected ? 'bg-white/[0.04]' : ''}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 flex-shrink-0 w-3.5 h-3.5 rounded-full border transition-colors ${
                        isSelected ? 'bg-white border-white' : 'border-white/30'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[14px] text-white">
                          {t(`community.poll.options.${key}`)}
                        </span>
                        <span className="font-data italic text-[13px] text-white tabular-nums">
                          {totalVotes > 0 ? `${pct}%` : '—'}
                        </span>
                      </div>
                      <span aria-hidden="true" className="block mt-2 h-1 bg-white/[0.08] overflow-hidden">
                        <span
                          className="block h-full bg-white/70 transition-[width] duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
            {totalVotes} {voteWord}
            <span aria-hidden="true"> · </span>
            {t('community.poll.voteWithoutAccount')}
          </div>
        </div>

        {/* 4 · BLOCK 2 — A EQUIPA PERGUNTA (3 editorial threads) */}
        <div className="mb-16">
          <div className="flex items-baseline gap-3 mb-6 font-mono text-[11px] uppercase tracking-[0.3em]">
            <span className="text-[#d4a017] font-medium">{t('community.threadsKicker')}</span>
            <span className="text-white/40">{t('community.threadsSubkicker')}</span>
          </div>

          <ul className="list-none p-0 m-0">
            {TEAM_THREAD_KEYS.map((tk) => (
              <li
                key={tk}
                className="border-b-[0.5px] border-white/15 last:border-b-0 pb-7 pt-7 first:pt-0"
              >
                <div className="flex items-baseline justify-end gap-2 mb-3 font-mono text-[10px] uppercase tracking-[0.3em]">
                  <span className="text-[#d4a017] font-medium">{t('community.byTeam')}</span>
                  <span aria-hidden="true" className="text-white/40">·</span>
                  <span className="text-white/40">{t(`community.threads.${tk}.time`)}</span>
                </div>
                <h4 className="font-data text-[22px] leading-[1.25] font-normal text-white m-0 mb-2 truncate">
                  {t(`community.threads.${tk}.title`)}
                </h4>
                <p className="text-[14px] leading-[1.6] text-white/65 m-0 mb-4 max-w-3xl">
                  {t(`community.threads.${tk}.description`)}
                </p>
                {/* Empty state — no fake responses. Replaces with real previews
                    in Part B once response data is available. */}
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <span className="font-data italic text-[14px] text-white/65">
                    {t('community.beFirst')}
                  </span>
                  <a
                    href="/comunidade/forum"
                    className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#d4a017] font-medium hover:text-[#e8b62a] transition-colors"
                  >
                    {t('community.respond')} →
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 5 · CTA ROW */}
        <div className="border-t-[0.5px] border-white/15 pt-12 grid lg:grid-cols-2 gap-3 lg:gap-4">
          {/* Primary — links to forum route. 404s until Part B wires it. */}
          <a
            href="/comunidade/forum"
            className="inline-flex items-center justify-center gap-2 px-5 py-5 text-[13px] font-medium bg-[#1d4ed8] text-white hover:bg-[#1944c0] transition-colors rounded-[4px]"
          >
            {t('community.ctaPrimary')} <span aria-hidden="true">→</span>
          </a>
          {/* Secondary — opens existing JoinModal until Part B builds the
              proper /comunidade/login magic-link flow. */}
          <button
            type="button"
            onClick={onJoinClick}
            className="inline-flex items-center justify-center gap-2 px-5 py-5 text-[13px] font-medium bg-transparent border-[0.5px] border-white/30 text-white hover:bg-white/[0.04] transition-colors rounded-[4px]"
          >
            {t('community.ctaSecondary')} <span aria-hidden="true" className="text-white/60">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
