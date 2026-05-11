import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const YELLOW   = '#d4a017';
const BLUE     = '#B8E835';
const HAIRLINE = 'rgba(255, 255, 255, 0.15)';
// "Soft" and "Faint" are no longer gray — per the typo pass we keep
// secondary text PURE white and lean on size/weight (not opacity) for
// hierarchy. Structural meta graduates to YELLOW.
const SOFT     = '#ffffff';
const FAINT    = '#ffffff';

// =====================================================================
// CIVIC AGENDA — five weekly questions, anonymous voting, no signup.
//
// Data sources (in priority order, see useWeeklyAgenda below):
//   1. weekly_agenda view (server) — when supabase is configured AND
//      tables exist AND have an active week → real questions + counts
//   2. FALLBACK_QUESTIONS (this file) — when supabase is NOT configured
//      OR the query errors (e.g. tables missing) → renders the 5
//      canonical questions for week 2026-W19 with 0 votes everywhere
//   3. Empty state — when the server explicitly returns no rows
//      (between weekly cycles, schema applied, no active week)
//
// Per-device "I voted on Q for option O" lives in localStorage keyed
// by questionKey + optionKey so it survives the fallback→real-data
// transition cleanly. Server aggregates remain the source of truth
// for percentages once the backend is live.
//
// Delete FALLBACK_QUESTIONS the day the team commits to never having
// a configured-but-empty Supabase project. Until then, this guarantees
// the page never renders the empty state in production.
// =====================================================================

const FALLBACK_QUESTIONS = [
  {
    id: 'q1',
    questionKey: 'q1',
    categoryKey: 'ciclovias',
    options: [
      { id: 'q1-segregated', optionKey: 'segregated', votes: 0 },
      { id: 'q1-shared30',   optionKey: 'shared30',   votes: 0 },
      { id: 'q1-metrobus',   optionKey: 'metrobus',   votes: 0 },
      { id: 'q1-nothing',    optionKey: 'nothing',    votes: 0 },
    ],
  },
  {
    id: 'q2',
    questionKey: 'q2',
    categoryKey: 'micromobilidade',
    options: [
      { id: 'q2-likebikes',  optionKey: 'likebikes',  votes: 0 },
      { id: 'q2-exclusive',  optionKey: 'exclusive',  votes: 0 },
      { id: 'q2-banned',     optionKey: 'banned',     votes: 0 },
      { id: 'q2-regulation', optionKey: 'regulation', votes: 0 },
    ],
  },
  {
    id: 'q3',
    questionKey: 'q3',
    categoryKey: 'velocidade',
    options: [
      { id: 'q3-everywhere',  optionKey: 'everywhere',  votes: 0 },
      { id: 'q3-schoolsonly', optionKey: 'schoolsonly', votes: 0 },
      { id: 'q3-shared',      optionKey: 'shared',      votes: 0 },
      { id: 'q3-keep50',      optionKey: 'keep50',      votes: 0 },
    ],
  },
  {
    id: 'q4',
    questionKey: 'q4',
    categoryKey: 'escolas',
    options: [
      { id: 'q4-fullfunding', optionKey: 'fullfunding', votes: 0 },
      { id: 'q4-schoolself',  optionKey: 'schoolself',  votes: 0 },
      { id: 'q4-logistics',   optionKey: 'logistics',   votes: 0 },
      { id: 'q4-parents',     optionKey: 'parents',     votes: 0 },
    ],
  },
  {
    id: 'q5',
    questionKey: 'q5',
    categoryKey: 'campus',
    options: [
      { id: 'q5-university',  optionKey: 'university',  votes: 0 },
      { id: 'q5-cityhall',    optionKey: 'cityhall',    votes: 0 },
      { id: 'q5-partnership', optionKey: 'partnership', votes: 0 },
      { id: 'q5-students',    optionKey: 'students',    votes: 0 },
    ],
  },
];

