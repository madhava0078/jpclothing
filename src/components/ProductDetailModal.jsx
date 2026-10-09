import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, MessageSquare, Shield, RefreshCw, Ruler } from 'lucide-react';

export default function ProductDetailModal({
    product,
    onClose,
    onAddToCart,
    isWishlisted,
    onToggleWishlist
}) {
    if (!product) return null;

    const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : 'Standard');
    const [selectedColor, setSelectedColor] = useState(product.colors ? product.colors[0] : null);
    const [quantity, setQuantity] = useState(1);
    const [pincode, setPincode] = useState('');
    const [pincodeStatus, setPincodeStatus] = useState(null);
    const [showSizeChart, setShowSizeChart] = useState(false);

    const discount = product.o ? Math.round(((product.o - product.p) / product.o) * 100) : 0;

    const handleCheckPincode = (e) => {
        e.preventDefault();
        if (pincode.length === 6 && /^\d+$/.test(pincode)) {
            setPincodeStatus({ valid: true, msg: 'Eligible for Express Delivery! Delivered in 2-3 days.' });
        } else {
            setPincodeStatus({ valid: false, msg: 'Please enter a valid 6-digit Indian PIN code.' });
        }
    };

    const handleWhatsAppOrder = () => {
        const message = `Hello JP CLOTHING! 👋 (Styles that defines you)
I would like to order:
🛍️ Outfit: ${product.n}
📏 Size: ${selectedSize}
🎨 Color: ${selectedColor ? selectedColor.name : 'Default'}
🔢 Quantity: ${quantity}
💰 Total Price: ₹${product.p * quantity}

Please confirm availability! My contact: ${product.phone || '9344634124'}`;

        const whatsappUrl = `https://wa.me/919344634124?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto'
        }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'var(--card)',
                    color: 'var(--ink)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-lg)',
                    maxWidth: '850px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    position: 'relative',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '28px'
                }}
                onClick={(e) => e.stopPropagation()}
                className="animate-fade-in"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label="Close details"
                    style={{
                        position: 'absolute',
                        top: '18px',
                        right: '18px',
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    <X size={20} color="var(--ink)" />
                </button>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '28px',
                    marginTop: '8px'
                }}>

                    {/* Left Column - Image & Badges */}
                    <div>
                        <div style={{
                            aspectRatio: '1 / 1',
                            borderRadius: 'var(--radius-md)',
                            background: product.bg || '#28050b',
                            overflow: 'hidden',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--line)'
                        }}>
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.n}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ fontSize: '3rem', fontWeight: 800, color: product.fg }}>
                                    {product.n}
                                </div>
                            )}

                            {product.t && (
                                <span style={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '12px',
                                    background: 'var(--brand)',
                                    color: 'var(--brand-ink)',
                                    fontWeight: 800,
                                    fontSize: '0.8rem',
                                    padding: '4px 12px',
                                    borderRadius: '999px',
                                    boxShadow: 'var(--gold-glow)'
                                }}>
                                    {product.t}
                                </span>
                            )}
                        </div>

                        {/* Guarantees */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                            <div style={{ background: 'var(--bg)', padding: '10px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--line)' }}>
                                <Shield size={16} color="var(--brand)" /> 100% Skin Safe
                            </div>
                            <div style={{ background: 'var(--bg)', padding: '10px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--line)' }}>
                                <RefreshCw size={16} color="var(--brand)" /> 7-Day Easy Exchange
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Product Info & Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                            <span style={{ color: 'var(--brand)', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase' }}>
                                JP CLOTHING • {product.c} Collection • Age: {product.a}
                            </span>
                            <h2 style={{ fontSize: '1.65rem', color: 'var(--ink)', marginTop: '4px', fontFamily: 'Cinzel, serif' }}>
                                {product.n}
                            </h2>

                            {/* Rating */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--brand-light)', color: 'var(--brand)', border: '1px solid var(--brand)', padding: '2px 8px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 800 }}>
                                    <Star size={14} fill="var(--brand)" color="var(--brand)" />
                                    <span>{product.rating || '4.8'}</span>
                                </div>
                                <span style={{ color: 'var(--mute)', fontSize: '0.84rem', fontWeight: 600 }}>
                                    ({product.reviewsCount || 85} verified reviews)
                                </span>
                            </div>
                        </div>

                        {/* Price */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand)' }}>
                                ₹{product.p}
                            </span>
                            {product.o && (
                                <s style={{ color: 'var(--mute)', fontSize: '1.1rem', textDecoration: 'line-through' }}>
                                    ₹{product.o}
                                </s>
                            )}
                            {discount > 0 && (
                                <span style={{ background: 'var(--brand)', color: 'var(--brand-ink)', padding: '2px 10px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 800 }}>
                                    Save {discount}%
                                </span>
                            )}
                        </div>

                        <p style={{ color: 'var(--ink-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                            {product.description}
                        </p>

                        {/* Size Selection */}
                        {product.sizes && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <label style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--ink)' }}>Select Size:</label>
                                    <button
                                        onClick={() => setShowSizeChart(!showSizeChart)}
                                        style={{ background: 'none', border: 'none', color: 'var(--brand)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Ruler size={14} /> Size Guide
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '8px',
                                                border: selectedSize === size ? '2px solid var(--brand)' : '1px solid var(--line)',
                                                background: selectedSize === size ? 'var(--brand-light)' : 'var(--card)',
                                                color: selectedSize === size ? 'var(--brand)' : 'var(--ink)',
                                                fontWeight: 800,
                                                fontSize: '0.88rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>

                                {showSizeChart && (
                                    <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', padding: '10px', borderRadius: '8px', marginTop: '8px', fontSize: '0.78rem', color: 'var(--mute)' }}>
                                        💡 Tip: If your child is between sizes, we recommend picking 1 size up for growing comfort.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Color Swatches */}
                        {product.colors && (
                            <div>
                                <label style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--ink)', display: 'block', marginBottom: '6px' }}>
                                    Color: <span style={{ color: 'var(--mute)', fontWeight: 600 }}>{selectedColor?.name}</span>
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {product.colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color)}
                                            title={color.name}
                                            style={{
                                                width: '30px',
                                                height: '30px',
                                                borderRadius: '50%',
                                                backgroundColor: color.hex,
                                                border: selectedColor?.name === color.name ? '3px solid var(--brand)' : '1px solid var(--line)',
                                                cursor: 'pointer',
                                                transform: selectedColor?.name === color.name ? 'scale(1.15)' : 'scale(1)',
                                                transition: 'transform 0.2s ease'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Modifier */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <label style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--ink)' }}>Quantity:</label>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: '8px', background: 'var(--bg)' }}>
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    style={{ border: 'none', background: 'none', padding: '6px 12px', fontWeight: 800, cursor: 'pointer', color: 'var(--ink)' }}
                                >
                                    -
                                </button>
                                <span style={{ padding: '0 12px', fontWeight: 800, fontSize: '0.95rem' }}>{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    style={{ border: 'none', background: 'none', padding: '6px 12px', fontWeight: 800, cursor: 'pointer', color: 'var(--ink)' }}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Delivery Pincode Checker */}
                        <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px', marginTop: '4px' }}>
                            <form onSubmit={handleCheckPincode} style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit Pincode"
                                    maxLength={6}
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--line)',
                                        background: 'var(--bg)',
                                        color: 'var(--ink)',
                                        fontSize: '0.88rem'
                                    }}
                                />
                                <button type="submit" className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.84rem' }}>
                                    Check
                                </button>
                            </form>
                            {pincodeStatus && (
                                <div style={{ fontSize: '0.8rem', marginTop: '6px', fontWeight: 700, color: pincodeStatus.valid ? 'var(--brand)' : 'var(--accent)' }}>
                                    {pincodeStatus.msg}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => {
                                        onAddToCart({
                                            ...product,
                                            selectedSize,
                                            selectedColor: selectedColor?.name,
                                            quantity
                                        });
                                        onClose();
                                    }}
                                    className="btn-primary"
                                    style={{ flex: 1, padding: '12px 20px', fontSize: '1rem' }}
                                >
                                    <ShoppingBag size={18} /> Add to Cart (₹{product.p * quantity})
                                </button>

                                <button
                                    onClick={() => onToggleWishlist(product)}
                                    className="btn-icon"
                                    style={{ width: '48px', height: '48px', borderRadius: '12px' }}
                                >
                                    <Heart size={20} color={isWishlisted ? "var(--brand)" : "var(--ink)"} fill={isWishlisted ? "var(--brand)" : "none"} />
                                </button>
                            </div>

                            {/* Order via WhatsApp (9344634124) */}
                            <button
                                onClick={handleWhatsAppOrder}
                                style={{
                                    background: '#25d366',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '11px 16px',
                                    fontFamily: 'Nunito, sans-serif',
                                    fontWeight: 800,
                                    fontSize: '0.96rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)'
                                }}
                            >
                                <MessageSquare size={18} /> Instant WhatsApp Order (9344634124)
                            </button>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}
