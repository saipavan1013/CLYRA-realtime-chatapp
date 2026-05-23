import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import AccountModal from '../components/AccountModal';

// ─── Shared form styles (inline, no layout changes) ───────────────────────
const inputStyle = {
    width: '100%', padding: '0.55rem 0.75rem', marginBottom: '0.75rem',
    background: 'var(--bg-primary)', border: '1px solid var(--border)',
    borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.95rem',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};
const btnPrimary = {
    padding: '0.55rem 1.25rem', borderRadius: '6px', border: 'none',
    background: 'var(--accent)', color: '#fff', fontWeight: 600,
    cursor: 'pointer', fontSize: '0.9rem',
};
const btnSecondary = {
    padding: '0.55rem 1.25rem', borderRadius: '6px', border: '1px solid var(--border)',
    background: 'none', color: 'var(--text-secondary)', fontWeight: 500,
    cursor: 'pointer', fontSize: '0.9rem', marginLeft: '0.5rem',
};
const btnDanger = {
    padding: '0.55rem 1.25rem', borderRadius: '6px', border: 'none',
    background: '#ef4444', color: '#fff', fontWeight: 600,
    cursor: 'pointer', fontSize: '0.9rem',
};
const errorStyle = { color: '#f87171', fontSize: '0.82rem', marginBottom: '0.5rem' };
const successStyle = { color: '#4ade80', fontSize: '0.82rem', marginBottom: '0.5rem' };
const infoStyle = { color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.75rem' };

// ─── Toggle component ──────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
    const trackStyle = {
        width: '44px', height: '24px', borderRadius: '12px', position: 'relative',
        background: checked ? 'var(--accent)' : 'var(--border)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s', border: 'none', padding: 0,
        opacity: disabled ? 0.6 : 1,
    };
    const thumbStyle = {
        position: 'absolute', top: '3px',
        left: checked ? '23px' : '3px', width: '18px', height: '18px',
        borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
    };
    return (
        <button style={trackStyle} onClick={() => !disabled && onChange(!checked)}>
            <div style={thumbStyle} />
        </button>
    );
}

// ─── Main AccountPage ──────────────────────────────────────────────────────
function AccountPage() {
    const navigate = useNavigate();
    const {
        user, logout,
        changeEmail, setSecurityNotifications, getAccountSettings,
        updatePhoneNumber, requestAccountInfo, deleteAccount,
    } = useAuth();

    const [modal, setModal] = useState(null); // Current open modal key
    const [secNotif, setSecNotif] = useState(false);
    const [loadingToggle, setLoadingToggle] = useState(false);

    // Load settings on mount
    useEffect(() => {
        if (!user) return;
        // Check user object first (optimistic), fall back to Firestore
        if (user.securityNotifications !== undefined) {
            setSecNotif(user.securityNotifications);
        } else {
            getAccountSettings().then(s => setSecNotif(s.securityNotifications ?? false));
        }
    }, [user]);

    const closeModal = () => setModal(null);

    // ── Security Notifications toggle ──────────────────────────────────────
    const handleToggleSecNotif = async () => {
        setLoadingToggle(true);
        try {
            const next = !secNotif;
            await setSecurityNotifications(next);
            setSecNotif(next);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingToggle(false);
        }
    };

    // ─── Modal contents ────────────────────────────────────────────────────
    const modalContent = {
        email: <EmailChangeModal onClose={closeModal} changeEmail={changeEmail} />,
        phone: <PhoneChangeModal onClose={closeModal} updatePhoneNumber={updatePhoneNumber} />,
        delete: <DeleteAccountModal onClose={closeModal} deleteAccount={deleteAccount} logout={logout} />,
        passkeys: <PasskeysModal onClose={closeModal} />,
        twofa: <TwoFAModal onClose={closeModal} />,
        accountInfo: <AccountInfoModal onClose={closeModal} requestAccountInfo={requestAccountInfo} />,
        addAccount: <AddAccountModal onClose={closeModal} />,
    };

    const modalTitles = {
        email: 'Change Email Address',
        phone: 'Change Phone Number',
        delete: 'Delete Account',
        passkeys: 'Passkeys',
        twofa: 'Two-Step Verification',
        accountInfo: 'Request Account Info',
        addAccount: 'Add Account',
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <button className="page-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </button>
                <h1 className="page-title">Account</h1>
            </header>

            <div className="settings-content">
                <div className="settings-group">
                    {/* Security Notifications */}
                    <div className="settings-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="settings-icon">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                                </svg>
                            </div>
                            <div className="settings-info">
                                <span className="settings-label">Security notifications</span>
                            </div>
                        </div>
                        <Toggle checked={secNotif} onChange={handleToggleSecNotif} disabled={loadingToggle} />
                    </div>

                    {/* Passkeys */}
                    <button className="settings-item" onClick={() => setModal('passkeys')}>
                        <div className="settings-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M2 17h20v2H2zm1.15-4.05L4 11.47l.85 1.48 1.3-.75-.85-1.48H7v-1.5H5.3l.85-1.47L4.85 7 4 8.47 3.15 7l-1.3.75.85 1.47H1v1.5h1.7l-.85 1.48 1.3.75.85-1.48zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0-2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm2.76-1.92l.86-1.52-1.31-.74-.86 1.52H12V2.85h-1.5v1.49H9.05l-.86-1.52-1.31.74.86 1.52-1.29.74.75 1.31 1.28-.75L9 7.84 8.27 9.1l-1.29-.75-.75 1.31 1.29.75L7 11.16H5.5v1.5h1.5l.52.74-1.29.75.75 1.31 1.29-.74 1.05 1.83 1.28-.75-.52-.74h2.9l-.54.76 1.28.74 1.06-1.84 1.29.74.75-1.3-1.29-.74.52-.74h1.5v-1.5h-1.5l-.54-.76 1.29-.74-.75-1.3-1.28.75.52.74h-2.9l.54-.76-1.28-.74L12 6.16 10.71 5.4l-.74 1.3 1.28.74L10.74 8l-1.29-.74-.75 1.31 1.28.74L9.5 10.15h2.98l-.48-.84z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Passkeys</span>
                        </div>
                    </button>

                    {/* Email Address */}
                    <button className="settings-item" onClick={() => setModal('email')}>
                        <div className="settings-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Email address</span>
                        </div>
                    </button>

                    {/* Two-step verification */}
                    <button className="settings-item" onClick={() => setModal('twofa')}>
                        <div className="settings-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-9-2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Two-step verification</span>
                        </div>
                    </button>

                    {/* Change number */}
                    <button className="settings-item" onClick={() => setModal('phone')}>
                        <div className="settings-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Change number</span>
                        </div>
                    </button>
                </div>

                <div className="settings-group">
                    {/* Request account info */}
                    <button className="settings-item" onClick={() => setModal('accountInfo')}>
                        <div className="settings-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Request account info</span>
                        </div>
                    </button>
                </div>

                <div className="settings-group">
                    {/* Add account */}
                    <button className="settings-item" onClick={() => setModal('addAccount')}>
                        <div className="settings-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Add account</span>
                        </div>
                    </button>

                    {/* Delete account */}
                    <button className="settings-item" style={{ color: '#ef4444' }} onClick={() => setModal('delete')}>
                        <div className="settings-icon" style={{ color: '#ef4444' }}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Delete account</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Render active modal */}
            {modal && (
                <AccountModal title={modalTitles[modal]} onClose={closeModal}>
                    {modalContent[modal]}
                </AccountModal>
            )}
        </div>
    );
}

