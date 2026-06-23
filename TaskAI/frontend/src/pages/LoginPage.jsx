import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Zap, ShieldCheck, User, Mail, Lock, Settings } from 'lucide-react';

const LoginPage = () => {
    const [role, setRole] = useState('Admin');
    const [email, setEmail] = useState('admin@company.com');
    const [password, setPassword] = useState('Admin@123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const switchRole = (r) => {
        setRole(r);
        setError('');
        if (r === 'Admin') {
            setEmail('admin@company.com');
            setPassword('Admin@123');
        } else {
            setEmail('manojyasuo@gmail.com');
            setPassword('Employee@123');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/api/auth/login', { email, password });
            const data = res.data;
            login(data);
            if (data.role === 'ROLE_ADMIN' || data.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/employee');
            }
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Invalid identity or credentials provided.');
            } else {
                setError('Link corrupted. Please ensure backend services are active.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at center, #1b2735 0%, #090a0f 100%)',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Visual Abstract Elements */}
            <div style={{ position: 'absolute', top: '15%', left: '20%', width: '400px', height: '400px', background: 'rgba(0, 210, 255, 0.1)', filter: 'blur(100px)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: '350px', height: '350px', background: 'rgba(245, 158, 11, 0.08)', filter: 'blur(90px)', borderRadius: '50%' }} />
            
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '460px',
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '28px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                padding: '48px',
                zIndex: 10
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>

  {/* ROBOT LOGO */}
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '70px',
    height: '70px',
    borderRadius: '16px',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    boxShadow: '0 10px 25px rgba(59,130,246,0.4)',
    marginBottom: '20px'
  }}>
    <img
      src="/images/robot.png"
      alt="logo"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }}
    />
  </div>

  {/* TITLE */}
  <h1 style={{
    fontSize: '1.8rem',
    fontWeight: 800,
    margin: '0 0 6px 0',
    letterSpacing: '-0.5px',
    background: 'linear-gradient(90deg, #3b82f6, #22c55e)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  }}>
       TaskAI 
  </h1>
  

 

</div>
                {/* Role Switcher */}
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '14px', padding: '6px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    {['Admin', 'Employee'].map(r => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => switchRole(r)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px 0',
                                borderRadius: '10px',
                                border: 'none',
                                background: role === r ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                color: role === r ? '#fff' : '#64748b',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: role === r ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                            }}
                        >
                            {r === 'Admin' ? <ShieldCheck size={16} color={role === r ? '#00d2ff' : '#64748b'} /> : <User size={16} color={role === r ? '#f59e0b' : '#64748b'} />}
                            {r}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                            Identity Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@quantum-grid.com"
                                required
                                style={{
                                    width: '100%',
                                    padding: '16px 16px 16px 48px',
                                    borderRadius: '14px',
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => { e.target.style.borderColor = '#00d2ff'; e.target.style.background = 'rgba(0,0,0,0.3)'; }}
                                onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.background = 'rgba(0,0,0,0.2)'; }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                            Security Code
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    width: '100%',
                                    padding: '16px 16px 16px 48px',
                                    borderRadius: '14px',
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => { e.target.style.borderColor = '#00d2ff'; e.target.style.background = 'rgba(0,0,0,0.3)'; }}
                                onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.background = 'rgba(0,0,0,0.2)'; }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.85rem', fontWeight: 500, textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '12px',
                            width: '100%',
                            height: '52px',
                            borderRadius: '14px',
                            background: loading ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                            color: loading ? '#94a3b8' : '#000',
                            border: 'none',
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            letterSpacing: '0.5px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.3s',
                            boxShadow: loading ? 'none' : '0 10px 20px -5px rgba(0, 210, 255, 0.3)'
                        }}
                    >
                        {loading ? (
                            <><Settings size={18} className="spin-anim" /> Establishing Link...</>
                        ) : (
                            'Initialize Session'
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '28px', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '8px' }}>
                        Invited to the platform?
                    </p>
                    <Link to="/signup" style={{ 
                        color: 'var(--accent)', 
                        textDecoration: 'none', 
                        fontWeight: 700, 
                        fontSize: '0.9rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <ShieldCheck size={16}/> Setup Personal Credentials
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
