import React, { useState } from 'react';
import { X, CheckCircle, Smartphone, ShieldCheck, PhoneCall } from 'lucide-react';
import confetti from 'canvas-confetti';

const UPI_ID = import.meta.env.VITE_UPI_ID || 'cmvinoth24-2@okicici';
const UPI_NAME = import.meta.env.VITE_UPI_NAME || 'JP Clothing';

export default function CheckoutModal({ isOpen, onClose, cartItems, totals, onClearCart, onOrderCreated }) {
    const [step, setStep] = useState('form');
    const [formData, setFormData] = useState({ name:'', phone:'', email:'', address:'', city:'', pincode:'' });
    const [orderId, setOrderId] = useState('');
    const [paid, setPaid] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handlePlaceOrder = async e => {
        e.preventDefault();
        if (!paid) return;
        setSubmitting(true);
        try {
            const created = await onOrderCreated({
                customer: {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email || formData.phone,
                    address: formData.address,
                    city: formData.city,
                    pincode: formData.pincode
                },
                paymentMethod: 'UPI (GPay / PhonePe)',
                paymentVerifiedBySeller: false
            });
            if (created?.id) setOrderId(created.id);
            setStep('success');
            confetti({ particleCount:120, spread:80, origin:{ y:.6 } });
        } catch {
            // App shows the error toast.
        } finally {
            setSubmitting(false);
        }
    };

    const resetAndClose = () => {
        setStep('form');
        setPaid(false);
        setOrderId('');
        setSubmitting(false);
        onClose();
    };

    return (
        <div style={{position:'fixed',inset:0,zIndex:80,background:'rgba(0,0,0,.6)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,overflowY:'auto'}} onClick={resetAndClose}>
            <div style={{background:'var(--card)',color:'var(--ink)',border:'1px solid var(--line)',borderRadius:'var(--radius-lg)',maxWidth:680,width:'100%',maxHeight:'90vh',overflowY:'auto',position:'relative',padding:28,boxShadow:'var(--shadow-lg)'}} onClick={e=>e.stopPropagation()}>
                <button onClick={resetAndClose} style={{position:'absolute',top:18,right:18,background:'none',border:'none',cursor:'pointer',color:'var(--ink)'}}><X size={24}/></button>

                {step === 'form' ? (
                    <>
                        <h2 style={{fontSize:'1.6rem',fontFamily:'Fredoka, sans-serif',color:'var(--brand)',marginBottom:4}}>Complete Your Order 🛍️</h2>
                        <p style={{color:'var(--mute)',fontSize:'.9rem',marginBottom:18}}>Pay using the UPI button below. Payment is not automatically verified; the shop will confirm it before approving your order.</p>

                        <form onSubmit={handlePlaceOrder} style={{display:'flex',flexDirection:'column',gap:15}}>
                            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
                                <Field label="Full Name *" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Kavitha Ram" required />
                                <Field label="Mobile Number / Email *" name="phone" value={formData.phone} onChange={handleChange} placeholder="9840123456 or email" required />
                            </div>
                            <Field label="Door No. & Street Address *" name="address" value={formData.address} onChange={handleChange} placeholder="House/Flat No., Building, Street Name" required />
                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                                <Field label="City / Town *" name="city" value={formData.city} onChange={handleChange} placeholder="Chennai" required />
                                <Field label="Pincode *" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="6-digit Pincode" required maxLength={6}/>
                            </div>

                            <div style={{background:'var(--brand-light)',border:'1px solid var(--brand)',borderRadius:14,padding:16}}>
                                <div style={{display:'flex',alignItems:'center',gap:8,fontWeight:900,color:'var(--brand)',marginBottom:8}}><Smartphone size={19}/> Online Payment — UPI only</div>
                                <div style={{fontSize:'.9rem',lineHeight:1.7}}>
                                    <div>UPI ID: <strong>{UPI_ID}</strong></div>
                                    <div>Payee: <strong>{UPI_NAME}</strong></div>
                                    <div>Amount: <strong>₹{totals?.grandTotal || 0}</strong></div>
                                </div>
                                <a href={`upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${encodeURIComponent(totals?.grandTotal || 0)}&cu=INR&tn=${encodeURIComponent('JP Clothing order')}`} style={{display:'inline-flex',marginTop:12,padding:'11px 16px',borderRadius:10,background:'var(--brand)',color:'#21050a',fontWeight:900,textDecoration:'none'}}><Smartphone size={18} style={{marginRight:8}}/> Pay ₹{totals?.grandTotal || 0} via UPI</a>
                                <div style={{fontSize:'.78rem',color:'var(--mute)',marginTop:8}}>Tap to open a supported UPI app. Your bank/app must confirm the payment; this website cannot automatically verify a plain UPI link.</div>
                            </div>

                            <label style={{display:'flex',alignItems:'flex-start',gap:10,padding:12,border:'1px solid var(--line)',borderRadius:10,cursor:'pointer'}}>
                                <input type="checkbox" checked={paid} onChange={e=>setPaid(e.target.checked)} style={{marginTop:4}} />
                                <span style={{fontSize:'.85rem',fontWeight:800}}>I have attempted the UPI payment. I understand the seller must verify it before approving my order.</span>
                            </label>

                            <div style={{display:'flex',gap:8,alignItems:'center',color:'var(--mute)',fontSize:'.8rem'}}><ShieldCheck size={16} color="var(--brand)"/> Order status starts as Pending and changes only after seller verification.</div>

                            <div style={{background:'var(--bg)',padding:14,borderRadius:12,border:'1px solid var(--line)',display:'flex',justifyContent:'space-between',fontWeight:800,fontSize:'1.1rem'}}>
                                <span>Order Total:</span><span style={{color:'var(--brand)'}}>₹{totals?.grandTotal || 0}</span>
                            </div>

                            <button disabled={!paid || submitting} type="submit" className="btn-primary" style={{padding:14,fontSize:'1.05rem',opacity:!paid||submitting?.6:1}}>
                                <PhoneCall size={18}/> {submitting ? 'Saving Order…' : 'Submit Order'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{textAlign:'center',padding:'20px 10px'}}>
                        <div style={{width:72,height:72,borderRadius:'50%',background:'var(--brand-light)',color:'var(--brand)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}><CheckCircle size={44}/></div>
                        <h2 style={{fontSize:'1.8rem',fontFamily:'Fredoka, sans-serif',color:'var(--brand)'}}>Order Submitted 🎉</h2>
                        <p style={{color:'var(--mute)',fontSize:'.95rem',marginTop:4}}>Your order is saved as Pending. The shop will verify payment and confirm your order.</p>
                        <div style={{background:'var(--bg)',padding:16,borderRadius:14,border:'1px solid var(--line)',margin:'20px 0',textAlign:'left'}}>
                            <div style={{fontSize:'.88rem',fontWeight:700,marginBottom:6}}>Order Reference ID: <span style={{color:'var(--brand)',fontWeight:800}}>{orderId}</span></div>
                            <div style={{fontSize:'.84rem',color:'var(--mute)'}}>Customer: <strong>{formData.name}</strong> ({formData.phone})<br/>Deliver To: {formData.address}, {formData.city} - {formData.pincode}<br/>Status: <strong style={{color:'var(--brand)'}}>Pending seller verification</strong></div>
                        </div>
                        <button onClick={resetAndClose} className="btn-primary" style={{padding:'12px 24px'}}>Back to Store</button>
                    </div>
                )}
            </div>
        </div>
    );
}

function Field({label,name,value,onChange,placeholder,required,maxLength}) {
    return <div>
        <label style={{fontWeight:800,fontSize:'.82rem',display:'block',marginBottom:4}}>{label}</label>
        <input type="text" name={name} required={required} maxLength={maxLength} placeholder={placeholder} value={value} onChange={onChange} style={{width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid var(--line)',background:'var(--bg)',color:'var(--ink)'}}/>
    </div>;
}
