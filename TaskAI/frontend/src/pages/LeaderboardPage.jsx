import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Trophy, Medal, Star, ShieldCheck, Zap, Users } from 'lucide-react';

const avatarColors = ['#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b','#06b6d4','#ef4444','#14b8a6'];
const getColor = (name = '') => avatarColors[name.charCodeAt(0) % avatarColors.length];

const getBadgeInfo = (badgeName) => {
    switch(badgeName) {
        case 'Platinum': return { color: '#a78bfa', emoji: '💎' };
        case 'Gold':     return { color: '#f59e0b', emoji: '🏆' };
        case 'Silver':   return { color: '#94a3b8', emoji: '🥈' };
        case 'Bronze':   return { color: '#d97706', emoji: '🥉' };
        default:         return { color: '#64748b', emoji: '🚀' }; // Newcomer
    }
};

const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchL = () => {
            api.get('/api/gamification/leaderboard')
                .then(r => setLeaderboard(r.data))
                .catch(console.error)
                .finally(() => setLoading(false));
        };
        fetchL();
        const t = setInterval(fetchL, 15000);
        return () => clearInterval(t);
    }, []);

    if (loading) return <div style={{ textAlign:'center', color:'#94a3b8', padding:64 }}>Calculating rankings…</div>;

    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);
    const podiumIcons = [
        <Trophy size={40} style={{ filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))' }} color="#f59e0b"/>, 
        <Medal size={40} style={{ filter: 'drop-shadow(0 0 10px rgba(148, 163, 184, 0.5))' }} color="#94a3b8"/>, 
        <Star size={40} style={{ filter: 'drop-shadow(0 0 10px rgba(217, 119, 6, 0.5))' }} color="#d97706"/>
    ];

    return (
        <div style={{ maxWidth: 1100 }}>
            <div className="page-header" style={{ marginBottom: 40 }}>
                <h1>Performance Leaderboard</h1>
                <p>Recognizing impact, verified tasks, and outstanding contributions</p>
            </div>

            <div className="leader-podium" style={{ display:'flex', alignItems:'flex-end', gap:24, marginBottom:48, padding:'0 20px' }}>
                {/* Second Place */}
                {top3[1] && (() => {
                    const badge = getBadgeInfo(top3[1].badge);
                    return (
                    <div className="glass-panel" style={{ flex:1, padding:32, textAlign:'center', borderRadius:28, height:380, border:'1px solid var(--panel-border)', position:'relative' }}>
                        <div style={{ marginBottom:20 }}>{podiumIcons[1]}</div>
                        <div style={{ width:72, height:72, borderRadius:20, background:getColor(top3[1].employeeName), margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'1.5rem', boxShadow:'0 12px 24px rgba(0,0,0,0.2)' }}>
                            {top3[1].employeeName.charAt(0)}
                        </div>
                        <div style={{ fontWeight:800, color:'#ffffff', fontSize:'1.16rem', marginBottom:4, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                            {top3[1].employeeName} <span title={top3[1].badge}>{badge.emoji}</span>
                        </div>
                        <div style={{ fontSize:'0.8rem', color:'#64748b', fontWeight:600, textTransform:'uppercase', marginBottom:12 }}>{top3[1].department}</div>
                        <div style={{ fontSize:'2.2rem', fontWeight:900, color:'var(--accent)' }}>{top3[1].points}</div>
                        <div style={{ fontSize:'0.75rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px' }}>Impact Points</div>
                        <div style={{ marginTop: 14, fontSize: '0.8rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            <ShieldCheck size={14}/> {top3[1].completedTasks} Verified Tasks
                        </div>
                    </div>
                )})()}

                {/* First Place */}
                {top3[0] && (() => {
                    const badge = getBadgeInfo(top3[0].badge);
                    return (
                    <div className="glass-panel" style={{ flex:1.2, padding:40, textAlign:'center', borderRadius:32, height:440, border:'2px solid var(--accent)', boxShadow:'0 0 30px rgba(0, 210, 255, 0.15)', position:'relative', transform:'translateY(-20px)' }}>
                        <div style={{ position:'absolute', top:-24, left:'50%', transform:'translateX(-50%)' }}>{podiumIcons[0]}</div>
                        <div style={{ width:88, height:88, borderRadius:24, background:getColor(top3[0].employeeName), margin:'16px auto 20px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'2rem', boxShadow:'0 16px 32px rgba(0,0,0,0.3)' }}>
                            {top3[0].employeeName.charAt(0)}
                        </div>
                        <div style={{ fontWeight:800, color:'#fff', fontSize:'1.4rem', marginBottom:4, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                            {top3[0].employeeName} <span title={top3[0].badge} style={{ fontSize:'1.5rem' }}>{badge.emoji}</span>
                        </div>
                        <div style={{ fontSize:'0.85rem', color:'#64748b', fontWeight:600, textTransform:'uppercase', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                            <span>{top3[0].department}</span>
                            <span style={{ color:'var(--accent)' }}>•</span>
                            <span style={{ color:'var(--accent)' }}>Elite Rank</span>
                        </div>
                        <div style={{ fontSize:'3rem', fontWeight:900, background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{top3[0].points}</div>
                        <div style={{ fontSize:'0.85rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1.5px' }}>Peak Performance</div>
                        <div style={{ marginTop:24, padding: '10px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, display:'inline-flex', alignItems: 'center', gap:8, color: '#10b981', fontWeight: 800 }}>
                            <ShieldCheck size={18}/> {top3[0].completedTasks} Verified Tasks
                        </div>
                    </div>
                )})()}

                {/* Third Place */}
                {top3[2] && (() => {
                    const badge = getBadgeInfo(top3[2].badge);
                    return (
                    <div className="glass-panel" style={{ flex:1, padding:32, textAlign:'center', borderRadius:28, height:340, border:'1px solid var(--panel-border)', position:'relative' }}>
                        <div style={{ marginBottom:20 }}>{podiumIcons[2]}</div>
                        <div style={{ width:64, height:64, borderRadius:18, background:getColor(top3[2].employeeName), margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'1.3rem', boxShadow:'0 10px 20px rgba(0,0,0,0.2)' }}>
                            {top3[2].employeeName.charAt(0)}
                        </div>
                        <div style={{ fontWeight:800, color:'#ffffff', fontSize:'1rem', marginBottom:4, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                            {top3[2].employeeName} <span title={top3[2].badge}>{badge.emoji}</span>
                        </div>
                        <div style={{ fontSize:'0.75rem', color:'#64748b', fontWeight:600, textTransform:'uppercase', marginBottom:12 }}>{top3[2].department}</div>
                        <div style={{ fontSize:'2rem', fontWeight:900, color:'var(--accent)' }}>{top3[2].points}</div>
                        <div style={{ fontSize:'0.7rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px' }}>Points Earned</div>
                        <div style={{ marginTop: 14, fontSize: '0.8rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            <ShieldCheck size={14}/> {top3[2].completedTasks} Verified
                        </div>
                    </div>
                )})()}
            </div>

            {rest.length > 0 && (
                <div className="glass-panel" style={{ padding:0, borderRadius:24, overflow:'hidden', border:'1px solid var(--panel-border)' }}>
                    <div style={{ padding:'24px 32px', borderBottom:'1px solid rgba(0,0,0,0.03)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap: 'wrap', gap: 10 }}>
                        <h3 style={{ fontSize:'1rem', fontWeight:700 }}>Global Rankings</h3>
                        <div style={{ display:'flex', gap: 20 }}>
                            <div style={{ fontSize:'0.8rem', color:'#64748b', fontWeight:600 }}><ShieldCheck size={14} style={{display:'inline', verticalAlign:'text-bottom', marginRight:4}}/> Verified Tasks Only</div>
                            <div style={{ fontSize:'0.8rem', color:'#64748b', fontWeight:600 }}><Users size={14} style={{display:'inline', verticalAlign:'text-bottom', marginRight:4}}/> {leaderboard.length} Total</div>
                        </div>
                    </div>
                    {rest.map((item, i) => {
                        const badge = getBadgeInfo(item.badge);
                        return (
                            <div className="ranking-row" key={item.id} style={{ 
                                padding:'18px 32px', display:'flex', alignItems:'center', justifyContent:'space-between',
                                borderBottom: i === rest.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.02)',
                                transition:'all 0.3s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.01)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                                <div style={{ display:'flex', alignItems:'center', gap:24 }}>
                                    <span style={{ width:32, fontWeight:800, color:'#94a3b8', fontSize:'1rem' }}>#{i+4}</span>
                                    <div style={{ 
                                        width:44, height:44, borderRadius:12, background:getColor(item.employeeName),
                                        display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:'1rem'
                                    }}>
                                        {item.employeeName.charAt(0)}
                                    </div>
                                    <div style={{ width: 140 }}>
                                        <div style={{ fontWeight:700, fontSize:'1rem', color:'#ffffff', display:'flex', alignItems:'center', gap:6 }}>
                                            {item.employeeName}
                                        </div>
                                        <div style={{ fontSize:'0.75rem', color:'#64748b', fontWeight:600, textTransform:'uppercase' }}>{item.department}</div>
                                    </div>
                                    <div style={{ width: 100 }}>
                                        <div style={{ display:'inline-block', background:`${badge.color}15`, color:badge.color, padding:'4px 10px', borderRadius:8, fontSize:'0.75rem', fontWeight:800, border:`1px solid ${badge.color}33`, whiteSpace: 'nowrap' }}>
                                            {badge.emoji} {item.badge}
                                        </div>
                                    </div>
                                    {item.status === 'ON_LEAVE' && (
                                        <span style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 800 }}>On Leave</span>
                                    )}
                                </div>
                                <div style={{ display:'flex', alignItems:'center', gap:32 }}>
                                    
                                    <div style={{ textAlign:'right' }}>
                                        <div style={{ fontSize:'0.7rem', color:'#94a3b8', textTransform:'uppercase', fontWeight:700, letterSpacing:'0.5px' }}><Zap size={10} style={{display:'inline'}}/> Active Load</div>
                                        <div style={{ fontWeight:600, color:'#ffffff', fontSize:'0.9rem' }}>{item.activeTasks} Active</div>
                                    </div>

                                    <div style={{ textAlign:'right' }}>
                                        <div style={{ fontSize:'0.7rem', color:'#10b981', textTransform:'uppercase', fontWeight:700, letterSpacing:'0.5px' }}><ShieldCheck size={10} style={{display:'inline'}}/> Verified</div>
                                        <div style={{ fontWeight:600, color:'#ffffff', fontSize:'0.9rem' }}>{item.completedTasks} Tasks</div>
                                    </div>

                                    <div style={{ textAlign:'right', width:80 }}>
                                        <div style={{ fontWeight:800, color:'var(--accent)', fontSize:'1.2rem' }}>{item.points}</div>
                                        <div style={{ fontSize:'0.65rem', color:'#94a3b8', fontWeight:700, textTransform:'uppercase' }}>Points</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LeaderboardPage;
