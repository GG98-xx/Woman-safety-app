import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { register } from '../api/api';

const roles = [
    { value: 'user',      label: '👤 User',      desc: 'Report incidents' },
    { value: 'admin',     label: '🛡️ Admin',     desc: 'Manage reports' },
    { value: 'authority', label: '⚖️ Authority', desc: 'Handle cases' },
];

export default function Register() {
    const [form, setForm] = useState({
        name: '', email: '', password: '', contact_no: '', emerg_contact: '', role: 'user'
    });
    const [error,   setError]   = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register(form);
            setSuccess('Account created! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fff0f5 0%, #ffe0ec 50%, #ffb3cc 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: '460px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{
                        width: 64, height: 64,
                        background: 'linear-gradient(135deg, #ff4d88, #e6005c)',
                        borderRadius: '18px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: '30px', margin: '0 auto 14px',
                        boxShadow: '0 8px 24px rgba(255,77,136,0.35)'
                    }}>🛡️</div>
                    <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1f2937' }}>Create account</h1>
                    <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>Join SafeHer today</p>
                </div>

                <div className="card" style={{ padding: '32px' }}>
                    {error   && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {/* Role selector */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '8px' }}>
                            I am registering as...
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {roles.map(r => (
                                <div key={r.value}
                                    onClick={() => setForm({ ...form, role: r.value })}
                                    style={{
                                        padding: '10px 8px', borderRadius: '12px', cursor: 'pointer',
                                        border: `2px solid ${form.role === r.value ? '#ff4d88' : '#ffe0ec'}`,
                                        background: form.role === r.value ? '#fff0f5' : 'white',
                                        textAlign: 'center', transition: 'all 0.2s'
                                    }}>
                                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>{r.label.split(' ')[0]}</div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: form.role === r.value ? '#ff4d88' : '#6b7280' }}>
                                        {r.label.split(' ').slice(1).join(' ')}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{r.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" placeholder="Anjali Sharma"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="input-group">
                            <label>Email address</label>
                            <input type="email" placeholder="you@example.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input type="password" placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })} required />
                        </div>
                        <div className="input-group">
                            <label>Contact Number</label>
                            <input type="tel" placeholder="9876543210"
                                value={form.contact_no}
                                onChange={e => setForm({ ...form, contact_no: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Emergency Contact</label>
                            <input type="tel" placeholder="9876543210"
                                value={form.emerg_contact}
                                onChange={e => setForm({ ...form, emerg_contact: e.target.value })} />
                        </div>
                        <button type="submit" className="btn-primary"
                            style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#9ca3af' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#ff4d88', fontWeight: 600, textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}