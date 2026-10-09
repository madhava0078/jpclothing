import React from 'react';
import { Sparkles } from 'lucide-react';

export default function PromoBanner() {
    return (
        <div style={{
            background: 'linear-gradient(90deg, #180205 0%, #380811 50%, #180205 100%)',
            borderBottom: '1px solid var(--line)',
            color: '#f5d061',
            padding: '8px 16px',
            fontSize: '0.86rem',
            fontWeight: 700,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="var(--brand)" />
                <span>✨ JP CLOTHING Festive Collection | WhatsApp Orders: <strong>9344634124</strong></span>
            </div>
            <div style={{
                background: 'var(--brand-light)',
                border: '1px solid var(--brand)',
                color: 'var(--brand)',
                padding: '2px 10px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                letterSpacing: '0.04em'
            }}>
                Code: <strong>JPGOLD20</strong>
            </div>
        </div>
    );
}
