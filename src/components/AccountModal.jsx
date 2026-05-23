import React from 'react';

/**
 * Reusable modal overlay for Account Settings flows.
 * Renders children inside a centered dialog.
 * Usage: <AccountModal title="..." onClose={fn}> ... </AccountModal>
 */
function AccountModal({ title, onClose, children }) {
    const overlayStyle = {
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
    };
    const dialogStyle = {
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg, 16px)',
        padding: '1.75rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    };
    const headerStyle = {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.25rem',
    };
    const titleStyle = {
        fontSize: '1.1rem', fontWeight: 700,
        color: 'var(--text-primary)', margin: 0,
    };
    const closeBtnStyle = {
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-muted)', padding: '4px', display: 'flex',
    };

    return (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={dialogStyle}>
                <div style={headerStyle}>
                    <h2 style={titleStyle}>{title}</h2>
                    <button style={closeBtnStyle} onClick={onClose} aria-label="Close">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export default AccountModal;
