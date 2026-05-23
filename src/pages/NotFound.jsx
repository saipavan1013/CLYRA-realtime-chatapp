import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFoundIllustration = () => (
  <svg
    className="not-found__illustration"
    viewBox="0 0 480 380"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Background blob */}
    <ellipse cx="240" cy="310" rx="200" ry="40" fill="var(--bg-tertiary)" opacity="0.5" />

    {/* Ground plants – left */}
    <ellipse cx="60" cy="320" rx="55" ry="30" fill="#3b82f6" opacity="0.15" />
    <path d="M40 320 Q55 280 70 310" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5" />
    <path d="M55 315 Q65 285 80 308" stroke="#10b981" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5" />
    <ellipse cx="58" cy="317" rx="20" ry="12" fill="#10b981" opacity="0.2" />

    {/* Ground plants – right */}
    <ellipse cx="400" cy="322" rx="55" ry="28" fill="#3b82f6" opacity="0.12" />
    <path d="M390 320 Q410 278 420 310" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5" />
    <path d="M408 318 Q415 282 430 306" stroke="#10b981" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5" />
    <ellipse cx="405" cy="318" rx="20" ry="12" fill="#10b981" opacity="0.2" />

    {/* Clouds */}
    <ellipse cx="360" cy="60" rx="45" ry="20" fill="var(--bg-tertiary)" opacity="0.8" />
    <ellipse cx="385" cy="50" rx="30" ry="22" fill="var(--bg-tertiary)" opacity="0.8" />
    <ellipse cx="340" cy="55" rx="28" ry="18" fill="var(--bg-tertiary)" opacity="0.8" />

    <ellipse cx="90" cy="80" rx="35" ry="16" fill="var(--bg-tertiary)" opacity="0.6" />
    <ellipse cx="108" cy="70" rx="24" ry="18" fill="var(--bg-tertiary)" opacity="0.6" />
    <ellipse cx="74" cy="75" rx="22" ry="14" fill="var(--bg-tertiary)" opacity="0.6" />

    {/* Person body */}
    {/* Legs */}
    <rect x="218" y="270" width="16" height="50" rx="8" fill="#334155" />
    <rect x="242" y="270" width="16" height="50" rx="8" fill="#334155" />
    {/* Shoes */}
    <ellipse cx="226" cy="318" rx="14" ry="7" fill="#1e293b" />
    <ellipse cx="250" cy="318" rx="14" ry="7" fill="#1e293b" />

    {/* Torso */}
    <rect x="210" y="196" width="56" height="80" rx="16" fill="#3b82f6" />

    {/* Backpack */}
    <rect x="256" y="205" width="28" height="52" rx="10" fill="#2563eb" />
    <rect x="260" y="218" width="20" height="12" rx="4" fill="#1d4ed8" />

    {/* Left arm */}
    <rect x="192" y="200" width="18" height="52" rx="9" fill="#3b82f6" />
    {/* Right arm (raised holding map) */}
    <rect x="267" y="185" width="18" height="45" rx="9" fill="#3b82f6" transform="rotate(-30 267 185)" />

    {/* Head */}
    <ellipse cx="238" cy="180" rx="28" ry="30" fill="#fbbf24" />
    {/* Hair */}
    <ellipse cx="238" cy="156" rx="28" ry="14" fill="#b45309" />
    <rect x="210" y="155" width="12" height="20" rx="6" fill="#b45309" />
    <rect x="255" y="155" width="12" height="20" rx="6" fill="#b45309" />

    {/* Map */}
    <rect x="300" y="155" width="80" height="60" rx="6" fill="#f8fafc" stroke="var(--border)" strokeWidth="1.5" transform="rotate(10 300 155)" />
    <line x1="310" y1="175" x2="365" y2="175" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" transform="rotate(10 310 175)" />
    <line x1="310" y1="188" x2="355" y2="188" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" transform="rotate(10 310 188)" />
    <line x1="310" y1="200" x2="360" y2="200" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" transform="rotate(10 310 200)" />
    {/* Map location pin */}
    <circle cx="341" cy="185" r="8" fill="#ef4444" transform="rotate(10 341 185)" />
    <circle cx="341" cy="185" r="3" fill="white" transform="rotate(10 341 185)" />

    {/* Question mark near head */}
    <text x="155" y="168" fontSize="36" fontWeight="900" fill="var(--primary)" opacity="0.85" fontFamily="sans-serif">?</text>
  </svg>
);

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '404 - Page Not Found | CYRA';
    return () => {
      document.title = 'CYRA';
    };
  }, []);

  return (
    <div className="not-found">
      <div className="not-found__content">
        <NotFoundIllustration />
        <h1 className="not-found__title">404</h1>
        <h2 className="not-found__message">Oops! Page not found.</h2>
        <p className="not-found__subtext">
          The page you are looking for doesn&apos;t exist or may have been moved.
        </p>
        <button
          className="not-found__button"
          onClick={() => navigate('/chat')}
        >
          ← Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
