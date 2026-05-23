import React, { useState, useRef } from 'react';
import { storage } from '../firebase/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import AccountModal from './AccountModal';

// Import professional avatars
import m1 from '../assets/avatars/professional/male-1.svg';
import m2 from '../assets/avatars/professional/male-2.svg';
import m3 from '../assets/avatars/professional/male-3.svg';
import m4 from '../assets/avatars/professional/male-4.svg';
import m5 from '../assets/avatars/professional/male-5.svg';
import m6 from '../assets/avatars/professional/male-6.svg';
import m7 from '../assets/avatars/professional/male-7.svg';
import m8 from '../assets/avatars/professional/male-8.svg';
import m9 from '../assets/avatars/professional/male-9.svg';
import m10 from '../assets/avatars/professional/male-10.svg';
import m11 from '../assets/avatars/professional/male-11.svg';
import m12 from '../assets/avatars/professional/male-12.svg';

import f1 from '../assets/avatars/professional/female-1.svg';
import f2 from '../assets/avatars/professional/female-2.svg';
import f3 from '../assets/avatars/professional/female-3.svg';
import f4 from '../assets/avatars/professional/female-4.svg';
import f5 from '../assets/avatars/professional/female-5.svg';
import f6 from '../assets/avatars/professional/female-6.svg';
import f7 from '../assets/avatars/professional/female-7.svg';
import f8 from '../assets/avatars/professional/female-8.svg';
import f9 from '../assets/avatars/professional/female-9.svg';
import f10 from '../assets/avatars/professional/female-10.svg';
import f11 from '../assets/avatars/professional/female-11.svg';
import f12 from '../assets/avatars/professional/female-12.svg';

const PRESET_AVATARS = [
    { id: 'm1', url: m1 }, { id: 'm2', url: m2 }, { id: 'm3', url: m3 }, { id: 'm4', url: m4 },
    { id: 'm5', url: m5 }, { id: 'm6', url: m6 }, { id: 'm7', url: m7 }, { id: 'm8', url: m8 },
    { id: 'm9', url: m9 }, { id: 'm10', url: m10 }, { id: 'm11', url: m11 }, { id: 'm12', url: m12 },
    { id: 'f1', url: f1 }, { id: 'f2', url: f2 }, { id: 'f3', url: f3 }, { id: 'f4', url: f4 },
    { id: 'f5', url: f5 }, { id: 'f6', url: f6 }, { id: 'f7', url: f7 }, { id: 'f8', url: f8 },
    { id: 'f9', url: f9 }, { id: 'f10', url: f10 }, { id: 'f11', url: f11 }, { id: 'f12', url: f12 },
];

function AvatarModal({ user, onClose, onUpdate }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            return setError('Only JPG, PNG, and WEBP are supported.');
        }
        if (file.size > 5 * 1024 * 1024) {
            return setError('Image size must be less than 5MB.');
        }

        setError('');
        setUploading(true);

        try {
            // Processing/Compression Placeholder (Square crop is trickier without a library,
            // but we'll upload and use CSS object-fit: cover on display)
            const fileName = `${user.uid}_${Date.now()}.jpg`;
            const storageRef = ref(storage, `avatars/${fileName}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(prog);
                },
                (err) => {
                    console.error('Upload error:', err);
                    setError('Upload failed. Please try again.');
                    setUploading(false);
                },
                async () => {
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    await onUpdate({ type: 'custom', url: downloadUrl });
                    setUploading(false);
                    onClose();
                }
            );
        } catch (err) {
            console.error('Avatar update failed:', err);
            setError('Something went wrong.');
            setUploading(false);
        }
    };

    const handleSelectPreset = async (preset) => {
        setUploading(true);
        try {
            await onUpdate({ type: 'preset', url: preset.url, presetId: preset.id });
            onClose();
        } catch (err) {
            setError('Failed to update avatar.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        setUploading(true);
        try {
            await onUpdate({ type: 'initials', url: null });
            onClose();
        } catch (err) {
            setError('Failed to remove avatar.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <AccountModal title="Change Avatar" onClose={onClose}>
            <div style={{ padding: '0.5rem 0' }}>
                {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

                {/* Main Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        style={{
                            flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)',
                            background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                        }}
                    >
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
                        </svg>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Upload Photo</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileUpload}
                    />

                    {user?.photoURL && (
                        <button
                            onClick={handleRemove}
                            disabled={uploading}
                            style={{
                                flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)',
                                background: 'var(--bg-primary)', color: '#f87171', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Remove Photo</span>
                        </button>
                    )}
                </div>

                {uploading && (
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ height: '4px', width: '100%', background: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', transition: 'width 0.3s ease' }} />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center' }}>
                            {progress > 0 && progress < 100 ? `Uploading... ${Math.round(progress)}%` : 'Processing...'}
                        </p>
                    </div>
                )}

                {/* Presets Grid */}
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>Default Avatars</h4>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '0.75rem',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    paddingRight: '4px'
                }}>
                    {PRESET_AVATARS.map(preset => (
                        <button
                            key={preset.id}
                            onClick={() => handleSelectPreset(preset)}
                            disabled={uploading}
                            style={{
                                padding: 0, border: 'none', background: 'none', cursor: 'pointer', borderRadius: '50%',
                                outline: user?.presetAvatarId === preset.id ? '2px solid var(--accent)' : 'none',
                                outlineOffset: '2px'
                            }}
                        >
                            <img
                                src={preset.url}
                                alt={`Preset ${preset.id}`}
                                style={{ width: '100%', aspectRatio: '1/1', borderRadius: '50%', background: 'var(--bg-secondary)' }}
                            />
                        </button>
                    ))}
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </AccountModal>
    );
}

export default AvatarModal;
