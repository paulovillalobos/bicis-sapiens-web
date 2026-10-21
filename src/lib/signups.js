// =====================================================================
// signups.js: submitSignup(), used by JoinModal and AppCTA.
//
// 1. Supabase `signups` table is the record. RLS allows anonymous
//    insert only; reads happen with the service role in the dashboard.
//    If this insert does not succeed, submitSignup throws, and the
//    caller must not tell the user they are signed up.
//
// 2. Formsubmit.co sends an email notification to the team, only after
//    the row is stored. It is a convenience: if it fails, the sign-up
//    is still stored, so that failure is not reported to the user.
//
// supabase-js does not throw on database errors (RLS denial, missing
// table, constraint violation): it resolves with `{ error }`. That
// value has to be checked explicitly.
// =====================================================================

import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const NOTIFY_EMAIL = 'imperiobaal69@gmail.com';
const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${NOTIFY_EMAIL}`;

export class SignupError extends Error {
  /** @param {string} message @param {unknown} [cause] */
  constructor(message, cause) {
    super(message);
    this.name = 'SignupError';
    this.cause = cause;
  }
}

/**
 * Store a sign-up. Resolves only when the row is in Supabase; otherwise
 * rejects with a SignupError.
 *
 * @param {{
 *   type: 'movement' | 'app_waitlist',
 *   email: string,
 *   name?: string,
 *   phone?: string,
 *   city?: string,
 *   language?: string,
 *   consent_given?: boolean,
 *   source?: string,
 * }} payload
 * @param {{ client?: any, fetchImpl?: typeof fetch }} [deps] for tests
 */
export async function submitSignup(payload, deps = {}) {
  const client = deps.client ?? (isSupabaseConfigured() ? supabase : null);
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;

  if (!client) {
    throw new SignupError('Sign-up storage is not configured');
  }

  const row = {
    type: payload.type,
    email: payload.email,
    name: payload.name || null,
    phone: payload.phone || null,
    city: payload.city || null,
    language: payload.language || null,
    consent_given: Boolean(payload.consent_given),
    source: payload.source || null,
  };

  let result;
  try {
    result = await client.from('signups').insert(row);
  } catch (err) {
    throw new SignupError('Could not reach sign-up storage', err);
  }
  if (result?.error) {
    throw new SignupError(`Sign-up was not stored: ${result.error.message}`, result.error);
  }

  // Not awaited: the user's confirmation should not wait on a third-party
  // email service once the row is stored.
  void notifyTeam(row, fetchImpl);
}

async function notifyTeam(row, fetchImpl) {
  const subjectPrefix = row.type === 'movement'
    ? 'Bicis Sapiens: novo membro'
    : 'Bicis Sapiens: app waitlist';
  try {
    await fetchImpl(FORMSUBMIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        _subject: `${subjectPrefix}, ${row.email}`,
        _template: 'table',
        _captcha: 'false',
        Type: row.type,
        Email: row.email,
        Name: row.name || '',
        Phone: row.phone || '',
        City: row.city || '',
        Language: row.language || '',
        Consent: row.consent_given ? 'yes' : 'no',
        Source: row.source || '',
        Submitted: new Date().toISOString(),
      }),
    });
  } catch (err) {
    // The row is already stored; a missing email notification is not the
    // user's problem. Log it so it shows up in the browser console.
    console.warn('Sign-up stored, but the team notification failed', err);
  }
}
