import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { base44 } from '@/api/base44Client';
import { ArrowRight, MapPin, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AppCTA() {
  const { t, lang } = useI18n();
  const ref = useScrollReveal();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      await base44.entities.Subscriber.create({
        email,
        type: 'app_waitlist',
        consent_given: true,
        language: lang,
      });
    } catch (_) {
      // base44 may be unconfigured in dev — fail silently, still acknowledge
    }
    setSubmitting(false);
    setEmail('');
    toast.success(t('join.success'));
  };

  return (
    <section
      id="app"
      ref={ref}
      className="reveal-section relative min-h-screen flex items-center bg-obsidian text-bone overflow-hidden border-t border-border py-24 lg:py-0"
    >
      {/* Radial glow — Apple-keynote atmosphere, biased to the right where the iPhone sits */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 65% at 75% 50%, rgba(0, 51, 153, 0.45) 0%, rgba(0, 51, 153, 0.18) 32%, rgba(10, 10, 10, 0) 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid lg:grid-cols-[2fr_3fr] gap-16 lg:gap-20 items-center">
          {/* COPY — left on desktop, below phone on mobile */}
          <div className="order-2 lg:order-1">
            <span
              className="font-mono uppercase text-eu-yellow"
              style={{ fontSize: 12, letterSpacing: '0.2em', fontWeight: 500 }}
            >
              06 — {t('app.title')}
            </span>

            <h2
              className="font-display font-black mt-6 text-bone tracking-tightest"
              style={{ fontSize: 'clamp(48px, 6.5vw, 80px)', lineHeight: 0.95 }}
            >
              {t('app.headline.prefix')}{' '}
              <span
                style={{
                  display: 'inline-block',
                  background: '#1d4ed8',
                  color: '#d4a017',
                  fontStyle: 'italic',
                  padding: '0 0.16em',
                  lineHeight: 1.0,
                  verticalAlign: 'baseline',
                }}
              >
                {t('app.headline.accent')}
              </span>
            </h2>

            <p className="mt-8 font-body text-[20px] leading-[1.55] text-bone max-w-[520px]">
              {t('app.subtitle')}
            </p>

            <p
              className="mt-6 font-mono uppercase max-w-[520px]"
              style={{ fontSize: 12, letterSpacing: '0.2em', color: '#d4a017', fontWeight: 500 }}
            >
              {t('app.taglineMono')}
            </p>

            {/* SINGLE CTA — email + button inline */}
            <form onSubmit={handleSubmit} className="mt-10 max-w-[480px]">
              <div className="flex flex-col sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('app.emailPlaceholder')}
                  className="flex-1 px-5 py-4 bg-obsidian border border-bone/15 text-bone placeholder:text-bone/30 text-sm focus:outline-none focus:border-eu-blue transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting || !email}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-4 text-xs font-mono uppercase tracking-widest bg-eu-blue text-bone hover:bg-eu-yellow hover:text-eu-blue transition-colors disabled:opacity-50 disabled:hover:bg-eu-blue disabled:hover:text-bone"
                >
                  {t('app.joinList')}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              <p
                className="mt-4 font-mono uppercase"
                style={{ fontSize: 12, letterSpacing: '0.2em', color: '#fff', fontWeight: 500 }}
              >
                {t('app.socialProof')}
              </p>

              <a
                href="#support"
                className="inline-block mt-6 font-body hover:text-eu-yellow transition-colors"
                style={{ fontSize: 16, color: '#fff', textDecoration: 'underline', textUnderlineOffset: 4, textDecorationColor: 'rgba(255,255,255,0.35)' }}
              >
                {t('app.supportLink')} →
              </a>
            </form>
          </div>

          {/* iPHONE — right on desktop, top on mobile */}
          <div
            className="order-1 lg:order-2 flex items-center justify-center"
            style={{ perspective: '1500px' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotateY: -25, rotateX: 8 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: -12, rotateX: 4 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
              >
                <Phone t={t} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Phone({ t }) {
  return (
    <div
      className="relative"
      style={{ width: 'clamp(240px, 30vw, 310px)' }}
    >
      {/* Ambient drop shadow */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          left: '5%',
          right: '5%',
          bottom: '-8%',
          height: '20%',
          background:
            'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Titanium frame */}
      <div
        className="relative bg-[#1a1a1c] p-[3px]"
        style={{
          borderRadius: '58px',
          boxShadow:
            '0 30px 80px rgba(0, 0, 0, 0.6), 0 80px 200px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
        }}
      >
        {/* Inner bezel */}
        <div className="bg-black p-[2px]" style={{ borderRadius: '55px' }}>
          {/* Screen */}
          <div
            className="relative bg-eu-blue overflow-hidden flex flex-col"
            style={{ borderRadius: '53px', aspectRatio: '9 / 19.5' }}
          >
            {/* Subtle screen reflection */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none z-30"
              style={{
                background:
                  'linear-gradient(118deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.04) 100%)',
                borderRadius: '53px',
              }}
            />

            {/* Status bar */}
            <div className="relative flex items-center justify-between px-7 pt-3 pb-2 z-10">
              <span className="text-[12px] text-bone font-mono tracking-tight">9:41</span>
              <div className="flex items-center gap-1 text-bone">
                <SignalIcon />
                <WifiIcon />
                <BatteryIcon />
              </div>
            </div>

            {/* Dynamic island */}
            <div
              aria-hidden="true"
              className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-black"
              style={{ width: '34%', height: '4.4%', borderRadius: '999px' }}
            />

            {/* Content */}
            <div className="relative flex-1 flex flex-col px-5 pt-4 pb-5 z-10">
              {/* Logo row */}
              <div className="flex items-center gap-2 mb-4">
                <BikeMark />
                <span className="font-display text-[14px] font-black tracking-tightest text-bone">
                  Bicis <i className="text-eu-yellow">Sapiens</i>
                </span>
              </div>

              {/* Map */}
              <div
                className="relative w-full overflow-hidden"
                style={{
                  aspectRatio: '4 / 3',
                  backgroundColor: '#001F66',
                  borderRadius: '20px',
                }}
              >
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 200 150"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <pattern id="streets-bg" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="200" height="150" fill="url(#streets-bg)" />

                  {/* Soft secondary roads */}
                  <path
                    d="M 0 110 Q 60 90 120 100 T 200 80"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <path
                    d="M 30 0 Q 50 40 90 60 T 160 150"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="6"
                    fill="none"
                  />

                  {/* Route — yellow organic curve */}
                  <path
                    d="M 30 115 Q 60 95 90 90 T 150 50 Q 165 40 170 28"
                    stroke="#FFD60A"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />

                  {/* Origin — white circle with halo */}
                  <circle cx="30" cy="115" r="6.5" fill="none" stroke="#FAFAF7" strokeWidth="0.8" opacity="0.45" />
                  <circle cx="30" cy="115" r="3.5" fill="#FAFAF7" />

                  {/* Destination — yellow pin */}
                  <circle cx="170" cy="28" r="5.5" fill="#FFD60A" stroke="#001F66" strokeWidth="1.5" />
                  <circle cx="170" cy="28" r="1.8" fill="#001F66" />
                </svg>
              </div>

              {/* Info card */}
              <div className="mt-4 space-y-3">
                <p className="font-display text-[14px] font-black tracking-tightest text-bone leading-tight">
                  {t('app.phone.route')}
                </p>
                <div className="flex items-center gap-2.5 font-mono text-[9px] uppercase tracking-widest text-bone/65">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> {t('app.phone.distance')}
                  </span>
                  <span className="text-bone/30">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {t('app.phone.time')}
                  </span>
                  <span className="text-bone/30">·</span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" /> {t('app.phone.safe')}
                  </span>
                </div>
              </div>

              {/* Spacer pushes the start button to the bottom */}
              <div className="flex-1" />

              {/* Start route button */}
              <div className="bg-eu-yellow text-eu-blue py-3 text-center font-mono text-[11px] font-bold uppercase tracking-widest">
                {t('app.phone.startButton')}
              </div>

              {/* Home indicator */}
              <div
                aria-hidden="true"
                className="mt-3 mx-auto bg-bone/35"
                style={{ width: '38%', height: '3px', borderRadius: '999px' }}
              />
            </div>
          </div>
        </div>

        {/* Side buttons */}
        <span aria-hidden="true" className="absolute -left-[3px] w-[3px] bg-[#0c0c0d]" style={{ top: '14%', height: '4%' }} />
        <span aria-hidden="true" className="absolute -left-[3px] w-[3px] bg-[#0c0c0d]" style={{ top: '21%', height: '7%' }} />
        <span aria-hidden="true" className="absolute -left-[3px] w-[3px] bg-[#0c0c0d]" style={{ top: '30%', height: '7%' }} />
        <span aria-hidden="true" className="absolute -right-[3px] w-[3px] bg-[#0c0c0d]" style={{ top: '24%', height: '12%' }} />
      </div>
    </div>
  );
}

function SignalIcon() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
      <rect x="0" y="6" width="2.5" height="4" />
      <rect x="3.5" y="4" width="2.5" height="6" />
      <rect x="7" y="2" width="2.5" height="8" />
      <rect x="10.5" y="0" width="2.5" height="10" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="13" height="10" viewBox="0 0 16 12" fill="currentColor">
      <path d="M8 11.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zM3.6 7.4a6.2 6.2 0 018.8 0l1.4-1.4a8.2 8.2 0 00-11.6 0l1.4 1.4zM.7 4.5a10.2 10.2 0 0114.6 0l1.4-1.4a12.2 12.2 0 00-17.4 0L.7 4.5z" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="22" height="10" viewBox="0 0 24 11">
      <rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="22" y="3.5" width="1.5" height="4" fill="currentColor" />
      <rect x="2" y="2" width="17" height="7" fill="currentColor" />
    </svg>
  );
}

function BikeMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD60A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="17" r="4" />
      <circle cx="18" cy="17" r="4" />
      <path d="M 6 17 L 11 9 L 18 17 M 11 9 L 14 9 M 11 9 L 9 5 L 7 5" />
    </svg>
  );
}
