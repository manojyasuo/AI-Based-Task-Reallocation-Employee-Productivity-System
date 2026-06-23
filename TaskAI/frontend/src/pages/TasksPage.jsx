import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import api from '../api/axios';

import { AuthContext } from '../context/AuthContext';
import {
    Plus, CheckCircle2, Zap, ArrowRight, List, LayoutGrid,
    Clock, Activity, RefreshCw, PlayCircle, ShieldCheck, XCircle, Send, Users, Sparkles
} from 'lucide-react';

// ── FILE UPLOAD SUBMIT COMPONENT ──
const FileUploadSubmit = ({ taskId, onSubmit }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            if (!file) {
                alert('Please select a PDF or DOCX file before submitting.');
                return;
            }
            const formData = new FormData();
            formData.append('file', file);
            formData.append('remarks', remarks || '');
            
            console.log('Uploading file to: http://localhost:8081/api/tasks/submit/' + taskId);
            console.log('File:', file.name, file.size);
            console.log('Remarks:', remarks);
            
            const response = await axios.post(`http://localhost:8081/api/tasks/submit/${taskId}`, formData);
            console.log('Upload response:', response);
            
            onSubmit(taskId);
            setFile(null);
            setRemarks('');
            setIsOpen(false);
            alert('Task submitted successfully!');
        } catch (err) {
            console.error('Upload error:', err);
            console.error('Error response:', err.response);
            alert('Submission failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) {
        return (
            <button className="btn-primary" style={{ width:'100%', height:36, borderRadius:12, fontWeight: 700 }} onClick={() => setIsOpen(true)}>
                <Send size={14}/> Submit Task
            </button>
        );
    }

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:10, padding:12, background:'rgba(59,130,246,0.05)', borderRadius:12, border:'1px solid rgba(59,130,246,0.1)' }}>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div>
                    <label style={{ display:'block', fontSize:'0.7rem', fontWeight:800, color:'#94a3b8', marginBottom:6, textTransform:'uppercase' }}>
                        Upload Project File (ZIP, PDF, DOCX, TXT, PNG)
                    </label>
                    <input 
                        type="file" 
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        accept=".pdf,.docx"
                        style={{ fontSize:'0.75rem', padding:'6px', borderRadius:8, width:'100%', boxSizing:'border-box' }}
                    />
                </div>
                <div>
                    <label style={{ display:'block', fontSize:'0.7rem', fontWeight:800, color:'#94a3b8', marginBottom:6, textTransform:'uppercase' }}>
                        Submission Remarks (Optional)
                    </label>
                    <textarea 
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add any notes about your submission..."
                        style={{ fontSize:'0.75rem', padding:'8px', borderRadius:8, width:'100%', height:50, boxSizing:'border-box', resize:'none' }}
                    />
                </div>
                <div style={{ display:'flex', gap:8 }}>
                    <button type="submit" className="btn-success" style={{ flex:1, height:32, borderRadius:10, fontSize:'0.75rem', fontWeight:700 }} disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Submit'}
                    </button>
                    <button type="button" className="btn-outline" style={{ flex:1, height:32, borderRadius:10, fontSize:'0.75rem', fontWeight:700 }} onClick={() => setIsOpen(false)}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

