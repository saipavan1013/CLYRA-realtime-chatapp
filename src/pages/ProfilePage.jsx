import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import AvatarModal from '../components/AvatarModal';

function ProfilePage() {
    const navigate = useNavigate();
    const { user, updateUserProfile, updateUserAvatar } = useAuth();
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    const displayName = user?.displayName || user?.username || user?.email?.split('@')[0] || 'User';
    const aboutText = user?.about || 'Hey there! I am using CLYRA.';
    const email = user?.email || '';

    // Name editing state
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameValue, setNameValue] = useState(displayName);
    const [nameError, setNameError] = useState('');
    const [savingName, setSavingName] = useState(false);

    // About editing state
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [aboutValue, setAboutValue] = useState(aboutText);
    const [savingAbout, setSavingAbout] = useState(false);

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    };

    // --- Name Handlers ---
    const handleEditName = () => {
        setNameValue(user?.displayName || user?.username || displayName);
        setNameError('');
        setIsEditingName(true);
    };

    const handleSaveName = async () => {
        const trimmed = nameValue.trim();
        if (!trimmed) {
            setNameError('Name cannot be empty.');
            return;
        }
        setSavingName(true);
        try {
            await updateUserProfile({ username: trimmed });
            setIsEditingName(false);
            setNameError('');
        } catch (e) {
            setNameError('Failed to save. Please try again.');
        } finally {
            setSavingName(false);
        }
    };

    const handleCancelName = () => {
        setNameValue(displayName);
        setNameError('');
        setIsEditingName(false);
    };

    // --- About Handlers ---
    const handleEditAbout = () => {
        setAboutValue(user?.about || aboutText);
        setIsEditingAbout(true);
    };

    const handleSaveAbout = async () => {
        const trimmed = aboutValue.trim();
        setSavingAbout(true);
        try {
            await updateUserProfile({ about: trimmed.slice(0, 150) });
            setIsEditingAbout(false);
        } catch (e) {
            console.error('Failed to update about:', e);
        } finally {
            setSavingAbout(false);
        }
    };

    const handleCancelAbout = () => {
        setAboutValue(user?.about || aboutText);
        setIsEditingAbout(false);
    };

    const PencilIcon = () => (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
    );

    return (
        <div className="page-container">
            <header className="page-header">
                <button className="page-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </button>
                <h1 className="page-title">Profile</h1>
            </header>

            <div className="profile-content">
                <div
                    className="profile-avatar-section"
                    onClick={() => setIsAvatarModalOpen(true)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                >
                    <div className="profile-avatar-large" style={{ position: 'relative', overflow: 'hidden' }}>
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={displayName} className="profile-avatar-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            getInitials(user?.displayName || user?.username || displayName)
                        )}

                        {/* Hover Overlay */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.4)', color: '#fff',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            opacity: 0, transition: 'opacity 0.2s',
                        }} className="avatar-hover-overlay">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M12 12m-3.2 0a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5z" />
                            </svg>
                            <span style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: 600 }}>CHANGE</span>
                        </div>
                    </div>
                </div>

                <style>{`
                    .profile-avatar-large:hover .avatar-hover-overlay {
                        opacity: 1 !important;
                    }
                `}</style>

                {isAvatarModalOpen && (
                    <AvatarModal
                        user={user}
                        onClose={() => setIsAvatarModalOpen(false)}
                        onUpdate={updateUserAvatar}
                    />
                )}

                {/* Your Name Section */}
                <section className="profile-section">
                    <label className="profile-label">Your Name</label>
                    {isEditingName ? (
                        <div>
                            <input
                                className="profile-input"
                                type="text"
                                value={nameValue}
                                onChange={(e) => { setNameValue(e.target.value); setNameError(''); }}
                                autoFocus
                                maxLength={60}
                                style={{ width: '100%', marginBottom: '0.5rem' }}
                            />
                            {nameError && <p style={{ color: 'var(--error, #f87171)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{nameError}</p>}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="profile-edit-btn"
                                    onClick={handleSaveName}
                                    disabled={savingName}
                                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', color: 'var(--accent)' }}
                                >
                                    {savingName ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    className="profile-edit-btn"
                                    onClick={handleCancelName}
                                    disabled={savingName}
                                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-value">
                            <span>{user?.displayName || user?.username || displayName}</span>
                            <button className="profile-edit-btn" onClick={handleEditName} aria-label="Edit name">
                                <PencilIcon />
                            </button>
                        </div>
                    )}
                    <p className="profile-info-text">
                        This is not your username or pin. This name will be visible to your contacts.
                    </p>
                </section>

                {/* About Section */}
                <section className="profile-section">
                    <label className="profile-label">About</label>
                    {isEditingAbout ? (
                        <div>
                            <textarea
                                className="profile-input"
                                value={aboutValue}
                                onChange={(e) => setAboutValue(e.target.value)}
                                autoFocus
                                maxLength={150}
                                rows={3}
                                style={{ width: '100%', resize: 'vertical', marginBottom: '0.5rem' }}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                {aboutValue.length}/150
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="profile-edit-btn"
                                    onClick={handleSaveAbout}
                                    disabled={savingAbout}
                                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', color: 'var(--accent)' }}
                                >
                                    {savingAbout ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    className="profile-edit-btn"
                                    onClick={handleCancelAbout}
                                    disabled={savingAbout}
                                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-value">
                            <span>{user?.about || aboutText}</span>
                            <button className="profile-edit-btn" onClick={handleEditAbout} aria-label="Edit about">
                                <PencilIcon />
                            </button>
                        </div>
                    )}
                </section>

                {/* Email Section - Read Only */}
                <section className="profile-section">
                    <label className="profile-label">Email</label>
                    <div className="profile-value">
                        {email}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default ProfilePage;
