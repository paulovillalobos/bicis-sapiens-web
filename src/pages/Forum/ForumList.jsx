import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { pt, enUS, es, fr } from 'date-fns/locale';
import { useI18n } from '@/lib/i18n';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/lib/SupabaseAuth';
import ForumWordmark from '@/components/landing/ForumWordmark';

const YELLOW   = '#d4a017';
const BLUE     = '#5b8e3a';
const HAIRLINE = 'rgba(255, 255, 255, 0.15)';
const FAINT    = '#ffffff';
const SOFT     = '#ffffff';

const LOCALES = { pt, en: enUS, es, fr };
const PAGE_SIZE = 30;

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

export default function ForumList() {
  const { t, lang } = useI18n();
  const { user, isAuthed } = useSupabaseAuth();

  const [threads, setThreads] = useState([]);
  const [myVotes, setMyVotes] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const loadThreads = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('threads_ranked')
      .select('*')
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (!error && data) {
      setThreads(data);
      setHasMore(data.length === PAGE_SIZE);
    }
    setLoading(false);
  }, [page]);

  const loadMyVotes = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setMyVotes(new Set());
      return;
    }
    const { data } = await supabase.rpc('my_thread_votes');
    if (data) setMyVotes(new Set(data));
  }, [user]);

  useEffect(() => { loadThreads(); }, [loadThreads]);
  useEffect(() => { loadMyVotes(); }, [loadMyVotes]);

  return (
    <main style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      <div className="max-w-[1100px] mx-auto px-6 sm:px-8" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>

        <ForumWordmark />

        {/* KICKER */}
        <div className="flex items-center gap-3 mb-8">
          <span aria-hidden="true" style={{ width: 32, height: 1, background: YELLOW }} />
          <span className="font-mono uppercase font-medium" style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}>
            {t('forum.kicker')}
          </span>
        </div>

        {/* HEADER */}
        <header
          className="grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 items-end pb-6 mb-12"
          style={{ borderBottom: `0.5px solid ${HAIRLINE}` }}
        >
          <div>
            <h1
              className="font-data m-0 mb-4"
              style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.1 }}
            >
              {t('forum.headline.prefix')}{' '}
              <span style={{ fontStyle: 'italic', color: BLUE }}>
                {t('forum.headline.accent')}
              </span>
            </h1>
            <p
              className="font-data m-0"
              style={{ fontSize: 16, fontStyle: 'italic', fontWeight: 400, lineHeight: 1.45, color: SOFT, maxWidth: 520 }}
            >
              {t('forum.tagline')}
            </p>
          </div>

          <div className="lg:justify-self-end">
            {isAuthed ? (
              <button
                onClick={() => setShowModal(true)}
                className="font-mono uppercase font-medium hover:opacity-80 transition-opacity"
                style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW, background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                {t('forum.action.create')}
              </button>
            ) : (
              <Link
                to="/comunidade/login"
                className="font-mono uppercase font-medium hover:opacity-80 transition-opacity"
                style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}
              >
                {t('forum.action.loginToParticipate')}
              </Link>
            )}
          </div>
        </header>

        {/* BODY */}
        {!isSupabaseConfigured() ? (
          <NotConfiguredNotice t={t} />
        ) : loading ? (
          <p className="font-mono uppercase" style={{ fontSize: 11, letterSpacing: '0.3em', color: FAINT }}>
            {t('forum.loading')}
          </p>
        ) : threads.length === 0 ? (
          <EmptyState t={t} isAuthed={isAuthed} onCreate={() => setShowModal(true)} />
        ) : (
          <ul className="list-none m-0 p-0">
            {threads.map((th) => (
              <ThreadRow
                key={th.id}
                thread={th}
                voted={myVotes.has(th.id)}
                lang={lang}
                t={t}
                onVoteToggled={loadThreads}
                onAuthRequired={() => {}}
              />
            ))}
          </ul>
        )}

        {/* PAGINATION */}
        {hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="font-mono uppercase hover:opacity-80 transition-opacity"
              style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW, background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              {t('forum.list.viewMore')}
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <CreateThreadModal
          t={t}
          user={user}
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); loadThreads(); }}
        />
      )}
    </main>
  );
}

// ---------- Thread row -----------------------------------------------

