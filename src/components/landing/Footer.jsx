import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { Mail, Heart, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

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
      {/* Newsletter */}
      <div className="border-b border-background/10">
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
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
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
                <span className="text-xs text-background/50">{t('footer.consent')}</span>
              </label>
            </form>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo-solid.svg" alt="Bicis Sapiens" width="36" height="36" className="w-9 h-9" />
              <span className="font-display text-lg font-black tracking-tightest text-background">
                Bicis <i className="text-primary">Sapiens</i>
              </span>
            </div>
            <p className="text-sm text-background/40 max-w-xs">
              Movimento cívico para uma cidade 100% amiga da bicicleta.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-semibold text-background mb-4">Contacto</h4>
            <div className="space-y-2">
              <a href="mailto:hola@bicisapiens.org" className="flex items-center gap-2 text-sm text-background/60 hover:text-background transition-colors">
                <Mail className="w-4 h-4" /> hola@bicisapiens.org
              </a>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-display text-sm font-semibold text-background mb-4">Social</h4>
            <div className="space-y-2 text-sm text-background/60">
              <a href="#" className="block hover:text-background transition-colors">Instagram</a>
              <a href="#" className="block hover:text-background transition-colors">Twitter / X</a>
              <a href="#" className="block hover:text-background transition-colors">LinkedIn</a>
              <a href="#" className="block hover:text-background transition-colors">YouTube</a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display text-sm font-semibold text-background mb-4">Legal</h4>
            <div className="space-y-2 text-sm text-background/60">
              <a href="#" className="block hover:text-background transition-colors">{t('footer.privacy')}</a>
              <a href="#" className="block hover:text-background transition-colors">{t('footer.cookies')}</a>
              <a href="#" className="block hover:text-background transition-colors">{t('footer.rgpd')}</a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/30 font-mono">
            © {new Date().getFullYear()} Bicis Sapiens. {t('footer.made')} <Heart className="w-3 h-3 inline text-destructive" /> no Porto.
          </p>
          <p className="text-xs text-background/20 font-mono">bicisapiens.org</p>
        </div>
      </div>
    </footer>
  );
}