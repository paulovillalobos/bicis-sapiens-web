// =====================================================================
// signups.js — dual-write submitSignup() used by JoinModal + AppCTA.
//
// Each signup gets written to TWO places in parallel:
//
//   1. Supabase `signups` table  — persistent record, queryable from the
//      Supabase dashboard (Table Editor → signups). RLS allows anon
//      insert only; reads happen via the service_role key in dashboard.
//
//   2. Formsubmit.co AJAX endpoint — instant email notification to
//      imperiobaal69@gmail.com with all submitted fields. Free, no
//      account, but the recipient must click an activation link
//      emailed on the FIRST submission before subsequent ones land.
//
// Both writes are fire-and-forget for UX — we surface success on the
// frontend regardless of whether either path fails (network glitch,
// Formsubmit rate limit, etc.) because the user's experience shouldn't
// hinge on the secondary email channel. Supabase is the source of truth.
// =====================================================================

import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const NOTIFY_EMAIL = 'imperiobaal69@gmail.com';
const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${NOTIFY_EMAIL}`;

/**
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
 */
export async function submitSignup(payload) {
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

  // 1. Supabase — source of truth
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('signups').insert(row);
    } catch (_) {
      // table missing / RLS denial / network — swallow, Formsubmit still tries
    }
  }

  // 2. Formsubmit — email notification (fire-and-forget)
  const subjectPrefix = row.type === 'movement'
    ? 'Bicis Sapiens — Novo membro'
    : 'Bicis Sapiens — App waitlist';

  try {
    await fetch(FORMSUBMIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        _subject: `${subjectPrefix} — ${row.email}`,
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
  } catch (_) {
    // network error — silent; Supabase still has the record
  }
}
