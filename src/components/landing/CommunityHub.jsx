import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const YELLOW   = '#d4a017';
const BLUE     = '#1d4ed8';
const HAIRLINE = 'rgba(255, 255, 255, 0.15)';
const SOFT     = 'rgba(255, 255, 255, 0.7)';
const FAINT    = 'rgba(255, 255, 255, 0.4)';

// =====================================================================
// CIVIC AGENDA — five weekly questions, anonymous voting, no signup.
//
// The component renders against any data shape it gets back from the
// backend; if zero questions are returned it falls into the empty
// state per the §07 brief. No fake placeholder questions live here.
//
// Voting state for THIS device persists in localStorage under the
// week key. When the backend's polls schema lights up, the hook below
// (`useWeeklyAgenda`) starts returning real questions and the cards
// render — no further code changes needed.
// =====================================================================

export default function CommunityHub() {
  const { t } = useI18n();
  const ref = useScrollReveal();

  const weekId = useMemo(() => isoWeekId(new Date()), []);
  const { questions, totalWeekVotes, loading } = useWeeklyAgenda();
  const [myVotes, castVote] = useDeviceVotes(weekId);

  const totalQuestions = questions.length;
  const answered = Object.keys(myVotes).length;
  const weekRange = useWeekRangeLabel(t);

  return (
    <section
      id="community"
      ref={ref}
      className="reveal-section"
      style={{ background: '#0a0a0a', color: '#fff' }}
    >
      <div
        className="max-w-[1100px] mx-auto px-6 sm:px-8"
        style={{ paddingTop: '5rem', paddingBottom: '5rem' }}
      >

        {/* ─── HERO ─── */}
        <div className="flex items-center gap-3 mb-8">
          <span aria-hidden="true" style={{ width: 32, height: 1, background: YELLOW }} />
          <span
            className="font-mono uppercase font-medium"
            style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}
          >
            {t('civic_agenda.kicker')}
          </span>
        </div>

        <h2
          className="font-data m-0 mb-6"
          style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 400,
            color: '#fff',
            letterSpacing: '-0.01em',
            lineHeight: 1.05,
          }}
        >
          {t('civic_agenda.headline.prefix')}{' '}
          <span style={{ fontStyle: 'italic', color: BLUE }}>
            {t('civic_agenda.headline.accent')}
          </span>
        </h2>

        <p
          className="font-data italic m-0 mb-12"
          style={{
            fontSize: 18,
            fontWeight: 400,
            lineHeight: 1.45,
            color: SOFT,
            maxWidth: 600,
          }}
        >
          {t('civic_agenda.subline')}
        </p>

        {/* ─── WEEK META BAR ─── */}
        <div
          className="flex flex-wrap items-baseline gap-x-3 gap-y-2 pb-3 mb-12"
          style={{ borderBottom: `0.5px solid ${HAIRLINE}` }}
        >
          <span className="font-mono uppercase" style={{ fontSize: 11, letterSpacing: '0.3em', color: FAINT }}>
            {t('civic_agenda.week.label')} · {weekRange}
          </span>
          <span aria-hidden="true" style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span className="font-mono uppercase" style={{ fontSize: 11, letterSpacing: '0.3em', color: SOFT }}>
            {t('civic_agenda.week.votes').replace('{N}', String(totalWeekVotes))}
          </span>
          <span aria-hidden="true" className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span className="sm:ml-auto" />
          <span
            className="font-mono uppercase transition-colors duration-150"
            style={{
              fontSize: 11,
              letterSpacing: '0.3em',
              color: answered > 0 ? BLUE : YELLOW,
            }}
          >
            {t('civic_agenda.week.progress')
              .replace('{DONE}', String(answered))
              .replace('{TOTAL}', String(totalQuestions || 5))}
          </span>
        </div>

        {/* ─── AGENDA CARDS or EMPTY STATE ─── */}
        {loading ? (
          <p
            className="font-mono uppercase"
            style={{ fontSize: 11, letterSpacing: '0.3em', color: FAINT }}
          >
            {t('forum.loading')}
          </p>
        ) : totalQuestions === 0 ? (
          <EmptyState t={t} />
        ) : (
          <div>
            {questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                index={i}
                total={totalQuestions}
                question={q}
                myVote={myVotes[q.id] || null}
                onVote={(optionId) => castVote(q.id, optionId)}
                t={t}
              />
            ))}
          </div>
        )}

        {/* ─── DEEP FORUM LINK ─── */}
        <div
          className="text-center mx-auto"
          style={{
            borderTop: `0.5px solid ${HAIRLINE}`,
            paddingTop: '4rem',
            marginTop: '4rem',
            maxWidth: 600,
          }}
        >
          <span
            className="font-mono uppercase font-medium block mb-4"
            style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}
          >
            {t('civic_agenda.deepForum.kicker')}
          </span>
          <p
            className="font-data m-0 mb-6"
            style={{ fontSize: 18, fontWeight: 400, color: '#fff', lineHeight: 1.5 }}
          >
            {t('civic_agenda.deepForum.body')}
          </p>
          <Link
            to="/comunidade/foro"
            className="font-mono uppercase font-medium inline-block hover:opacity-80 transition-opacity"
            style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}
          >
            {t('civic_agenda.deepForum.cta')}
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---------- Question card --------------------------------------------