function ThreadRow({ thread, voted, lang, t, onVoteToggled }) {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [busy, setBusy] = useState(false);
  const locale = LOCALES[lang] || pt;

  const replyCount = thread.reply_count || 0;
  const repliesLabel =
    replyCount === 0 ? t('forum.thread.replies_zero')
    : replyCount === 1 ? t('forum.thread.replies_one')
    : t('forum.thread.replies_other').replace('{N}', replyCount);

  const timeAgo = formatDistanceToNow(new Date(thread.created_at), { addSuffix: true, locale });

  async function toggleVote(e) {
    e.stopPropagation();
    if (!user) {
      navigate('/comunidade/login?returnTo=/comunidade/foro');
      return;
    }
    if (busy) return;
    setBusy(true);
    if (voted) {
      await supabase.from('thread_votes').delete().eq('thread_id', thread.id).eq('user_id', user.id);
    } else {
      await supabase.from('thread_votes').insert({ thread_id: thread.id, user_id: user.id });
    }
    setBusy(false);
    onVoteToggled?.();
  }

  return (
    <li style={{ borderBottom: `0.5px solid ${HAIRLINE}` }}>
      <Link
        to={`/comunidade/foro/${thread.slug}`}
        className="flex gap-4 group"
        style={{ padding: '1.25rem 0', textDecoration: 'none', color: 'inherit' }}
      >
        {/* Vote column */}
        <div
          className="flex flex-col items-center justify-start shrink-0 select-none"
          style={{ width: 48, paddingTop: 2 }}
          onClick={toggleVote}
        >
          <svg
            width="14"
            height="12"
            viewBox="0 0 14 12"
            style={{
              fill: voted ? BLUE : 'none',
              stroke: voted ? BLUE : 'rgba(255,255,255,0.55)',
              strokeWidth: 1.4,
              cursor: 'pointer',
            }}
          >
            <polygon points="7,1 13,11 1,11" />
          </svg>
          <span
            className="mt-1"
            style={{ fontSize: 14, fontWeight: 500, color: voted ? BLUE : '#fff' }}
          >
            {thread.upvote_count || 0}
          </span>
        </div>

        {/* Content column */}
        <div className="flex-1 min-w-0">
          <h3
            className="font-data m-0 mb-1.5 group-hover:underline"
            style={{ fontSize: 18, fontWeight: 400, color: '#fff', lineHeight: 1.3 }}
          >
            {thread.title}
          </h3>
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1"
            style={{ fontSize: 12, color: FAINT }}
          >
            {thread.is_team_prompt && (
              <span className="font-mono uppercase" style={{ letterSpacing: '0.3em', color: YELLOW, fontSize: 10 }}>
                {t('forum.thread.byTeam')}
              </span>
            )}
            {!thread.is_team_prompt && thread.author_display_name && (
              <span>{thread.author_display_name}</span>
            )}
            <span>{timeAgo}</span>
            <span style={{ color: '#d4a017' }}>·</span>
            <span>{repliesLabel}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}

// ---------- Empty state ----------------------------------------------

function EmptyState({ t, isAuthed, onCreate }) {
  return (
    <div className="text-center" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <p
        className="font-data italic m-0 mb-6"
        style={{ fontSize: 18, fontWeight: 400, color: SOFT }}
      >
        {t('forum.list.empty')}
      </p>
      {isAuthed ? (
        <button
          onClick={onCreate}
          className="font-mono uppercase hover:opacity-80 transition-opacity"
          style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW, background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          {t('forum.action.create')}
        </button>
      ) : (
        <Link
          to="/comunidade/login"
          className="font-mono uppercase hover:opacity-80 transition-opacity"
          style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}
        >
          {t('forum.action.loginToParticipate')}
        </Link>
      )}
    </div>
  );
}

function NotConfiguredNotice({ t }) {
  return (
    <div className="text-center" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <p
        className="font-data italic m-0"
        style={{ fontSize: 18, fontWeight: 400, color: SOFT, lineHeight: 1.5 }}
      >
        {t('forum.notConfigured')}
      </p>
    </div>
  );
}

// ---------- Create thread modal --------------------------------------

function CreateThreadModal({ t, user, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const titleCount = title.length;
  const descCount = description.length;
  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit || !user) return;
    setError(null);
    setSubmitting(true);

    let slug = slugify(title);
    let attempt = 0;
    let inserted = null;
    while (attempt < 5 && !inserted) {
      const trySlug = attempt === 0 ? slug : `${slug}-${attempt + 1}`;
      const { data, error: err } = await supabase
        .from('threads')
        .insert({
          slug: trySlug,
          title: title.trim(),
          description: description.trim(),
          author_id: user.id,
          is_team_prompt: false,
        })
        .select()
        .single();
      if (!err) { inserted = data; break; }
      // unique violation on slug → retry with suffix
      if (err.code === '23505' && err.message.includes('slug')) { attempt++; continue; }
      setError(err.message); setSubmitting(false); return;
    }
    setSubmitting(false);
    if (inserted) {
      setSuccess(true);
      setTimeout(onCreated, 2200);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] mx-4"
        style={{ background: '#0a0a0a', border: `0.5px solid ${HAIRLINE}`, padding: '2.5rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="text-center" style={{ padding: '2rem 0' }}>
            <p className="font-data m-0" style={{ fontSize: 18, color: '#fff', lineHeight: 1.5 }}>
              {t('forum.create.success')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={title}
              maxLength={120}
              placeholder={t('forum.create.titlePlaceholder')}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="block w-full mb-6 transition-colors"
              style={{
                background: 'transparent',
                border: '0.5px solid rgba(255, 255, 255, 0.15)',
                padding: '12px 14px',
                color: '#fff',
                fontSize: 18,
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.30)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
            />

            <textarea
              value={description}
              maxLength={2000}
              placeholder={t('forum.create.descPlaceholder')}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full mb-2 transition-colors resize-y"
              style={{
                background: 'transparent',
                border: '0.5px solid rgba(255, 255, 255, 0.15)',
                padding: '12px 14px',
                color: 'rgba(255,255,255,0.85)',
                fontSize: 14,
                lineHeight: 1.6,
                minHeight: 200,
                outline: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.30)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
            />

            <p className="font-mono uppercase text-right m-0 mb-6" style={{ fontSize: 10, letterSpacing: '0.25em', color: FAINT }}>
              {titleCount + descCount} / {120 + 2000}
            </p>

            {error && (
              <p className="font-mono uppercase mb-4" style={{ fontSize: 11, letterSpacing: '0.25em', color: '#ef4444' }}>
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-6">
              <button
                type="button"
                onClick={onClose}
                className="font-mono uppercase hover:opacity-80 transition-opacity"
                style={{ fontSize: 11, letterSpacing: '0.25em', color: FAINT, background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                {t('forum.create.cancel')}
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: BLUE, color: '#fff', padding: '0.75rem 1.5rem', fontSize: 15, fontWeight: 500 }}
              >
                {submitting ? t('forum.create.submitting') : t('forum.create.submit')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
