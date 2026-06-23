import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { TrendingUp, Users, CheckCircle, Activity, RefreshCw, Clock, AlertTriangle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement, Filler);

const severityColor = (s) => s === 'CRITICAL' ? '#ef4444' : s === 'HIGH' ? '#f59e0b' : '#6366f1';

const AnalyticsPage = () => {
    const [stats, setStats] = useState(null);
    const [performance, setPerformance] = useState([]);
    const [activity, setActivity] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = () => {
        Promise.all([
            api.get('/api/analytics/dashboardStats'),
            api.get('/api/analytics/performance'),
            api.get('/api/analytics/activity'),
            api.get('/api/analytics/alerts'),
            api.get('/api/gamification/leaderboard'),
        ]).then(([s, p, act, al, l]) => {
            setStats(s.data);
            setPerformance(p.data);
            setActivity(act.data);
            setAlerts(al.data);
            setLeaderboard(l.data);
            setLoading(false);
        }).catch(console.error);
    };

    useEffect(() => {
        fetchAll();
        const t = setInterval(fetchAll, 15000);
        return () => clearInterval(t);
    }, []);

    if (loading || !stats) return <div style={{ textAlign:'center', color:'#94a3b8', padding:64 }}>Parsing real-time metrics…</div>;

    const barData = {
        labels: performance.slice(0,8).map(e => e.name),
        datasets: [
            { label:'Workload (%)', data:performance.slice(0,8).map(e=>e.workload), backgroundColor:'rgba(0, 210, 255, 0.6)', borderRadius:6 },
            { label:'Availability (%)', data:performance.slice(0,8).map(e=>e.availability), backgroundColor:'rgba(16, 185, 129, 0.6)', borderRadius:6 },
            { label:'Fatigue (%)', data:performance.slice(0,8).map(e=>e.fatigueScore), backgroundColor:'rgba(245, 158, 11, 0.6)', borderRadius:6 },
        ]
    };
    const baseOpts = { responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:'bottom', labels:{ boxWidth:12, color:'#94a3b8', font:{size:11, weight:600} } } },
        scales:{ x:{ticks:{color:'#94a3b8',font:{size:10}},grid:{display:false}}, y:{ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,0.03)'},min:0,max:100} }
    };
    
    const topPts = leaderboard.slice(0,8);
    const pointsData = {
        labels: topPts.map(g => g.employeeName?.split(' ')[0] || 'Unknown'),
        datasets:[{ 
            label:'Points', 
            data:topPts.map(g=>g.points), 
            fill:true, 
            backgroundColor:'rgba(0, 210, 255, 0.05)', 
            borderColor:'var(--accent)', 
            pointBackgroundColor:'var(--accent)', 
            pointBorderColor:'#fff',
            pointBorderWidth:2,
            pointRadius:4,
            tension:0.4 
        }]
    };
    const lineOpts = { responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        scales:{ x:{ticks:{color:'#94a3b8',font:{size:10}},grid:{display:false}}, y:{ticks:{color:'#94a3b8', font:{size:10}},grid:{color:'rgba(255,255,255,0.03)'}} }
    };

    return (
        <div style={{ maxWidth: 1200 }}>
            <div className="page-header" style={{ marginBottom: 32 }}>
                <h1 style={{ color:'#fff' }}>Strategic Analytics</h1>
                <p style={{ color: '#94a3b8' }}>Data-driven insights across the entire project ecosystem</p>
            </div>

            <div className="stat-cards" style={{ marginBottom: 32 }}>
                {[
                    { label:'Total Personnel', value:stats.totalEmployees, icon:<Users size={20}/>, cls:'blue' },
                    { label:'Total Tasks', value:stats.totalTasks, icon:<Activity size={20}/>, cls:'blue' },
                    { label:'Success Rate', value:`${stats.successRate}%`, icon:<TrendingUp size={20}/>, cls:'green' },
                    { label:'Verified/Completed', value:stats.verifiedTasks, icon:<CheckCircle size={20}/>, cls:'green' },
                    { label:'Currently Active Tasks', value:stats.activeTasks, icon:<Clock size={20}/>, cls:'orange' },
                    { label:'AI Reassigned', value:stats.reassignedTasks, icon:<RefreshCw size={20}/>, cls:'purple' },
                ].map((s,i) => (
                    <div className="glass-panel stat-card" key={i} style={{ borderRadius: 20, border: '1px solid var(--panel-border)' }}>
                        <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                        <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
                    </div>
                ))}
            </div>

            <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24, marginBottom: 24 }}>
                <div className="glass-panel chart-card" style={{ padding: 28, borderRadius: 24, border: '1px solid var(--panel-border)' }}>
                    <h3 style={{ marginBottom:24, fontSize:'1.05rem', fontWeight:800, color:'#ffffff', display:'flex', alignItems:'center', gap:10 }}>
                        <Activity size={18} color="var(--primary)"/> Workforce Load & Fatigue
                    </h3>
                    <div style={{ height:280 }}><Bar data={barData} options={baseOpts}/></div>
                </div>
                <div className="glass-panel chart-card" style={{ padding: 28, borderRadius: 24, border: '1px solid var(--panel-border)' }}>
                    <h3 style={{ marginBottom:24, fontSize:'1.05rem', fontWeight:800, color:'#ffffff', display:'flex', alignItems:'center', gap:10 }}>
                        <TrendingUp size={18} color="var(--primary)"/> Impact Points Trend
                    </h3>
                    <div style={{ height:280 }}><Line data={pointsData} options={lineOpts}/></div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
                <div className="glass-panel chart-card" style={{ padding: 28, borderRadius: 24, border: '1px solid var(--panel-border)' }}>
                    <h3 style={{ marginBottom:24, fontSize:'1.05rem', fontWeight:800, color:'#ffffff', display:'flex', alignItems:'center', gap:10 }}>
                        <Clock size={18} color="var(--primary)"/> System Activity Timeline
                    </h3>
                    <div style={{ height: 350, overflowY: 'auto', paddingRight: 10 }}>
                        {activity.map(log => (
                            <div key={log.id} style={{ display: 'flex', gap: 16, marginBottom: 20, position: 'relative' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', marginTop: 4, zIndex: 1, boxShadow:'0 0 10px var(--primary)' }}/>
                                {/* Vertical line */}
                                <div style={{ position: 'absolute', left: 4, top: 14, bottom: -20, width: 2, background: 'rgba(255,255,255,0.05)', zIndex: 0 }}/>
                                
                                <div style={{ flex: 1, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>{log.actor}</strong>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight:700 }}>
                                            {new Date(log.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                                        <span style={{ fontWeight: 800, color: 'var(--primary)', marginRight: 6, fontSize:'0.75rem' }}>[{log.action.toUpperCase()}]</span>
                                        {log.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="glass-panel chart-card" style={{ padding: 28, borderRadius: 24, border: '1px solid var(--panel-border)' }}>
                        <h3 style={{ marginBottom:24, fontSize:'1.05rem', fontWeight:800, color:'#ffffff', display:'flex', alignItems:'center', gap:10 }}>
                            <AlertTriangle size={18} color="#f59e0b"/> Smart Alerts
                        </h3>
                        {alerts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                                <CheckCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} color="#10b981"/>
                                All systems nominal.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 260, overflowY: 'auto' }}>
                                {alerts.map((alert, i) => (
                                    <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:14, background:`rgba(${severityColor(alert.severity).replace('#','').match(/../g).map(h=>parseInt(h,16)).join(',')},0.08)`, border:`1px solid ${severityColor(alert.severity)}44` }}>
                                        <div style={{ width:10, height:10, borderRadius:'50%', background:severityColor(alert.severity), flexShrink:0, boxShadow:`0 0 8px ${severityColor(alert.severity)}` }}/>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: severityColor(alert.severity), marginBottom: 2, textTransform:'uppercase' }}>{alert.severity}</div>
                                            <div style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 700 }}>{alert.message}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                </div>
            </div>
            
        </div>
    );
};

export default AnalyticsPage;
