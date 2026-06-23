import React, { useEffect, useState, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import {
    CheckSquare, CheckCircle, TrendingUp, Award, CheckCircle2,
    CalendarDays, Zap, Send, ShieldCheck, PlayCircle, Plus, X
} from 'lucide-react';
import TasksPage from './TasksPage';
import LeaderboardPage from './LeaderboardPage';
import NotificationsPage from './NotificationsPage';
import LeaveRequestPage from './LeaveRequestPage';

const avatarColors = ['#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b','#06b6d4','#ef4444','#14b8a6'];
const getColor = (name = '') => avatarColors[name.charCodeAt(0) % avatarColors.length];

const getBadgeInfo = (pts) => {
    if (pts >= 500) return { label: 'Platinum', color: '#a78bfa', emoji: '💎' };
    if (pts >= 300) return { label: 'Gold',     color: '#f59e0b', emoji: '🏆' };
    if (pts >= 150) return { label: 'Silver',   color: '#94a3b8', emoji: '🥈' };
    if (pts >=  50) return { label: 'Bronze',   color: '#d97706', emoji: '🥉' };
    return { label: 'Newcomer', color: '#64748b', emoji: '🚀' };
};

const EmployeeOverview = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [gamification, setGamification] = useState(null);
    const [myTasks, setMyTasks] = useState([]);
    const [submittedTasks, setSubmittedTasks] = useState([]);
    const [completedCount, setCompletedCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showSkillForm, setShowSkillForm] = useState(false);
    const [newSkill, setNewSkill] = useState({ name: '', score: 80 });

    const fetchData = () => {
        if (!user?.id) return;
        api.get(`/api/employees/me/${user.id}`).then(empRes => {
            const emp = empRes.data;
            setProfile(emp);
            const loadTasks = api.get('/api/tasks', { params: { employeeId: emp.id } });
            const loadLeaderboard = api.get('/api/gamification/leaderboard').catch(() => ({ data: [] }));

            Promise.all([loadLeaderboard, loadTasks]).then(([leaderRes, taskRes]) => {
                const me = (leaderRes.data || []).find(g => g.employeeId === emp.id);
                setGamification(me || null);

                const allTasks = taskRes.data || [];
                const active = allTasks.filter(t => t.assignedEmployeeId === emp.id && (t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS' || t.status === 'REASSIGNED'));
                const submitted = allTasks.filter(t => t.assignedEmployeeId === emp.id && t.status === 'SUBMITTED');
                const completed = allTasks.filter(t => t.assignedEmployeeId === emp.id && t.status === 'COMPLETED');

                setMyTasks(active);
                setSubmittedTasks(submitted);
                setCompletedCount(completed.length);
            }).catch(console.error).finally(() => setLoading(false));
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
        const t = setInterval(fetchData, 15000);
        return () => clearInterval(t);
    }, [user]);

    const handleAddSkill = (e) => {
        e.preventDefault();
        if (!newSkill.name) return;
        api.post(`/api/employees/${profile.id}/skills`, { [newSkill.name]: +newSkill.score })
            .then(() => {
                fetchData();
                setNewSkill({ name: '', score: 80 });
                setShowSkillForm(false);
            }).catch(console.error);
    };

    if (loading) return <div style={{ textAlign:'center', color:'#94a3b8', padding:64 }}>Loading your dashboard…</div>;
    if (!profile)  return <div style={{ textAlign:'center', padding:64, color:'#f87171' }}>Could not load profile. Please re-login.</div>;

    const pts = gamification?.points || 0;
    const badge = getBadgeInfo(pts);
    const firstName = profile.name.split(' ')[0];
    const skills = profile.skills ? Object.entries(profile.skills) : [];

    return (
        <div style={{ maxWidth: 1100 }}>
            <div className="page-header" style={{ marginBottom:28 }}>
                <h1 style={{ color: '#fff' }}>Welcome back, {firstName}! 👋</h1>
                <p style={{ color: '#94a3b8' }}>Strategic overview of and your personal performance metrics</p>
            </div>

            {/* Stat Cards */}
            <div className="stat-cards" style={{ marginBottom:28 }}>
                {[
                    { label: 'Active Tasks',     value: myTasks.length,    icon: <CheckSquare size={20}/>,  cls: 'blue'   },
                    { label: 'Completed',        value: completedCount,    icon: <CheckCircle size={20}/>,  cls: 'green'  },
                    { label: 'Points Earned',    value: pts,               icon: <TrendingUp size={20}/>,   cls: 'purple' },
                    { label: `Badge: ${badge.label}`, value: badge.emoji,  icon: <Award size={20}/>,        cls: 'orange' },
                ].map((s, i) => (
                    <div className="glass-panel stat-card" key={i} style={{ borderRadius:20, border:'1px solid var(--panel-border)' }}>
                        <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                        <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
                    </div>
                ))}
            </div>

            {/* Profile + Skills + Workload */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(360px, 1fr))', gap:24, marginBottom:24 }}>
                {/* Profile Card */}
                <div className="glass-panel" style={{ padding:28, borderRadius:24, border:'1px solid var(--panel-border)' }}>
                    <h3 style={{ marginBottom:20, fontSize:'1rem', fontWeight:800, color: '#ffffff', display:'flex', alignItems:'center', gap:8 }}>
                        <ShieldCheck size={18} color="var(--primary)"/> Grid Profile Status
                    </h3>
                    <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
                        <div style={{ width:60, height:60, borderRadius:18, background:getColor(profile.name), display:'flex', alignItems:'center', justifyContent:'center', color:'#000', fontWeight:900, fontSize:'1.5rem', boxShadow:'0 8px 20px rgba(0,0,0,0.2)', flexShrink:0 }}>
                            {profile.name.charAt(0)}
                        </div>
                        <div>
                            <div style={{ fontWeight:800, fontSize:'1.1rem', color:'#ffffff' }}>{profile.name}</div>
                            <div style={{ fontSize:'0.8rem', color:'#94a3b8', fontWeight:700 }}>{profile.department} // Level {Math.floor(pts/100)+1}</div>
                            <div style={{ display:'inline-block', marginTop:4, background:`${badge.color}22`, color:badge.color, padding:'2px 10px', borderRadius:8, fontSize:'0.72rem', fontWeight:800, border:`1px solid ${badge.color}44` }}>
                                {badge.emoji} {badge.label}
                            </div>
                        </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                        {[{ label:'Workload', value:profile.workload, color:'#ef4444' }, { label:'Availability', value:profile.availability, color:'#10b981' }, { label:'Fatigue', value:profile.fatigueScore, color:profile.fatigueScore>70?'#ef4444':'#f59e0b' }].map(bar => (
                            <div key={bar.label}>
                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                                    <span style={{ fontSize:'0.78rem', fontWeight:700, color:'#94a3b8' }}>{bar.label}</span>
                                    <span style={{ fontSize:'0.78rem', fontWeight:800, color:bar.color }}>{Math.round(bar.value||0)}%</span>
                                </div>
                                <div style={{ height:8, background:'rgba(255,255,255,0.05)', borderRadius:4, overflow:'hidden' }}>
                                    <div style={{ height:'100%', width:`${bar.value||0}%`, background:bar.color, borderRadius:4, transition:'width 0.8s ease' }}/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills Section */}
                <div className="glass-panel" style={{ padding:28, borderRadius:24, border:'1px solid var(--panel-border)', position:'relative' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                        <h3 style={{ fontSize:'1rem', fontWeight:800, color: '#ffffff', display:'flex', alignItems:'center', gap:8 }}>
                            <Zap size={18} color="var(--primary)"/> Sector Dominance
                        </h3>
                        <button className="btn-outline" style={{ width:32, height:32, padding:0, borderRadius:8, color:'var(--primary)' }} onClick={() => setShowSkillForm(!showSkillForm)}>
                            {showSkillForm ? <X size={16}/> : <Plus size={16}/>}
                        </button>
                    </div>

                    {showSkillForm && (
                        <form onSubmit={handleAddSkill} style={{ marginBottom:20, padding:18, background:'rgba(255,255,255,0.02)', borderRadius:16, border:'1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                                <input placeholder="New Skill Name..." value={newSkill.name} onChange={e => setNewSkill({...newSkill, name:e.target.value})} required style={{ marginBottom:0 }}/>
                                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                                    <input type="number" min="1" max="100" value={newSkill.score} onChange={e => setNewSkill({...newSkill, score:e.target.value})} style={{ marginBottom:0, flex:1 }}/>
                                    <button type="submit" className="btn-primary" style={{ height:42, borderRadius:10, padding:'0 16px' }}>Add</button>
                                </div>
                            </div>
                        </form>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {skills.length === 0 ? <p style={{ color:'#64748b', fontSize:'0.85rem' }}>No modules registered</p> : skills.map(([sk, pct]) => (
                            <div key={sk}>
                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                                    <span style={{ fontWeight:700, color:'#ffffff', fontSize:'0.85rem' }}>{sk}</span>
                                    <span style={{ fontWeight:800, color:'var(--primary)', fontSize:'0.85rem' }}>{pct}%</span>
                                </div>
                                <div style={{ height:8, background:'rgba(255,255,255,0.05)', borderRadius:4, overflow:'hidden' }}>
                                    <div style={{ width:`${pct}%`, height:'100%', background:'var(--primary)', boxShadow:'0 0 10px rgba(0,210,255,0.3)', borderRadius:4 }}/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Submitted tasks (Pending Verification) */}
            {submittedTasks.length > 0 && (
                <div className="glass-panel" style={{ padding:0, borderRadius:24, overflow:'hidden', border:'1px solid rgba(251,146,60,0.3)', background:'rgba(251,146,60,0.03)', marginBottom:24 }}>
                    <div style={{ padding:'18px 28px', borderBottom:'1px solid rgba(251,146,60,0.15)', display:'flex', alignItems:'center', gap:8 }}>
                        <ShieldCheck size={18} color="#fb923c"/>
                        <h3 style={{ fontSize:'0.95rem', fontWeight:800, color:'#ffffff' }}>Awaiting Validation</h3>
                        <span style={{ marginLeft:'auto', background:'rgba(251,146,60,0.15)', color:'#fb923c', borderRadius:8, padding:'2px 10px', fontSize:'0.72rem', fontWeight:800 }}>
                            {submittedTasks.length} queued
                        </span>
                    </div>
                    {submittedTasks.map(task => (
                        <div key={task.id} style={{ padding:'16px 28px', borderBottom:'1px solid rgba(251,146,60,0.08)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <div>
                                <div style={{ fontWeight:700, fontSize:'0.95rem', color:'#ffffff' }}>{task.name}</div>
                                {task.deadline && <div style={{ fontSize:'0.75rem', color:'#64748b' }}>Due: {task.deadline}</div>}
                            </div>
                            <span style={{ border: '1px solid #fb923c44', background:'rgba(251,146,60,0.05)', color:'#fb923c', padding:'4px 14px', borderRadius:10, fontSize:'0.65rem', fontWeight:900, textTransform:'uppercase' }}>
                                In Review
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Active Tasks */}
            <div className="glass-panel" style={{ padding:0, borderRadius:24, overflow:'hidden', border:'1px solid var(--panel-border)' }}>
                <div style={{ padding:'18px 28px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:8 }}>
                    <CheckCircle2 size={18} color="var(--primary)"/>
                    <h3 style={{ fontSize:'0.95rem', fontWeight:800, color:'#ffffff' }}>Active Mission Directives</h3>
                    <span style={{ marginLeft:'auto', background:'rgba(0,210,255,0.08)', color:'var(--primary)', borderRadius:8, padding:'2px 10px', fontSize:'0.72rem', fontWeight:800 }}>
                        {myTasks.length} assigned
                    </span>
                </div>
                {myTasks.length === 0 ? (
                    <div style={{ padding:64, textAlign:'center', color:'#64748b' }}>
                        <ShieldCheck size={48} style={{ margin:'0 auto 16px', opacity:0.1 }} color="#fff"/>
                        <p style={{ fontWeight:700, fontSize:'0.9rem' }}>All sectors operational. No pending tasks.</p>
                    </div>
                ) : (
                    myTasks.map(task => (
                        <div key={task.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 28px', borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.2s' }}>
                            <div>
                                <div style={{ fontWeight:800, fontSize:'1.05rem', color:'#ffffff', marginBottom:3 }}>{task.name}</div>
                                {task.deadline && <div style={{ fontSize:'0.78rem', color:'#64748b', fontWeight:600 }}>DEADLINE: {task.deadline}</div>}
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                                <span style={{ background: task.status==='IN_PROGRESS'?'rgba(99,102,241,0.1)':'rgba(59,130,246,0.1)', color:task.status==='IN_PROGRESS'?'#6366f1':'#3b82f6', border:`1px solid ${task.status==='IN_PROGRESS'?'#6366f133':'#3b82f633'}`, padding:'5px 14px', borderRadius:10, fontSize:'0.7rem', fontWeight:900, textTransform:'uppercase' }}>
                                    {task.status.replace('_',' ')}
                                </span>
                                <button className="btn-primary glow-button" style={{ height:38, padding:'0 18px', fontSize:'0.82rem', borderRadius:12, fontWeight:800 }}
                                    onClick={() => api.post(`/api/tasks/${task.id}/submit`).then(fetchData).catch(console.error)}>
                                    <Send size={14}/> Submit
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const EmployeeDashboard = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (user?.id) {
            api.get(`/api/employees/me/${user.id}`).then(r => setProfile(r.data)).catch(() => {});
        }
    }, [user]);

    return (
        <div className="dashboard-layout employee-bg">
            <Sidebar role="EMPLOYEE"/>
            <div className="main-content">
                <Routes>
                    <Route path="/"             element={<EmployeeOverview/>}/>
                    <Route path="/tasks"        element={<TasksPage role="EMPLOYEE" employeeName={profile?.name}/>}/>
                    <Route path="/leaderboard"  element={<LeaderboardPage/>}/>
                    <Route path="/notifications" element={<NotificationsPage role="EMPLOYEE"/>}/>
                    <Route path="/leave"        element={<LeaveRequestPage/>}/>
                </Routes>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
