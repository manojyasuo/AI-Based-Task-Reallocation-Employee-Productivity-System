import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { Users, UserPlus, X, Mail, ShieldAlert, Zap, CheckCircle2, Loader2, RefreshCw, BarChart3, Database } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const avatarColors = ['#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b','#06b6d4','#ef4444','#14b8a6'];
const getColor = (name = '') => avatarColors[name.charCodeAt(0) % avatarColors.length];

const statusBadge = (status) => {
    const map = { ACTIVE: 'badge-active', BUSY: 'badge-absent', ON_LEAVE: 'badge-on-leave' };
    const labels = { ACTIVE: 'Active', BUSY: 'Busy', ON_LEAVE: 'On-Leave' };
    return <span className={`badge ${map[status] || 'badge-pending'}`}>{labels[status] || status}</span>;
};

const EmployeesPage = () => {
    const { user } = useContext(AuthContext);
    const [employees, setEmployees] = useState([]); // Dynamic list initialized to empty
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    
    // New employee state
    const [newEmp, setNewEmp] = useState({ 
        name: '', 
        email: '', 
        department: 'Engineering', 
        role: 'EMPLOYEE',
        skills: '',
        workload: 0,
        availability: 100
    });

    /**
     * Requirement: Fetch employees from backend API: GET /api/employees
     */
    const fetchEmployees = async () => {
        setLoading(true);
        console.log("Synchronizing personnel registry with real-time database...");
        try {
            const res = await api.get(`/api/employees?_t=${Date.now()}`); // Cache-bust timestamp
            console.log(`Registry sync complete. Received ${res.data.length} units.`);
            setEmployees(res.data); // Requirement: Update React state using setEmployees()
        } catch (err) { 
            console.error("Critical Registry Handshake Failure:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    /**
     * Requirement: Call fetchEmployees() on page load to load data.
     */
    useEffect(() => { 
        fetchEmployees(); 
    }, []);

    const markStatus = (id, status) => {
        api.post(`/api/employees/${id}/status`, { status })
            .then(() => { fetchEmployees(); })
            .catch(console.error);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        
        if (!newEmp.name || !newEmp.email) {
            alert("Identification Error: Name and Email are mandatory.");
            return;
        }

        setSubmitting(true);
        setSuccessMsg('');
        
        api.post('/api/employees', newEmp)
            .then((response) => {
                /**
                 * Requirement: Show success message: "Employee created and email sent successfully"
                 */
                setSuccessMsg('Employee created and email sent successfully');
                
                // Clear the form
                setNewEmp({ 
                    name: '', email: '', department: 'Engineering', role: 'EMPLOYEE',
                    skills: '', workload: 0, availability: 100
                });
                
                /**
                 * Requirement: Call fetchEmployees() after adding new employee.
                 */
                fetchEmployees(); 
                
                setTimeout(() => {
                    setShowModal(false);
                    setSuccessMsg('');
                }, 3000);
            })
            .catch(err => {
                const msg = err.response?.data?.message || 'Registry failure: Database connection failed.';
                alert(msg);
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    const roleValue = (user?.role || '').toString().toUpperCase();
    const isAdmin = roleValue === 'ADMIN' || roleValue === 'ROLE_ADMIN' || roleValue.includes('ADMIN') || window.location.pathname.startsWith('/admin');
    
    /**
     * Requirement: Display employees dynamically from API response.
     */
    const filtered = filter === 'ALL' ? employees : employees.filter(e => e.status === filter);

    return (
        <div style={{ position: 'relative' }}>
            <div className="page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32 }}>
                <div>
                    <h1 style={{ color:'#fff' }}>Talent Registry</h1>
                    <p style={{ color:'#94a3b8' }}>Dynamic workforce directory synchronized with Mission Command database</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn-outline" style={{ height: 48, borderRadius: 14, minWidth:48 }} onClick={fetchEmployees} title="Sync Registry">
                        <RefreshCw size={18} className={loading ? "spin-anim" : ""} />
                    </button>
                    {isAdmin && (
                        <button 
                            className="btn-primary" 
                            style={{ padding: '0 24px', borderRadius: 14, display:'flex', alignItems:'center', gap:8, height: 48, fontWeight:800 }}
                            onClick={() => setShowModal(true)}
                        >
                            <UserPlus size={18} /> Add Employee
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display:'flex', gap:12, marginBottom:32, flexWrap:'wrap' }}>
                {['ALL','ACTIVE','ON_LEAVE','BUSY'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding:'10px 24px', borderRadius:14, border:'1px solid', cursor:'pointer',
                        fontWeight:700, fontSize:'0.85rem', transition:'all 0.3s',
                        background: filter === f ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                        color: filter === f ? '#000' : '#94a3b8',
                        borderColor: filter === f ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    }}>
                        {f === 'ON_LEAVE' ? 'On Leave' : (f === 'ALL' ? 'Global' : f.charAt(0) + f.slice(1).toLowerCase())}
                    </button>
                ))}
            </div>

            {loading && employees.length === 0 ? (
                <div style={{ textAlign:'center', color:'#94a3b8', padding:64, fontWeight:700 }}>Initiating directory handshake…</div>
            ) : (
                        <div className="employee-grid">
                            {filtered.map(emp => (
                        <div className="glass-panel" key={emp.id} style={{ padding:28, borderRadius:24, border:'1px solid var(--panel-border)', position:'relative' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
                                <div style={{ 
                                    width:64, height:64, borderRadius:20, background:getColor(emp.name),
                                    display:'flex', alignItems:'center', justifyContent:'center', 
                                    color:'#000', fontWeight:900, fontSize:'1.5rem', boxShadow:'0 8px 20px rgba(0,0,0,0.3)'
                                }}>
                                    {emp.name.charAt(0)}
                                </div>
                                <div style={{ flex:1 }}>
                                    <div style={{ fontWeight:800, fontSize:'1.15rem', color:'#ffffff', marginBottom:2 }}>{emp.name}</div>
                                    <div style={{ fontSize:'0.8rem', color:'#64748b', fontWeight:700, textTransform:'uppercase' }}>{emp.department}</div>
                                </div>
                                {statusBadge(emp.status)}
                            </div>

                            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:20 }}>
                                {emp.skills && Object.entries(emp.skills).slice(0,4).map(([sk]) => (
                                    <span key={sk} style={{ 
                                        padding:'3px 10px', borderRadius:6, background:'rgba(0,210,255,0.05)', 
                                        color:'var(--primary)', fontSize:'0.7rem', fontWeight:800, border:'1px solid rgba(0,210,255,0.1)'
                                    }}>{sk}</span>
                                ))}
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:8, fontWeight:800 }}>
                                    <span style={{ color:'#64748b' }}>AVAILABILITY</span>
                                    <span style={{ color: '#10b981' }}>{Math.round(emp.availability || 0)}%</span>
                                </div>
                                <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow:'hidden' }}>
                                    <div style={{ height: '100%', width: `${emp.availability || 0}%`, background: '#10b981', borderRadius:4 }} />
                                </div>
                            </div>

                            <div style={{ display:'flex', gap:10 }}>
                                {isAdmin ? (
                                    <>
                                        <button className="btn-outline" style={{ flex:1, height:40, fontSize:'0.7rem', fontWeight:800, color:'#f59e0b', borderColor:'rgba(245, 158, 11, 0.2)' }} 
                                            onClick={() => markStatus(emp.id, 'ON_LEAVE')} disabled={emp.status === 'ON_LEAVE'}>SET LEAVE</button>
                                        <button className="btn-success" style={{ flex:1, height:40, fontSize:'0.7rem', fontWeight:800, borderRadius:12 }} 
                                            onClick={() => markStatus(emp.id, 'ACTIVE')} disabled={emp.status === 'ACTIVE'}>SET ACTIVE</button>
                                    </>
                                ) : (
                                    <div style={{ width:'100%', textAlign:'center', padding:10, fontSize:'0.8rem', color:'#64748b', fontStyle:'italic' }}>Verified Unit</div>
                                )}
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && !loading && (
                        <div style={{ gridColumn:'1/-1', textAlign:'center', padding:48, color:'#64748b', fontWeight:700 }}>
                            No personnel identified in this sector.
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <div style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(5, 10, 20, 0.95)', backdropFilter:'blur(20px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
                    <div className="glass-panel" style={{ width:'100%', maxWidth:540, padding:40, borderRadius:32, border:'1px solid rgba(255,255,255,0.1)', position:'relative', background: 'rgba(15, 23, 42, 0.8)' }}>
                        <button onClick={() => setShowModal(false)} style={{ position:'absolute', top:24, right:24, background:'none', border:'none', color:'#64748b', cursor:'pointer' }}>
                            <X size={24}/>
                        </button>
                        
                        <div style={{ textAlign:'center', marginBottom:32 }}>
                            <div style={{ width:60, height:60, borderRadius:20, background:'var(--primary)', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:16, boxShadow:'0 0 20px rgba(0,210,255,0.4)' }}>
                                <Database color="#000" size={28} />
                            </div>
                            <h2 style={{ fontSize:'1.65rem', fontWeight:800, color:'#fff', margin:0 }}>New Personnel Registry</h2>
                            <p style={{ fontSize:'0.9rem', color:'#94a3b8', marginTop:6 }}>Establish identity coordinates in the global grid</p>
                        </div>

                        {successMsg ? (
                            <div style={{ textAlign:'center', padding:32, background:'rgba(16, 185, 129, 0.05)', borderRadius:24, border:'1px solid rgba(16, 185, 129, 0.2)' }}>
                                <CheckCircle2 size={48} color="#10b981" style={{ margin:'0 auto 16px' }}/>
                                <h3 style={{ color:'#10b981', marginBottom:8, fontWeight:800 }}>REGISTRY SYNC COMPLETE</h3>
                                <p style={{ color:'#ffffff', fontSize:'1rem', fontWeight:700 }}>{successMsg}</p>
                                <button className="btn-primary" style={{ marginTop: 24, padding: '10px 24px', borderRadius: 12 }} onClick={() => setShowModal(false)}>Close Registry Portal</button>
                            </div>
                        ) : (
                            <form onSubmit={handleAddSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                                    <div>
                                        <label style={{ display:'block', fontSize:'0.7rem', fontWeight:800, color:'#64748b', textTransform:'uppercase', marginBottom:8 }}>Full Identity Name</label>
                                        <input required value={newEmp.name} onChange={e => setNewEmp({...newEmp, name:e.target.value})} placeholder="e.g. Manoj Yasuo" style={{ width:'100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ display:'block', fontSize:'0.7rem', fontWeight:800, color:'#64748b', textTransform:'uppercase', marginBottom:8 }}>Communication (Gmail)</label>
                                        <input required type="email" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email:e.target.value})} placeholder="manoj@gmail.com" style={{ width:'100%' }} />
                                    </div>
                                </div>
                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                                    <div>
                                        <label style={{ display:'block', fontSize:'0.7rem', fontWeight:800, color:'#64748b', textTransform:'uppercase', marginBottom:8 }}>Sector Assignment</label>
                                        <select value={newEmp.department} onChange={e => setNewEmp({...newEmp, department:e.target.value})} style={{ width:'100%' }}>
                                            {['Engineering','Frontend','Backend','Fullstack','UI/UX Design','QA','Human Resources','Cybersecurity','Data Analysis'].map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display:'block', fontSize:'0.7rem', fontWeight:800, color:'#64748b', textTransform:'uppercase', marginBottom:8 }}>Clearance Level</label>
                                        <select value={newEmp.role} onChange={e => setNewEmp({...newEmp, role:e.target.value})} style={{ width:'100%' }}>
                                            <option value="EMPLOYEE">Level 1: Employee</option>
                                            <option value="ADMIN">Level 2: Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display:'block', fontSize:'0.7rem', fontWeight:800, color:'#64748b', textTransform:'uppercase', marginBottom:8 }}>Specialized Skills (CSV)</label>
                                    <input value={newEmp.skills} onChange={e => setNewEmp({...newEmp, skills:e.target.value})} placeholder="React, Node.js, AWS, Python" style={{ width:'100%' }} />
                                </div>
                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                                    <div>
                                        <label style={{ display:'block', fontSize:'0.7rem', fontWeight:800, color:'#64748b', textTransform:'uppercase', marginBottom:8 }}>Initial Workload %</label>
                                        <input type="number" min="0" max="100" value={newEmp.workload} onChange={e => setNewEmp({...newEmp, workload:e.target.value})} style={{ width:'100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ display:'block', fontSize:'0.7rem', fontWeight:800, color:'#64748b', textTransform:'uppercase', marginBottom:8 }}>Resource Availability %</label>
                                        <input type="number" min="0" max="100" value={newEmp.availability} onChange={e => setNewEmp({...newEmp, availability:e.target.value})} style={{ width:'100%' }} />
                                    </div>
                                </div>

                                <button type="submit" className="btn-primary" style={{ height:54, borderRadius:16, fontSize:'0.95rem', fontWeight:800, marginTop:10, display:'flex', alignItems:'center', justifyContent:'center', gap:10, border:'none', cursor:'pointer' }} disabled={submitting}>
                                    {submitting ? <><Loader2 className="spin-anim" size={18}/> Committing...</> : <><Database size={18}/> Initialize Registry</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin-anim { animation: spin 2s linear infinite; display: inline-block; }
            ` }} />
        </div>
    );
};

export default EmployeesPage;