// ─── Sub-modals ────────────────────────────────────────────────────────────

function EmailChangeModal({ onClose, changeEmail }) {
    const [step, setStep] = useState(1); // 1=password, 2=new email, 3=done
    const [password, setPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAuth = async () => {
        if (!password) return setError('Enter your current password.');
        setLoading(true); setError('');
        try {
            // Just validate password on next step too, so keep it
            setStep(2);
        } finally { setLoading(false); }
    };

    const handleChange = async () => {
        if (!newEmail.includes('@')) return setError('Enter a valid email address.');
        setLoading(true); setError('');
        try {
            await changeEmail(password, newEmail);
            setStep(3);
        } catch (e) {
            setError(e.code === 'auth/wrong-password' ? 'Incorrect password.' : e.message);
        } finally { setLoading(false); }
    };

    if (step === 3) return (
        <div>
            <p style={successStyle}>✓ Verification email sent to <strong>{newEmail}</strong>.</p>
            <p style={infoStyle}>Click the link in the email to confirm the change. Your email will update after verification.</p>
            <button style={btnPrimary} onClick={onClose}>Done</button>
        </div>
    );

    return (
        <div>
            {step === 1 && <>
                <p style={infoStyle}>Confirm your identity to change your email.</p>
                <input style={inputStyle} type="password" placeholder="Current password" value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }} />
                {error && <p style={errorStyle}>{error}</p>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={btnPrimary} onClick={handleAuth} disabled={loading}>{loading ? 'Checking...' : 'Continue'}</button>
                    <button style={btnSecondary} onClick={onClose}>Cancel</button>
                </div>
            </>}
            {step === 2 && <>
                <p style={infoStyle}>Enter your new email address. A verification link will be sent to it.</p>
                <input style={inputStyle} type="email" placeholder="New email address" value={newEmail}
                    onChange={e => { setNewEmail(e.target.value); setError(''); }} autoFocus />
                {error && <p style={errorStyle}>{error}</p>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={btnPrimary} onClick={handleChange} disabled={loading}>{loading ? 'Sending...' : 'Send Verification'}</button>
                    <button style={btnSecondary} onClick={onClose}>Cancel</button>
                </div>
            </>}
        </div>
    );
}

function PhoneChangeModal({ onClose, updatePhoneNumber }) {
    const [step, setStep] = useState(1);
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSave = async () => {
        if (!password) return setError('Enter your current password.');
        if (!phone || phone.length < 7) return setError('Enter a valid phone number.');
        setLoading(true); setError('');
        try {
            await updatePhoneNumber(password, phone);
            setSuccess(true);
        } catch (e) {
            setError(e.code === 'auth/wrong-password' ? 'Incorrect password.' : e.message);
        } finally { setLoading(false); }
    };

    if (success) return (
        <div>
            <p style={successStyle}>✓ Phone number saved successfully.</p>
            <button style={btnPrimary} onClick={onClose}>Done</button>
        </div>
    );

    return (
        <div>
            <p style={infoStyle}>Update the phone number associated with your account.</p>
            <input style={inputStyle} type="tel" placeholder="New phone number (e.g. +91 9876543210)"
                value={phone} onChange={e => { setPhone(e.target.value); setError(''); }} />
            <input style={inputStyle} type="password" placeholder="Current password (to confirm)"
                value={password} onChange={e => { setPassword(e.target.value); setError(''); }} />
            {error && <p style={errorStyle}>{error}</p>}
            <p style={{ ...infoStyle, fontSize: '0.78rem' }}>
                Note: Full OTP verification requires additional server configuration.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={btnPrimary} onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                <button style={btnSecondary} onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

function DeleteAccountModal({ onClose, deleteAccount, logout }) {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        if (confirm !== 'DELETE') return setError('Type DELETE to confirm.');
        if (!password) return setError('Enter your password.');
        setLoading(true); setError('');
        try {
            await deleteAccount(password);
            // deleteUser signs out automatically; navigate will happen via auth listener
        } catch (e) {
            setError(e.code === 'auth/wrong-password' ? 'Incorrect password.' : e.message);
            setLoading(false);
        }
    };

    return (
        <div>
            <p style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                ⚠ This action is irreversible.
            </p>
            <p style={infoStyle}>Your profile, messages, and settings will be permanently deleted.</p>
            <input style={inputStyle} type="password" placeholder="Enter your password"
                value={password} onChange={e => { setPassword(e.target.value); setError(''); }} />
            <input style={{ ...inputStyle, borderColor: confirm === 'DELETE' ? '#4ade80' : undefined }}
                type="text" placeholder='Type "DELETE" to confirm'
                value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }} />
            {error && <p style={errorStyle}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={btnDanger} onClick={handleDelete} disabled={loading}>
                    {loading ? 'Deleting...' : 'Delete My Account'}
                </button>
                <button style={btnSecondary} onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

function PasskeysModal({ onClose }) {
    return (
        <div>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--text-muted)" style={{ marginBottom: '1rem' }}>
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Passkeys not configured
                </p>
                <p style={infoStyle}>
                    Passkeys use WebAuthn and require a secure server for challenge/response verification.
                    This feature is available when the backend is configured.
                </p>
            </div>
            <button style={{ ...btnSecondary, marginLeft: 0, width: '100%' }} onClick={onClose}>Close</button>
        </div>
    );
}

function TwoFAModal({ onClose }) {
    return (
        <div>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--text-muted)" style={{ marginBottom: '1rem' }}>
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                </svg>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Two-Step Verification
                </p>
                <p style={infoStyle}>
                    TOTP-based 2FA (Google Authenticator) requires server-side secret key management
                    and a QR code generator. This feature is ready to activate with backend configuration.
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
                    Firebase Phone Multi-Factor Auth is available — contact your admin to enable it.
                </p>
            </div>
            <button style={{ ...btnSecondary, marginLeft: 0, width: '100%' }} onClick={onClose}>Close</button>
        </div>
    );
}

function AccountInfoModal({ onClose, requestAccountInfo }) {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const handleRequest = async () => {
        setLoading(true); setError('');
        try {
            await requestAccountInfo();
            setDone(true);
        } catch (e) {
            setError('Failed to generate account data. Please try again.');
        } finally { setLoading(false); }
    };

    if (done) return (
        <div>
            <p style={successStyle}>✓ Your account data has been downloaded.</p>
            <p style={infoStyle}>The file contains your profile, settings, and messages.</p>
            <button style={btnPrimary} onClick={onClose}>Done</button>
        </div>
    );

    return (
        <div>
            <p style={infoStyle}>
                Generate a JSON file containing your profile info, messages, and account settings.
                The file will download immediately.
            </p>
            {error && <p style={errorStyle}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={btnPrimary} onClick={handleRequest} disabled={loading}>
                    {loading ? 'Generating...' : 'Download My Data'}
                </button>
                <button style={btnSecondary} onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

function AddAccountModal({ onClose }) {
    return (
        <div>
            <p style={infoStyle}>
                Multi-account support allows you to switch between different accounts without signing out.
                Sign in with another account to add it.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '1rem' }}>
                This feature requires session isolation support. Currently, only one active session is maintained.
            </p>
            <button style={{ ...btnSecondary, marginLeft: 0, width: '100%' }} onClick={onClose}>Close</button>
        </div>
    );
}

export default AccountPage;
