import { describe, expect, it, vi } from 'vitest';
import { SignupError, submitSignup } from './signups';

vi.mock('@/lib/supabaseClient', () => ({
  supabase: null,
  isSupabaseConfigured: () => false,
}));

const payload = { type: 'movement', email: 'ana@example.org', name: 'Ana', consent_given: true };

function fakeClient(insertResult) {
  const insert = vi.fn(() =>
    insertResult instanceof Error ? Promise.reject(insertResult) : Promise.resolve(insertResult),
  );
  return { client: { from: vi.fn(() => ({ insert })) }, insert };
}

describe('submitSignup', () => {
  it('resolves and notifies the team when the row is stored', async () => {
    const { client, insert } = fakeClient({ error: null });
    const fetchImpl = vi.fn(() => Promise.resolve({ ok: true }));

    await expect(submitSignup(payload, { client, fetchImpl })).resolves.toBeUndefined();

    expect(client.from).toHaveBeenCalledWith('signups');
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ email: 'ana@example.org' }));
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('rejects when Supabase returns an error (RLS denial, missing table)', async () => {
    const { client } = fakeClient({ error: { message: 'new row violates row-level security policy' } });
    const fetchImpl = vi.fn();

    await expect(submitSignup(payload, { client, fetchImpl })).rejects.toBeInstanceOf(SignupError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects when the request itself fails', async () => {
    const { client } = fakeClient(new TypeError('Failed to fetch'));

    await expect(submitSignup(payload, { client, fetchImpl: vi.fn() })).rejects.toThrow(
      'Could not reach sign-up storage',
    );
  });

  it('rejects when Supabase is not configured', async () => {
    await expect(submitSignup(payload, { fetchImpl: vi.fn() })).rejects.toThrow('not configured');
  });

  it('still resolves when only the email notification fails', async () => {
    const { client } = fakeClient({ error: null });
    const fetchImpl = vi.fn(() => Promise.reject(new Error('rate limited')));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(submitSignup(payload, { client, fetchImpl })).resolves.toBeUndefined();
    await vi.waitFor(() => expect(warn).toHaveBeenCalled());
    warn.mockRestore();
  });
});