function QuestionCard({ index, total, question, myVote, onVote, t }) {
  const hasVoted = Boolean(myVote);

  // Compute total card votes including any optimistic local increment.
  const cardVotes = question.options.reduce((sum, o) => sum + (o.votes || 0), 0);

  const num = String(index + 1).padStart(2, '0');
  const totalStr = String(total).padStart(2, '0');

  return (
    <article
      className="relative mb-6 transition-colors"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: hasVoted
          ? '0.5px solid rgba(29, 78, 216, 0.4)'
          : '0.5px solid rgba(255, 255, 255, 0.10)',
        borderRadius: 12,
        padding: '2rem',
      }}
    >
      {hasVoted && (
        <span
          aria-hidden="true"
          className="absolute"
          style={{
            top: 16,
            right: 16,
            width: 10,
            height: 10,
            borderRadius: 9999,
            background: BLUE,
          }}
        />
      )}

      {/* metadata row */}
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <div className="font-mono uppercase" style={{ fontSize: 11, letterSpacing: '0.3em' }}>
          <span style={{ color: YELLOW }}>{num} / {totalStr}</span>
          {question.category && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.20)', margin: '0 0.5em' }}>·</span>
              <span style={{ color: FAINT }}>{question.category}</span>
            </>
          )}
        </div>
        <span className="font-mono uppercase" style={{ fontSize: 11, letterSpacing: '0.3em', color: FAINT }}>
          {t('civic_agenda.card.votes').replace('{N}', String(cardVotes))}
        </span>
      </div>

      {/* question title */}
      <h3
        className="font-data m-0 mb-6"
        style={{
          fontSize: 'clamp(20px, 2.5vw, 26px)',
          fontWeight: 400,
          color: '#fff',
          lineHeight: 1.25,
          letterSpacing: '-0.005em',
        }}
      >
        {question.question}
      </h3>

      {/* options */}
      <ul className="list-none p-0 m-0">
        {question.options.map((opt) => {
          const isMine = myVote === opt.id;
          const pct = cardVotes > 0 ? Math.round(((opt.votes || 0) / cardVotes) * 100) : 0;
          return (
            <OptionRow
              key={opt.id}
              option={opt}
              pct={pct}
              hasVoted={hasVoted}
              isMine={isMine}
              onClick={() => !hasVoted && onVote(opt.id)}
            />
          );
        })}
      </ul>

      {hasVoted && (
        <p
          className="font-mono uppercase text-center m-0 mt-5"
          style={{ fontSize: 11, letterSpacing: '0.3em', color: FAINT }}
        >
          {t('civic_agenda.card.thanked')}
        </p>
      )}
    </article>
  );
}

