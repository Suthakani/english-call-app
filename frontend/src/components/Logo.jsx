import React from 'react';

export default function Logo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className="speakup-logo-mark" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <circle className="logo-ring" cx="22" cy="22" r="20.5" fill="none" stroke="url(#ringGrad)" strokeWidth="1.5" strokeDasharray="6 5" strokeLinecap="round" />
      <circle cx="22" cy="22" r="17" fill="url(#logoGrad)" />
      <rect className="logo-eq logo-eq-1" x="13" y="18" width="3" height="8" rx="1.5" fill="#ffffff" />
      <rect className="logo-eq logo-eq-2" x="18" y="15" width="3" height="14" rx="1.5" fill="#ffffff" />
      <rect className="logo-eq logo-eq-3" x="23" y="12" width="3" height="20" rx="1.5" fill="#ffffff" />
      <rect className="logo-eq logo-eq-4" x="28" y="15" width="3" height="14" rx="1.5" fill="#ffffff" />
    </svg>
  );
}