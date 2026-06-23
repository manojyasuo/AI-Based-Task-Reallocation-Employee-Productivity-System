import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { CheckCircle2, XCircle, Clock, UserCheck } from 'lucide-react';

const LeaveManagementPage = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    const fetchLeaves = () => {
        setLoading(true);
        console.log('[LeaveManagement] fetching leave requests');
        api.get('/api/leave/all')
            .then(r => {
                console.log('[LeaveManagement] fetchLeaves response', r.data);
                setLeaveRequests(r.data);
            })
            .catch((err) => {
                console.error('[LeaveManagement] fetchLeaves failed', err);
                setLeaveRequests([]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchLeaves(); }, []);

    const handleApprove = async (id) => {
        console.log('[LeaveManagement] approve clicked', id);
        if (id == null) {
            console.error('[LeaveManagement] approve id is undefined');
            return;
        }
        setProcessing(id);
        try {
            const res = await api.post(`/api/leave/approve/${id}`);
            console.log('[LeaveManagement] approve response', res.status, res.data);
            alert("Leave Approved");
            fetchLeaves();
        } catch (err) {
            console.error('[LeaveManagement] approve error', err);
            alert("Error approving leave");
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (id) => {
        console.log('[LeaveManagement] reject clicked', id);
        if (id == null) {
            console.error('[LeaveManagement] reject id is undefined');
            return;
        }
        setProcessing(id);
        try {
            const res = await api.post(`/api/leave/reject/${id}`);
            console.log('[LeaveManagement] reject response', res.status, res.data);
            alert("Leave Rejected");
            fetchLeaves();
        } catch (err) {
            console.error('[LeaveManagement] reject error', err);
            alert("Error rejecting leave");
        } finally {
            setProcessing(null);
        }
    };

    const statusBadge = (s) => {
        if (s === 'PENDING') return <span className="badge badge-pending" style={{ background:'#fef9c3', color:'#854d0e' }}>Pending</span>;
        if (s === 'APPROVED') return <span className="badge badge-active">Approved</span>;
        if (s === 'REJECTED') return <span className="badge badge-absent">Rejected</span>;
        return <span className="badge">{s}</span>;
    };

    const pending = leaveRequests.filter(r => r.status === 'PENDING');
    const decided = leaveRequests.filter(r => r.status !== 'PENDING');

    return (
        <div style={{ maxWidth: 860 }}>
            <div className="page-header" style={{ marginBottom: 32 }}>
                <h1>Leave Administration</h1>
                <p>Strategic review of workforce availability requests</p>
            </div>

            {loading ? (
                <div style={{ textAlign:'center', color:'#CBD5E1', padding:64 }}>Fetching records…</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {/* Pending Requests */}
                    <section>
                        <h2 style={{ fontSize:'1.1rem', marginBottom:20, display:'flex', alignItems:'center', gap:10, fontWeight:700, color:'#E2E8F0' }}>
                            <Clock size={20} color="#38bdf8"/> Pending Approval
                            {pending.length > 0 && <span style={{ background:'rgba(250,204,21,0.15)', color:'#FACC15', borderRadius:10, padding:'2px 10px', fontSize:'0.7rem', fontWeight:800 }}>{pending.length} NEW</span>}
                        </h2>
                        {pending.length === 0 ? (
                            <div className="glass-panel" style={{ textAlign:'center', padding:48, color:'#CBD5E1', borderRadius:24, background:'linear-gradient(145deg, #0f172a, #1e293b)', border:'1px solid rgba(255,255,255,0.1)' }}>
                                <UserCheck size={40} color="#38bdf8" style={{ margin:'0 auto 12px' }}/>
                                <p style={{ fontWeight:500, color:'#E2E8F0' }}>All requests processed</p>
                            </div>
                        ) : (
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(360px, 1fr))', gap:16 }}>
                                {pending.map(req => (
                                    <div key={req.id} className="glass-panel" style={{ display:'flex', flexDirection:'column', gap:20, padding:24, borderRadius:24, border:'1px solid rgba(255,255,255,0.1)', background:'linear-gradient(145deg, #0f172a, #1e293b)' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                                            <div style={{ width:48, height:48, borderRadius:14, background:'rgba(56,189,248,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#38bdf8', fontWeight:800, fontSize:'1.1rem' }}>
                                                {req.employeeName?.charAt(0) || '?'}
                                            </div>
                                            <div style={{ flex:1 }}>
                                                <div style={{ fontWeight:700, color:'#E2E8F0', fontSize:'1rem' }}>{req.employeeName}</div>
                                                <div style={{ fontSize:'0.8rem', color:'#CBD5E1', fontWeight:500 }}>{req.startDate} → {req.endDate}</div>
                                            </div>
                                            {statusBadge(req.status)}
                                        </div>
                                        {req.reason && <div style={{ fontSize:'0.85rem', color:'#E2E8F0', background:'rgba(255,255,255,0.05)', padding:16, borderRadius:16, fontStyle:'italic' }}>&quot;{req.reason}&quot;</div>}
                                        <div style={{ display:'flex', gap:10 }}>
                                            <button className="btn-success" style={{ flex:1, height:42, borderRadius:12 }} onClick={() => handleApprove(req.id)} disabled={processing===req.id}>
                                                <CheckCircle2 size={16} color="#38bdf8"/> {processing===req.id ? '…' : 'Approve'}
                                            </button>
                                            <button className="btn-outline text-danger" style={{ flex:1, height:42, borderRadius:12, borderColor:'rgba(239,68,68,0.2)' }} onClick={() => handleReject(req.id)} disabled={processing===req.id}>
                                                <XCircle size={16} color="#38bdf8"/> {processing===req.id ? '…' : 'Refuse'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Decided Requests */}
                    {decided.length > 0 && (
                        <section>
                            <h2 style={{ fontSize:'0.95rem', marginBottom:20, color:'#CBD5E1', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px' }}>Processed History</h2>
                            <div className="glass-panel" style={{ padding:0, borderRadius:24, overflow:'hidden', border:'1px solid rgba(255,255,255,0.1)' }}>
                                {decided.map(req => (
                                    <div key={req.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 24px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                                        <div style={{ width:36, height:36, borderRadius:10, background:'rgba(56,189,248,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#38bdf8', fontWeight:700, fontSize:'0.85rem' }}>
                                            {req.employeeName?.charAt(0)}
                                        </div>
                                        <div style={{ flex:1 }}>
                                            <div style={{ fontWeight:700, color:'#E2E8F0', fontSize:'0.9rem' }}>{req.employeeName}</div>
                                            <div style={{ fontSize:'0.75rem', color:'#CBD5E1', fontWeight:500 }}>{req.startDate} — {req.endDate}</div>
                                        </div>
                                        {statusBadge(req.status)}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

export default LeaveManagementPage;
