import React from 'react';
import { Link } from 'react-router-dom';

// Minimal wordmark + logo header used as a "way home" on the standalone
// forum pages (ForumList, ForumThread, Login) — those pages don't render
// the full <Navbar> so visitors otherwise have no exit. Clicking goes to
// the Landing route.

export default function ForumWordmark() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity"
      style={{ textDecoration: 'none' }}
    >
      <img
        src="/logo-solid.svg"
        alt=""
        aria-hidden="true"
        width="32"
        height="32"
        style={{ width: 32, height: 32 }}
      />
      <span
        className="font-display tracking-tightest"
        style={{ fontSize: 17, fontWeight: 900, color: '#fff', lineHeight: 1 }}
      >
        Bicis <i style={{ color: '#5b8e3a' }}>Sapiens</i>
      </span>
    </Link>
  );
}
