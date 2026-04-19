import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../api/api';
import axios from 'axios';
import Navbar from '../components/Navbar';
import SOSButton from '../components/SOSButton';

export default function UserProfile() {
    const { user, loginUser, token } = useAuth();
    const [form, setForm] = useState({
        name: '', email: '', contact_no: '', emerg_contact: '', department: ''
    });
    const [passwordForm, setPasswordForm] = useState({
        current_password: '', new_password: '', confirm_password: ''
    });
    const [loading,   setLoading]   = useState(true);
    const [saving,    setSaving]    = useState(false);
    const [msg,       setMsg]       = useState('');
    const [error,     setError]     = useState('');
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        getProfile().then(res => {
            const u = res.data;
            setForm({
                name:          u.name          || '',
                email:         u.email         || '',
                contact_no:    u.contact_no    || '',
                emerg_contact: u.emerg_contact || '',
                department:    u.department    || '',
            });
        }).catch(console.error)
        .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(''); setMsg('');
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/profile`,
                form,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            loginUser({ ...user, ...form }, token);
            setMsg('✅ Profile updated successfully!');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        }
        setSaving(false);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setError('New passwords do not match!'); return;
        }
        setSaving(true); setError('');
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/password`,
                { current_password: passwordForm.current_password, new_password: passwordForm.new_password },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMsg('✅ Password changed successfully!');
            setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password.');
        }
        setSaving(false);
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#fff0f5' }}>
            <Navbar />
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
                <div className="spinner" />
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#fff0f5' }}>
            <Navbar />
            {user?.role === 'user' && <SOSButton />}
            <div className="page-container">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="page-title">My Profile 👤</h1>
                    <p className="page-subtitle">Manage your account details and security settings.</p>
                </motion.div>

                {msg   && <motion.div className="alert alert-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{msg}</motion.div>}
                {error && <motion.div className="alert alert-error"   initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}

                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>

                    {/* Left card */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
                            <motion.div style={{
                                width: 90, height: 90, margin: '0 auto 16px',
                                background: 'linear-gradient(135deg, #ff4d88, #e6005c)',
                                borderRadius: '50%', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '36px', color: 'white', fontWeight: 800,
                                boxShadow: '0 8px 24px rgba(255,77,136,0.35)'
                            }}
                                animate={{ scale: [1, 1.04, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </motion.div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', marginBottom: '4px' }}>{user?.name}</h3>
                            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>{user?.email}</p>
                            <span style={{ background: '#fff0f5', color: '#ff4d88', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, border: '1px solid #ffb3cc' }}>
                                {user?.role?.toUpperCase()}
                            </span>
                            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {[
                                    { id: 'profile',   label: '👤 Edit Profile'   },
                                    { id: 'password',  label: '🔒 Change Password' },
                                    { id: 'emergency', label: '🆘 Emergency Info'  },
                                ].map(tab => (
                                    <motion.button key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); setError(''); setMsg(''); }}
                                        style={{
                                            padding: '10px 14px', borderRadius: '10px', border: 'none',
                                            background: activeTab === tab.id ? 'linear-gradient(135deg, #ff4d88, #e6005c)' : '#fff0f5',
                                            color: activeTab === tab.id ? 'white' : '#6b7280',
                                            fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'Poppins', textAlign: 'left'
                                        }}
                                        whileHover={{ scale: 1.02 }}>
                                        {tab.label}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right form */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        {activeTab === 'profile' && (
                            <div className="card" style={{ padding: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Edit Profile</h3>
                                <form onSubmit={handleSave}>
                                    <div className="input-group">
                                        <label>Full Name</label>
                                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                    </div>
                                    <div className="input-group">
                                        <label>Email Address</label>
                                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                                    </div>
                                    <div className="input-group">
                                        <label>Contact Number</label>
                                        <input type="tel" value={form.contact_no} onChange={e => setForm({ ...form, contact_no: e.target.value })} />
                                    </div>
                                    {user?.role === 'authority' && (
                                        <div className="input-group">
                                            <label>Department</label>
                                            <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                                        </div>
                                    )}
                                    <motion.button type="submit" className="btn-primary" disabled={saving} whileHover={{ scale: 1.02 }}>
                                        {saving ? 'Saving...' : '💾 Save Changes'}
                                    </motion.button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className="card" style={{ padding: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Change Password</h3>
                                <form onSubmit={handlePasswordChange}>
                                    <div className="input-group">
                                        <label>Current Password</label>
                                        <input type="password" value={passwordForm.current_password} onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })} required />
                                    </div>
                                    <div className="input-group">
                                        <label>New Password</label>
                                        <input type="password" value={passwordForm.new_password} onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })} required />
                                    </div>
                                    <div className="input-group">
                                        <label>Confirm New Password</label>
                                        <input type="password" value={passwordForm.confirm_password} onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} required />
                                    </div>
                                    <motion.button type="submit" className="btn-primary" disabled={saving} whileHover={{ scale: 1.02 }}>
                                        {saving ? 'Changing...' : '🔒 Change Password'}
                                    </motion.button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'emergency' && (
                            <div className="card" style={{ padding: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>🆘 Emergency Information</h3>
                                <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '24px' }}>
                                    This contact will be called when you press the SOS button.
                                </p>
                                <form onSubmit={handleSave}>
                                    <div className="input-group">
                                        <label>Emergency Contact Number</label>
                                        <input type="tel" placeholder="e.g. 9876543210"
                                            value={form.emerg_contact}
                                            onChange={e => setForm({ ...form, emerg_contact: e.target.value })} />
                                    </div>
                                    <div style={{ background: '#fff0f0', border: '1px solid #ffb3b3', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#c62828', marginBottom: '8px' }}>🆘 When you press SOS:</div>
                                        {[
                                            '📍 Share your live GPS location',
                                            '🚨 File an emergency incident report',
                                            '📢 Alert nearby community members',
                                            `📞 Call: ${form.emerg_contact || 'your emergency contact'}`,
                                        ].map((item, i) => (
                                            <div key={i} style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{item}</div>
                                        ))}
                                    </div>
                                    <motion.button type="submit" className="btn-primary"
                                        style={{ background: 'linear-gradient(135deg, #ff1744, #c62828)' }}
                                        disabled={saving} whileHover={{ scale: 1.02 }}>
                                        {saving ? 'Saving...' : '💾 Save Emergency Contact'}
                                    </motion.button>
                                </form>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}