export default function CommunityHub() {
  const { t } = useI18n();
  const ref = useScrollReveal();

  const weekId = useMemo(() => isoWeekId(new Date()), []);
  const [refreshKey, setRefreshKey] = useState(0);
  const { questions, totalWeekVotes, loading, isFallback } = useWeeklyAgenda(refreshKey);
  const [myVotes, castVote] = useDeviceVotes(weekId);

  const totalQuestions = questions.length;
  const answered = Object.keys(myVotes).length;
  const weekRange = useWeekRangeLabel(t);

  // When we're on the local fallback (server returned 0 server-side
  // votes), each local vote should bump the visible counter by 1 so
  // the hero meta bar reflects the user's own contribution.
  const displayedTotalVotes = totalWeekVotes > 0 ? totalWeekVotes : answered;

  const handleVote = useCallback(
    async (question, option) => {
      castVote(question.questionKey, option.optionKey);
      // Server insert uses whatever IDs we have. On the fallback path
      // these are synthetic strings so the insert FK-fails silently —
      // localStorage keeps the UX whole regardless.
      await submitVoteToServer(question.id, option.id);
      setRefreshKey((k) => k + 1);
    },
    [castVote]
  );

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
            style={{ fontSize: 13, letterSpacing: '0.16em', fontWeight: 500, color: YELLOW }}
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
          <span
            style={{
              display: 'inline-block',
              background: BLUE,
              color: YELLOW,
              fontStyle: 'italic',
              padding: '0 0.06em',
              lineHeight: 0.95,
              verticalAlign: 'baseline',
            }}
          >
            {t('civic_agenda.headline.accent')}
          </span>
        </h2>

        <p
          className="font-data italic m-0 mb-12"
          style={{
            fontSize: 22,
            fontWeight: 400,
            lineHeight: 1.45,
            color: '#ffffff',
            maxWidth: 640,
          }}
        >
          {t('civic_agenda.subline')}
        </p>

        {/* ─── WEEK META BAR ─── */}
        <div
          className="flex flex-wrap items-baseline gap-x-3 gap-y-2 pb-3 mb-12"
          style={{ borderBottom: `0.5px solid ${HAIRLINE}` }}
        >
          <span className="font-mono uppercase" style={{ fontSize: 13, letterSpacing: '0.16em', fontWeight: 500, color: '#ffffff' }}>
            {t('civic_agenda.week.label')} · {weekRange}
          </span>
          <span aria-hidden="true" style={{ color: '#d4a017' }}>·</span>
          <span className="font-mono uppercase" style={{ fontSize: 13, letterSpacing: '0.16em', fontWeight: 500, color: '#ffffff' }}>
            {t('civic_agenda.week.votes').replace('{N}', String(displayedTotalVotes))}
          </span>
          <span className="sm:ml-auto" />
          <span
            className="font-mono uppercase transition-colors duration-150"
            style={{
              fontSize: 13,
              letterSpacing: '0.18em',
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
            style={{ fontSize: 13, letterSpacing: '0.16em', fontWeight: 500, color: '#ffffff' }}
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
                myOptionKey={myVotes[q.questionKey] || null}
                onVote={(option) => handleVote(q, option)}
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
            style={{ fontSize: 13, letterSpacing: '0.16em', fontWeight: 500, color: YELLOW }}
          >
            {t('civic_agenda.deepForum.kicker')}
          </span>
          <p
            className="font-data m-0 mb-6"
            style={{ fontSize: 20, fontWeight: 400, color: '#fff', lineHeight: 1.5 }}
          >
            {t('civic_agenda.deepForum.body')}
          </p>
          <Link
            to="/comunidade/foro"
            className="font-mono uppercase font-medium inline-block hover:opacity-80 transition-opacity"
            style={{ fontSize: 13, letterSpacing: '0.16em', fontWeight: 500, color: YELLOW }}
          >
            {t('civic_agenda.deepForum.cta')}
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---------- Question card --------------------------------------------

function QuestionCard({ index, total, question, myOptionKey, onVote, t }) {
  const hasVoted = Boolean(myOptionKey);
  const num = String(index + 1).padStart(2, '0');
  const totalStr = String(total).padStart(2, '0');
  const qPath = `civic_agenda.questions.${question.questionKey}`;

  // Fallback / first-vote handling: if the server reports 0 votes but
  // the user just voted, treat their vote as the only data point so
  // we render 100% on their pick instead of a meaningless 0%.
  const serverVotes = question.options.reduce((sum, o) => sum + (o.votes || 0), 0);
  const useLocalCount = serverVotes === 0 && hasVoted;
  const cardVotes = useLocalCount ? 1 : serverVotes;

  function pctOf(opt) {
    if (!hasVoted) return 0;
    if (useLocalCount) return opt.optionKey === myOptionKey ? 100 : 0;
    return cardVotes > 0 ? Math.round(((opt.votes || 0) / cardVotes) * 100) : 0;
  }

  return (
    <article
      className="relative mb-6 transition-colors"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: hasVoted
          ? '0.5px solid rgba(184, 232, 53, 0.4)'
          : '0.5px solid rgba(255, 255, 255, 0.10)',
        borderRadius: 12,
        padding: 'clamp(1.25rem, 3vw, 2rem)',
      }}
    >
      {hasVoted && (
        <span
          aria-hidden="true"
          className="absolute"
          style={{
            top: 16,
            right: 16,
            width: 8,
            height: 8,
            borderRadius: 9999,
            background: BLUE,
          }}
        />
      )}

      {/* metadata row */}
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <div className="font-mono uppercase" style={{ fontSize: 13, letterSpacing: '0.18em' }}>
          <span style={{ color: YELLOW, fontWeight: 500 }}>{num} / {totalStr}</span>
          <span style={{ color: '#d4a017', margin: '0 0.5em' }}>·</span>
          <span style={{ color: FAINT }}>{t(`${qPath}.category`)}</span>
        </div>
        <span className="font-mono uppercase" style={{ fontSize: 13, letterSpacing: '0.16em', fontWeight: 500, color: '#ffffff' }}>
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
          lineHeight: 1.3,
          letterSpacing: '-0.005em',
        }}
      >
        {t(`${qPath}.title`)}
      </h3>

      {/* options */}
      <ul className="list-none p-0 m-0">
        {question.options.map((opt) => {
          const isMine = myOptionKey === opt.optionKey;
          return (
            <OptionRow
              key={opt.id}
              label={t(`${qPath}.options.${opt.optionKey}`)}
              pct={pctOf(opt)}
              hasVoted={hasVoted}
              isMine={isMine}
              onClick={() => !hasVoted && onVote(opt)}
            />
          );
        })}
      </ul>

      {hasVoted && (
        <p
          className="font-mono uppercase text-center m-0 mt-5"
          style={{ fontSize: 13, letterSpacing: '0.16em', fontWeight: 500, color: '#ffffff' }}
        >
          {t('civic_agenda.card.thanked')}
        </p>
      )}
    </article>
  );
}

