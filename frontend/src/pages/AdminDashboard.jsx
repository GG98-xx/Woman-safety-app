import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getDashboardStats, getAllIncidents, getAllAuthorities, assignIncident, updateIncidentStatus, getAlerts } from '../api/api';
import Navbar from '../components/Navbar';

const StatusBadge = ({ status }) => {
    const map = {
        'Pending':      { bg: '#fff3cd', color: '#856404' },
        'Under Review': { bg: '#cce5ff', color: '#004085' },
        'Resolved':     { bg: '#d4edda', color: '#155724' },
        'Completed':    { bg: '#d1ecf1', color: '#0c5460' },
    };
    const s = map[status] || map['Pending'];
    return <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{status}</span>;
};

const PriorityBadge = ({ priority }) => {
    const map = {
        Low:      { bg: '#d4edda', color: '#155724' },
        Medium:   { bg: '#fff3cd', color: '#856404' },
        High:     { bg: '#ffe5d0', color: '#7d3c00' },
        Critical: { bg: '#f8d7da', color: '#721c24' },
    };
    const p = map[priority] || map.Medium;
    return <span style={{ background: p.bg, color: p.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>{priority}</span>;
};

const COLORS = ['#ff4d88', '#ff80aa', '#ffb3cc', '#e6005c', '#ff1a66', '#ff6699'];

export default function AdminDashboard() {
    const [stats,       setStats]       = useState({});
    const [incidents,   setIncidents]   = useState([]);
    const [filtered,    setFiltered]    = useState([]);
    const [authorities, setAuthorities] = useState([]);
    const [alerts,      setAlerts]      = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [selected,    setSelected]    = useState(null);
    const [detailInc,   setDetailInc]   = useState(null);
    const [assignForm,  setAssignForm]  = useState({ authority_id: '', priority: 'Medium' });
    const [msg,         setMsg]         = useState('');
    const [search,      setSearch]      = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType,   setFilterType]   = useState('All');
    const [activeTab,    setActiveTab]    = useState('incidents');

    const loadData = async () => {
        try {
            const [s, i, a, al] = await Promise.all([
                getDashboardStats(), getAllIncidents(), getAllAuthorities(), getAlerts()
            ]);
            setStats(s.data);
            setIncidents(i.data);
            setFiltered(i.data);
            setAuthorities(a.data);
            setAlerts(al.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    // Filter logic
    useEffect(() => {
        let result = [...incidents];
        if (search) result = result.filter(i =>
            i.reported_by?.toLowerCase().includes(search.toLowerCase()) ||
            i.type?.toLowerCase().includes(search.toLowerCase()) ||
            i.city?.toLowerCase().includes(search.toLowerCase())
        );
        if (filterStatus !== 'All') result = result.filter(i => i.status === filterStatus);
        if (filterType   !== 'All') result = result.filter(i => i.type   === filterType);
        setFiltered(result);
    }, [search, filterStatus, filterType, incidents]);

    // Chart data
    const typeData = [...new Set(incidents.map(i => i.type))].map(type => ({
        name: type, value: incidents.filter(i => i.type === type).length
    }));
    const cityData = [...new Set(incidents.map(i => i.city).filter(Boolean))].map(city => ({
        name: city, incidents: incidents.filter(i => i.city === city).length
    }));
    const statusData = ['Pending', 'Under Review', 'Resolved', 'Completed'].map(s => ({
        name: s, value: incidents.filter(i => i.status === s).length
    }));

    const handleAssign = async (incidentId) => {
        try {
            await assignIncident(incidentId, assignForm);
            setMsg('✅ Incident assigned successfully!');
            setSelected(null);
            loadData();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) { setMsg('❌ Failed to assign.'); }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await updateIncidentStatus(id, { status });
            loadData();
        } catch (err) { console.error(err); }
    };

    const incidentTypes = [...new Set(incidents.map(i => i.type))];

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#fff0f5' }}>
            <Navbar />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="spinner" />
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#fff0f5' }}>
            <Navbar />
            <div className="page-container">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="page-title">Admin Dashboard 🛡️</h1>
                    <p className="page-subtitle">Manage all incidents, alerts and assignments.</p>
                </motion.div>

                {msg && (
                    <motion.div className="alert alert-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {msg}
                    </motion.div>
                )}

                {/* Stats */}
                <div className="stats-grid">
                    {[
                        { label: 'Total Incidents', value: stats.total,    emoji: '📋' },
                        { label: 'Pending',          value: stats.pending,  emoji: '⏳' },
                        { label: 'Resolved',         value: stats.resolved, emoji: '✅' },
                        { label: 'Total Users',      value: stats.users,    emoji: '👥' },
                        { label: 'Active Alerts',    value: alerts.length,  emoji: '📢' },
                    ].map((s, i) => (
                        <motion.div key={i} className="stat-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -4 }}>
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.emoji}</div>
                            <div className="stat-number">{s.value ?? 0}</div>
                            <div className="stat-label">{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Charts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                    {/* Incidents by Type */}
                    <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: '#1f2937' }}>
                            📊 Incidents by Type
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                                    dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                                    labelLine={false}>
                                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Incidents by City */}
                    <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: '#1f2937' }}>
                            🏙️ Incidents by City
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={cityData}>
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="incidents" fill="#ff4d88" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'white', padding: '6px', borderRadius: '14px', boxShadow: '0 2px 8px rgba(255,77,136,0.08)', width: 'fit-content' }}>
                    {[
                        { id: 'incidents', label: '📋 Incidents' },
                        { id: 'alerts',    label: '📢 Community Alerts' },
                    ].map(tab => (
                        <motion.button key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 24px', borderRadius: '10px', border: 'none',
                                background: activeTab === tab.id ? 'linear-gradient(135deg, #ff4d88, #e6005c)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#6b7280',
                                fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                                fontFamily: 'Poppins, sans-serif'
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}>
                            {tab.label}
                        </motion.button>
                    ))}
                </div>

                {/* Incidents Tab */}
                {activeTab === 'incidents' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Search + Filters */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <input
                                placeholder="🔍 Search by name, type, city..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{
                                    flex: 1, minWidth: '200px', padding: '10px 16px',
                                    border: '2px solid #ffe0ec', borderRadius: '12px',
                                    fontFamily: 'Poppins', fontSize: '13px', outline: 'none'
                                }}
                            />
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                                style={{ padding: '10px 14px', border: '2px solid #ffe0ec', borderRadius: '12px', fontFamily: 'Poppins', fontSize: '13px', outline: 'none' }}>
                                <option value="All">All Status</option>
                                {['Pending', 'Under Review', 'Resolved', 'Completed'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <select value={filterType} onChange={e => setFilterType(e.target.value)}
                                style={{ padding: '10px 14px', border: '2px solid #ffe0ec', borderRadius: '12px', fontFamily: 'Poppins', fontSize: '13px', outline: 'none' }}>
                                <option value="All">All Types</option>
                                {incidentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <div style={{ padding: '10px 14px', background: '#fff0f5', borderRadius: '12px', fontSize: '13px', color: '#ff4d88', fontWeight: 600 }}>
                                {filtered.length} results
                            </div>
                        </div>

                        {/* Table */}
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Reported By</th>
                                        <th>Type</th>
                                        <th>Location</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((inc, i) => (
                                        <motion.tr key={inc.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            style={{ cursor: 'pointer' }}>
                                            <td style={{ fontWeight: 700, color: '#ff4d88' }}>#{inc.id}</td>
                                            <td style={{ fontWeight: 600 }}>{inc.reported_by}</td>
                                            <td>{inc.type}</td>
                                            <td>{inc.city}</td>
                                            <td>{new Date(inc.date_time).toLocaleDateString()}</td>
                                            <td><StatusBadge status={inc.status} /></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    <motion.button
                                                        className="btn-secondary"
                                                        style={{ padding: '5px 12px', fontSize: '11px' }}
                                                        onClick={() => setDetailInc(inc)}
                                                        whileHover={{ scale: 1.05 }}>
                                                        👁️ View
                                                    </motion.button>
                                                    <motion.button
                                                        className="btn-primary"
                                                        style={{ padding: '5px 12px', fontSize: '11px' }}
                                                        onClick={() => { setSelected(inc.id); setAssignForm({ authority_id: '', priority: 'Medium' }); }}
                                                        whileHover={{ scale: 1.05 }}>
                                                        Assign
                                                    </motion.button>
                                                    <select value={inc.status}
                                                        onChange={e => handleStatusChange(inc.id, e.target.value)}
                                                        style={{ padding: '5px 8px', borderRadius: '8px', border: '2px solid #ffe0ec', fontSize: '11px', fontFamily: 'Poppins', cursor: 'pointer' }}>
                                                        {['Pending', 'Under Review', 'Resolved', 'Completed'].map(s => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* Alerts Tab */}
                {activeTab === 'alerts' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {alerts.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                                <p style={{ color: '#9ca3af' }}>No active community alerts.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {alerts.map((alert, i) => (
                                    <motion.div key={alert.id} className="card"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        style={{ padding: '20px 24px', borderLeft: '4px solid #ff4d88' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '14px' }}>{alert.sent_by}</span>
                                                    {alert.city && (
                                                        <span style={{ background: '#ffe0ec', color: '#e6005c', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                                                            📍 {alert.city}
                                                        </span>
                                                    )}
                                                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                                        {new Date(alert.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '13px', color: '#374151' }}>🚨 {alert.message}</p>
                                                {alert.latitude && (
                                                    <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                                                        📍 {parseFloat(alert.latitude).toFixed(4)}, {parseFloat(alert.longitude).toFixed(4)}
                                                    </p>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                                <span style={{ background: alert.status === 'Active' ? '#d4edda' : '#e2e8f0', color: alert.status === 'Active' ? '#155724' : '#64748b', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                                                    {alert.status}
                                                </span>
                                                <span style={{ fontSize: '12px', color: '#ff4d88', fontWeight: 600 }}>
                                                    🤝 {alert.helpers} helping
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Assign Modal */}
            <AnimatePresence>
                {selected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="card" style={{ width: '420px', padding: '32px' }}>
                            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 700 }}>
                                Assign Incident #{selected}
                            </h3>
                            <div className="input-group">
                                <label>Select Authority</label>
                                <select value={assignForm.authority_id}
                                    onChange={e => setAssignForm({ ...assignForm, authority_id: e.target.value })}>
                                    <option value="">Choose authority...</option>
                                    {authorities.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} — {a.department || 'Authority'}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Priority Level</label>
                                <select value={assignForm.priority}
                                    onChange={e => setAssignForm({ ...assignForm, priority: e.target.value })}>
                                    {['Low', 'Medium', 'High', 'Critical'].map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <motion.button className="btn-primary" style={{ flex: 1 }}
                                    onClick={() => handleAssign(selected)}
                                    whileHover={{ scale: 1.02 }}>
                                    ✅ Assign
                                </motion.button>
                                <motion.button className="btn-secondary"
                                    onClick={() => setSelected(null)}
                                    whileHover={{ scale: 1.02 }}>
                                    Cancel
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Incident Detail Modal */}
            <AnimatePresence>
                {detailInc && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px', overflowY: 'auto' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="card" style={{ width: '100%', maxWidth: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Incident #{detailInc.id} Details</h3>
                                <button onClick={() => setDetailInc(null)}
                                    style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                {[
                                    { label: 'Reported By', value: detailInc.reported_by },
                                    { label: 'Type',        value: detailInc.type },
                                    { label: 'Status',      value: <StatusBadge status={detailInc.status} /> },
                                    { label: 'Location',    value: `${detailInc.city || ''}${detailInc.area ? ', ' + detailInc.area : ''}` },
                                    { label: 'Date',        value: new Date(detailInc.date_time).toLocaleString() },
                                    { label: 'Report Type', value: detailInc.report_type || 'Authorities' },
                                ].map((item, i) => (
                                    <div key={i} style={{ background: '#fff0f5', padding: '12px 16px', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            {detailInc.description && (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ff4d88', marginBottom: '8px', letterSpacing: '0.5px' }}>DESCRIPTION</div>
                                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, background: '#f9fafb', padding: '14px', borderRadius: '12px' }}>{detailInc.description}</p>
                                </div>
                            )}

                            {(detailInc.criminal_age || detailInc.criminal_height || detailInc.criminal_appearance) && (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ff4d88', marginBottom: '8px', letterSpacing: '0.5px' }}>👤 CRIMINAL DESCRIPTION</div>
                                    <div style={{ background: '#fff3f3', padding: '14px', borderRadius: '12px', border: '1px solid #ffb3b3' }}>
                                        {detailInc.criminal_age        && <p style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Age:</strong> {detailInc.criminal_age}</p>}
                                        {detailInc.criminal_height     && <p style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Height:</strong> {detailInc.criminal_height}</p>}
                                        {detailInc.criminal_appearance && <p style={{ fontSize: '13px' }}><strong>Appearance:</strong> {detailInc.criminal_appearance}</p>}
                                    </div>
                                </div>
                            )}

                            {detailInc.criminal_photo && (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ff4d88', marginBottom: '8px', letterSpacing: '0.5px' }}>📸 CRIMINAL PHOTO</div>
                                    <img src={detailInc.criminal_photo} alt="Criminal" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px' }} />
                                </div>
                            )}

                            {detailInc.latitude && (
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ff4d88', marginBottom: '8px', letterSpacing: '0.5px' }}>📍 LOCATION</div>
                                    <div style={{ background: '#f0fff4', padding: '12px', borderRadius: '12px', fontSize: '13px' }}>
                                        {parseFloat(detailInc.latitude).toFixed(6)}, {parseFloat(detailInc.longitude).toFixed(6)}
                                        <a href={`https://www.google.com/maps?q=${detailInc.latitude},${detailInc.longitude}`}
                                            target="_blank" rel="noreferrer"
                                            style={{ marginLeft: '12px', color: '#ff4d88', fontWeight: 600, fontSize: '12px' }}>
                                            Open in Maps →
                                        </a>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <motion.button className="btn-primary" style={{ flex: 1 }}
                                    onClick={() => { setDetailInc(null); setSelected(detailInc.id); }}
                                    whileHover={{ scale: 1.02 }}>
                                    Assign to Authority
                                </motion.button>
                                <motion.button className="btn-secondary"
                                    onClick={() => setDetailInc(null)}
                                    whileHover={{ scale: 1.02 }}>
                                    Close
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}