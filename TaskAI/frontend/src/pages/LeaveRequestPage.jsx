import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { CalendarDays, CheckCircle2, FileText, Send } from 'lucide-react';

const LeaveRequestPage = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [myLeaves, setMyLeaves] = useState([]);
    const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.id) {
            api.get(`/api/employees/me/${user.id}`).then(r => {
                setProfile(r.data);
                api.get(`/api/leave/employee/${r.data.id}`).then(lr => setMyLeaves(lr.data)).catch(() => {});
            }).catch(console.error);
        }
    }, [user]);

    const submit = (e) => {
        e.preventDefault();
        if (!profile) return;
        setSubmitting(true);
        setError('');
        setSuccess('');
        api.post('/api/leave/apply', { ...form, employeeId: profile.id })
            .then(() => {
                setSuccess('Leave request submitted successfully!');
                setForm({ startDate:'', endDate:'', reason:'' });
                api.get(`/api/leave/employee/${profile.id}`).then(lr => setMyLeaves(lr.data)).catch(() => {});
            })
            .catch(() => setError('Failed to submit. Please try again.'))
            .finally(() => setSubmitting(false));
    };

    const statusBadge = (s) => {
        if (s === 'PENDING') return <span className="badge" style={{ background:'rgba(250,204,21,0.15)', color:'#FACC15', border:'1px solid rgba(250,204,21,0.25)' }}>Pending</span>;
        if (s === 'APPROVED') return <span className="badge" style={{ background:'rgba(34,197,94,0.15)', color:'#22C55E', border:'1px solid rgba(34,197,94,0.25)' }}>Approved</span>;
        if (s === 'REJECTED') return <span className="badge" style={{ background:'rgba(239,68,68,0.15)', color:'#EF4444', border:'1px solid rgba(239,68,68,0.25)' }}>Rejected</span>;
        return <span className="badge">{s}</span>;
    };

    // Shared input style for visibility
    const inputStyle = {
        width: '100%',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '14px',
        padding: '14px 16px',
        color: '#E2E8F0',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.3s',
        boxSizing: 'border-box'
    };

    return (
        <div style={{ maxWidth: 1100 }}>
            <div className="page-header" style={{ marginBottom: 40 }}>
                <h1>Leave Management</h1>
                <p>Strategic rest planning and application tracking</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 32, alignItems: 'start' }}>
                {/* Form Section */}
                <div className="glass-panel" style={{ padding: 40, borderRadius: 28, border: '1px solid rgba(255,255,255,0.1)', background:'linear-gradient(145deg, #0f172a, #1e293b)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CalendarDays size={22} color="#38bdf8"/>
                        </div>
                        <h3 style={{ fontSize:'1.2rem', fontWeight:800, color:'#ffffff' }}>Request Time Off</h3>
                    </div>

                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                            <div>
                                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', marginBottom:10 }}>Start Date</label>
                                <input 
                                    type="date" 
                                    value={form.startDate} 
                                    onChange={e => setForm({...form, startDate:e.target.value})} 
                                    required 
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                />
                            </div>
                            <div>
                                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', marginBottom:10 }}>End Date</label>
                                <input 
                                    type="date" 
                                    value={form.endDate} 
                                    onChange={e => setForm({...form, endDate:e.target.value})} 
                                    required 
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display:'block', fontSize:'0.75rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', marginBottom:10 }}>Primary Reason</label>
                            <div style={{ position: 'relative' }}>
                                <FileText size={18} color="#38bdf8" style={{ position: 'absolute', left: 16, top: 16 }} />
                                <textarea 
                                    rows={5} 
                                    placeholder="Explain the necessity of this leave..." 
                                    value={form.reason} 
                                    onChange={e => setForm({...form, reason:e.target.value})} 
                                    required 
                                    style={{ ...inputStyle, paddingLeft: 48, resize: 'none' }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                />
                            </div>
                        </div>

                        {success && <div style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#34d399', padding:'14px 20px', borderRadius:14, fontSize:'0.85rem', fontWeight:700 }}>⚡ {success}</div>}
                        {error && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171', padding:'14px 20px', borderRadius:14, fontSize:'0.85rem', fontWeight:700 }}>⚠ {error}</div>}
                        
                        <button type="submit" className="btn-primary" disabled={submitting} style={{ width:'100%', height:52, borderRadius:16, fontWeight:800, fontSize: '0.95rem', gap: 10 }}>
                            {submitting ? 'Transmitting Request...' : <><Send size={18}/> Submit Application</>}
                        </button>
                    </form>
                </div>

                {/* History Section */}
                <div className="glass-panel" style={{ padding: 0, borderRadius: 28, border: '1px solid rgba(255,255,255,0.1)', overflow:'hidden', background:'linear-gradient(145deg, #0f172a, #1e293b)' }}>
                    <div style={{ padding:'24px 32px', borderBottom:'1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                        <h3 style={{ fontSize:'1.1rem', fontWeight:800, color:'#ffffff' }}>Request Archive</h3>
                    </div>
                    
                    <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                        {myLeaves.length === 0 ? (
                            <div style={{ padding:64, textAlign:'center', color:'#CBD5E1' }}>
                                <CheckCircle2 size={44} color="#38bdf8" style={{ margin:'0 auto 16px' }}/>
                                <p style={{ fontSize:'0.95rem', fontWeight:600, color:'#E2E8F0' }}>No current leave history</p>
                            </div>
                        ) : (
                            myLeaves.map(req => (
                                <div key={req.id} style={{ padding:'20px 32px', borderBottom:'1px solid rgba(255,255,255,0.03)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                    <div style={{ flex:1 }}>
                                        <div style={{ fontWeight:800, fontSize:'0.95rem', color:'#ffffff', marginBottom:4 }}>{req.startDate} — {req.endDate}</div>
                                        <div style={{ fontSize:'0.8rem', color:'#94a3b8', fontWeight:500, lineHeight: 1.4 }}>{req.reason}</div>
                                    </div>
                                    {statusBadge(req.status)}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveRequestPage;
