import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Users, CheckSquare, CheckCircle, RefreshCw, BarChart2, Clock, ShieldCheck, AlertTriangle, Zap, Activity } from 'lucide-react';
import api from '../api/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

import EmployeesPage from './EmployeesPage';
import TasksPage from './TasksPage';
import AnalyticsPage from './AnalyticsPage';
import LeaderboardPage from './LeaderboardPage';
import NotificationsPage from './NotificationsPage';
import LeaveManagementPage from './LeaveManagementPage';
import CalendarPage from "./CalendarPage";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const severityColor = (s) => s === 'CRITICAL' ? '#ef4444' : s === 'HIGH' ? '#f59e0b' : '#6366f1';

const AdminOverview = () => {
    const [employees, setEmployees] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchAll = () => {
            api.get('/api/employees').then(r => setEmployees(r.data)).catch(() => {});
            api.get('/api/tasks').then(r => setTasks(r.data)).catch(() => {});
            api.get('/api/analytics/alerts').then(r => setAlerts(r.data)).catch(() => {});
        };
        fetchAll();
        const t = setInterval(fetchAll, 15000);
        return () => clearInterval(t);
    }, []);

    const taskCounts = { PENDING:0, ASSIGNED:0, IN_PROGRESS:0, SUBMITTED:0, COMPLETED:0, REASSIGNED:0 };
    tasks.forEach(t => { if (taskCounts[t.status] !== undefined) taskCounts[t.status]++; });
    const activeTasks = taskCounts.PENDING + taskCounts.ASSIGNED + taskCounts.IN_PROGRESS + taskCounts.REASSIGNED;
    const completionRate = tasks.length ? Math.round((taskCounts.COMPLETED / tasks.length) * 100) : 0;

    const firstSix = employees.slice(0, 6);
    const barData = {
        labels: firstSix.map(e => e.name.split(' ')[0]),
        datasets: [
            { label: 'Workload (%)',     data: firstSix.map(e => e.workload),     backgroundColor: 'rgba(0, 210, 255, 0.6)',   borderRadius: 6 },
            { label: 'Availability (%)', data: firstSix.map(e => e.availability), backgroundColor: 'rgba(16, 185, 129, 0.6)',  borderRadius: 6 },
        ]
    };
    const barOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, color: '#94a3b8', font: { size: 11, weight: 600 } } } },
        scales: { x: { ticks: { color:'#94a3b8', font:{size:10} }, grid:{display:false} }, y: { ticks:{color:'#94a3b8'}, grid:{color:'rgba(255,255,255,0.03)'}, min:0, max:100 } }
    };

    const donutData = {
        labels: ['Completed', 'Assigned', 'In Progress', 'Submitted', 'Pending', 'Reassigned'],
        datasets: [{ data: [taskCounts.COMPLETED, taskCounts.ASSIGNED, taskCounts.IN_PROGRESS, taskCounts.SUBMITTED, taskCounts.PENDING, taskCounts.REASSIGNED], backgroundColor: ['#10b981','#3b82f6','#6366f1','#fb923c','#f59e0b','#8b5cf6'], borderWidth: 0, hoverOffset: 10 }]
    };
    const donutOptions = { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, color: '#94a3b8', font: { size: 10, weight: 600 }, padding: 10 } } } };

    return (
        <div>
            <div className="page-header" style={{ marginBottom: 28 }}>
                <h1 style={{ color:'#fff' }}>Mission Command Overview</h1>
                <p style={{ color: '#94a3b8' }}>Strategic workforce orchestration and real-time performance analytics</p>
            </div>

            {/* Stat cards */}
            <div className="stat-cards" style={{ marginBottom: 28 }}>
                {[
                    { label: 'Total Personnel',    value: employees.length,       icon: <Users size={20}/>,       cls: 'blue'   },
                    { label: 'Active Directives',   value: activeTasks,            icon: <Activity size={20}/>,    cls: 'orange' },
                    { label: 'Mission Success',     value: `${completionRate}%`,   icon: <CheckCircle size={20}/>, cls: 'green'  },
                    { label: 'Awaiting Validation', value: taskCounts.SUBMITTED,   icon: <ShieldCheck size={20}/>, cls: 'purple' },
                ].map((s, i) => (
                    <div className="glass-panel stat-card" key={i} style={{ borderRadius: 20, border: '1px solid var(--panel-border)' }}>
                        <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                        <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
                    </div>
                ))}
            </div>

            {/* Smart Alerts */}
            {alerts.length > 0 && (
                <div className="glass-panel" style={{ padding:24, borderRadius:24, border:'1px solid var(--panel-border)', marginBottom:28 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
                        <AlertTriangle size={18} color="#f59e0b"/>
                        <h3 style={{ fontSize:'1rem', fontWeight:800, color:'#ffffff' }}>System Intelligence Alerts</h3>
                        <span style={{ marginLeft:'auto', background:'rgba(245,158,11,0.1)', color:'#f59e0b', borderRadius:8, padding:'2px 10px', fontSize:'0.75rem', fontWeight:800 }}>
                            {alerts.length} active
                        </span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        {alerts.slice(0, 5).map((alert, i) => (
                            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px', borderRadius:14, background:`rgba(${severityColor(alert.severity).replace('#','').match(/../g).map(h=>parseInt(h,16)).join(',')},0.08)`, border:`1px solid ${severityColor(alert.severity)}44` }}>
                                <div style={{ width:10, height:10, borderRadius:'50%', background:severityColor(alert.severity), flexShrink:0, boxShadow:`0 0 8px ${severityColor(alert.severity)}` }}/>
                                <span style={{ fontSize:'0.85rem', fontWeight:700, color:'#ffffff', flex:1 }}>{alert.message}</span>
                                <span style={{ fontSize:'0.7rem', color:severityColor(alert.severity), fontWeight:900, textTransform:'uppercase', letterSpacing:'1px' }}>{alert.severity}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pending Verification Queue */}
            {taskCounts.SUBMITTED > 0 && (
                <div className="glass-panel" style={{ padding:24, borderRadius:24, border:'1px solid rgba(251,146,60,0.3)', background:'rgba(251,146,60,0.04)', marginBottom:28 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
                        <ShieldCheck size={20} color="#fb923c"/>
                        <h3 style={{ fontSize:'1rem', fontWeight:800, color:'#ffffff' }}>Validation Queue</h3>
                        <span style={{ marginLeft:'auto', background:'rgba(251,146,60,0.15)', color:'#fb923c', borderRadius:8, padding:'2px 12px', fontSize:'0.75rem', fontWeight:900, border:'1px solid rgba(251,146,60,0.3)' }}>
                            {taskCounts.SUBMITTED} pending
                        </span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        {tasks.filter(t => t.status === 'SUBMITTED').map(task => (
                            <div key={task.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderRadius:16, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)' }}>
                                <div>
                                    <div style={{ fontWeight:800, fontSize:'0.95rem', color:'#ffffff' }}>{task.name}</div>
                                    {task.assignedEmployeeName && <div style={{ fontSize:'0.78rem', color:'#94a3b8', marginTop:3, fontWeight:600 }}>By Personnel: {task.assignedEmployeeName}</div>}
                                </div>
                                <div style={{ display:'flex', gap:10 }}>
                                    <button className="btn-success" style={{ height:36, padding:'0 18px', fontSize:'0.82rem', borderRadius:10, fontWeight:800 }}
                                        onClick={() => api.post(`/api/tasks/${task.id}/verify`).then(() => { api.get('/api/tasks').then(r => setTasks(r.data)); }).catch(console.error)}>
                                        <ShieldCheck size={14}/> Verify
                                    </button>
                                    <button className="btn-outline" style={{ height:36, padding:'0 18px', fontSize:'0.82rem', borderRadius:10, fontWeight:800, color:'#ef4444', borderColor:'#ef444466' }}
                                        onClick={() => api.post(`/api/tasks/${task.id}/reject-submission`).then(() => { api.get('/api/tasks').then(r => setTasks(r.data)); }).catch(console.error)}>
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="charts-row" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:24 }}>
                <div className="glass-panel chart-card" style={{ padding:28, borderRadius:28, border:'1px solid var(--panel-border)' }}>
                    <h3 style={{ marginBottom:24, fontSize:'1rem', fontWeight:800, display:'flex', alignItems:'center', gap:10, color:'#ffffff' }}>
                        <BarChart2 size={18} color="var(--primary)"/> Grid Load Variance
                    </h3>
                    <div style={{ height:260 }}><Bar data={barData} options={barOptions}/></div>
                </div>
                <div className="glass-panel chart-card" style={{ padding:28, borderRadius:28, border:'1px solid var(--panel-border)' }}>
                    <h3 style={{ marginBottom:24, fontSize:'1rem', fontWeight:800, display:'flex', alignItems:'center', gap:10, color:'#ffffff' }}>
                        <Clock size={18} color="var(--primary)"/> Project Distribution
                    </h3>
                    <div style={{ height:260, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Doughnut data={donutData} options={donutOptions}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => (
    <div className="dashboard-layout">
        <Sidebar role="ADMIN"/>
        <div className="main-content">
            <Routes>
                <Route path="/"             element={<AdminOverview/>}/>
                <Route path="/employees"    element={<EmployeesPage/>}/>
                <Route path="/tasks"        element={<TasksPage role="ADMIN"/>}/>
                <Route path="/analytics"    element={<AnalyticsPage/>}/>
                <Route path="/leaderboard"  element={<LeaderboardPage/>}/>
                <Route path="/notifications" element={<NotificationsPage role="ADMIN"/>}/>
                <Route path="/leave"        element={<LeaveManagementPage/>}/>
                <Route path="/calendar" element={<CalendarPage />} />
            </Routes>
        </div>
    </div>
);

export default AdminDashboard;
