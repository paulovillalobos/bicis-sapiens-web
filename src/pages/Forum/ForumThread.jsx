import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { pt, enUS, es, fr } from 'date-fns/locale';
import { useI18n } from '@/lib/i18n';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/lib/SupabaseAuth';
import ForumWordmark from '@/components/landing/ForumWordmark';

const YELLOW   = '#d4a017';
const BLUE     = '#1d4ed8';
const HAIRLINE = 'rgba(255, 255, 255, 0.15)';
const FAINT    = 'rgba(255, 255, 255, 0.4)';
const SOFT     = 'rgba(255, 255, 255, 0.7)';
const BODY     = 'rgba(255, 255, 255, 0.85)';

const LOCALES = { pt, en: enUS, es, fr };
const VOTE_REVEAL_THRESHOLD = 5; // brief: hide reply vote count until 5

export default function ForumThread() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const { user, isAuthed } = useSupabaseAuth();
  const replyFormRef = useRef(null);

  const [thread, setThread] = useState(null);
  const [responses, setResponses] = useState([]);
  const [threadVoted, setThreadVoted] = useState(false);
  const [responseVotes, setResponseVotes] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sort, setSort] = useState('byVotes'); // byVotes | byNewest | byOldest
  const [replyingTo, setReplyingTo] = useState(null); // {id, author_name} | null
  const [shareToast, setShareToast] = useState(false);

  const locale = LOCALES[lang] || pt;

  // -------- Fetch ----------------------------------------------------
  const loadAll = useCallback(async () => {
    if (!isSupabaseConfigured() || !slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: th } = await supabase
      .from('threads_ranked')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (!th) { setNotFound(true); setLoading(false); return; }
    setThread(th);

    const { data: rs } = await supabase
      .from('responses')
      .select('id, body, depth, parent_response_id, created_at, author_id, users_profile(display_name, is_team)')
      .eq('thread_id', th.id)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: true });

    if (rs) {
      const ids = rs.map((r) => r.id);
      let voteCounts = {};
      if (ids.length > 0) {
        const { data: vc } = await supabase
          .from('response_votes')
          .select('response_id')
          .in('response_id', ids);
        if (vc) {
          for (const v of vc) {
            voteCounts[v.response_id] = (voteCounts[v.response_id] || 0) + 1;
          }
        }
      }
      const enriched = rs.map((r) => ({
        ...r,
        upvote_count: voteCounts[r.id] || 0,
        author_display_name: r.users_profile?.display_name,
        author_is_team: r.users_profile?.is_team || false,
      }));
      setResponses(enriched);
    }

    if (user) {
      const [{ data: tv }, { data: rv }] = await Promise.all([
        supabase.from('thread_votes').select('thread_id').eq('thread_id', th.id).eq('user_id', user.id),
        supabase.rpc('my_response_votes'),
      ]);
      setThreadVoted((tv?.length || 0) > 0);
      setResponseVotes(new Set(rv || []));
    } else {
      setThreadVoted(false);
      setResponseVotes(new Set());
    }

    setLoading(false);
  }, [slug, user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // -------- Tree build with sort -------------------------------------
  const tree = useMemo(() => {
    const byParent = new Map();
    for (const r of responses) {
      const k = r.parent_response_id || 'root';
      if (!byParent.has(k)) byParent.set(k, []);
      byParent.get(k).push(r);
    }
    const sorter = {
      byVotes: (a, b) => {
        const ageA = (Date.now() - new Date(a.created_at).getTime()) / 3600000 + 2;
        const ageB = (Date.now() - new Date(b.created_at).getTime()) / 3600000 + 2;
        return (b.upvote_count / Math.pow(ageB, 1.5)) - (a.upvote_count / Math.pow(ageA, 1.5));
      },
      byNewest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      byOldest: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    }[sort];
    for (const arr of byParent.values()) arr.sort(sorter);
    return byParent;
  }, [responses, sort]);

  const totalReplies = responses.length;

  // -------- Actions --------------------------------------------------
  async function toggleThreadVote() {
    if (!user) { navigate(`/comunidade/login?returnTo=/comunidade/foro/${slug}`); return; }
    if (threadVoted) {
      await supabase.from('thread_votes').delete().eq('thread_id', thread.id).eq('user_id', user.id);
    } else {
      await supabase.from('thread_votes').insert({ thread_id: thread.id, user_id: user.id });
    }
    loadAll();
  }

  async function toggleResponseVote(rid) {
    if (!user) { navigate(`/comunidade/login?returnTo=/comunidade/foro/${slug}`); return; }
    const voted = responseVotes.has(rid);
    if (voted) {
      await supabase.from('response_votes').delete().eq('response_id', rid).eq('user_id', user.id);
    } else {
      await supabase.from('response_votes').insert({ response_id: rid, user_id: user.id });
    }
    loadAll();
  }

  function copyShareLink() {
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 1800);
  }

  function startReply(target) {
    setReplyingTo(target); // null = top-level, or {id, author_name}
    setTimeout(() => replyFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 50);
    setTimeout(() => replyFormRef.current?.querySelector('textarea')?.focus(), 400);
  }

  async function submitReply(body) {
    if (!user || !body.trim()) return null;
    const { data, error } = await supabase
      .from('responses')
      .insert({
        thread_id: thread.id,
        parent_response_id: replyingTo?.id || null,
        body: body.trim(),
        author_id: user.id,
      })
      .select()
      .single();
    if (error) return error;
    setReplyingTo(null);
    loadAll();
    return null;
  }

  // -------- Render ---------------------------------------------------
  if (!isSupabaseConfigured()) {
    return <ShellMessage title={t('forum.notConfiguredTitle')} body={t('forum.notConfigured')} />;
  }
  if (loading) {
    return <ShellMessage body={t('forum.loading')} />;
  }
  if (notFound) {
    return <ShellMessage title="404" body={t('forum.threadNotFound')} backTo="/comunidade/foro" backLabel={t('forum.thread.breadcrumb')} />;
  }

  const timeAgo = formatDistanceToNow(new Date(thread.created_at), { addSuffix: true, locale });
  const repliesHeading = t('forum.replies.heading').replace('{N}', totalReplies);

  return (
    <main style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      <div className="max-w-[800px] mx-auto px-6 sm:px-8" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>

        <ForumWordmark />

        {/* Breadcrumb */}
        <div className="font-mono uppercase mb-8" style={{ fontSize: 11, letterSpacing: '0.3em', color: FAINT }}>
          <Link to="/comunidade/foro" style={{ color: YELLOW }}>{t('forum.thread.breadcrumb')}</Link>
          <span style={{ margin: '0 0.5em' }}>/</span>
          <span>{t('forum.thread.thread')}</span>
        </div>

        {/* Thread header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4" style={{ fontSize: 12, color: FAINT }}>
            {thread.is_team_prompt && (
              <span className="font-mono uppercase" style={{ letterSpacing: '0.3em', color: YELLOW, fontSize: 10 }}>
                {t('forum.thread.byTeam')}
              </span>
            )}
            <Avatar name={thread.author_display_name} />
            <span style={{ color: '#fff', fontSize: 12 }}>{thread.author_display_name || '—'}</span>
            <span>{timeAgo}</span>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
            <span>{repliesHeading.toLowerCase()}</span>
          </div>

          <h1
            className="font-data m-0 mb-6"
            style={{ fontSize: 'clamp(24px, 3.6vw, 32px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.2 }}
          >
            {thread.title}
          </h1>

          <div
            className="m-0 mb-6 whitespace-pre-wrap"
            style={{ fontSize: 16, lineHeight: 1.7, color: BODY }}
          >
            <Linkify text={thread.description} />
          </div>

          {/* Vote + Reply + Share row */}
          <div className="flex items-center gap-6 flex-wrap">
            <button
              onClick={toggleThreadVote}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <svg width="14" height="12" viewBox="0 0 14 12"
                style={{ fill: threadVoted ? BLUE : 'none', stroke: threadVoted ? BLUE : 'rgba(255,255,255,0.55)', strokeWidth: 1.4 }}>
                <polygon points="7,1 13,11 1,11" />
              </svg>
              <span style={{ fontSize: 16, fontWeight: 500, color: threadVoted ? BLUE : '#fff' }}>
                {thread.upvote_count || 0}
              </span>
            </button>

            <button
              onClick={() => startReply(null)}
              className="font-mono uppercase hover:opacity-80 transition-opacity"
              style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW, background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              {t('forum.thread.reply')}
            </button>

            <div style={{ flex: 1 }} />

            <button
              onClick={copyShareLink}
              className="font-mono uppercase hover:opacity-80 transition-opacity"
              style={{ fontSize: 11, letterSpacing: '0.3em', color: FAINT, background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              {shareToast ? t('forum.thread.shareCopied') : t('forum.thread.share')}
            </button>
          </div>
        </header>

        <div style={{ borderTop: `0.5px solid ${HAIRLINE}` }} />

        {/* Replies section */}
        <section style={{ paddingTop: '2.5rem' }}>
          <div className="flex items-baseline justify-between mb-6 flex-wrap gap-3">
            <span className="font-mono uppercase font-medium" style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}>
              {repliesHeading}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="font-mono uppercase"
              style={{
                fontSize: 11, letterSpacing: '0.25em', color: FAINT,
                background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="byVotes" style={{ background: '#0a0a0a' }}>{t('forum.replies.sort.byVotes')}</option>
              <option value="byNewest" style={{ background: '#0a0a0a' }}>{t('forum.replies.sort.byNewest')}</option>
              <option value="byOldest" style={{ background: '#0a0a0a' }}>{t('forum.replies.sort.byOldest')}</option>
            </select>
          </div>

          {totalReplies === 0 && (
            <p className="font-data italic m-0 mb-12" style={{ fontSize: 16, color: SOFT }}>
              {t('forum.replies.empty')}
            </p>
          )}

          {(tree.get('root') || []).map((r) => (
            <ReplyNode
              key={r.id}
              reply={r}
              tree={tree}
              t={t}
              locale={locale}
              user={user}
              voted={responseVotes.has(r.id)}
              onVote={() => toggleResponseVote(r.id)}
              onReply={(target) => startReply(target)}
              voteSet={responseVotes}
              onAnyVote={toggleResponseVote}
            />
          ))}
        </section>

        {/* Reply form */}
        <div ref={replyFormRef} style={{ borderTop: `0.5px solid ${HAIRLINE}`, paddingTop: '2.5rem', marginTop: '2.5rem' }}>
          {isAuthed ? (
            <ReplyForm
              t={t}
              replyingTo={replyingTo}
              onCancel={() => setReplyingTo(null)}
              onSubmit={submitReply}
            />
          ) : (
            <LoginPrompt t={t} returnTo={`/comunidade/foro/${slug}`} />
          )}
        </div>

      </div>
    </main>
  );
}

// ---------- Reply tree node ------------------------------------------

function ReplyNode({ reply, tree, t, locale, user, voted, onVote, onReply, voteSet, onAnyVote }) {
  const children = tree.get(reply.id) || [];
  const timeAgo = formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale });
  const showCount = reply.upvote_count >= VOTE_REVEAL_THRESHOLD;

  return (
    <div
      className="flex gap-3"
      style={{
        marginBottom: '1.5rem',
        paddingLeft: reply.depth > 0 ? `${reply.depth * 1}rem` : 0,
        borderLeft: reply.depth > 0 ? '0.5px solid rgba(255,255,255,0.10)' : 'none',
      }}
    >
      {/* Vote column */}
      <div className="flex flex-col items-center shrink-0 select-none" style={{ width: 32, paddingTop: 4 }}>
        <button
          onClick={onVote}
          aria-label="upvote"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <svg width="12" height="10" viewBox="0 0 14 12"
            style={{ fill: voted ? BLUE : 'none', stroke: voted ? BLUE : 'rgba(255,255,255,0.55)', strokeWidth: 1.4 }}>
            <polygon points="7,1 13,11 1,11" />
          </svg>
        </button>
        {showCount && (
          <span className="mt-1" style={{ fontSize: 12, fontWeight: 500, color: voted ? BLUE : '#fff' }}>
            {reply.upvote_count}
          </span>
        )}
      </div>

      {/* Body column */}
      <div className="flex-1 min-w-0" style={{ paddingLeft: reply.depth > 0 ? '0.5rem' : 0 }}>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mb-1.5" style={{ fontSize: 11, color: FAINT }}>
          <Avatar name={reply.author_display_name} size={20} />
          <span style={{ color: '#fff', fontSize: 12 }}>{reply.author_display_name || '—'}</span>
          <span>{timeAgo}</span>
          {reply.author_is_team && (
            <span className="font-mono uppercase" style={{ letterSpacing: '0.3em', color: YELLOW, fontSize: 9 }}>
              {t('forum.reply.teamBadge')}
            </span>
          )}
        </div>

        <div className="m-0 whitespace-pre-wrap mb-2" style={{ fontSize: 14, lineHeight: 1.6, color: BODY }}>
          <Linkify text={reply.body} />
        </div>

        <div className="flex items-center gap-4 font-mono uppercase" style={{ fontSize: 10, letterSpacing: '0.25em', color: FAINT }}>
          {reply.depth < 2 && user && (
            <button
              onClick={() => onReply({ id: reply.id, author_name: reply.author_display_name })}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: YELLOW, letterSpacing: '0.25em', fontSize: 10 }}
              className="font-mono uppercase hover:opacity-80 transition-opacity"
            >
              {t('forum.thread.reply')}
            </button>
          )}
        </div>

        {children.length > 0 && (
          <div className="mt-4">
            {children.map((c) => (
              <ReplyNode
                key={c.id}
                reply={c}
                tree={tree}
                t={t}
                locale={locale}
                user={user}
                voted={voteSet.has(c.id)}
                onVote={() => onAnyVote(c.id)}
                onReply={onReply}
                voteSet={voteSet}
                onAnyVote={onAnyVote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Reply form ------------------------------------------------

function ReplyForm({ t, replyingTo, onCancel, onSubmit }) {
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    const err = await onSubmit(body);
    setSubmitting(false);
    if (err) { setError(err.message || 'Could not submit'); return; }
    setBody('');
  }

  return (
    <form onSubmit={handleSubmit}>
      {replyingTo && (
        <div className="flex items-center gap-3 mb-3 font-mono uppercase" style={{ fontSize: 10, letterSpacing: '0.25em', color: FAINT }}>
          <span>{t('forum.reply.replyingTo').replace('{name}', replyingTo.author_name || '—')}</span>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: YELLOW, fontSize: 10, letterSpacing: '0.25em' }}
            className="font-mono uppercase"
          >
            ✕
          </button>
        </div>
      )}

      <textarea
        value={body}
        maxLength={2000}
        placeholder={t('forum.reply.placeholder')}
        onChange={(e) => setBody(e.target.value)}
        className="block w-full mb-2 transition-colors resize-y"
        style={{
          background: 'transparent',
          border: '0.5px solid rgba(255, 255, 255, 0.30)',
          borderRadius: 4,
          padding: '12px 14px',
          color: BODY,
          fontSize: 14,
          lineHeight: 1.6,
          minHeight: 80,
          maxHeight: 400,
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="font-mono uppercase m-0" style={{ fontSize: 10, letterSpacing: '0.25em', color: FAINT }}>
          {t('forum.reply.moderationNote')}
        </p>
        <p className="font-mono uppercase m-0" style={{ fontSize: 10, letterSpacing: '0.25em', color: FAINT }}>
          {body.length} / 2000
        </p>
      </div>

      {error && (
        <p className="font-mono uppercase mt-3" style={{ fontSize: 11, letterSpacing: '0.25em', color: '#ef4444' }}>
          {error}
        </p>
      )}

      <div className="flex justify-end mt-4">
        <button
          type="submit"
          disabled={!body.trim() || submitting}
          className="hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: BLUE, color: '#fff', padding: '0.75rem 1.5rem', fontSize: 14, fontWeight: 500 }}
        >
          {submitting ? t('forum.reply.submitting') : t('forum.reply.submit')}
        </button>
      </div>
    </form>
  );
}

// ---------- Login prompt + helpers ------------------------------------

function LoginPrompt({ t, returnTo }) {
  return (
    <div className="text-center" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
      <p className="font-data m-0 mb-4" style={{ fontSize: 16, color: SOFT, lineHeight: 1.5 }}>
        {t('forum.reply.loginPrompt')}
      </p>
      <Link
        to={`/comunidade/login?returnTo=${encodeURIComponent(returnTo)}`}
        className="font-mono uppercase hover:opacity-80 transition-opacity"
        style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}
      >
        {t('forum.reply.loginCta')}
      </Link>
    </div>
  );
}

function Avatar({ name, size = 28 }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: 9999,
        background: 'rgba(255,255,255,0.10)',
        border: '0.5px solid rgba(255,255,255,0.15)',
        color: '#fff',
        fontSize: Math.round(size * 0.4),
        fontWeight: 500,
      }}
    >
      {initial}
    </span>
  );
}

function Linkify({ text }) {
  const parts = (text || '').split(/(\bhttps?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a key={i} href={p} target="_blank" rel="noopener noreferrer" style={{ color: BLUE, textDecoration: 'underline' }}>
            {p}
          </a>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </>
  );
}

function ShellMessage({ title, body, backTo, backLabel }) {
  return (
    <main style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      <div className="max-w-[640px] mx-auto px-6 sm:px-8" style={{ paddingTop: '3rem' }}>
        <ForumWordmark />
      </div>
      <div className="max-w-[640px] mx-auto px-6 sm:px-8 text-center" style={{ paddingTop: '5rem' }}>
        {title && (
          <h1 className="font-data m-0 mb-4" style={{ fontSize: 28, fontWeight: 400, color: '#fff' }}>
            {title}
          </h1>
        )}
        {body && (
          <p className="font-data italic m-0 mb-8" style={{ fontSize: 16, color: SOFT, lineHeight: 1.6 }}>
            {body}
          </p>
        )}
        {backTo && (
          <Link to={backTo} className="font-mono uppercase" style={{ fontSize: 11, letterSpacing: '0.3em', color: YELLOW }}>
            ← {backLabel}
          </Link>
        )}
      </div>
    </main>
  );
}
