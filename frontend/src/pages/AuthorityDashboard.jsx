import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssignedIncidents, resolveIncident } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const PriorityBadge = ({ priority }) => {
    const colors = {
        Low:      { bg: '#d4edda', color: '#155724' },
        Medium:   { bg: '#fff3cd', color: '#856404' },
        High:     { bg: '#ffe5d0', color: '#7d3c00' },
        Critical: { bg: '#f8d7da', color: '#721c24' },
    };
    const c = colors[priority] || colors.Medium;
    return <span style={{ background: c.bg, color: c.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>{priority}</span>;
};

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

export default function AuthorityDashboard() {
    const [incidents, setIncidents] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [msg,       setMsg]       = useState('');
    const [selected,  setSelected]  = useState(null);
    const [note,      setNote]      = useState('');
    const [filter,    setFilter]    = useState('All');
    const { user } = useAuth();

    const load = async () => {
        try {
            const res = await getAssignedIncidents();
            setIncidents(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleResolve = async (id, status) => {
        try {
            await resolveIncident(id, { status, notes: note });
            setMsg(`✅ Case #${id} marked as ${status}!`);
            setSelected(null);
            setNote('');
            load();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) { console.error(err); }
    };

    const filtered = filter === 'All' ? incidents : incidents.filter(i =>
        filter === 'Active' ? !['Resolved', 'Completed'].includes(i.status) :
        ['Resolved', 'Completed'].includes(i.status)
    );

    const stats = {
        total:    incidents.length,
        active:   incidents.filter(i => !['Resolved', 'Completed'].includes(i.status)).length,
        resolved: incidents.filter(i => ['Resolved', 'Completed'].includes(i.status)).length,
        critical: incidents.filter(i => i.priority === 'Critical').length,
    };

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
                    <h1 className="page-title">Authority Panel ⚖️</h1>
                    <p className="page-subtitle">
                        Welcome, {user?.name} — {user?.department || 'Authority'}
                    </p>
                </motion.div>

                {msg && (
                    <motion.div className="alert alert-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {msg}
                    </motion.div>
                )}

                {/* Stats */}
                <div className="stats-grid">
                    {[
                        { label: 'Total Assigned', value: stats.total,    emoji: '📋' },
                        { label: 'Active Cases',   value: stats.active,   emoji: '🔍' },
                        { label: 'Resolved',       value: stats.resolved, emoji: '✅' },
                        { label: '🚨 Critical',    value: stats.critical, emoji: '🚨' },
                    ].map((s, i) => (
                        <motion.div key={i} className="stat-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -4 }}
                            style={{ borderTop: i === 3 && stats.critical > 0 ? '3px solid #ff1744' : 'none' }}>
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.emoji}</div>
                            <div className="stat-number" style={{ color: i === 3 && stats.critical > 0 ? '#ff1744' : undefined }}>
                                {s.value}
                            </div>
                            <div className="stat-label">{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Filter */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'white', padding: '6px', borderRadius: '14px', boxShadow: '0 2px 8px rgba(255,77,136,0.08)', width: 'fit-content' }}>
                    {['All', 'Active', 'Resolved'].map(f => (
                        <motion.button key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '8px 20px', borderRadius: '10px', border: 'none',
                                background: filter === f ? 'linear-gradient(135deg, #ff4d88, #e6005c)' : 'transparent',
                                color: filter === f ? 'white' : '#6b7280',
                                fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                                fontFamily: 'Poppins, sans-serif'
                            }}
                            whileHover={{ scale: 1.02 }}>
                            {f} {f === 'All' ? `(${incidents.length})` : f === 'Active' ? `(${stats.active})` : `(${stats.resolved})`}
                        </motion.button>
                    ))}
                </div>

                {/* Cases */}
                {filtered.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                        <p style={{ color: '#9ca3af' }}>No cases in this category.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filtered.map((inc, i) => (
                            <motion.div key={inc.id} className="card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}
                                style={{
                                    padding: '24px',
                                    borderLeft: `4px solid ${inc.priority === 'Critical' ? '#ff1744' : inc.priority === 'High' ? '#ff6b35' : '#ff4d88'}`,
                                    background: inc.priority === 'Critical' ? '#fff5f5' : 'white'
                                }}>

                                {inc.priority === 'Critical' && (
                                    <motion.div style={{
                                        background: '#ff1744', color: 'white',
                                        padding: '6px 14px', borderRadius: '8px',
                                        fontSize: '12px', fontWeight: 700,
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        marginBottom: '12px'
                                    }}
                                        animate={{ opacity: [1, 0.6, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}>
                                        🚨 CRITICAL — Immediate Action Required
                                    </motion.div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 700, color: '#ff4d88', fontSize: '15px' }}>#{inc.id}</span>
                                            <span style={{ fontWeight: 700, fontSize: '16px' }}>{inc.type}</span>
                                            <PriorityBadge priority={inc.priority} />
                                            <StatusBadge status={inc.status} />
                                        </div>

                                        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '10px', maxWidth: '500px', lineHeight: 1.6 }}>
                                            {inc.description}
                                        </p>

                                        {/* Criminal description */}
                                        {(inc.criminal_age || inc.criminal_height || inc.criminal_appearance) && (
                                            <div style={{ background: '#fff3f3', padding: '10px 14px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #ffb3b3' }}>
                                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff4d88', marginBottom: '6px', letterSpacing: '0.5px' }}>👤 SUSPECT DESCRIPTION</div>
                                                <div style={{ fontSize: '12px', color: '#374151', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                                    {inc.criminal_age        && <span><strong>Age:</strong> {inc.criminal_age}</span>}
                                                    {inc.criminal_height     && <span><strong>Height:</strong> {inc.criminal_height}</span>}
                                                    {inc.criminal_appearance && <span><strong>Appearance:</strong> {inc.criminal_appearance}</span>}
                                                </div>
                                            </div>
                                        )}

                                        {/* Criminal photo */}
                                        {inc.criminal_photo && (
                                            <div style={{ marginBottom: '10px' }}>
                                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff4d88', marginBottom: '6px' }}>📸 SUSPECT PHOTO</div>
                                                <img src={inc.criminal_photo} alt="Suspect"
                                                    style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #ffb3cc' }} />
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#9ca3af', flexWrap: 'wrap' }}>
                                            <span>👤 {inc.reported_by}</span>
                                            <span>📍 {inc.city}{inc.area ? `, ${inc.area}` : ''}</span>
                                            <span>📅 {new Date(inc.date_time).toLocaleDateString()}</span>
                                            <span>🗓️ Assigned: {new Date(inc.assigned_date).toLocaleDateString()}</span>
                                            {inc.latitude && (
                                                <a href={`https://www.google.com/maps?q=${inc.latitude},${inc.longitude}`}
                                                    target="_blank" rel="noreferrer"
                                                    style={{ color: '#ff4d88', fontWeight: 600 }}>
                                                    🗺️ Open in Maps
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {!['Resolved', 'Completed'].includes(inc.status) && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <motion.button className="btn-primary"
                                                style={{ padding: '9px 18px', fontSize: '12px', whiteSpace: 'nowrap' }}
                                                onClick={() => setSelected(inc)}
                                                whileHover={{ scale: 1.05 }}>
                                                📝 Update Case
                                            </motion.button>
                                            <motion.button
                                                style={{
                                                    padding: '9px 18px', fontSize: '12px',
                                                    background: 'linear-gradient(135deg, #00b894, #00796b)',
                                                    color: 'white', border: 'none', borderRadius: '10px',
                                                    cursor: 'pointer', fontWeight: 600, fontFamily: 'Poppins'
                                                }}
                                                onClick={() => handleResolve(inc.id, 'Resolved')}
                                                whileHover={{ scale: 1.05 }}>
                                                ✅ Mark Resolved
                                            </motion.button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Update Case Modal */}
            <AnimatePresence>
                {selected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="card" style={{ width: '440px', padding: '32px' }}>
                            <h3 style={{ marginBottom: '8px', fontSize: '18px', fontWeight: 700 }}>
                                Update Case #{selected?.id}
                            </h3>
                            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
                                {selected?.type} — {selected?.reported_by}
                            </p>
                            <div className="input-group">
                                <label>Add Case Notes</label>
                                <textarea
                                    placeholder="Add investigation notes, findings, or updates..."
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    style={{ minHeight: '100px' }}
                                />
                            </div>
                            <div className="input-group">
                                <label>Update Status</label>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                {['Under Review', 'Resolved', 'Completed'].map(s => (
                                    <motion.button key={s}
                                        className="btn-secondary"
                                        style={{ fontSize: '12px', padding: '8px 16px' }}
                                        onClick={() => handleResolve(selected.id, s)}
                                        whileHover={{ scale: 1.05 }}>
                                        → {s}
                                    </motion.button>
                                ))}
                            </div>
                            <motion.button className="btn-secondary" style={{ width: '100%' }}
                                onClick={() => { setSelected(null); setNote(''); }}
                                whileHover={{ scale: 1.02 }}>
                                Cancel
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}