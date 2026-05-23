import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import { useChatSettingsContext } from '../context/ChatSettingsContext';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import AccountModal from '../components/AccountModal';

// ── Predefined wallpapers ──────────────────────────────────────────────────
const PRESET_WALLPAPERS = [
    { id: 'none', label: 'None', value: null },
    { id: 'gradient-1', label: 'Midnight', value: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
    { id: 'gradient-2', label: 'Ocean', value: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)' },
    { id: 'gradient-3', label: 'Forest', value: 'linear-gradient(135deg, #134e5e, #71b280)' },
    { id: 'gradient-4', label: 'Dusk', value: 'linear-gradient(135deg, #232526, #414345)' },
    { id: 'gradient-5', label: 'Ember', value: 'linear-gradient(135deg, #200122, #6f0000)' },
    { id: 'gradient-6', label: 'Arctic', value: 'linear-gradient(135deg, #1c92d2, #f2fcfe)' },
];

// ── Inline styles (no UI changes) ─────────────────────────────────────────
const infoStyle = { color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.75rem' };
const errorStyle = { color: '#f87171', fontSize: '0.82rem', marginBottom: '0.5rem' };
const successStyle = { color: '#4ade80', fontSize: '0.82rem', marginBottom: '0.5rem' };
const inputStyle = { width: '100%', padding: '0.55rem 0.75rem', marginBottom: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const btnPrimary = { padding: '0.55rem 1.25rem', borderRadius: '6px', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' };
const btnSecondary = { padding: '0.55rem 1.25rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'none', color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem', marginLeft: '0.5rem' };
const btnDanger = { padding: '0.55rem 1.25rem', borderRadius: '6px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' };

// ── Toggle ─────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
    return (
        <div
            onClick={() => !disabled && onChange(!checked)}
            className={`settings-toggle ${checked ? 'active' : ''}`}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}
        >
            <div className="settings-toggle-handle" />
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
function ChatsPage() {
    const navigate = useNavigate();
    const { theme, toggleTheme, persistTheme } = useTheme();
    const { user } = useAuth();
    const { settings, updateSetting } = useChatSettingsContext();

    const [modal, setModal] = useState(null);
    const [saving, setSaving] = useState(null); // key of the setting currently saving

    // Load theme from Firestore on mount
    useEffect(() => {
        // Theme is already loaded via ThemeContext localStorage; Firestore sync happens on toggle
    }, []);

    const handleToggle = async (key, value) => {
        setSaving(key);
        try {
            await updateSetting(key, value);
        } catch (e) {
            console.error('Error saving setting:', e);
        } finally {
            setSaving(null);
        }
    };

    const handleThemeToggle = async () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        toggleTheme();
        if (user?.uid) await persistTheme(user.uid, next);
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <button className="page-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </button>
                <h1 className="page-title">Chats</h1>
            </header>

            <div className="settings-content">

                {/* ── Group 1: Theme + Wallpaper ──────────────────────── */}
                <div className="settings-group">
                    {/* Theme */}
                    <div className="settings-item" onClick={handleThemeToggle} style={{ cursor: 'pointer' }}>
                        <div className="settings-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Theme</span>
                            <span className="settings-sublabel">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                        </div>
                        <div className={`settings-toggle ${theme === 'dark' ? 'active' : ''}`}>
                            <div className="settings-toggle-handle" />
                        </div>
                    </div>

                    {/* Wallpaper */}
                    <button className="settings-item" onClick={() => setModal('wallpaper')}>
                        <div className="settings-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9l-4 5h12l-3-4-2.03 2.71L10 13zm7-4.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5zM20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 18h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Wallpaper</span>
                            {settings.wallpaper && (
                                <span className="settings-sublabel">Custom wallpaper active</span>
                            )}
                        </div>
                    </button>
                </div>

                {/* ── Group 2: Toggles ────────────────────────────────── */}
                <div className="settings-group">
                    {/* Enter is send */}
                    <div className="settings-item">
                        <div className="settings-info">
                            <span className="settings-label">Enter is send</span>
                            <span className="settings-sublabel">Enter key will send your message</span>
                        </div>
                        <Toggle
                            checked={settings.enterIsSend}
                            onChange={(v) => handleToggle('enterIsSend', v)}
                            disabled={saving === 'enterIsSend'}
                        />
                    </div>

                    {/* Media visibility */}
                    <div className="settings-item">
                        <div className="settings-info">
                            <span className="settings-label">Media visibility</span>
                            <span className="settings-sublabel">Show newly downloaded media in your device's gallery</span>
                        </div>
                        <Toggle
                            checked={settings.mediaVisibility}
                            onChange={(v) => handleToggle('mediaVisibility', v)}
                            disabled={saving === 'mediaVisibility'}
                        />
                    </div>
                </div>

                {/* ── Group 3: Keep Archived ─────────────────────────── */}
                <div className="settings-group">
                    <div className="settings-item">
                        <div className="settings-info">
                            <span className="settings-label">Keep chats archived</span>
                            <span className="settings-sublabel">Archived chats will remain archived when you receive a new message</span>
                        </div>
                        <Toggle
                            checked={settings.keepChatsArchived}
                            onChange={(v) => handleToggle('keepChatsArchived', v)}
                            disabled={saving === 'keepChatsArchived'}
                        />
                    </div>
                </div>

                {/* ── Group 4: Chat History ──────────────────────────── */}
                <div className="settings-group">
                    <button className="settings-item" onClick={() => setModal('history')}>
                        <div className="settings-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Chat history</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* ── Modals ────────────────────────────────────────────── */}
            {modal === 'wallpaper' && (
                <AccountModal title="Chat Wallpaper" onClose={() => setModal(null)}>
                    <WallpaperModal
                        current={settings.wallpaper}
                        onSelect={async (val) => { await updateSetting('wallpaper', val); setModal(null); }}
                        uid={user?.uid}
                    />
                </AccountModal>
            )}
            {modal === 'history' && (
                <AccountModal title="Chat History" onClose={() => setModal(null)}>
                    <ChatHistoryModal onClose={() => setModal(null)} uid={user?.uid} settings={settings} updateSetting={updateSetting} />
                </AccountModal>
            )}
        </div>
    );
}

// ─── Wallpaper Modal ──────────────────────────────────────────────────────
function WallpaperModal({ current, onSelect, uid }) {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleCustomUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const reader = new FileReader();
        reader.onload = async (ev) => {
            // Store as data URL (for custom wallpaper without cloud storage)
            await onSelect(ev.target.result);
            setUploading(false);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <p style={infoStyle}>Choose a wallpaper for the chat background.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                {PRESET_WALLPAPERS.map(wp => (
                    <button
                        key={wp.id}
                        onClick={() => onSelect(wp.value)}
                        style={{
                            height: '64px', borderRadius: '8px', border: current === wp.value ? '2px solid var(--accent)' : '2px solid var(--border)',
                            background: wp.value || 'var(--bg-primary)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500,
                        }}
                    >
                        {!wp.value && wp.label}
                    </button>
                ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleCustomUpload} />
                <button style={{ ...btnSecondary, marginLeft: 0, width: '100%' }} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? 'Applying...' : '📁 Upload Custom Image'}
                </button>
            </div>
        </div>
    );
}

// ─── Chat History Modal ───────────────────────────────────────────────────
function ChatHistoryModal({ onClose, uid: uidProp, settings, updateSetting }) {
    const { user } = useAuth();
    // Always use the authenticated user's uid for security; fall back to prop
    const uid = user?.uid || uidProp;

    const [view, setView] = useState('menu'); // menu | clear | autodelete
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [confirm, setConfirm] = useState('');

    // Derived: is the confirmation input valid?
    const isConfirmValid = confirm.trim().toUpperCase() === 'CLEAR';

    const handleClearAll = async () => {
        // Guard: must be authenticated and confirmation must be valid
        if (!uid) return setError('You must be logged in to perform this action.');
        if (!isConfirmValid) return setError('Type CLEAR (any case) to confirm.');

        setLoading(true);
        setError('');
        try {
            const q = query(collection(db, 'messages'), where('senderId', '==', uid));
            const snap = await getDocs(q);

            if (snap.empty) {
                setSuccess('No messages found to delete.');
                setLoading(false);
                return;
            }

            // Firestore batch delete (max 500 per batch, chunk if needed)
            const chunkSize = 499;
            const docs = snap.docs;
            for (let i = 0; i < docs.length; i += chunkSize) {
                const batch = writeBatch(db);
                docs.slice(i, i + chunkSize).forEach(d => batch.delete(d.ref));
                await batch.commit();
            }

            setSuccess(`✓ Deleted ${docs.length} message${docs.length !== 1 ? 's' : ''} successfully.`);
            setConfirm('');
        } catch (e) {
            console.error('[ChatHistory] Clear all failed:', e);
            setError('Failed to clear messages. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setLoading(true); setError('');
        try {
            const q = query(collection(db, 'messages'), where('senderId', '==', uid));
            const snap = await getDocs(q);
            const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), messages }, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `chat-history-${Date.now()}.json`; a.click();
            URL.revokeObjectURL(url);
            setSuccess('Chat history downloaded successfully.');
        } catch (e) {
            setError('Export failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSetAutoDelete = async (days) => {
        setLoading(true);
        await updateSetting('autoDeleteDays', days);
        setLoading(false);
        setSuccess(`Auto-delete set to ${days ? `${days} days` : 'Off'}.`);
    };

    if (view === 'menu') return (
        <div>
            <p style={infoStyle}>Manage your local chat data and history preferences.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button style={{ ...btnSecondary, marginLeft: 0, textAlign: 'left', width: '100%' }} onClick={() => setView('clear')}>
                    🗑 Clear All Chats
                </button>
                <button style={{ ...btnSecondary, marginLeft: 0, textAlign: 'left', width: '100%' }} onClick={handleExport} disabled={loading}>
                    📥 {loading ? 'Exporting...' : 'Export Chat History'}
                </button>
                <button style={{ ...btnSecondary, marginLeft: 0, textAlign: 'left', width: '100%' }} onClick={() => setView('autodelete')}>
                    ⏱ Auto-Delete Messages {settings.autoDeleteDays ? `(${settings.autoDeleteDays}d)` : '(Off)'}
                </button>
            </div>
            {success && <p style={{ ...successStyle, marginTop: '0.75rem' }}>{success}</p>}
        </div>
    );

    if (view === 'clear') return (
        <div>
            <p style={{ color: '#f87171', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>⚠ This will delete all your sent messages.</p>
            <p style={infoStyle}>This action cannot be undone. Contacts will still have their copies.</p>
            <input
                style={{
                    ...inputStyle,
                    borderColor: isConfirmValid ? '#4ade80' : confirm.length > 0 ? '#f87171' : undefined,
                }}
                type="text"
                placeholder='Type "CLEAR" to confirm'
                value={confirm}
                autoFocus
                onChange={e => { setConfirm(e.target.value); setError(''); }}
            />
            {error && <p style={errorStyle}>{error}</p>}
            {success && <p style={successStyle}>{success}</p>}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    style={{ ...btnDanger, opacity: (!isConfirmValid || loading) ? 0.5 : 1, cursor: (!isConfirmValid || loading) ? 'not-allowed' : 'pointer' }}
                    onClick={handleClearAll}
                    disabled={!isConfirmValid || loading}
                >
                    {loading ? 'Clearing...' : 'Clear All'}
                </button>
                <button style={btnSecondary} onClick={() => { setView('menu'); setConfirm(''); setError(''); setSuccess(''); }}>Back</button>
            </div>
        </div>
    );

    if (view === 'autodelete') return (
        <div>
            <p style={infoStyle}>Automatically delete your messages after a set period.</p>
            {[null, 7, 30, 90].map(d => (
                <button
                    key={d ?? 'off'}
                    style={{
                        ...btnSecondary, marginLeft: 0, width: '100%', marginBottom: '0.4rem',
                        borderColor: settings.autoDeleteDays === d ? 'var(--accent)' : undefined,
                        color: settings.autoDeleteDays === d ? 'var(--accent)' : undefined,
                    }}
                    onClick={() => handleSetAutoDelete(d)}
                    disabled={loading}
                >
                    {d === null ? 'Off' : `${d} days`}
                </button>
            ))}
            {success && <p style={{ ...successStyle, marginTop: '0.5rem' }}>{success}</p>}
            <button style={{ ...btnSecondary, marginLeft: 0, marginTop: '0.5rem' }} onClick={() => setView('menu')}>Back</button>
        </div>
    );
}

export default ChatsPage;
