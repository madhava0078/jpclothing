import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';

export default function WishlistDrawer({
    isOpen,
    onClose,
    wishlistItems,
    onMoveToCart,
    onRemoveWishlist
}) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 70,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'flex-end'
        }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    height: '100%',
                    background: 'var(--card)',
                    color: 'var(--ink)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-lg)',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
                className="animate-slide-in"
            >
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Heart size={22} color="var(--accent)" fill="var(--accent)" />
                        <h2 style={{ fontSize: '1.3rem', fontFamily: 'Fredoka, sans-serif' }}>
                            Your Wishlist ({wishlistItems.length})
                        </h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                    {wishlistItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--mute)' }}>
                            <Heart size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)' }}>No favorites yet</h3>
                            <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>Tap the heart icon on any outfit to save it here!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {wishlistItems.map((item) => (
                                <div
                                    key={item.id}
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        padding: '12px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--line)',
                                        background: 'var(--bg)',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: item.bg || '#eee', flexShrink: 0 }}>
                                        {item.image ? (
                                            <img src={item.image} alt={item.n} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{item.n.substring(0, 2)}</div>
                                        )}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '0.95rem', fontFamily: 'Fredoka, sans-serif' }}>{item.n}</h4>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--mute)' }}>{item.a}</div>
                                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--ink)' }}>₹{item.p}</div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <button
                                            onClick={() => onMoveToCart(item)}
                                            style={{
                                                background: 'var(--brand)',
                                                color: 'var(--brand-ink)',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '6px 10px',
                                                fontSize: '0.78rem',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            <ShoppingBag size={12} /> Add
                                        </button>
                                        <button
                                            onClick={() => onRemoveWishlist(item)}
                                            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.78rem', textAlign: 'center' }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
