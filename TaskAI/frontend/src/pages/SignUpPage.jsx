import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Zap, Mail, Lock, UserCheck, ShieldCheck, ArrowLeft } from 'lucide-react';

const SignUpPage = () => {
    const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        api.post('/api/auth/register', { email: form.email, password: form.password })
            .then(() => {
                setSuccess('Registration successful! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            })
            .catch(err => {
                setError(err.response?.data?.message || 'Registration failed. Is your email pre-approved by Admin?');
            })
            .finally(() => setLoading(false));
    };

    const inputStyle = {
        width: '100%',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '16px 20px 16px 52px',
        color: '#ffffff',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.3s'
    };

    return (
        <div className="login-wrapper" style={{ 
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            background: 'radial-gradient(circle at top right, #1e293b 0%, #090A0F 100%)',
            padding: 20 
        }}>
            <div className="galaxy-bg"><div className="stars"></div><div className="stars2"></div></div>
            
            <div className="glass-panel" style={{ 
                width: 480, padding: 48, borderRadius: 36, border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', zIndex: 1
            }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div className="glow-button" style={{ 
                        width: 56, height: 56, background: 'var(--accent)', borderRadius: 16, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' 
                    }}>
                        <ShieldCheck size={32} color="#000"/>
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>Establish Credentials</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Only pre-approved Admin invitations can register</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={20} color="#64748b" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)' }}/>
                        <input 
                            type="email" 
                            placeholder="Invited Email Address"
                            value={form.email}
                            onChange={e => setForm({...form, email: e.target.value})}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={20} color="#64748b" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)' }}/>
                        <input 
                            type="password" 
                            placeholder="Create Personal Password"
                            value={form.password}
                            onChange={e => setForm({...form, password: e.target.value})}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <UserCheck size={20} color="#64748b" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)' }}/>
                        <input 
                            type="password" 
                            placeholder="Confirm Password"
                            value={form.confirmPassword}
                            onChange={e => setForm({...form, confirmPassword: e.target.value})}
                            required
                            style={inputStyle}
                        />
                    </div>

                    {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '14px 16px', borderRadius: 14, fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
                    {success && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '14px 16px', borderRadius: 14, fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.2)' }}>{success}</div>}

                    <button className="btn-primary glow-button" style={{ height: 56, borderRadius: 18, fontWeight: 800, fontSize: '1.05rem' }} disabled={loading}>
                        {loading ? 'Transmitting...' : 'Register as Personnel'}
                    </button>
                    
                    <Link to="/login" style={{ textAlign: 'center', color: 'var(--accent)', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <ArrowLeft size={16}/> Back to Login
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;