function OptionRow({ label, pct, hasVoted, isMine, onClick }) {
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
          padding: '0.875rem 0.5rem',
          cursor: interactive ? 'pointer' : 'default',
        }}
      >
        <div className="flex items-center gap-3">
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
          <span className="flex-1" style={{ fontSize: 16, color: '#fff' }}>
            {label}
          </span>
          {hasVoted && (
            <span
              className="font-data italic"
              style={{
                fontSize: 14,
                color: isMine ? '#fff' : SOFT,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {pct}%
            </span>
          )}
        </div>
        <div
          aria-hidden="true"
          className="mt-2"
          style={{
            height: 3,
            width: '100%',
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: hasVoted ? `${pct}%` : '0%',
              background: isMine ? BLUE : 'rgba(255,255,255,0.6)',
              transition: 'width 200ms ease-out',
            }}
          />
        </div>
      </button>
    </li>
  );
}

// ---------- Empty state ----------------------------------------------
// Only rendered when the server explicitly says "no active week" (data
// is an empty array with no error). Fallback questions cover all other
// "no real data" paths so production never lands here pre-launch.

function EmptyState({ t }) {
  return (
    <div className="text-center mx-auto" style={{ paddingTop: '2rem', paddingBottom: '2rem', maxWidth: 600 }}>
      <p
        className="font-data italic m-0 mb-6"
        style={{ fontSize: 24, fontWeight: 400, color: '#fff', lineHeight: 1.4 }}
      >
        {t('civic_agenda.empty.headline')}
      </p>
      <Link
        to="/comunidade/login"
        className="font-mono uppercase inline-block hover:opacity-80 transition-opacity"
        style={{ fontSize: 13, letterSpacing: '0.16em', fontWeight: 500, color: '#d4a017' }}
      >
        {t('civic_agenda.empty.cta')}
      </Link>
    </div>
  );
}

