import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Sparkles, MessageSquare, Phone } from 'lucide-react';

export default function Hero({ activeCategory, setActiveCategory }) {
    return (
        <div style={{
            maxWidth: '1140px',
            margin: '20px auto 0',
            padding: '0 16px'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(56, 9, 18, 0.9) 0%, rgba(24, 2, 5, 0.95) 100%)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '36px 30px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                alignItems: 'center'
            }}>

                {/* Background ambient glow */}
                <div style={{
                    position: 'absolute',
                    top: '-40px',
                    right: '-40px',
                    width: '240px',
                    height: '240px',
                    borderRadius: '50%',
                    background: 'rgba(212, 175, 55, 0.12)',
                    filter: 'blur(30px)',
                    pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 2 }}>
                    <span style={{
                        background: 'var(--brand-light)',
                        border: '1px solid var(--brand)',
                        color: 'var(--brand-dark)',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        padding: '4px 14px',
                        borderRadius: '999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '14px'
                    }}>
                        <Sparkles size={14} /> Official JP Clothing Fashion Store
                    </span>

                    <h1 style={{
                        fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
                        color: '#ffffff',
                        lineHeight: 1.15,
                        marginBottom: '6px',
                        fontFamily: 'Cinzel, serif'
                    }}>
                        JP CLOTHING
                    </h1>

                    <p className="brand-text" style={{
                        fontSize: '1.15rem',
                        fontStyle: 'italic',
                        fontWeight: 700,
                        marginBottom: '16px'
                    }}>
                        "Styles that defines you .."
                    </p>

                    <p style={{
                        color: 'var(--ink-secondary)',
                        fontSize: '1.02rem',
                        fontWeight: 600,
                        marginBottom: '24px',
                        lineHeight: 1.5
                    }}>
                        Exclusive, premium outfits for kids & families. Handpicked fabrics, traditional festive wear, and comfortable daily wear.
                    </p>

                    {/* Quick WhatsApp order pill */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <a
                            href="https://wa.me/919344634124"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                background: '#25d366',
                                color: '#ffffff',
                                borderRadius: '999px',
                                padding: '10px 20px',
                                fontWeight: 800,
                                fontSize: '0.92rem',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)'
                            }}
                        >
                            <MessageSquare size={18} /> WhatsApp Order: 9344634124
                        </a>
                    </div>

                    {/* Key trust badges */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 700, color: 'var(--ink)' }}>
                            <ShieldCheck size={18} color="var(--brand)" /> Premium Fabrics
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 700, color: 'var(--ink)' }}>
                            <Truck size={18} color="var(--brand)" /> Express Shipping
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 700, color: 'var(--ink)' }}>
                            <RotateCcw size={18} color="var(--brand)" /> 7-Day Returns
                        </div>
                    </div>
                </div>

                {/* Right Emblem Card */}
                <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
                    <div style={{
                        width: '210px',
                        height: '210px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '4px solid var(--brand)',
                        boxShadow: '0 0 35px rgba(212, 175, 55, 0.4)',
                        background: '#180205'
                    }}>
                        <img
                            src="/images/jp_logo.jpeg"
                            alt="JP Clothing Emblem"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
