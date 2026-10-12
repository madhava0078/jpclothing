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
    if (!product) {
        return null;
    }

    // =====================================================
    // PRODUCT PRICE AND DISCOUNT
    // =====================================================

    const price = Number(product.p) || 0;
    const originalPrice = Number(product.o) || 0;

    const discount =
        originalPrice > price && originalPrice > 0
            ? Math.round(
                  ((originalPrice - price) / originalPrice) * 100
              )
            : 0;

    // =====================================================
    // STOCK
    // =====================================================

    const rawStock = product.stock ?? product.quantity;

    const stockValue =
        rawStock !== undefined &&
        rawStock !== null &&
        rawStock !== ''
            ? Number(rawStock)
            : null;

    const stockIsValid =
        stockValue !== null &&
        Number.isFinite(stockValue) &&
        stockValue >= 0;

    const hasStock =
        stockIsValid &&
        stockValue > 0;

    const stockLabel = !stockIsValid
        ? 'Stock unavailable'
        : hasStock
            ? `${stockValue} in stock`
            : 'Out of stock';

    // =====================================================
    // SAFE CALLBACKS
    // =====================================================

    const handleQuickView = () => {
        if (typeof onQuickView === 'function') {
            onQuickView(product);
        }
    };

    const handleAddToCart = () => {
        if (!hasStock) {
            return;
        }

        if (typeof onAddToCart === 'function') {
            onAddToCart(product);
        }
    };

    const handleWishlist = (event) => {
        event.stopPropagation();

        if (typeof onToggleWishlist === 'function') {
            onToggleWishlist(product);
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

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
                transition:
                    'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: 'var(--shadow-sm)'
            }}
            onMouseEnter={(event) => {
                event.currentTarget.style.transform =
                    'translateY(-4px)';

                event.currentTarget.style.boxShadow =
                    'var(--shadow-md)';

                event.currentTarget.style.borderColor =
                    'var(--brand)';
            }}
            onMouseLeave={(event) => {
                event.currentTarget.style.transform =
                    'translateY(0)';

                event.currentTarget.style.boxShadow =
                    'var(--shadow-sm)';

                event.currentTarget.style.borderColor =
                    'var(--line)';
            }}
        >
            {/* =================================================
                PRODUCT IMAGE
            ================================================= */}

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
                onClick={handleQuickView}
            >
                {/* Product image */}

                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.n || 'Product'}
                        loading="lazy"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease'
                        }}
                        onError={(event) => {
                            event.currentTarget.style.display =
                                'none';

                            const fallback =
                                event.currentTarget.parentElement
                                    ?.querySelector(
                                        '.product-image-fallback'
                                    );

                            if (fallback) {
                                fallback.style.display = 'block';
                            }
                        }}
                    />
                ) : null}

                {/* Fallback SVG */}

                <div
                    className="product-image-fallback"
                    style={{
                        display: product.image ? 'none' : 'block',
                        width: '50%',
                        height: '50%'
                    }}
                >
                    <svg
                        viewBox="0 0 64 64"
                        fill={product.fg || 'var(--brand)'}
                        aria-hidden="true"
                        style={{
                            width: '100%',
                            height: '100%'
                        }}
                        dangerouslySetInnerHTML={{
                            __html:
                                SVG_ICONS[product.k] ||
                                SVG_ICONS.dress
                        }}
                    />
                </div>

                {/* =================================================
                    PRODUCT TAG
                ================================================= */}

                {product.t && (
                    <span
                        className="tag"
                        style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background:
                                product.t === 'Sale'
                                    ? 'var(--accent)'
                                    : 'var(--tag)',
                            color:
                                product.t === 'Sale'
                                    ? '#fff'
                                    : 'var(--tag-ink)',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            padding: '3px 9px',
                            borderRadius: '999px',
                            boxShadow:
                                '0 2px 6px rgba(0,0,0,0.2)'
                        }}
                    >
                        {product.t}
                    </span>
                )}

                {/* =================================================
                    STOCK BADGE
                ================================================= */}

                <span
                    className="product-stock-badge"
                    style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        background: 'rgba(24,2,5,.92)',
                        color: !stockIsValid
                            ? '#fcd34d'
                            : hasStock
                                ? '#86efac'
                                : '#fca5a5',
                        padding: '5px 9px',
                        borderRadius: '7px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        zIndex: 2
                    }}
                >
                    {stockLabel}
                </span>

                {/* =================================================
                    DISCOUNT BADGE
                ================================================= */}

                {discount > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            bottom: '8px',
                            left: '8px',
                            background: 'rgba(24, 2, 5, 0.85)',
                            color: 'var(--brand)',
                            border: '1px solid var(--brand)',
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            padding: '3px 7px',
                            borderRadius: '6px',
                            backdropFilter: 'blur(4px)',
                            zIndex: 2
                        }}
                    >
                        {discount}% OFF
                    </span>
                )}

                {/* =================================================
                    WISHLIST BUTTON
                ================================================= */}

                <button
                    type="button"
                    onClick={handleWishlist}
                    aria-label={
                        isWishlisted
                            ? 'Remove from wishlist'
                            : 'Add to wishlist'
                    }
                    aria-pressed={Boolean(isWishlisted)}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'var(--card)',
                        border: '1px solid var(--line)',
                        borderRadius: '50%',
                        width: '34px',
                        height: '34px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        zIndex: 3
                    }}
                >
                    <Heart
                        size={16}
                        color={
                            isWishlisted
                                ? 'var(--brand)'
                                : 'var(--mute)'
                        }
                        fill={
                            isWishlisted
                                ? 'var(--brand)'
                                : 'none'
                        }
                    />
                </button>

                {/* =================================================
                    QUICK VIEW OVERLAY
                ================================================= */}

                <div
                    className="quick-overlay"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        pointerEvents: 'none'
                    }}
                >
                    <span
                        style={{
                            background: 'var(--brand)',
                            color: 'var(--brand-ink)',
                            padding: '7px 14px',
                            borderRadius: '999px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: 'var(--gold-glow)'
                        }}
                    >
                        <Eye size={14} />
                        Quick View
                    </span>
                </div>
            </div>

            {/* =================================================
                PRODUCT INFORMATION
            ================================================= */}

            <div
                className="info"
                style={{
                    padding: '12px 14px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    flex: 1
                }}
            >
                {/* Product name and rating */}

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '8px'
                    }}
                >
                    <h3
                        onClick={handleQuickView}
                        style={{
                            fontSize: '0.98rem',
                            color: 'var(--ink)',
                            fontFamily: 'Cinzel, sans-serif',
                            fontWeight: 700,
                            cursor: 'pointer',
                            lineHeight: 1.35,
                            margin: 0,
                            overflowWrap: 'anywhere'
                        }}
                    >
                        {product.n || 'Unnamed Product'}
                    </h3>

                    {product.rating != null &&
                        Number(product.rating) > 0 && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontSize: '0.76rem',
                                    fontWeight: 800,
                                    color: 'var(--brand)',
                                    flexShrink: 0
                                }}
                            >
                                <Star
                                    size={12}
                                    fill="var(--brand)"
                                    color="var(--brand)"
                                />

                                <span>{product.rating}</span>
                            </div>
                        )}
                </div>

                {/* Age/category description */}

                {product.a && (
                    <span
                        className="age"
                        style={{
                            color: 'var(--mute)',
                            fontSize: '0.82rem',
                            fontWeight: 600
                        }}
                    >
                        {product.a}
                    </span>
                )}

                {/* =================================================
                    PRICE
                ================================================= */}

                <div
                    className="price"
                    style={{
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        margin: '5px 0 8px',
                        color: 'var(--brand)'
                    }}
                >
                    ₹{price.toLocaleString('en-IN')}

                    {originalPrice > price && (
                        <s
                            style={{
                                color: 'var(--mute)',
                                fontWeight: 400,
                                fontSize: '0.85rem',
                                marginLeft: '7px',
                                textDecoration: 'line-through'
                            }}
                        >
                            ₹
                            {originalPrice.toLocaleString('en-IN')}
                        </s>
                    )}
                </div>

                {/* =================================================
                    ADD TO CART
                ================================================= */}

                <button
                    type="button"
                    className="add btn-primary"
                    data-i={product.id}
                    disabled={!hasStock}
                    onClick={handleAddToCart}
                    title={
                        !stockIsValid
                            ? 'Stock information is unavailable'
                            : !hasStock
                                ? 'This product is out of stock'
                                : 'Add this product to your cart'
                    }
                    style={{
                        marginTop: 'auto',
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '7px',
                        opacity: hasStock ? 1 : 0.55,
                        cursor: hasStock
                            ? 'pointer'
                            : 'not-allowed'
                    }}
                >
                    <ShoppingBag size={15} />

                    {!stockIsValid
                        ? 'Stock Unavailable'
                        : hasStock
                            ? 'Add to Cart'
                            : 'Out of Stock'}
                </button>
            </div>

            {/* =================================================
                COMPONENT STYLES
            ================================================= */}

            <style>
                {`
                    .img:hover .quick-overlay {
                        opacity: 1 !important;
                    }

                    .product-stock-badge {
                        max-width: calc(100% - 16px);
                        text-align: center;
                    }

                    .card button:disabled {
                        pointer-events: none;
                    }
                `}
            </style>
        </article>
    );
}
