import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, Check } from 'lucide-react';

export default function CartDrawer({
    isOpen,
    onClose,
    cartItems,
    onUpdateQuantity,
    onRemoveItem,
    onProceedCheckout
}) {
    if (!isOpen) return null;

    const subtotal = cartItems.reduce((acc, item) => acc + item.p * (item.quantity || 1), 0);

    const freeShippingThreshold = 1000;
    const isFreeShipping = subtotal >= freeShippingThreshold || cartItems.length === 0;
    const shippingFee = isFreeShipping ? 0 : 49;
    const discountAmount = 0;
    const grandTotal = subtotal + shippingFee;

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
                    maxWidth: '460px',
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
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShoppingBag size={22} color="var(--brand)" />
                        <h2 style={{ fontSize: '1.35rem', fontFamily: 'Fredoka, sans-serif' }}>
                            Your Shopping Bag ({cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)})
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}
                        aria-label="Close cart drawer"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Free Shipping Progress bar */}
                <div style={{ padding: '12px 24px', background: 'var(--brand-light)', borderBottom: '1px solid var(--line)' }}>
                    {subtotal >= freeShippingThreshold ? (
                        <div style={{ color: 'var(--brand-dark)', fontWeight: 800, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Check size={16} /> 🎉 You earned FREE Express Shipping!
                        </div>
                    ) : (
                        <div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--brand-dark)', fontWeight: 700, marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Add ₹{freeShippingThreshold - subtotal} more for FREE shipping</span>
                                <span>{Math.round((subtotal / freeShippingThreshold) * 100)}%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'rgba(13,148,136,0.2)', borderRadius: '999px', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`, height: '100%', background: 'var(--brand)', borderRadius: '999px' }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Cart Item List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                    {cartItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--mute)' }}>
                            <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)' }}>Your cart is empty</h3>
                            <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>Discover comfortable kids clothes and add your favorites!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {cartItems.map((item, idx) => (
                                <div
                                    key={`${item.id}-${item.selectedSize}-${idx}`}
                                    style={{
                                        display: 'flex',
                                        gap: '14px',
                                        padding: '12px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--line)',
                                        background: 'var(--bg)'
                                    }}
                                >
                                    {/* Image */}
                                    <div style={{
                                        width: '70px',
                                        height: '70px',
                                        borderRadius: '8px',
                                        background: item.bg || '#f3f4f6',
                                        overflow: 'hidden',
                                        flexShrink: 0
                                    }}>
                                        {item.image ? (
                                            <img src={item.image} alt={item.n} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontWeight: 800, color: item.fg }}>
                                                {item.n.substring(0, 2)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '0.98rem', color: 'var(--ink)', fontFamily: 'Fredoka, sans-serif' }}>{item.n}</h4>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--mute)', fontWeight: 700 }}>
                                            Size: {item.selectedSize || item.a} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                                        </div>
                                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--ink)', marginTop: '4px' }}>
                                            ₹{item.p * (item.quantity || 1)}
                                        </div>

                                        {/* Quantity modifier */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--card)' }}>
                                                <button
                                                    onClick={() => onUpdateQuantity(item, (item.quantity || 1) - 1)}
                                                    style={{ border: 'none', background: 'none', padding: '2px 8px', fontWeight: 800, cursor: 'pointer' }}
                                                >
                                                    -
                                                </button>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 800, padding: '0 6px' }}>{item.quantity || 1}</span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item, (item.quantity || 1) + 1)}
                                                    style={{ border: 'none', background: 'none', padding: '2px 8px', fontWeight: 800, cursor: 'pointer' }}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => onRemoveItem(item)}
                                                style={{ border: 'none', background: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }}
                                            >
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Promo code & Total Summary Footer */}
                {cartItems.length > 0 && (
                    <div style={{ padding: '20px 24px', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>

                        <div style={{fontSize:'.86rem',marginBottom:12,color:'var(--mute)'}}>
                            {isFreeShipping ? '🎉 Free delivery unlocked!' : `Add ₹${freeShippingThreshold-subtotal} more for free delivery. Delivery fee: ₹49.`}
                        </div>

                        {/* Calculations */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem', color: 'var(--mute)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Subtotal:</span>
                                <span style={{ fontWeight: 700, color: 'var(--ink)' }}>₹{subtotal}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--brand)' }}>
                                    <span>Discount:</span>
                                    <span style={{ fontWeight: 800 }}>-₹{discountAmount}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Delivery:</span>
                                <span style={{ fontWeight: 700, color: isFreeShipping ? 'var(--brand)' : 'var(--ink)' }}>
                                    {isFreeShipping ? 'FREE' : `₹${shippingFee}`}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)', paddingTop: '8px', borderTop: '1px dashed var(--line)' }}>
                                <span>Total Amount:</span>
                                <span>₹{grandTotal}</span>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <button
                            onClick={() => {
                                onClose();
                                onProceedCheckout({ subtotal, discountAmount, shippingFee, grandTotal });
                            }}
                            className="btn-primary"
                            style={{ width: '100%', marginTop: '16px', padding: '14px', fontSize: '1.05rem' }}
                        >
                            Proceed to Checkout <ArrowRight size={18} />
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
