import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { useSupabaseAuth } from '@/lib/SupabaseAuth';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import ForumWordmark from '@/components/landing/ForumWordmark';

const YELLOW = '#d4a017';
const BLUE   = '#5b8e3a';
const FAINT  = '#ffffff';
const SOFT   = '#ffffff';

export default function Login() {
  const { t } = useI18n();
  const { signInWithMagicLink } = useSupabaseAuth();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/comunidade/foro';

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const redirectTo = window.location.origin + returnTo;
      const { error: err } = await signInWithMagicLink(email, redirectTo);
      if (err) throw err;
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send magic link');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      <div className="max-w-[480px] mx-auto px-6 sm:px-8" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>

        <ForumWordmark />

        <Link
          to="/comunidade/foro"
          className="font-mono uppercase mb-8 inline-block"
          style={{ fontSize: 13, letterSpacing: '0.18em', color: FAINT }}
        >
          ← {t('forum.thread.breadcrumb')}
        </Link>

        <h1
          className="font-data m-0 mb-8"
          style={{ fontSize: 'clamp(28px, 4.5vw, 36px)', fontWeight: 400, color: '#fff', letterSpacing: '-0.01em' }}
        >
          {t('forum.login.title')}
        </h1>

        {!isSupabaseConfigured() && (
          <p className="font-mono uppercase mb-6" style={{ fontSize: 13, letterSpacing: '0.16em', color: YELLOW }}>
            {t('forum.login.notConfigured')}
          </p>
        )}

        {sent ? (
          <div>
            <p className="font-data m-0 mb-2" style={{ fontSize: 18, color: '#fff', lineHeight: 1.5 }}>
              {t('forum.login.linkSent')}
            </p>
            <p className="m-0" style={{ fontSize: 15, color: SOFT, lineHeight: 1.6 }}>
              {t('forum.login.checkInbox', { email })}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="m-0 mb-6" style={{ fontSize: 16, color: SOFT, lineHeight: 1.6 }}>
              {t('forum.login.intro')}
            </p>

            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('forum.login.emailPlaceholder')}
              disabled={!isSupabaseConfigured() || submitting}
              className="block w-full mb-4 px-4 py-3 transition-colors"
              style={{
                background: 'transparent',
                border: '0.5px solid rgba(255, 255, 255, 0.30)',
                borderRadius: 4,
                color: '#fff',
                fontSize: 16,
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#fff')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.30)')}
            />

            {error && (
              <p className="font-mono uppercase mb-4" style={{ fontSize: 13, letterSpacing: '0.16em', color: '#ef4444' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!email || submitting || !isSupabaseConfigured()}
              className="w-full transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: BLUE, color: '#fff', padding: '1rem', fontSize: 16, fontWeight: 500 }}
            >
              {submitting ? t('forum.login.sending') : t('forum.login.send')}
            </button>

            <p className="font-mono uppercase text-center mt-6 m-0" style={{ fontSize: 12, letterSpacing: '0.16em', color: FAINT }}>
              {t('forum.login.privacy')}
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