const priorityBadge = (p) => {
    if (p === 3) return <span className="badge badge-critical" style={{ boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)' }}>Critical</span>;
    if (p === 2) return <span className="badge badge-high" style={{ boxShadow: '0 0 10px rgba(245, 158, 11, 0.4)' }}>High</span>;
    return <span className="badge badge-low" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>Low</span>;
};

const statusColors = {
    PENDING:    { bg: 'rgba(245,158,11,0.12)',  border: '#f59e0b', text: '#f59e0b', label: 'Pending',   icon: <Zap size={13}/> },
    ASSIGNED:   { bg: 'rgba(59,130,246,0.12)',  border: '#3b82f6', text: '#3b82f6', label: 'Assigned',  icon: <ArrowRight size={13}/> },
    IN_PROGRESS:{ bg: 'rgba(99,102,241,0.12)',  border: '#6366f1', text: '#6366f1', label: 'In Progress',icon: <Activity size={13}/> },
    SUBMITTED:  { bg: 'rgba(251,146,60,0.12)',  border: '#fb923c', text: '#fb923c', label: 'Submitted', icon: <Send size={13}/> },
    COMPLETED:  { bg: 'rgba(16,185,129,0.12)',  border: '#10b981', text: '#10b981', label: 'Completed', icon: <CheckCircle2 size={13}/> },
    REASSIGNED: { bg: 'rgba(139,92,246,0.12)',  border: '#8b5cf6', text: '#8b5cf6', label: 'Reassigned',icon: <RefreshCw size={13}/> },
};

const KANBAN_COLS = ['PENDING','ASSIGNED','IN_PROGRESS','SUBMITTED','COMPLETED','REASSIGNED'];

// ── SKILL PREDICTION LOGIC ──
// ── IMPROVED SKILL PREDICTION LOGIC ──
const predictSkill = (name) => {
    const low = name.toLowerCase();

    // 🎨 FRONTEND
    if (
        low.includes('react') || low.includes('frontend') || low.includes('ui') ||
        low.includes('css') || low.includes('html') || low.includes('javascript')
    ) return 'Frontend';

    // 🗄 DATABASE
    if (
        low.includes('sql') || low.includes('mysql') || low.includes('db') ||
        low.includes('database') || low.includes('query')
    ) return 'Database';

    // ⚙ BACKEND
    if (
        low.includes('java') || low.includes('spring') || low.includes('backend') ||
        low.includes('api') || low.includes('server') || low.includes('node') || low.includes('express')
    ) return 'Backend';

    // 🧠 AI / ML
    if (
        low.includes('python') || low.includes('ai') || low.includes('ml') ||
        low.includes('data') || low.includes('model') || low.includes('nlp')
    ) return 'AI/ML';

    // 🧪 QA TESTING
    if (
        low.includes('bug') || low.includes('fix') || low.includes('test') ||
        low.includes('testing') || low.includes('debug')
    ) return 'QA Testing';

    // 🚀 DEVOPS
    if (
        low.includes('docker') || low.includes('k8s') || low.includes('pipeline') ||
        low.includes('aws') || low.includes('deploy') || low.includes('ci/cd')
    ) return 'DevOps';

    return '';
};

const extractFileName = (path) => {
    if (!path) return '';
    const normalized = path.replace(/\\/g, '/');
    const segments = normalized.split('/').filter(Boolean);
    return segments.length ? segments[segments.length - 1] : path;
};

const getSubmissionFile = (task) => task.submittedFile || task.filePath || null;
const getSubmissionTime = (task) => task.submittedAt || task.submittedTime || null;
const getSubmissionUrl = (task) => {
    const submittedFile = getSubmissionFile(task);
    if (!submittedFile) return null;
    if (submittedFile.startsWith('http://') || submittedFile.startsWith('https://')) {
        return submittedFile;
    }
    // Use backend URL (8081) for file serving, not frontend URL
    const backendUrl = 'http://localhost:8081';
    const encodedPath = submittedFile.startsWith('/') ? submittedFile : `/${submittedFile}`;
    const fullUrl = `${backendUrl}${encodedPath}`;
    console.log('DEBUG: File path:', submittedFile, 'Full URL:', fullUrl);
    return fullUrl;
};

// ── TASK CARD ──
const TaskCard = ({ task, role, onStart, onSubmit, onVerify, onReject, onSuggest, onAssignManual, onDownloadFile }) => {
    const cfg = statusColors[task.status] || statusColors.PENDING;
    const s = task.status;
    return (
        <div className="glass-panel" style={{
            padding: '20px 18px', borderRadius: 22, border: `1px solid ${cfg.border}22`,
            background: cfg.bg, transition: 'all 0.3s', cursor: 'default'
        }}>
            <div style={{ marginBottom: 14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 8 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#ffffff', lineHeight: 1.4, flex: 1, marginRight: 8 }}>
                        {task.name}
                    </div>
                    {priorityBadge(task.priority)}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>{task.description}</div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <span className="task-tag" style={{ background: 'rgba(0,210,255,0.08)', color: 'var(--primary)', border: '1px solid rgba(0,210,255,0.15)', fontSize: '0.72rem', fontWeight: 800 }}>
                    {task.requiredSkill}
                </span>
                {task.deadline && (
                    <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                        <Clock size={12}/>{task.deadline}
                    </span>
                )}
            </div>

            {task.assignedEmployeeName && (
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, padding:'10px 12px', background:'rgba(255,255,255,0.03)', borderRadius:12, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width:24, height:24, borderRadius:8, background: 'var(--accent)', color:'#000', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:900 }}>
                        {task.assignedEmployeeName.charAt(0)}
                    </div>
                    <span style={{ fontSize:'0.85rem', fontWeight:800, color:'#ffffff' }}>{task.assignedEmployeeName}</span>
                </div>
            )}

            {task.submissionRemarks && (
                <div style={{ marginBottom: 12, padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, fontSize: '0.78rem', color: '#cbd5e1' }}>
                    <span style={{ fontWeight: 700, color: '#94a3b8' }}>Remarks:</span> {task.submissionRemarks}
                </div>
            )}
            {getSubmissionFile(task) && (
                <div style={{ marginBottom: 12, padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, fontSize: '0.78rem', color: '#cbd5e1' }}>
                    <span style={{ fontWeight: 700, color: '#94a3b8' }}>Submission File:</span> {extractFileName(getSubmissionFile(task))}
                </div>
            )}
            {getSubmissionTime(task) && (
                <div style={{ marginBottom: 12, padding: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, fontSize: '0.78rem', color: '#94a3b8' }}>
                    Submitted: {new Date(getSubmissionTime(task)).toLocaleString()}
                </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {role === 'EMPLOYEE' && s === 'ASSIGNED' && (
                    <button className="btn-success" style={{ width:'100%', height:36, borderRadius:12, fontWeight: 700 }} onClick={() => onStart(task.id)}>
                        <PlayCircle size={14}/> Start Task
                    </button>
                )}
                {role === 'EMPLOYEE' && (s === 'IN_PROGRESS' || s === 'REASSIGNED') && (
                    <FileUploadSubmit taskId={task.id} onSubmit={onSubmit} />
                )}

                {role === 'ADMIN' && s === 'SUBMITTED' && (
                    <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
                        <div style={{ display:'flex', gap:8 }}>
                            <button className="btn-success" style={{ flex:1, height:36, borderRadius:12, fontWeight: 700 }} onClick={() => onVerify(task.id)}>
                                <ShieldCheck size={14}/> Approve
                            </button>
                            <button className="btn-outline" style={{ flex:1, height:36, borderRadius:12, fontWeight: 700, color:'#ef4444', borderColor:'#ef444433' }} onClick={() => onReject(task.id)}>
                                <XCircle size={14}/> Reject
                            </button>
                        </div>
                        {getSubmissionFile(task) && (
                            <>
                                <button className="btn-outline" style={{ width:'100%', height:34, borderRadius:10, fontSize:'0.75rem', fontWeight:700 }} onClick={() => onDownloadFile(task.id)}>
                                    Download Submission
                                </button>
                                <a href={getSubmissionUrl(task)} target="_blank" rel="noreferrer" className="btn-outline" style={{ width:'100%', height:34, borderRadius:10, fontSize:'0.75rem', fontWeight:700, display:'inline-flex', alignItems:'center', justifyContent:'center', textDecoration:'none' }}>
                                    View Submission
                                </a>
                            </>
                        )}
                    </div>
                )}

                {role === 'ADMIN' && s === 'PENDING' && (
                    <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <button className="btn-primary glow-button" style={{ height:36, borderRadius:10, fontSize:'0.7rem', fontWeight: 800 }} onClick={() => onSuggest(task.id)}>
                            <Zap size={12} fill="currentColor"/> AI ASSIGN
                        </button>
                        <button className="btn-outline" style={{ height:36, borderRadius:10, fontSize:'0.7rem', fontWeight: 800, color:'#94a3b8' }} onClick={() => onAssignManual(task.id)}>
                            <Users size={12}/> MANUAL
                        </button>
                    </div>
                )}
                
                {role === 'ADMIN' && s !== 'PENDING' && s !== 'COMPLETED' && s !== 'VERIFIED' && (
                    <button className="btn-outline" style={{ width:'100%', height:34, borderRadius:10, fontSize:'0.75rem', fontWeight:700, borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }} onClick={() => onSuggest(task.id)}>
                         <RefreshCw size={13}/> AI Re-assign
                    </button>
                )}
            </div>
        </div>
    );
};

// ── KANBAN COLUMN ──
const KanbanColumn = ({ status, tasks, role, onStart, onSubmit, onVerify, onReject, onSuggest, onAssignManual, onDownloadFile }) => {
    const cfg = statusColors[status];
    return (
        <div className="glass-panel" style={{ borderRadius:24, padding:20, minHeight:600, minWidth:280, flex:1, border:'1px solid var(--panel-border)', background:'rgba(255,255,255,0.015)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
                <div style={{ width:12, height:12, borderRadius:'50%', background:cfg.border, boxShadow:`0 0 10px ${cfg.border}` }}/>
                <span style={{ fontWeight:800, fontSize:'0.82rem', color:'#ffffff', textTransform:'uppercase', letterSpacing:'1px' }}>{cfg.label}</span>
                <span style={{ marginLeft:'auto', background:cfg.bg, color:cfg.text, borderRadius:10, padding:'2px 10px', fontSize:'0.72rem', fontWeight:900, border:`1px solid ${cfg.border}22` }}>
                    {tasks.length}
                </span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} role={role}
                        onStart={onStart} onSubmit={onSubmit}
                        onVerify={onVerify} onReject={onReject} 
                        onSuggest={onSuggest} onAssignManual={onAssignManual}
                        onDownloadFile={onDownloadFile} />
                ))}
                {tasks.length === 0 && (
                    <div style={{ textAlign:'center', color:'#475569', padding:'80px 0', fontSize:'0.82rem', fontWeight: 600 }}>
                        No records
                    </div>
                )}
            </div>
        </div>
    );
};

// ── MAIN PAGE ──
const TasksPage = ({ role = 'ADMIN', employeeName = null }) => {
    const { user } = useContext(AuthContext);
    const [employeeProfileId, setEmployeeProfileId] = useState(null);
    const [employeeProfileLoading, setEmployeeProfileLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [viewMode, setViewMode] = useState('kanban');
    const [showForm, setShowForm] = useState(false);
    const [newTask, setNewTask] = useState({ name:'', description:'', requiredSkill:'', priority:2, deadline:'', assignMode:'AI', manualEmployeeId:'' });
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [reassigning, setReassigning] = useState(false);

    useEffect(() => {
        if (role === 'EMPLOYEE' && user?.id) {
            setEmployeeProfileLoading(true);
            api.get(`/api/employees/me/${user.id}`)
                .then(r => setEmployeeProfileId(r.data?.id || null))
                .catch(() => setEmployeeProfileId(null))
                .finally(() => setEmployeeProfileLoading(false));
        } else {
            setEmployeeProfileId(null);
            setEmployeeProfileLoading(false);
        }
    }, [role, user]);

    const fetchTasks = () => {
        setLoading(true);
        const employeeId = role === 'EMPLOYEE' ? employeeProfileId : null;

        if (role === 'EMPLOYEE' && employeeId) {
            api.get('/api/tasks', { params: { employeeId } })
                .then(r => setTasks(r.data))
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            api.get('/api/tasks')
                .then(r => setTasks(r.data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    };

    const fetchEmps = () => {
        api.get('/api/employees').then(r => {
            console.log('[TasksPage] fetchEmps response', r.data);
            setEmployees(r.data);
        }).catch(console.error);
    };

    useEffect(() => { 
        fetchEmps();
    }, []);

    useEffect(() => {
        if (role === 'EMPLOYEE') {
            if (employeeProfileId) {
                fetchTasks();
            }
        } else {
            fetchTasks();
        }

        const interval = setInterval(() => {
            if (role === 'EMPLOYEE') {
                if (employeeProfileId) fetchTasks();
            } else {
                fetchTasks();
            }
        }, 15000);

        return () => clearInterval(interval);
    }, [employeeProfileId, role]);

    const fetchSuggestions = (taskId) => {
        setShowSuggestions(taskId);
        setSuggestions([]);
        api.get(`/api/tasks/${taskId}/suggestions`).then(r => setSuggestions(r.data)).catch(console.error);
    };

    const applyAssign = async (taskId, employee) => {
        setReassigning(true);
        const employeeId = employee ? Number(employee.id ?? employee.employeeId ?? employee) : null;
        console.log('[TasksPage] applyAssign called', { taskId, employee, employeeId });

        if (!taskId) {
            alert('Allocation Failed: missing task identifier.');
            setReassigning(false);
            return;
        }
        if (!employeeId || Number.isNaN(employeeId)) {
            alert('Allocation Failed: invalid personnel ID. Please select a valid employee.');
            setReassigning(false);
            return;
        }

        try {
            const res = await api.post(`/api/tasks/${taskId}/assign`, { employeeId });
            console.log('[TasksPage] assignTask response', res.status, res.data);
            fetchTasks(); 
            setShowSuggestions(null); 
        } catch (err) {
            alert("Allocation Failed: interface link lost or invalid personnel ID.");
            console.error('[TasksPage] assignTask error', err);
        } finally {
            setReassigning(false);
        }
    };

    const downloadFile = (taskId) => {
        const task = allTasks.find(t => t.id === taskId);
        if (!task || !task.filePath) {
            alert('No file available for download');
            return;
        }
        // Use direct backend URL for file download
        const fileUrl = 'http://localhost:8081' + (task.filePath.startsWith('/') ? task.filePath : '/' + task.filePath);
        console.log('DEBUG: Downloading from:', fileUrl);
        
        api.get(`/api/tasks/${taskId}/file`, { responseType: 'blob' })
            .then(response => {
                const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
                let filename = `task_${taskId}`;
                if (contentDisposition) {
                    const match = /filename\*?=(?:UTF-8''?)?"?([^";]+)/i.exec(contentDisposition);
                    if (match && match[1]) {
                        filename = decodeURIComponent(match[1].trim().replace(/"/g, ''));
                    }
                }
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
                console.log('File downloaded:', filename);
            })
            .catch(err => {
                console.error('Download error:', err);
                alert('Download failed: ' + (err.response?.data?.error || err.message));
            });
    };

    const handleTaskNameChange = (val) => {
        const predicted = predictSkill(val);
        setNewTask({ ...newTask, name: val, requiredSkill: predicted || newTask.requiredSkill });
    };

    const createTask = async (e) => {
        e.preventDefault();
        setCreating(true);
        const auto = newTask.assignMode === 'AI';
        
        try {
            const r = await api.post(`/api/tasks?autoAssign=${auto}`, newTask);
            const taskId = r.data.id;

            if (!auto && newTask.manualEmployeeId) {
                const employeeId = Number(newTask.manualEmployeeId);
                if (!employeeId) {
                    throw new Error('Invalid manual employee selection');
                }
                // Synchronously ensure manual assignment is completed and notifications triggered
                await api.post(`/api/tasks/${taskId}/assign`, { employeeId });
            }

            fetchTasks(); 
            resetForm();
            alert("Mission Established: Directive has been successfully broadcast to the grid.");
        } catch (err) {
            alert("Registry Error: Fail to establish mission directive.");
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    const resetForm = () => {
        setNewTask({name:'',description:'',requiredSkill:'',priority:2,deadline:'', assignMode:'AI', manualEmployeeId:''}); 
        setShowForm(false);
    }

    const filteredTasks = (() => {
        if (role === 'EMPLOYEE') {
            const currentEmployeeId = employeeProfileId ? Number(employeeProfileId) : null;
            return tasks.filter(t => {
                const isOwner = currentEmployeeId ? t.assignedEmployeeId === currentEmployeeId : false;
                const allowedStatus = ['ASSIGNED', 'IN_PROGRESS', 'SUBMITTED'];
                return isOwner && allowedStatus.includes(t.status);
            });
        }
        return tasks;
    })();

    const grouped = {};
    KANBAN_COLS.forEach(s => { grouped[s] = filteredTasks.filter(t => t.status === s); });

    const submittedCount = grouped['SUBMITTED']?.length || 0;

    return (
        <div>
            <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:32 }}>
                <div>
                    <h1>Mission Control</h1>
                    <p>Orchestrate workforce tasks with AI & Smart Allocation</p>
                </div>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                    {role === 'ADMIN' && submittedCount > 0 && (
                        <div style={{ background:'rgba(251,146,60,0.1)', color:'#fb923c', border:'1px solid rgba(251,146,60,0.2)', padding:'8px 16px', borderRadius:12, fontSize:'0.82rem', fontWeight:800, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ShieldCheck size={16}/> {submittedCount} Verification Pending
                        </div>
                    )}
                    <div className="glass-panel" style={{ display:'flex', borderRadius:12, overflow:'hidden', border: '1px solid rgba(255,255,255,0.08)', padding: 2 }}>
                        <button onClick={() => setViewMode('kanban')} style={{ width: 44, height: 38, border:'none', cursor:'pointer', borderRadius: 10, background:viewMode==='kanban'?'var(--primary)':'transparent', color:viewMode==='kanban'?'#000':'#94a3b8', transition: 'all 0.3s' }}><LayoutGrid size={18}/></button>
                        <button onClick={() => setViewMode('list')} style={{ width: 44, height: 38, border:'none', cursor:'pointer', borderRadius: 10, background:viewMode==='list'?'var(--primary)':'transparent', color:viewMode==='list'?'#000':'#94a3b8', transition: 'all 0.3s' }}><List size={18}/></button>
                    </div>
                    {role === 'ADMIN' && (
                        <button className="btn-primary" style={{ padding: '0 20px', height: 44, borderRadius: 14 }} onClick={() => setShowForm(!showForm)}>
                            <Plus size={18}/> Establish Mission
                        </button>
                    )}
                </div>
            </div>

            {showForm && role === 'ADMIN' && (
                <div className="glass-panel" style={{ marginBottom:32, padding:32, borderRadius:24, border: '1px solid var(--panel-border)' }}>
                    <h3 style={{ marginBottom:24, fontSize:'1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Sparkles size={18} color="var(--primary)"/> Configure New Directive
                    </h3>
                    <form onSubmit={createTask}>
                        <div style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1fr 1fr', gap:16, marginBottom:16 }}>
                            <div>
                                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:800, color:'#94a3b8', marginBottom:10, textTransform:'uppercase' }}>Mission Name</label>
                                <input placeholder="e.g. Integrate Payment API" value={newTask.name} onChange={e => handleTaskNameChange(e.target.value)} required style={{ marginBottom:0, width: '100%', boxSizing: 'border-box' }}/>
                            </div>
                            <div>
                                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:800, color:'#94a3b8', marginBottom:10, textTransform:'uppercase' }}>Target Sector</label>
                                <input placeholder="e.g. Backend" value={newTask.requiredSkill} onChange={e => setNewTask({...newTask, requiredSkill:e.target.value})} required style={{ marginBottom:0, width: '100%', boxSizing: 'border-box' }}/>
                            </div>
                            <div>
                                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:800, color:'#94a3b8', marginBottom:10, textTransform:'uppercase' }}>Priority Level</label>
                                <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority:+e.target.value})} style={{ marginBottom:0, width: '100%' }}>
                                    <option value={1}>Low Priority</option>
                                    <option value={2}>High Priority</option>
                                    <option value={3}>Critical Core</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:800, color:'#94a3b8', marginBottom:10, textTransform:'uppercase' }}>Deadline</label>
                                <input type="date" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline:e.target.value})} required style={{ marginBottom:0, width: '100%', boxSizing: 'border-box' }}/>
                            </div>
                        </div>
                        
                        <div style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1fr', gap:16, marginBottom:24 }}>
                            <div>
                                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:800, color:'#94a3b8', marginBottom:10, textTransform:'uppercase' }}>Directive Summary</label>
                                <input placeholder="Detailed scope of requirements..." value={newTask.description} onChange={e => setNewTask({...newTask, description:e.target.value})} style={{ marginBottom:0, width: '100%', boxSizing: 'border-box' }}/>
                            </div>
                            <div>
                                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:800, color:'#94a3b8', marginBottom:10, textTransform:'uppercase' }}>Allocation Mode</label>
                                <select value={newTask.assignMode} onChange={e => setNewTask({...newTask, assignMode:e.target.value})} style={{ marginBottom:0, width: '100%' }}>
                                    <option value="AI">Auto-Allocate (AI Intelligence)</option>
                                    <option value="MANUAL">Manual Designation</option>
                                </select>
                            </div>
                            {newTask.assignMode === 'MANUAL' && (
                                <div>
                                    <label style={{ display:'block', fontSize:'0.75rem', fontWeight:800, color:'#94a3b8', marginBottom:10, textTransform:'uppercase' }}>Assign To</label>
                                    <select value={newTask.manualEmployeeId} onChange={e => setNewTask({...newTask, manualEmployeeId:e.target.value})} required style={{ marginBottom:0, width: '100%' }}>
                                        <option value="">Choose Personnel...</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.department})</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div style={{ display:'flex', gap:12 }}>
                            <button type="submit" className="btn-primary glow-button" style={{ padding: '0 28px', height: 48, minWidth: 200, borderRadius: 14 }} disabled={creating}>
                                {creating ? 'Initializing...' : <><Zap size={18}/> {newTask.assignMode==='AI' ? 'Initialize AI Mission' : 'Deploy Mission'}</>}
                            </button>
                            <button type="button" className="btn-outline" style={{ height: 48, padding: '0 24px', borderRadius: 14 }} onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign:'center', color:'#94a3b8', padding:64 }}>Connecting to Grid…</div>
            ) : viewMode === 'kanban' ? (
                <div style={{ display:'flex', gap:16, overflowX:'auto', paddingBottom:24 }}>
                    {KANBAN_COLS.map(status => (
                        <KanbanColumn key={status} status={status} tasks={grouped[status]} role={role}
                            onStart={id => api.post(`/api/tasks/${id}/start`).then(fetchTasks).catch(console.error)}
                            onSubmit={id => fetchTasks()}
                            onVerify={id => api.post(`/api/tasks/${id}/verify`).then(fetchTasks).catch(console.error)}
                            onReject={id => api.post(`/api/tasks/${id}/reject-submission`).then(fetchTasks).catch(console.error)}
                            onSuggest={fetchSuggestions}
                            onAssignManual={fetchSuggestions}
                            onDownloadFile={downloadFile} />
                    ))}
                </div>
            ) : (
                <div className="task-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 20 }}>
                    {filteredTasks.map(task => {
                        const cfg = statusColors[task.status] || statusColors.PENDING;
                        return (
                            <div className="glass-panel" key={task.id} style={{ display: 'flex', gap: 16, padding: 24, borderRadius: 24, border: `1px solid ${cfg.border}11`, background: `${cfg.bg}` }}>
                                <div style={{ width:44, height:44, borderRadius:12, background:cfg.bg, color:cfg.text, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border: `1px solid ${cfg.border}33` }}>
                                    {cfg.icon}
                                </div>
                                <div style={{ flex:1 }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom: 6 }}>
                                        <span style={{ fontWeight:800, fontSize:'1.05rem', color:'#ffffff' }}>{task.name}</span>
                                        {priorityBadge(task.priority)}
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 12 }}>{task.description}</div>
                                    <div className="task-meta" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                                        {task.deadline && <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem' }}>DUE {task.deadline}</span>}
                                        {task.assignedEmployeeName && <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.75rem' }}>// {task.assignedEmployeeName.toUpperCase()}</span>}
                                        {task.requiredSkill && <span className="task-tag" style={{ background: 'rgba(255,255,255,0.02)', color: '#94a3b8', padding: '2px 8px', borderRadius: 6 }}>{task.requiredSkill}</span>}
                                    </div>
                                </div>
                                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                                    {role === 'EMPLOYEE' && task.status === 'ASSIGNED' && (
                                        <button className="btn-primary" style={{ width:'100%', height:36, borderRadius:12, fontWeight: 700 }} onClick={() => api.post(`/api/tasks/${task.id}/start`).then(fetchTasks).catch(console.error)}>
                                            <PlayCircle size={14}/> Start Task
                                        </button>
                                    )}
                                    {role === 'EMPLOYEE' && (task.status==='IN_PROGRESS' || task.status==='REASSIGNED') && (
                                        <FileUploadSubmit taskId={task.id} onSubmit={fetchTasks} />
                                    )}
                                    {role === 'ADMIN' && task.status==='SUBMITTED' && (
                                        <>
                                            <button className="btn-success" style={{ height: 38, padding: '0 16px', borderRadius: 10 }} onClick={() => api.post(`/api/tasks/${task.id}/verify`).then(fetchTasks).catch(console.error)}>
                                                Verify
                                            </button>
                                            <button className="btn-outline" style={{ color:'#ef4444', borderColor:'#ef444433', height: 38, borderRadius: 10 }} onClick={() => api.post(`/api/tasks/${task.id}/reject-submission`).then(fetchTasks).catch(console.error)}>
                                                Reject
                                            </button>
                                            {getSubmissionFile(task) && (
                                                <>
                                                    <button className="btn-outline" style={{ height: 34, borderRadius: 10, fontSize: '0.75rem' }} onClick={() => downloadFile(task.id)}>
                                                        Download
                                                    </button>
                                                    <a href={getSubmissionUrl(task)} target="_blank" rel="noreferrer" className="btn-outline" style={{ height: 34, borderRadius: 10, fontSize: '0.75rem', display:'inline-flex', alignItems:'center', justifyContent:'center', textDecoration:'none' }}>
                                                        View
                                                    </a>
                                                </>
                                            )}
                                        </>
                                    )}
                                    {role === 'ADMIN' && task.status === 'PENDING' && (
                                        <div style={{ display:'flex', flexDirection: 'column', gap: 6 }}>
                                            <button className="btn-primary" style={{ height: 34, borderRadius: 10, fontSize: '0.72rem' }} onClick={() => fetchSuggestions(task.id)}>AI Assign</button>
                                            <button className="btn-outline" style={{ height: 34, borderRadius: 10, fontSize: '0.72rem', color: '#94a3b8' }} onClick={() => fetchSuggestions(task.id)}>Manual</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* AI SUGGESTIONS & MANUAL ASSIGN MODAL */}
            {showSuggestions && (
                <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.85)', backdropFilter:'blur(16px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
                    <div className="glass-panel" style={{ width:680, padding:40, borderRadius:32, border:'1px solid var(--panel-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', maxHeight:'85vh', overflowY:'auto' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32 }}>
                            <div>
                                <h2 style={{ fontSize:'1.5rem', fontWeight:900, color:'#fff', marginBottom:8, display:'flex', alignItems:'center', gap:14 }}>
                                    <Users size={24} color="var(--primary)"/> Grid Personnel Allocation
                                </h2>
                                <p style={{ fontSize:'0.9rem', color:'#94a3b8' }}>Select a candidate manually or follow AI recommendations</p>
                            </div>
                            <button className="btn-outline" style={{ width:36, height:36, padding:0, borderRadius:12, color:'#fff', borderColor:'rgba(255,255,255,0.1)' }} onClick={() => setShowSuggestions(null)}>✕</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Top AI Recommendations</div>
                            {suggestions.length === 0 ? (
                                <div style={{ textAlign:'center', padding:40, color:'#475569' }}>Connecting to Neural Network...</div>
                            ) : (
                                suggestions.map((sug, i) => (
                                    <div key={sug.id} style={{ display:'flex', alignItems:'center', gap:16, padding:20, borderRadius:20, border:`1px solid rgba(0,210,255,${i===0?'0.2':'0.05'})`, background:i===0?'rgba(0,210,255,0.05)':'rgba(255,255,255,0.02)', transition:'all 0.3s' }}>
                                        <div style={{ width:52, height:52, borderRadius:14, background:i===0?'var(--primary)':'#1e1e2e', color:i===0?'#000':'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:'1.2rem', flexShrink:0 }}>
                                            {sug.name.charAt(0)}
                                        </div>
                                        <div style={{ flex:1 }}>
                                            <div style={{ fontWeight:800, fontSize:'1.05rem', color:'#fff', display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                                                {sug.name}
                                                {i===0 && <span style={{ fontSize:'0.65rem', background:'var(--primary)', color:'#000', padding:'2px 8px', borderRadius:6, fontWeight:900 }}>OPTIMAL</span>}
                                            </div>
                                            <div style={{ fontSize:'0.75rem', color:'#64748b', fontWeight: 600 }}>{sug.department} // {sug.aiScore} Match Score</div>
                                        </div>
                                        <button className="btn-primary" style={{ height:40, padding:'0 20px', fontSize:'0.85rem', fontWeight:800, borderRadius:12 }} onClick={() => applyAssign(showSuggestions, sug)} disabled={reassigning}>
                                            Assign
                                        </button>
                                    </div>
                                ))
                            )}

                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 12 }}>All Personnel (Manual Selection)</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {employees.map(emp => (
                                    <div key={emp.id} className="glass-panel" style={{ padding: 14, borderRadius: 14, display:'flex', alignItems:'center', justifyContent:'space-between', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8' }}>{emp.name}</span>
                                        <button className="btn-outline" style={{ height: 28, padding: '0 10px', fontSize: '0.65rem', borderRadius: 8 }} onClick={() => applyAssign(showSuggestions, emp)} disabled={reassigning}>Select</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button className="btn-outline" style={{ width:'100%', height:48, borderRadius:16, fontWeight:800, color:'#64748b' }} onClick={() => setShowSuggestions(null)}>Cancel Allocation</button>
                    </div>
                </div>
            )}
            
        </div>
    );
    
};

export default TasksPage;
