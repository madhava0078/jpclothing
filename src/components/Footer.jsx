import React from 'react';
import { Heart, Sparkles, Phone, Mail, MapPin, MessageSquare } from 'lucide-react';

export default function Footer() {
    return (
        <footer style={{
            borderTop: '1px solid var(--line)',
            background: 'var(--card)',
            color: 'var(--mute)',
            padding: '40px 16px 24px',
            fontSize: '0.9rem',
            marginTop: '60px'
        }}>
            <div style={{ maxWidth: '1140px', margin: '0 auto' }}>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '32px',
                    marginBottom: '32px'
                }}>

                    {/* Column 1 - Brand Info */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--brand)' }}>
                                <img src="/images/jp_logo.jpeg" alt="JP Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div>
                                <span style={{ fontSize: '1.25rem', fontFamily: 'Cinzel, serif', fontWeight: 800 }} className="brand-text">
                                    JP CLOTHING
                                </span>
                                <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--mute)', fontStyle: 'italic' }}>
                                    Styles that defines you ..
                                </span>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.86rem', lineHeight: 1.6, color: 'var(--ink-secondary)' }}>
                            Delivering high-end, comfortable, skin-friendly fashion for kids and families with luxury craftsmanship.
                        </p>
                    </div>

                    {/* Column 2 - Categories */}
                    <div>
                        <h4 style={{ color: 'var(--brand)', fontSize: '1rem', fontFamily: 'Cinzel, serif', marginBottom: '12px' }}>
                            Fashion Collections
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                            <li>Girls Frocks & Party Dresses</li>
                            <li>Boys Pajama & Kurta Sets</li>
                            <li>Infant Organic Rompers & Swaddles</li>
                            <li>Traditional Festive Wear</li>
                        </ul>
                    </div>

                    {/* Column 3 - Contact & Support */}
                    <div>
                        <h4 style={{ color: 'var(--brand)', fontSize: '1rem', fontFamily: 'Cinzel, serif', marginBottom: '12px' }}>
                            Contact Us
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                            <a
                                href="tel:9344634124"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)', textDecoration: 'none', fontWeight: 700 }}
                            >
                                <Phone size={15} color="var(--brand)" /> 9344634124
                            </a>
                            <a
                                href="https://wa.me/919344634124"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#25d366', textDecoration: 'none', fontWeight: 800 }}
                            >
                                <MessageSquare size={15} /> WhatsApp: 9344634124
                            </a>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Mail size={15} color="var(--brand)" /> support@jpclothing.com
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapPin size={15} color="var(--brand)" /> Tamil Nadu, India
                            </div>
                        </div>
                    </div>

                </div>

                {/* Disclaimer & Copyright */}
                <div style={{
                    borderTop: '1px solid var(--line)',
                    paddingTop: '20px',
                    textAlign: 'center',
                    fontSize: '0.84rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div>
                        © {new Date().getFullYear()} <strong>JP CLOTHING</strong>. All rights reserved. — <em>Styles that defines you ..</em>
                    </div>
                </div>

            </div>
        </footer>
    );
}