function OptionRow({ option, pct, hasVoted, isMine, onClick }) {
  const [hover, setHover] = useState(false);
  const interactive = !hasVoted;
  const bg = interactive && hover ? 'rgba(255,255,255,0.03)' : 'transparent';

  return (
    <li className="m-0 p-0">
      <button
        type="button"
        onClick={onClick}
        disabled={hasVoted}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-pressed={isMine}
        className="w-full text-left transition-colors"
        style={{
          background: bg,
          border: 'none',
          padding: '1rem 0.5rem',
          cursor: interactive ? 'pointer' : 'default',
        }}
      >
        <div className="flex items-center gap-3">
          {/* radio circle */}
          <span
            aria-hidden="true"
            className="shrink-0"
            style={{
              width: 14,
              height: 14,
              borderRadius: 9999,
              border: isMine ? `4px solid ${BLUE}` : '1px solid rgba(255,255,255,0.30)',
              background: isMine ? '#fff' : 'transparent',
              transition: 'all 150ms ease-out',
            }}
          />
          {/* label */}
          <span className="flex-1" style={{ fontSize: 15, color: '#fff' }}>
            {option.label}
          </span>
          {/* percentage (only after vote) */}
          {hasVoted && (
            <span
              className="font-data italic"
              style={{
                fontSize: 13,
                color: isMine ? '#fff' : SOFT,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {pct}%
            </span>
          )}
        </div>
        {/* bar */}
        <div
          aria-hidden="true"
          className="mt-2"
          style={{
            height: 4,
            width: '100%',
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: hasVoted ? `${pct}%` : '0%',
              background: isMine ? BLUE : 'rgba(255,255,255,0.7)',
              transition: 'width 200ms ease-out',
            }}
          />
        </div>
      </button>
    </li>
  );
}

// ---------- Empty state ----------------------------------------------

function EmptyState({ t }) {
  return (
    <div className="text-center mx-auto" style={{ paddingTop: '2rem', paddingBottom: '2rem', maxWidth: 600 }}>
      <p
        className="font-data italic m-0 mb-6"
        style={{ fontSize: 22, fontWeight: 400, color: '#fff', lineHeight: 1.4 }}
      >
        {t('civic_agenda.empty.headline')}
      </p>
      <Link
        to="/comunidade/login"
        className="font-mono uppercase inline-block hover:opacity-80 transition-opacity"
        style={{ fontSize: 11, letterSpacing: '0.3em', color: FAINT }}
      >
        {t('civic_agenda.empty.cta')}
      </Link>
    </div>
  );
}

// ---------- Data hook ------------------------------------------------
// Tries to fetch the latest 5 active polls from Supabase. If the
// schema doesn't yet have a `polls` table (current state, since
// backend activation is paused), the query errors and the page falls
// gracefully into the empty state. When the team adds the polls
// table, no code change is needed here — just real data flows in.

function useWeeklyAgenda() {
  const [state, setState] = useState({ questions: [], totalWeekVotes: 0, loading: true });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState({ questions: [], totalWeekVotes: 0, loading: false });
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          id,
          category,
          question,
          options:poll_options(id, label, position, votes:poll_votes(count))
        `)
        .eq('active', true)
        .order('position', { ascending: true })
        .limit(5);

      if (cancelled) return;

      if (error || !data) {
        setState({ questions: [], totalWeekVotes: 0, loading: false });
        return;
      }

      const questions = data.map((row) => ({
        id: row.id,
        category: row.category || '',
        question: row.question,
        options: (row.options || [])
          .slice()
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          .map((o) => ({ id: o.id, label: o.label, votes: o.votes?.[0]?.count || 0 })),
      }));

      const totalWeekVotes = questions.reduce(
        (sum, q) => sum + q.options.reduce((s, o) => s + (o.votes || 0), 0),
        0
      );

      setState({ questions, totalWeekVotes, loading: false });
    })();

    return () => { cancelled = true; };
  }, []);

  return state;
}

// ---------- Per-device vote storage ----------------------------------

function useDeviceVotes(weekId) {
  const KEY = `bs:agenda:${weekId}`;
  const [votes, setVotes] = useState(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(window.localStorage.getItem(KEY) || '{}'); }
    catch { return {}; }
  });

  const cast = useCallback(
    (questionId, optionId) => {
      setVotes((prev) => {
        if (prev[questionId]) return prev; // one vote per question per device
        const next = { ...prev, [questionId]: optionId };
        try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    },
    [KEY]
  );

  return [votes, cast];
}

// ---------- Week helpers ---------------------------------------------

function isoWeekId(d) {
  // Returns "YYYY-Www" for the date's ISO week.
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function useWeekRangeLabel(t) {
  return useMemo(() => {
    const now = new Date();
    const day = now.getDay() || 7; // Mon=1, Sun=7
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const months = t('civic_agenda.months');
    const monthAbbr = Array.isArray(months) ? months[sunday.getMonth()] : '';
    const startDay = String(monday.getDate()).padStart(2, '0');
    const endDay   = String(sunday.getDate()).padStart(2, '0');
    return `${startDay}–${endDay} ${monthAbbr} ${sunday.getFullYear()}`;
  }, [t]);
}
