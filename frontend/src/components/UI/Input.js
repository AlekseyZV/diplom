import React from 'react';

const Input = ({ label, error, ...props }) => {
    return (
        <div style={{ marginBottom: '15px' }}>
            {label && <label style={{ display: 'block', marginBottom: '5px' }}>{label}</label>}
            <input
                style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${error ? '#e74c3c' : '#ddd'}`,
                    borderRadius: '4px',
                    fontSize: '16px'
                }}
                {...props}
            />
            {error && <span style={{ color: '#e74c3c', fontSize: '14px' }}>{error}</span>}
        </div>
    );
};

export default Input;