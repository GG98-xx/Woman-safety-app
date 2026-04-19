import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMyIncidents } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SOSButton from '../components/SOSButton';

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

export default function UserDashboard() {
    const [incidents, setIncidents] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        getMyIncidents()
            .then(res => setIncidents(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const stats = {
        total:    incidents.length,
        pending:  incidents.filter(i => i.status === 'Pending').length,
        review:   incidents.filter(i => i.status === 'Under Review').length,
        resolved: incidents.filter(i => ['Resolved', 'Completed'].includes(i.status)).length,
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fff0f5' }}>
            <Navbar />

            {/* SOS Floating Button */}
            <SOSButton />

            <div className="page-container">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                    <p className="page-subtitle">Here's an overview of your reported incidents.</p>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
                    <Link to="/report">
                        <motion.button className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
                            whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                            🚨 Report Incident
                        </motion.button>
                    </Link>
                    <Link to="/community">
                        <motion.button className="btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #ff6b35, #e6005c)', color: 'white', border: 'none' }}
                            whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                            📢 Community Alert
                        </motion.button>
                    </Link>
                    <motion.a href="tel:112"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '12px 24px', borderRadius: '14px',
                            background: 'linear-gradient(135deg, #ff1744, #c62828)',
                            color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '14px',
                            fontFamily: 'Poppins', boxShadow: '0 4px 14px rgba(255,23,68,0.3)'
                        }}
                        whileHover={{ scale: 1.04, y: -2 }}>
                        📞 Call 112
                    </motion.a>
                </motion.div>

                {/* Stats */}
                <div className="stats-grid">
                    {[
                        { label: 'Total Reports',  value: stats.total,    emoji: '📋' },
                        { label: 'Pending',        value: stats.pending,  emoji: '⏳' },
                        { label: 'Under Review',   value: stats.review,   emoji: '🔍' },
                        { label: 'Resolved',       value: stats.resolved, emoji: '✅' },
                    ].map((s, i) => (
                        <motion.div key={i} className="stat-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            whileHover={{ y: -4 }}>
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.emoji}</div>
                            <div className="stat-number">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Emergency contacts reminder */}
                {!user?.emerg_contact && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                        style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '14px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>⚠️</span>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '13px', color: '#856404' }}>Add Emergency Contact</div>
                            <div style={{ fontSize: '12px', color: '#856404' }}>For SOS to work properly, add an emergency contact to your profile.</div>
                        </div>
                    </motion.div>
                )}

                {/* Incidents */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#1f2937' }}>
                        My Incidents
                    </h2>

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                            <div className="spinner" />
                        </div>
                    ) : incidents.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                            <p style={{ color: '#9ca3af', fontSize: '15px' }}>No incidents reported yet.</p>
                            <Link to="/report">
                                <button className="btn-primary" style={{ marginTop: '16px' }}>
                                    Report your first incident
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Type</th>
                                        <th>Description</th>
                                        <th>Location</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incidents.map((inc, i) => (
                                        <motion.tr key={inc.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}>
                                            <td style={{ fontWeight: 700, color: '#ff4d88' }}>#{inc.id}</td>
                                            <td style={{ fontWeight: 600 }}>{inc.type}</td>
                                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {inc.description}
                                            </td>
                                            <td>{inc.city}{inc.area ? `, ${inc.area}` : ''}</td>
                                            <td>{new Date(inc.date_time).toLocaleDateString()}</td>
                                            <td><StatusBadge status={inc.status} /></td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* SOS hint */}
            <div style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: '#9ca3af' }}>
                🆘 Press the red SOS button (bottom right) for emergency assistance
            </div>
        </div>
    );
}