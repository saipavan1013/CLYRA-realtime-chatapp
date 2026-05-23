import React from 'react';
import { useTheme } from '../context/ThemeContext';
import cyraLogoLight from '../assets/logo/cyra-logo-light.png';
import cyraLogoDark from '../assets/logo/cyra-logo-dark.png';

const Logo = ({ size = 120, className = "" }) => {
    const { theme } = useTheme();
    const logoSrc = theme === 'light' ? cyraLogoLight : cyraLogoDark;

    return (
        <div className={`logo-container ${className}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
                src={logoSrc}
                alt="CLYRA Logo"
                style={{
                    height: `${size}px`,
                    width: 'auto',
                    maxWidth: '100%',
                    display: 'block',
                    objectFit: 'contain'
                }}
            />
        </div>
    );
};

export default Logo;
