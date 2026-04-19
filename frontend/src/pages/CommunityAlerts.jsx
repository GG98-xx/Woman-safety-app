import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAlerts, createAlert, helpAlert, resolveAlert } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function CommunityAlerts() {
    const [alerts,   setAlerts]   = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [sending,  setSending]  = useState(false);
    const [msg,      setMsg]      = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form,     setForm]     = useState({ message: '', city: '' });
    const [locating, setLocating] = useState(false);
    const [coords,   setCoords]   = useState({ latitude: null, longitude: null });
    const { user } = useAuth();

    const load = async () => {
        try {
            const res = await getAlerts();
            setAlerts(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const getLocation = () => {
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                setLocating(false);
                setMsg('📍 Location captured!');
                setTimeout(() => setMsg(''), 2000);
            },
            () => { setLocating(false); setMsg('Could not get location.'); }
        );
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await createAlert({ ...form, ...coords });
            setMsg('🚨 Community alert sent!');
            setShowForm(false);
            setForm({ message: '', city: '' });
            load();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) { setMsg('Failed to send alert.'); }
        setSending(false);
    };

    const handleHelp = async (id) => {
        try {
            await helpAlert(id);
            load();
        } catch (err) { console.error(err); }
    };

    const handleResolve = async (id) => {
        try {
            await resolveAlert(id);
            load();
        } catch (err) { console.error(err); }
    };

    const timeAgo = (date) => {
        const diff = Math.floor((Date.now() - new Date(date)) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
        return `${Math.floor(diff/3600)}h ago`;
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fff0f5' }}>
            <Navbar />
            <div className="page-container">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="page-title">Community Alerts 📢</h1>
                    <p className="page-subtitle">Send and view safety alerts from your community.</p>
                </motion.div>

                {msg && <div className="alert alert-success">{msg}</div>}

                {/* Send Alert Button */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    style={{ marginBottom: '24px' }}>
                    <button className="btn-primary"
                        style={{ background: 'linear-gradient(135deg, #ff6b35, #e6005c)', fontSize: '15px', padding: '14px 28px' }}
                        onClick={() => setShowForm(!showForm)}>
                        📢 Send Community Alert
                    </button>
                </motion.div>

                {/* Alert Form */}
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card"
                        style={{ marginBottom: '24px', padding: '28px', borderLeft: '4px solid #ff4d88' }}
                    >
                        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 700 }}>
                            🚨 Send Alert to Community
                        </h3>
                        <form onSubmit={handleSend}>
                            <div className="input-group">
                                <label>What's happening? (be brief)</label>
                                <textarea
                                    placeholder="e.g. Being followed by a man near the bus stop..."
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                    style={{ minHeight: '80px' }}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Your City</label>
                                <input type="text" placeholder="e.g. Mumbai"
                                    value={form.city}
                                    onChange={e => setForm({ ...form, city: e.target.value })}
                                    required />
                            </div>

                            {/* Location */}
                            <div style={{ marginBottom: '16px' }}>
                                <button type="button" className="btn-secondary"
                                    onClick={getLocation} disabled={locating}
                                    style={{ fontSize: '13px', padding: '8px 18px' }}>
                                    {locating ? '📍 Getting location...' : coords.latitude ? '✅ Location captured' : '📍 Capture my location'}
                                </button>
                                {coords.latitude && (
                                    <span style={{ marginLeft: '10px', fontSize: '12px', color: '#9ca3af' }}>
                                        {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" className="btn-primary"
                                    style={{ background: 'linear-gradient(135deg, #ff6b35, #e6005c)' }}
                                    disabled={sending}>
                                    {sending ? 'Sending...' : '🚨 Send Alert Now'}
                                </button>
                                <button type="button" className="btn-secondary"
                                    onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Alerts Feed */}
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
                    Active Alerts Near You
                </h2>

                {loading ? (
                    <div className="loading-container"><div className="spinner" /></div>
                ) : alerts.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                        <p style={{ color: '#9ca3af' }}>No active alerts right now. Stay safe!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {alerts.map((alert, i) => (
                            <motion.div
                                key={alert.id}
                                className="card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}
                                style={{
                                    padding: '20px 24px',
                                    borderLeft: '4px solid #ff4d88',
                                    background: alert.user_id === user?.id ? '#fff5f8' : 'white'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <div style={{
                                                width: 32, height: 32,
                                                background: 'linear-gradient(135deg, #ff4d88, #e6005c)',
                                                borderRadius: '50%', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontSize: '12px', fontWeight: 700
                                            }}>
                                                {alert.sent_by?.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600, fontSize: '13px' }}>{alert.sent_by}</span>
                                            {alert.city && (
                                                <span style={{
                                                    background: '#ffe0ec', color: '#e6005c',
                                                    padding: '2px 10px', borderRadius: '12px',
                                                    fontSize: '11px', fontWeight: 600
                                                }}>📍 {alert.city}</span>
                                            )}
                                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                                {timeAgo(alert.created_at)}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, marginBottom: '12px' }}>
                                            🚨 {alert.message}
                                        </p>
                                        {alert.latitude && (
                                            <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                                                📍 Location: {parseFloat(alert.latitude).toFixed(4)}, {parseFloat(alert.longitude).toFixed(4)}
                                            </p>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                        <div style={{
                                            background: '#fff0f5', color: '#ff4d88',
                                            padding: '4px 12px', borderRadius: '20px',
                                            fontSize: '12px', fontWeight: 600
                                        }}>
                                            🤝 {alert.helpers} helping
                                        </div>
                                        {alert.user_id !== user?.id && (
                                            <button className="btn-primary"
                                                style={{ padding: '8px 16px', fontSize: '12px' }}
                                                onClick={() => handleHelp(alert.id)}>
                                                🤝 I can help!
                                            </button>
                                        )}
                                        {alert.user_id === user?.id && (
                                            <button className="btn-secondary"
                                                style={{ padding: '8px 16px', fontSize: '12px' }}
                                                onClick={() => handleResolve(alert.id)}>
                                                ✅ I'm Safe Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}