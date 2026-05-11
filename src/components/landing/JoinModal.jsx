import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { submitSignup } from '@/lib/signups';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { toast } from 'sonner';

export default function JoinModal({ open, onOpenChange }) {
  const { t, lang } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '' });
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !consent) return;
    setSubmitting(true);
    await submitSignup({
      type: 'movement',
      email: form.email,
      name: form.name,
      phone: form.phone,
      city: form.city,
      language: lang,
      consent_given: consent,
      source: 'join_modal',
    });
    setSubmitting(false);
    setForm({ name: '', email: '', phone: '', city: '' });
    setConsent(false);
    toast.success(t('join.success'));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold">
            {t('join.title')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('join.name')}</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('join.email')} *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('join.phone')}</Label>
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('join.city')}</Label>
            <Input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="rounded-xl"
            />
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 rounded border-border"
              required
            />
            <span className="text-[13px] text-foreground/90">{t('join.consent')}</span>
          </label>

          <button
            type="submit"
            disabled={submitting || !consent || !form.email}
            className="w-full px-6 py-3.5 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {submitting ? '...' : t('join.submit')}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}