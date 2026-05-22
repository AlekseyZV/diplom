import React from 'react';

const Button = ({ children, variant = 'primary', ...props }) => {
    const styles = {
        primary: {
            backgroundColor: '#3498db',
            color: 'white'
        },
        secondary: {
            backgroundColor: '#95a5a6',
            color: 'white'
        },
        danger: {
            backgroundColor: '#e74c3c',
            color: 'white'
        }
    };
    
    return (
        <button
            style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                ...styles[variant]
            }}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;