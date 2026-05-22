import React, { useState } from 'react';

const ProductFilter = ({ categories, onCategoryChange, onSearch }) => {
    const [search, setSearch] = useState('');

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        onSearch(value);
    };

    return (
        <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <input
                type="text"
                placeholder="Поиск товаров..."
                value={search}
                onChange={handleSearchChange}
                style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                }}
            />
            
            <h4 style={{ marginBottom: '10px' }}>Категории</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categories.map(category => (
                    <button
                        key={category.id}
                        onClick={() => onCategoryChange(category.id)}
                        style={{
                            padding: '8px',
                            textAlign: 'left',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProductFilter;