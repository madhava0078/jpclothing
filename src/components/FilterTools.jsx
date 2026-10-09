import React from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES, AGE_RANGES } from '../data/products';

export default function FilterTools({
    activeCategory,
    setActiveCategory,
    activeAge,
    setActiveAge,
    sortOption,
    setSortOption,
    totalResults
}) {
    return (
        <div style={{ margin: '24px 0 20px' }}>
            <div className="tools" id="tools" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>

                {/* Category Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            className="chip"
                            aria-pressed={activeCategory === cat ? "true" : "false"}
                            data-c={cat}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Age Filter Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <select
                        value={activeAge}
                        onChange={(e) => setActiveAge(e.target.value)}
                        aria-label="Filter by age"
                        style={{
                            border: '1px solid var(--line)',
                            background: 'var(--card)',
                            color: 'var(--ink)',
                            borderRadius: '999px',
                            padding: '7px 14px',
                            font: '700 0.88rem Nunito, sans-serif',
                            cursor: 'pointer'
                        }}
                    >
                        {AGE_RANGES.map((age) => (
                            <option key={age} value={age}>
                                {age === 'All Ages' ? '👶 All Age Groups' : `Age: ${age}`}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort selector */}
                <select
                    id="sort"
                    aria-label="Sort products"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    style={{
                        marginLeft: 'auto',
                        border: '1px solid var(--line)',
                        background: 'var(--card)',
                        color: 'var(--ink)',
                        borderRadius: '999px',
                        padding: '7px 16px',
                        font: '700 0.88rem Nunito, sans-serif',
                        cursor: 'pointer'
                    }}
                >
                    <option value="f">Featured</option>
                    <option value="l">Price: Low to High</option>
                    <option value="h">Price: High to Low</option>
                    <option value="r">Customer Rating</option>
                </select>
            </div>

            {/* Result stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', color: 'var(--mute)', fontWeight: 600 }}>
                <span>Showing <strong>{totalResults}</strong> {totalResults === 1 ? 'item' : 'items'} in {activeCategory}</span>
                {activeAge !== 'All Ages' && (
                    <button
                        onClick={() => setActiveAge('All Ages')}
                        style={{ background: 'none', border: 'none', color: 'var(--brand)', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
                    >
                        Clear Age Filter ✕
                    </button>
                )}
            </div>
        </div>
    );
}
