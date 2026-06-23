import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Bell, RefreshCw, CheckCircle2, Info } from 'lucide-react';

const typeConfig = {
    ASSIGNMENT:   { icon: <Bell size={18} color="#38bdf8"/>, bg:'rgba(56,189,248,0.12)', border:'#38bdf8', label:'New Assignment' },
    REASSIGNMENT: { icon: <RefreshCw size={18} color="#38bdf8"/>, bg:'rgba(56,189,248,0.12)', border:'#38bdf8', label:'Reassigned' },
    COMPLETION:   { icon: <CheckCircle2 size={18} color="#38bdf8"/>, bg:'rgba(56,189,248,0.12)', border:'#38bdf8', label:'Completed' },
    VERIFICATION: { icon: <CheckCircle2 size={18} color="#10b981"/>, bg:'rgba(16,185,129,0.12)', border:'#10b981', label:'Task Submitted' },
    SYSTEM:       { icon: <Info size={18} color="#38bdf8"/>, bg:'rgba(56,189,248,0.12)', border:'#38bdf8', label:'System' },
};

const NotificationsPage = ({ role }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        loadNotifs();

        // 🔥 AUTO REFRESH
        const interval = setInterval(() => {
            loadNotifs();
        }, 30000);

        return () => clearInterval(interval);
    }, [role, user]);

    const loadNotifs = async () => {
        setLoading(true);
        try {
            let backendNotifs = [];

            // ===== EXISTING BACKEND LOGIC =====
            if (role === 'ADMIN') {
                const r = await api.get('/api/notifications/admin');
                backendNotifs = r.data;
            } else if (user?.id) {
                const empRes = await api.get(`/api/employees/me/${user.id}`);
                const empId = empRes.data?.id;
                if (empId) {
                    const r = await api.get(`/api/notifications/employee/${empId}`);
                    backendNotifs = r.data;
                }
            }

            // ===== 🔥 NEW: DEADLINE ALERTS =====
            const taskRes = await api.get("/api/tasks");
            const today = new Date();
            today.setHours(0,0,0,0);

            const deadlineNotifs = taskRes.data.map(task => {
                const due = new Date(task.deadline);
                due.setHours(0,0,0,0);

                const diff = (due - today) / (1000 * 60 * 60 * 24);

                if (diff < 0) {
                    return {
                        id: "deadline-" + task.id,
                        type: "SYSTEM",
                        message: `❌ Task "${task.name}" is overdue`,
                        read: false
                    };
                }

                if (diff === 0) {
                    return {
                        id: "deadline-" + task.id,
                        type: "SYSTEM",
                        message: `⚡ Task "${task.name}" is due today`,
                        read: false
                    };
                }

                if (diff <= 2) {
                    return {
                        id: "deadline-" + task.id,
                        type: "SYSTEM",
                        message: `⚠ Task "${task.name}" due in ${diff} days`,
                        read: false
                    };
                }

                return null;
            }).filter(Boolean);

            // ===== MERGE =====
            setNotifications([...deadlineNotifs, ...backendNotifs]);

        } catch {
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const markRead = (id) => {
        api.post(`/api/notifications/${id}/read`).catch(() => {});
        setNotifications(prev => prev.map(n => n.id===id ? {...n, read:true} : n));
    };

    const verifyTask = async (taskId) => {
        await api.post(`/api/tasks/verify/${taskId}`);
        loadNotifs();
    };

    const rejectTask = async (taskId) => {
        await api.post(`/api/tasks/reject-submission/${taskId}`);
        loadNotifs();
    };

    if (loading) return <div style={{ textAlign:'center', color:'#CBD5E1', padding:64 }}>Loading...</div>;

    return (
        <div style={{ maxWidth:860 }}>
            <h1>🔔 Notifications ({unreadCount})</h1>

            {notifications.length === 0 ? (
                <p>No notifications</p>
            ) : (
                notifications.map((notif) => {
                    const cfg = typeConfig[notif.type] || typeConfig.SYSTEM;

                    // 🔥 PRIORITY COLOR
                    let color = "#38bdf8";
                    if (notif.message.includes("overdue")) color = "#ef4444";
                    if (notif.message.includes("today")) color = "#f97316";
                    if (notif.message.includes("due")) color = "#facc15";

                    return (
                        <div key={notif.id}
                            onClick={() => markRead(notif.id)}
                            style={{
                                padding:20,
                                marginBottom:10,
                                borderRadius:10,
                                background: notif.read ? "transparent" : "rgba(56,189,248,0.08)",
                                border:`1px solid ${color}33`,
                                cursor:"pointer"
                            }}
                        >
                            <div style={{ display:"flex", gap:10 }}>
                                {cfg.icon}
                                <div>
                                    <p style={{ fontWeight: notif.read ? 500 : 700 }}>
                                        {notif.message}
                                    </p>

                                    {/* ADMIN ACTIONS */}
                                    {role === "ADMIN" && notif.taskId && (
                                        <div style={{ marginTop:10 }}>
                                            <button onClick={(e)=>{e.stopPropagation();verifyTask(notif.taskId);}}>Approve</button>
                                            <button onClick={(e)=>{e.stopPropagation();rejectTask(notif.taskId);}}>Reject</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default NotificationsPage;