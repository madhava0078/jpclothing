import React from 'react';
import { Heart, Star, Eye, ShoppingBag } from 'lucide-react';

const SVG_ICONS = {
    dress: '<path d="M32 8l-8 4-4 18 6 28h12l6-28-4-18-8-4z M24 12l8 10 8-10"/>',
    set: '<path d="M20 10l-12 8 6 10 6-4v26h24V24l6 4 6-10-12-8c-2 6-6 8-12 8s-10-2-12-8z"/>',
    romper: '<path d="M22 8l-10 8 6 8 4-2v14l-4 22h8l4-14 4 14h8l-4-22V22l4 2 6-8-10-8c-2 5-5 7-10 7s-8-2-10-7z"/>',
    tee: '<path d="M20 10l-14 8 6 12 8-4v30h24V26l8 4 6-12-14-8c-2 6-6 8-12 8s-10-2-12-8z"/>'
};

export default function ProductCard({
    product,
    onAddToCart,
    onQuickView,
    isWishlisted,
    onToggleWishlist
}) {
    const discount = product.o ? Math.round(((product.o - product.p) / product.o) * 100) : 0;

    return (
        <article
            className="card"
            style={{
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: 'var(--shadow-sm)'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = 'var(--brand)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--line)';
            }}
        >
            {/* Compact Image Container */}
            <div
                className="img"
                style={{
                    height: '210px',
                    width: '100%',
                    display: 'grid',
                    placeItems: 'center',
                    position: 'relative',
                    background: product.bg || '#28050b',
                    overflow: 'hidden',
                    cursor: 'pointer'
                }}
                onClick={() => onQuickView(product)}
            >
                {/* Render High Quality Image if exists, else fallback SVG */}
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.n}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease'
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                        }}
                    />
                ) : null}

                <div style={{ display: product.image ? 'none' : 'block', width: '50%', height: '50%' }}>
                    <svg
                        viewBox="0 0 64 64"
                        fill={product.fg || 'var(--brand)'}
                        aria-hidden="true"
                        style={{ width: '100%', height: '100%' }}
                        dangerouslySetInnerHTML={{ __html: SVG_ICONS[product.k] || SVG_ICONS.dress }}
                    />
                </div>

                {/* Tag (Sale/New/Bestseller) */}
                {product.t && (
                    <span className="tag" style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: product.t === 'Sale' ? 'var(--accent)' : 'var(--tag)',
                        color: product.t === 'Sale' ? '#fff' : 'var(--tag-ink)',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        padding: '3px 9px',
                        borderRadius: '999px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}>
                        {product.t}
                    </span>
                )}

                {/* Available stock */}
                {Number.isFinite(Number(product.stock ?? product.quantity)) && (product.stock != null || product.quantity != null) && (
                    <span style={{position:'absolute',bottom:8,right:8,background:'rgba(24,2,5,.9)',color:Number(product.stock ?? product.quantity) > 0 ? '#86efac' : '#fca5a5',padding:'4px 8px',borderRadius:7,fontSize:'.72rem',fontWeight:800}}>
                        {(product.stock ?? product.quantity) > 0 ? `${product.stock ?? product.quantity} in stock` : 'Out of stock'}
                    </span>
                )}

                {/* Discount Badge */}
                {discount > 0 && (
                    <span style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        background: 'rgba(24, 2, 5, 0.85)',
                        color: 'var(--brand)',
                        border: '1px solid var(--brand)',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        backdropFilter: 'blur(4px)'
                    }}>
                        {discount}% OFF
                    </span>
                )}

                {/* Wishlist Heart Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product);
                    }}
                    aria-label="Wishlist product"
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'var(--card)',
                        border: '1px solid var(--line)',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        transition: 'transform 0.2s ease'
                    }}
                >
                    <Heart
                        size={16}
                        color={isWishlisted ? "var(--brand)" : "var(--mute)"}
                        fill={isWishlisted ? "var(--brand)" : "none"}
                    />
                </button>

                {/* Quick view button overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s ease'
                }}
                    className="quick-overlay"
                >
                    <span style={{
                        background: 'var(--brand)',
                        color: 'var(--brand-ink)',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: 'var(--gold-glow)'
                    }}>
                        <Eye size={14} /> Quick View
                    </span>
                </div>
            </div>

            {/* Info Section */}
            <div className="info" style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3
                        onClick={() => onQuickView(product)}
                        style={{
                            fontSize: '0.98rem',
                            color: 'var(--ink)',
                            fontFamily: 'Cinzel, sans-serif',
                            fontWeight: 700,
                            cursor: 'pointer',
                            lineHeight: 1.25
                        }}
                    >
                        {product.n}
                    </h3>
                    {product.rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.76rem', fontWeight: 800, color: 'var(--brand)' }}>
                            <Star size={12} fill="var(--brand)" color="var(--brand)" />
                            <span>{product.rating}</span>
                        </div>
                    )}
                </div>

                <span className="age" style={{ color: 'var(--mute)', fontSize: '0.82rem', fontWeight: 600 }}>
                    {product.a}
                </span>

                {/* Price */}
                <div className="price" style={{ fontWeight: 800, fontSize: '1.05rem', margin: '4px 0 8px', color: 'var(--brand)' }}>
                    ₹{product.p}
                    {product.o && (
                        <s style={{ color: 'var(--mute)', fontWeight: 400, fontSize: '0.85rem', marginLeft: '6px', textDecoration: 'line-through' }}>
                            ₹{product.o}
                        </s>
                    )}
                </div>

                {/* Add to Cart button */}
                <button
                    className="add btn-primary"
                    data-i={product.id}
                    onClick={() => onAddToCart(product)}
                    style={{
                        marginTop: 'auto',
                        width: '100%',
                        padding: '7px 12px',
                        fontSize: '0.85rem'
                    }}
                >
                    <ShoppingBag size={15} /> Add to cart
                </button>
            </div>

            <style>{`
        .img:hover .quick-overlay {
          opacity: 1 !important;
        }
      `}</style>
        </article>
    );
}
