import React from 'react';

export function Spinner({ size, color }) {
    const customStyle = {};
    if (size) {
        customStyle.width = size;
        customStyle.height = size;
    }
    if (color) {
        customStyle.borderTopColor = color;
    }

    return (
        <div 
            className="circular-spinner" 
            style={customStyle} 
            role="status" 
            aria-label="Loading"
        />
    );
}

export default Spinner;
