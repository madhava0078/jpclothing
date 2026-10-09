import React, { useEffect, useState } from 'react';
import { X, User, Mail, Phone, Lock } from 'lucide-react';
import { api, setUserSession } from '../lib/api';

export default function AuthModal({ isOpen, onClose, onUserLogin }) {
    const [authMode, setAuthMode] = useState('login');
    const [loginMethod, setLoginMethod] = useState('phone');
    const [userName, setUserName] = useState('');
    const [userContact, setUserContact] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userError, setUserError] = useState('');

    useEffect(() => {
        if (isOpen) setUserError('');
    }, [isOpen]);

    if (!isOpen) return null;

    const reset = () => {
        setUserName('');
        setUserContact('');
        setUserPassword('');
        setConfirmPassword('');
        setUserError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUserError('');
        const contact = userContact.trim().toLowerCase();
        if (!contact || !userPassword) {
            setUserError('Please enter your login details.');
            return;
        }
        if (authMode === 'signup') {
            if (!userName.trim()) return setUserError('Please enter your full name.');
            if (userPassword.length < 6) return setUserError('Password must be at least 6 characters.');
            if (userPassword !== confirmPassword) return setUserError('Passwords do not match.');
        }

        try {
            const data = authMode === 'signup'
                ? await api.signup({ name: userName.trim(), contact, method: loginMethod, password: userPassword })
                : await api.login({ contact, method: loginMethod, password: userPassword });

            setUserSession(data);
            onUserLogin(data.user);
            reset();
            onClose();
        } catch (error) {
            setUserError(error.message);
        }
    };

    return (
        <div style={{ position:'fixed', inset:0, zIndex:90, background:'rgba(0,0,0,.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={onClose}>
            <div style={{ background:'var(--card)', color:'var(--ink)', border:'1px solid var(--line)', borderRadius:'var(--radius-lg)', maxWidth:460, width:'100%', position:'relative', padding:28, boxShadow:'var(--shadow-lg)' }} onClick={e=>e.stopPropagation()}>
                <button onClick={onClose} style={{ position:'absolute', top:18, right:18, background:'none', border:'none', cursor:'pointer', color:'var(--ink)' }}><X size={22}/></button>
                <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--brand)', marginBottom:8 }}>
                    <User size={20}/><strong>Customer Account</strong>
                </div>
                <h3 style={{ fontSize:'1.4rem', fontFamily:'Cinzel, serif', color:'var(--brand)', marginBottom:4 }}>Welcome to JP CLOTHING 🌸</h3>
                <p style={{ color:'var(--mute)', fontSize:'.88rem', marginBottom:18 }}>
                    {authMode === 'login' ? 'Login with your Mobile Number or Email and password.' : 'Create your JP CLOTHING account with a password.'}
                </p>

                <div style={{ display:'flex', gap:8, marginBottom:16, padding:4, background:'var(--bg)', borderRadius:10, border:'1px solid var(--line)' }}>
                    {['login','signup'].map(mode => (
                        <button key={mode} type="button" onClick={()=>{setAuthMode(mode);setUserError('');}} style={{ flex:1, padding:8, borderRadius:7, border:'none', background:authMode===mode?'var(--card)':'transparent', color:authMode===mode?'var(--brand)':'var(--mute)', fontWeight:800, cursor:'pointer' }}>
                            {mode === 'login' ? 'Login' : 'Create Account'}
                        </button>
                    ))}
                </div>

                {authMode === 'login' && (
                    <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                        <button type="button" className="chip" aria-pressed={loginMethod==='phone'} onClick={()=>{setLoginMethod('phone');setUserContact('');}}> <Phone size={15}/> Phone</button>
                        <button type="button" className="chip" aria-pressed={loginMethod==='email'} onClick={()=>{setLoginMethod('email');setUserContact('');}}> <Mail size={15}/> Email</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {authMode === 'signup' && (
                        <input value={userName} onChange={e=>setUserName(e.target.value)} placeholder="Full name" required style={inputStyle}/>
                    )}
                    <input value={userContact} onChange={e=>setUserContact(e.target.value)} placeholder={loginMethod==='phone'?'Mobile number':'Email address'} required style={inputStyle}/>
                    <input type="password" value={userPassword} onChange={e=>setUserPassword(e.target.value)} placeholder="Password" required minLength={6} style={inputStyle}/>
                    {authMode === 'signup' && <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Confirm password" required style={inputStyle}/>}
                    {userError && <div style={{ color:'#f87171', fontSize:'.85rem', fontWeight:700 }}>{userError}</div>}
                    <button className="btn-primary" type="submit" style={{ padding:12 }}>{authMode==='login'?'Login':'Create Account'}</button>
                </form>
            </div>
        </div>
    );
}

const inputStyle = {
    width:'100%', padding:'11px 14px', borderRadius:8, border:'1px solid var(--line)',
    background:'var(--bg)', color:'var(--ink)'
};
