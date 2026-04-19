import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createIncident } from '../api/api';
import Navbar from '../components/Navbar';

const incidentTypes = ['Harassment', 'Assault', 'Stalking', 'Threat', 'Domestic Violence', 'Other'];
const locations = [
    { id: 1, label: 'Mumbai - Mulund' },
    { id: 2, label: 'Delhi - MG Road' },
    { id: 3, label: 'Pune - Shivajinagar' },
    { id: 4, label: 'Bangalore - Koramangala' },
    { id: 5, label: 'Kolkata - Salt Lake' },
];

export default function ReportIncident() {
    const [form, setForm] = useState({
        type: '', description: '', location_id: '', channel_id: '',
        report_type: 'Authorities',
        criminal_age: '', criminal_height: '', criminal_appearance: '',
        latitude: '', longitude: '',
    });
    const [criminalPhoto, setCriminalPhoto] = useState(null);
    const [evidenceFile,  setEvidenceFile]  = useState(null);
    const [error,    setError]    = useState('');
    const [success,  setSuccess]  = useState('');
    const [loading,  setLoading]  = useState(false);
    const [locating, setLocating] = useState(false);
    const navigate = useNavigate();

    const getLocation = () => {
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
                setLocating(false);
            },
            () => { setLocating(false); setError('Could not get location. Please allow location access.'); }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v) data.append(k, v); });
            if (criminalPhoto) data.append('criminal_photo', criminalPhoto);
            if (evidenceFile)  data.append('evidence_file',  evidenceFile);

            await createIncident(data);
            setSuccess('Incident reported successfully! Redirecting...');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to report incident.');
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fff0f5' }}>
            <Navbar />
            <div className="page-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ maxWidth: '680px', margin: '0 auto' }}
                >
                    <h1 className="page-title">🚨 Report an Incident</h1>
                    <p className="page-subtitle">Your report is confidential and will be reviewed immediately.</p>

                    <div className="card" style={{ padding: '32px' }}>
                        {error   && <div className="alert alert-error">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}

                        <form onSubmit={handleSubmit}>

                            {/* Report type */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '8px' }}>
                                    Report to...
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {[
                                        { value: 'Authorities', label: '⚖️ Report to Authorities', desc: 'Police / NGO / Medical' },
                                        { value: 'Community',   label: '👥 Community Alert',       desc: 'Alert nearby people' },
                                    ].map(r => (
                                        <div key={r.value}
                                            onClick={() => setForm({ ...form, report_type: r.value })}
                                            style={{
                                                padding: '14px', borderRadius: '12px', cursor: 'pointer',
                                                border: `2px solid ${form.report_type === r.value ? '#ff4d88' : '#ffe0ec'}`,
                                                background: form.report_type === r.value ? '#fff0f5' : 'white',
                                                transition: 'all 0.2s'
                                            }}>
                                            <div style={{ fontWeight: 700, fontSize: '13px', color: form.report_type === r.value ? '#ff4d88' : '#374151' }}>
                                                {r.label}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>{r.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Incident details */}
                            <div style={{ borderTop: '1px solid #ffe0ec', paddingTop: '20px', marginBottom: '4px' }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#ff4d88', marginBottom: '14px', letterSpacing: '0.5px' }}>
                                    📋 INCIDENT DETAILS
                                </p>
                            </div>

                            <div className="input-group">
                                <label>Incident Type</label>
                                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required>
                                    <option value="">Select type...</option>
                                    {incidentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div className="input-group">
                                <label>Description of what happened</label>
                                <textarea placeholder="Describe what happened in detail..."
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    required />
                            </div>

                            <div className="input-group">
                                <label>Location</label>
                                <select value={form.location_id} onChange={e => setForm({ ...form, location_id: e.target.value })} required>
                                    <option value="">Select location...</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                                </select>
                            </div>

                            {/* Location capture */}
                            <div style={{ marginBottom: '18px' }}>
                                <button type="button" className="btn-secondary"
                                    onClick={getLocation} disabled={locating}
                                    style={{ fontSize: '13px', padding: '9px 18px' }}>
                                    {locating ? '📍 Getting location...' : form.latitude ? '✅ Location captured' : '📍 Capture my live location'}
                                </button>
                                {form.latitude && (
                                    <span style={{ marginLeft: '10px', fontSize: '12px', color: '#9ca3af' }}>
                                        {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}
                                    </span>
                                )}
                            </div>

                            {/* Criminal description */}
                            <div style={{ borderTop: '1px solid #ffe0ec', paddingTop: '20px', marginBottom: '4px' }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#ff4d88', marginBottom: '4px', letterSpacing: '0.5px' }}>
                                    👤 CRIMINAL DESCRIPTION <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '12px' }}>(optional — guesswork is okay)</span>
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Approx. Age</label>
                                    <input type="text" placeholder="e.g. 25-30 years"
                                        value={form.criminal_age}
                                        onChange={e => setForm({ ...form, criminal_age: e.target.value })} />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Approx. Height</label>
                                    <input type="text" placeholder="e.g. 5'8 or medium build"
                                        value={form.criminal_height}
                                        onChange={e => setForm({ ...form, criminal_height: e.target.value })} />
                                </div>
                            </div>

                            <div className="input-group" style={{ marginTop: '14px' }}>
                                <label>Appearance / What they were wearing</label>
                                <textarea placeholder="e.g. Tall man, dark jacket, jeans, had a bike..."
                                    value={form.criminal_appearance}
                                    onChange={e => setForm({ ...form, criminal_appearance: e.target.value })}
                                    style={{ minHeight: '80px' }} />
                            </div>

                            {/* Photo of harasser */}
                            <div className="input-group">
                                <label>📸 Photo of harasser (optional)</label>
                                <input type="file" accept="image/*"
                                    onChange={e => setCriminalPhoto(e.target.files[0])}
                                    style={{ padding: '8px', border: '2px dashed #ffb3cc', borderRadius: '12px', cursor: 'pointer' }} />
                                {criminalPhoto && <span style={{ fontSize: '12px', color: '#9ca3af' }}>✅ {criminalPhoto.name}</span>}
                            </div>

                            {/* Evidence */}
                            <div style={{ borderTop: '1px solid #ffe0ec', paddingTop: '20px', marginBottom: '4px' }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#ff4d88', marginBottom: '4px', letterSpacing: '0.5px' }}>
                                    📎 EVIDENCE <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '12px' }}>(optional)</span>
                                </p>
                            </div>

                            <div className="input-group">
                                <label>Upload evidence (CCTV footage / image / document / witness statement)</label>
                                <input type="file" accept="image/*,video/*,.pdf,.doc,.docx"
                                    onChange={e => setEvidenceFile(e.target.files[0])}
                                    style={{ padding: '8px', border: '2px dashed #ffb3cc', borderRadius: '12px', cursor: 'pointer' }} />
                                {evidenceFile && <span style={{ fontSize: '12px', color: '#9ca3af' }}>✅ {evidenceFile.name}</span>}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
                                    {loading ? 'Submitting...' : '🚨 Submit Report'}
                                </button>
                                <button type="button" className="btn-secondary"
                                    onClick={() => navigate('/dashboard')}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}