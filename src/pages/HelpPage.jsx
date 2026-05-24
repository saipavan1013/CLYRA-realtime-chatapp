import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import AccountModal from '../components/AccountModal';
import {
    FAQ_DATA, HELP_CATEGORIES, TERMS_CONTENT, PRIVACY_CONTENT,
    REPORT_TYPES, CONTACT_SUBJECTS, APP_VERSION, BUILD_NUMBER,
} from '../data/help-data';

// ── Shared styles (no layout/UI changes) ──────────────────────────────────
const inputStyle = { width: '100%', padding: '0.55rem 0.75rem', marginBottom: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const selectStyle = { ...undefined, width: '100%', padding: '0.55rem 0.75rem', marginBottom: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', cursor: 'pointer' };
const textareaStyle = { width: '100%', padding: '0.55rem 0.75rem', marginBottom: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical', minHeight: '100px' };
const btnPrimary = { padding: '0.55rem 1.25rem', borderRadius: '6px', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' };
const btnSecondary = { padding: '0.55rem 1.25rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'none', color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem', marginLeft: '0.5rem' };
const errorStyle = { color: '#f87171', fontSize: '0.82rem', marginBottom: '0.5rem' };
const successStyle = { color: '#4ade80', fontSize: '0.82rem', marginBottom: '0.5rem' };
const infoStyle = { color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.75rem' };

// ── Main Page ────────────────────────────────────────────────────────────────
function HelpPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [modal, setModal] = useState(null);

    const modalTitles = {
        helpCenter: 'Help Center',
        contact: 'Contact Us',
        terms: 'Terms & Privacy Policy',
        report: 'Report a Channel',
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <button className="page-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </button>
                <h1 className="page-title">Help</h1>
            </header>

            <div className="settings-content">
                <div className="settings-group">
                    {/* Help Center */}
                    <button className="settings-item" onClick={() => setModal('helpCenter')}>
                        <div className="settings-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Help Center</span>
                        </div>
                    </button>

                    {/* Contact Us */}
                    <button className="settings-item" onClick={() => setModal('contact')}>
                        <div className="settings-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-8c-1.1 0-2 .9-2 2h2c0 1.1.9 2 2 2v2c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Contact us</span>
                            <span className="settings-sublabel">Questions? Need help?</span>
                        </div>
                    </button>

                    {/* Terms and Privacy */}
                    <button className="settings-item" onClick={() => setModal('terms')}>
                        <div className="settings-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Terms and Privacy Policy</span>
                        </div>
                    </button>

                    {/* Channel Reports */}
                    <button className="settings-item" onClick={() => setModal('report')}>
                        <div className="settings-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M21 17.5v2.5h-2.5v-2.5H21zm0-13H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2zm0 16H3v-14h18v14z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Channel reports</span>
                        </div>
                    </button>
                </div>

                {/* App version footer */}
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <p>CLYRA version {APP_VERSION}</p>
                    <p>Build {BUILD_NUMBER} &copy; {new Date().getFullYear()} CLYRA Inc.</p>
                </div>
            </div>

            {/* Modals */}
            {modal && (
                <AccountModal title={modalTitles[modal]} onClose={() => setModal(null)}>
                    {modal === 'helpCenter' && <HelpCenterModal />}
                    {modal === 'contact' && <ContactModal user={user} onClose={() => setModal(null)} />}
                    {modal === 'terms' && <TermsModal />}
                    {modal === 'report' && <ReportModal user={user} onClose={() => setModal(null)} />}
                </AccountModal>
            )}
        </div>
    );
}

// ── Help Center Modal ─────────────────────────────────────────────────────
function HelpCenterModal() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [openId, setOpenId] = useState(null);

    const categories = ['All', ...HELP_CATEGORIES];

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return FAQ_DATA.filter(item => {
            const matchCat = activeCategory === 'All' || item.category === activeCategory;
            const matchSearch = !q || item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q);
            return matchCat && matchSearch;
        });
    }, [search, activeCategory]);

    return (
        <div>
            {/* Search */}
            <input
                style={{ ...inputStyle, marginBottom: '0.75rem' }}
                type="text"
                placeholder="Search help topics..."
                value={search}
                onChange={e => { setSearch(e.target.value); setOpenId(null); }}
            />

            {/* Category pills */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat); setOpenId(null); }}
                        style={{
                            padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', border: 'none',
                            background: activeCategory === cat ? 'var(--accent)' : 'var(--bg-primary)',
                            color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* FAQ Accordion */}
            <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {filtered.length === 0 && (
                    <p style={infoStyle}>No results found. Try a different search term or category.</p>
                )}
                {filtered.map(item => (
                    <div key={item.id} style={{ borderBottom: '1px solid var(--border)', marginBottom: '2px' }}>
                        <button
                            onClick={() => setOpenId(openId === item.id ? null : item.id)}
                            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>{item.title}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '1rem', flexShrink: 0 }}>{openId === item.id ? '▲' : '▼'}</span>
                        </button>
                        {openId === item.id && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, paddingBottom: '0.75rem', margin: 0 }}>
                                {item.content}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Contact Us Modal ──────────────────────────────────────────────────────
function ContactModal({ user, onClose }) {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [ticketId, setTicketId] = useState('');

    // Simple rate-limit: store last submission time in sessionStorage
    const canSubmit = () => {
        const last = sessionStorage.getItem('last_support_ticket');
        if (!last) return true;
        return Date.now() - parseInt(last) > 5 * 60 * 1000; // 5 minutes
    };

    const handleSubmit = async () => {
        if (!subject) return setError('Please select a subject.');
        if (!message.trim()) return setError('Please enter a message.');
        if (message.trim().length < 20) return setError('Message must be at least 20 characters.');
        if (!canSubmit()) return setError('Please wait 5 minutes before submitting another request.');

        setLoading(true); setError('');
        try {
            const ref = await addDoc(collection(db, 'support_tickets'), {
                userId: user?.uid || 'anonymous',
                userEmail: user?.email || '',
                subject,
                message: message.trim(),
                status: 'open',
                createdAt: serverTimestamp(),
                userAgent: navigator.userAgent,
            });
            sessionStorage.setItem('last_support_ticket', Date.now().toString());
            setTicketId(ref.id.slice(0, 8).toUpperCase());
            setSubmitted(true);
        } catch (e) {
            console.error('[ContactUs] Submit failed:', e);
            setError('Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) return (
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Ticket Submitted</p>
            <p style={infoStyle}>Your support ticket <strong>#{ticketId}</strong> has been received.</p>
            <p style={infoStyle}>Our team will review it and respond to <strong>{user?.email}</strong> within 24 hours.</p>
            <button style={btnPrimary} onClick={onClose}>Done</button>
        </div>
    );

    return (
        <div>
            <p style={infoStyle}>Fill in the details below and we'll get back to you as soon as possible.</p>
            <select style={selectStyle} value={subject} onChange={e => { setSubject(e.target.value); setError(''); }}>
                <option value="">Select a subject...</option>
                {CONTACT_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <textarea
                style={textareaStyle}
                placeholder="Describe your issue in detail (minimum 20 characters)..."
                value={message}
                maxLength={2000}
                onChange={e => { setMessage(e.target.value); setError(''); }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{message.length}/2000</span>
            </div>
            {error && <p style={errorStyle}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={btnPrimary} onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
                <button style={btnSecondary} onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

// ── Terms & Privacy Modal ─────────────────────────────────────────────────
function TermsModal() {
    const [tab, setTab] = useState('terms');

    const content = tab === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT;

    const renderContent = (text) =>
        text.split('\n\n').map((para, i) => {
            const parts = para.split(/\*\*(.*?)\*\*/g);
            return (
                <p key={i} style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: 'var(--text-primary)' }}>{p}</strong> : p)}
                </p>
            );
        });

    return (
        <div>
            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {['terms', 'privacy'].map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '0.3rem 0.9rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
                        background: tab === t ? 'var(--accent)' : 'var(--bg-primary)',
                        color: tab === t ? '#fff' : 'var(--text-secondary)',
                    }}>
                        {t === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{ maxHeight: '360px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {renderContent(content)}
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                Version 1.2 — Effective 1 January 2025
            </p>
        </div>
    );
}

// ── Channel Report Modal ──────────────────────────────────────────────────
function ReportModal({ user, onClose }) {
    const [reportType, setReportType] = useState('');
    const [description, setDescription] = useState('');
    const [targetId, setTargetId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Rate-limit: 3 reports per session
    const getReportCount = () => parseInt(sessionStorage.getItem('report_count') || '0');

    const handleSubmit = async () => {
        if (!reportType) return setError('Please select a report type.');
        if (!description.trim() || description.trim().length < 10) return setError('Please enter at least 10 characters of description.');
        if (getReportCount() >= 3) return setError('You have reached the maximum reports for this session.');

        setLoading(true); setError('');
        try {
            await addDoc(collection(db, 'reports'), {
                reporterId: user?.uid || 'anonymous',
                reporterEmail: user?.email || '',
                type: reportType,
                description: description.trim(),
                targetId: targetId.trim() || null,
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            sessionStorage.setItem('report_count', (getReportCount() + 1).toString());
            setSubmitted(true);
        } catch (e) {
            console.error('[Report] Submit failed:', e);
            setError('Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) return (
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🛡️</div>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Report Submitted</p>
            <p style={infoStyle}>Thank you for helping keep CLYRA safe. Our moderation team will review your report within 48 hours.</p>
            <button style={btnPrimary} onClick={onClose}>Done</button>
        </div>
    );

    return (
        <div>
            <p style={infoStyle}>Report inappropriate content or behaviour. All reports are reviewed by our moderation team.</p>
            <select style={selectStyle} value={reportType} onChange={e => { setReportType(e.target.value); setError(''); }}>
                <option value="">Select report type...</option>
                {REPORT_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <textarea
                style={textareaStyle}
                placeholder="Describe the issue in detail..."
                value={description}
                maxLength={1000}
                onChange={e => { setDescription(e.target.value); setError(''); }}
            />
            <input
                style={inputStyle}
                type="text"
                placeholder="Message or channel ID (optional)"
                value={targetId}
                onChange={e => { setTargetId(e.target.value); setError(''); }}
            />
            {error && <p style={errorStyle}>{error}</p>}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Your identity will remain anonymous in this report.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={btnPrimary} onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
                <button style={btnSecondary} onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

export default HelpPage;
