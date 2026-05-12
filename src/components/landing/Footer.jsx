import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Minimal footer — newsletter signup only.
 *
 * Stripped down per direct user request: the previous footer had brand
 * wordmark, Contacto / Social / Legal columns, and a copyright line.
 * All removed. The only thing left is the email-capture form, because
 * that's the only piece of the footer that delivers real value right
 * now (social channels and legal pages are not launched yet, so
 * listing them as placeholder "#" links read as unfinished).
 *
 * Brand identity lives on every page via the Navbar. When social /
 * legal pages exist, restore those columns in a follow-up.
 */
export default function Footer() {
  const { t, lang } = useI18n();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!email || !consent) return;
    setSubmitting(true);
    await base44.entities.Subscriber.create({
      email,
      type: 'newsletter',
      consent_given: consent,
      language: lang,
    });
    setSubmitting(false);
    setEmail('');
    setConsent(false);
    toast.success(t('join.success'));
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="font-display text-2xl sm:text-3xl font-semibold">
              {t('footer.newsletter')}
            </h3>
          </div>
          <form onSubmit={handleNewsletter} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.emailPlaceholder')}
                required
                className="flex-1 px-4 py-3 rounded-xl bg-background/10 border border-background/20 text-background placeholder:text-background/40 text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                disabled={submitting || !consent}
                className="inline-flex items-center gap-2 px-6 py-3 text-[13px] font-mono uppercase tracking-[0.18em] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {t('footer.subscribe')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 rounded border-background/30 bg-transparent"
              />
              <span className="text-[13px] text-background/90 font-medium">
                {t('footer.consent')}
              </span>
            </label>
          </form>
        </div>
      </div>
    </footer>
  );
}
