import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export default function Toast({ message, onClose }) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            onClose();
        }, 2000);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    if (!message) return null;

    return (
        <div
            id="toast"
            role="status"
            className="on"
            style={{
                position: 'fixed',
                left: '50%',
                bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
                transform: 'translateX(-50%)',
                background: 'var(--ink)',
                color: 'var(--bg)',
                padding: '12px 22px',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '0.92rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                pointerEvents: 'none',
                transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: 1
            }}
        >
            <CheckCircle size={18} color="var(--brand)" />
            <span>{message}</span>
        </div>
    );
}
