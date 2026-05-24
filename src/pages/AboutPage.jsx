import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { APP_VERSION, BUILD_NUMBER } from '../data/help-data';

function AboutPage() {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <header className="page-header">
                <button className="page-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </button>
                <h1 className="page-title">About CLYRA</h1>
            </header>

            <div className="settings-content" style={{ paddingBottom: '40px' }}>
                {/* Hero Section */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '40px 20px',
                    textAlign: 'center'
                }}>
                    <Logo size={80} />
                    <h2 style={{
                        marginTop: '16px',
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'var(--text-primary)'
                    }}>CLYRA</h2>
                    <p style={{
                        marginTop: '8px',
                        fontSize: '0.9rem',
                        color: 'var(--text-muted)',
                        maxWidth: '280px'
                    }}>Your Words. Your Space. Secure and elegant communication for everyone.</p>
                </div>

                {/* Mission Section */}
                <div className="settings-group" style={{ padding: '20px' }}>
                    <h3 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '12px',
                        color: 'var(--accent)'
                    }}>Our Mission</h3>
                    <p style={{
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        color: 'var(--text-secondary)'
                    }}>
                        At CLYRA, we believe that communication is a human right. Our mission is to bridge connections through
                        tools that are as secure as they are beautiful. We build for the moments that matter, ensuring your
                        conversations remain private, permanent, and personal.
                    </p>
                </div>

                {/* Values Section */}
                <div className="settings-group" style={{ padding: '20px' }}>
                    <h3 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '12px',
                        color: 'var(--accent)'
                    }}>Core Values</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>Privacy First</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>We don't just protect your data; we respect your space. Encryption is at our core.</span>
                        </div>
                        <div>
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>Simple Perfection</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Every pixel and every line of code is crafted to provide a seamless, intuitive experience.</span>
                        </div>
                        <div>
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>Human Connection</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Technology should bring us closer, not get in the way. We focus on what makes chat feel real.</span>
                        </div>
                    </div>
                </div>

                {/* App Info Footer */}
                <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                }}>
                    <span>Version {APP_VERSION}</span>
                    <span>Build {BUILD_NUMBER}</span>
                    <span style={{ marginTop: '8px' }}>&copy; {new Date().getFullYear()} CLYRA Inc.</span>
                </div>
            </div>
        </div>
    );
}

export default AboutPage;
