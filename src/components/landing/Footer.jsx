import React from 'react';
import { useI18n } from '@/lib/i18n';

/**
 * Minimal footer — brand wordmark + civic tagline.
 *
 * Stripped down per direct user request: the previous footer had a
 * newsletter form, Contacto / Social / Legal columns, and a copyright
 * line. All removed. Newsletter signup lives elsewhere on the page
 * (Hero CTA → join modal); social channels and legal pages are not
 * launched yet, so listing them as placeholder "#" links read as
 * unfinished. Per the same logic that hides the Matosinhos partner
 * placeholder, we ship only what is real.
 *
 * When social / legal pages exist, restore those columns in a follow-up.
 */
export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/logo-solid.svg"
            alt="Bicis Sapiens"
            width="36"
            height="36"
            className="w-9 h-9"
          />
          <span className="font-display text-lg font-black tracking-tightest text-background">
            Bicis <i className="text-primary">Sapiens</i>
          </span>
        </div>
        <p className="text-base text-background/85 max-w-xs leading-relaxed">
          {t('footer.tagline')}
        </p>
      </div>
    </footer>
  );
}