// ---------- Data hook ------------------------------------------------
//
// Three-state resolution:
//   • Supabase not configured       → fallback (isFallback=true)
//   • Query errors (table missing)  → fallback (isFallback=true)
//   • Query OK, 0 rows              → empty (isFallback=false, []=questions)
//   • Query OK, N rows              → real (isFallback=false)

function useWeeklyAgenda(refreshKey = 0) {
  const [state, setState] = useState({
    questions: FALLBACK_QUESTIONS,
    totalWeekVotes: 0,
    loading: true,
    isFallback: true,
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState({ questions: FALLBACK_QUESTIONS, totalWeekVotes: 0, loading: false, isFallback: true });
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('weekly_agenda')
        .select('*')
        .order('position', { ascending: true })
        .limit(5);

      if (cancelled) return;

      // Tables missing / network error / RLS denial → keep the fallback
      if (error) {
        setState({ questions: FALLBACK_QUESTIONS, totalWeekVotes: 0, loading: false, isFallback: true });
        return;
      }

      // Server explicitly says "no active week" → real empty state
      if (!data || data.length === 0) {
        setState({ questions: [], totalWeekVotes: 0, loading: false, isFallback: false });
        return;
      }

      const questions = data.map((row) => ({
        id: row.id,
        questionKey: row.question_key,
        categoryKey: row.category_key,
        options: (row.options || []).map((o) => ({
          id: o.id,
          optionKey: o.option_key,
          votes: o.votes || 0,
        })),
      }));

      const totalWeekVotes = questions.reduce(
        (sum, q) => sum + q.options.reduce((s, o) => s + (o.votes || 0), 0),
        0
      );

      setState({ questions, totalWeekVotes, loading: false, isFallback: false });
    })();

    return () => { cancelled = true; };
  }, [refreshKey]);

  return state;
}

// ---------- Server-side vote write -----------------------------------

async function submitVoteToServer(questionId, optionId) {
  if (!isSupabaseConfigured()) return;
  try {
    const fingerprint = getDeviceFingerprint();
    await supabase.from('vote_records').insert({
      question_id: questionId,
      option_id: optionId,
      device_fingerprint: fingerprint,
    });
  } catch (_) {
    // Synthetic IDs from the fallback won't satisfy FK; duplicate
    // votes hit the unique constraint. Either way: localStorage is the
    // source of truth for "this device voted", we keep going quietly.
  }
}

function getDeviceFingerprint() {
  const KEY = 'bs:device-id';
  if (typeof window === 'undefined') return 'ssr';
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id =
        (window.crypto && typeof window.crypto.randomUUID === 'function')
          ? window.crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'no-storage';
  }
}

// ---------- Per-device vote storage ----------------------------------
// Keyed by questionKey + optionKey (stable across the fallback ↔ real
// data transition) so a vote cast against the local fallback survives
// once the seed lands and the IDs become real UUIDs.

function useDeviceVotes(weekId) {
  const KEY = `bs:agenda:${weekId}`;
  const [votes, setVotes] = useState(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(window.localStorage.getItem(KEY) || '{}'); }
    catch { return {}; }
  });

  const cast = useCallback(
    (questionKey, optionKey) => {
      setVotes((prev) => {
        if (prev[questionKey]) return prev;
        const next = { ...prev, [questionKey]: optionKey };
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
    const day = now.getDay() || 7;
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
