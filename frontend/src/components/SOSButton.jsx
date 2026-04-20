import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createIncident, createAlert } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function SOSButton() {
    const [active,    setActive]    = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [location,  setLocation]  = useState(null);
    const [status,    setStatus]    = useState('');
    const [sent,      setSent]      = useState(false);
    const { user } = useAuth();

    // Get location on mount
    useEffect(() => {
        navigator.geolocation?.getCurrentPosition(
            pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            err => console.log('Location unavailable')
        );
    }, []);

    // Countdown timer
    useEffect(() => {
        if (!active) return;
        if (countdown === 0) { triggerSOS(); return; }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [active, countdown]);

    const triggerSOS = async () => {
        setStatus('🚨 Sending SOS...');
        try {
            // 1. Create emergency incident
            const formData = new FormData();
            formData.append('type', 'Emergency SOS');
            formData.append('description', `EMERGENCY SOS triggered by ${user?.name}. Immediate assistance required.`);
            formData.append('location_id', '1');
            formData.append('report_type', 'Authorities');
            if (location) {
                formData.append('latitude',  location.lat);
                formData.append('longitude', location.lng);
            }
            await createIncident(formData);

            // 2. Send community alert
            await createAlert({
                message: `🚨 EMERGENCY SOS from ${user?.name}! Immediate help needed!`,
                city: 'Emergency',
                latitude:  location?.lat,
                longitude: location?.lng,
            });

            // 3. Call emergency contact
            if (user?.emerg_contact) {
                window.location.href = `tel:${user.emerg_contact}`;
            }

            setStatus('✅ SOS sent! Help is on the way.');
            setSent(true);
        } catch (err) {
            setStatus('❌ Failed to send SOS. Call 112 directly!');
        }
    };

    const handlePress = () => {
        setActive(true);
        setCountdown(5);
        setSent(false);
        setStatus('');
    };

    const handleCancel = () => {
        setActive(false);
        setCountdown(5);
        setStatus('');
    };

    return (
        <>
            {/* Floating SOS Button */}
            <motion.button
                onClick={handlePress}
                style={{
                    position: 'fixed', bottom: '32px', right: '32px',
                    width: 70, height: 70, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff1744, #c62828)',
                    border: 'none', cursor: 'pointer', zIndex: 999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: '2px',
                    boxShadow: '0 4px 20px rgba(255,23,68,0.5)',
                    color: 'white', fontFamily: 'Poppins, sans-serif'
                }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}>
                <span style={{ fontSize: '22px' }}>🆘</span>
                <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.5px' }}>SOS</span>
            </motion.button>

            {/* SOS Modal */}
            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 1000,
                            background: 'rgba(0,0,0,0.85)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '24px'
                        }}>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            style={{
                                background: 'white', borderRadius: '28px',
                                padding: '40px', maxWidth: '400px', width: '100%',
                                textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.4)'
                            }}>

                            {!sent ? (
                                <>
                                    {/* Pulsing SOS */}
                                    <motion.div
                                        animate={{ scale: [1, 1.15, 1] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                        style={{
                                            width: 120, height: 120, margin: '0 auto 24px',
                                            background: 'linear-gradient(135deg, #ff1744, #c62828)',
                                            borderRadius: '50%', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            fontSize: '48px',
                                            boxShadow: '0 0 0 20px rgba(255,23,68,0.15), 0 0 0 40px rgba(255,23,68,0.08)'
                                        }}>
                                        🆘
                                    </motion.div>

                                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937', marginBottom: '8px' }}>
                                        SOS Activating...
                                    </h2>
                                    <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px' }}>
                                        Sending emergency alert + calling your emergency contact
                                    </p>

                                    {/* Countdown */}
                                    <motion.div style={{
                                        width: 80, height: 80, margin: '0 auto 24px',
                                        borderRadius: '50%', background: '#fff0f0',
                                        border: '4px solid #ff1744',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '36px', fontWeight: 900, color: '#ff1744'
                                    }}
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}>
                                        {countdown}
                                    </motion.div>

                                    {/* What will happen */}
                                    <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                                        {[
                                            '📍 Share your GPS location',
                                            '🚨 File emergency incident report',
                                            '📢 Alert nearby community',
                                            `📞 Call ${user?.emerg_contact || 'emergency contact'}`,
                                        ].map((item, i) => (
                                            <motion.div key={i} style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                padding: '8px 0', fontSize: '13px', color: '#374151',
                                                borderBottom: i < 3 ? '1px solid #f3f4f6' : 'none'
                                            }}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}>
                                                {item}
                                            </motion.div>
                                        ))}
                                    </div>

                                    {status && (
                                        <div style={{
                                            padding: '10px', borderRadius: '10px',
                                            background: '#fff0f0', color: '#c62828',
                                            fontSize: '13px', marginBottom: '16px', fontWeight: 600
                                        }}>{status}</div>
                                    )}

                                    <motion.button
                                        onClick={handleCancel}
                                        style={{
                                            width: '100%', padding: '14px',
                                            background: '#f3f4f6', border: 'none',
                                            borderRadius: '14px', fontSize: '15px',
                                            fontWeight: 700, cursor: 'pointer', color: '#374151'
                                        }}
                                        whileHover={{ background: '#e5e7eb' }}
                                        whileTap={{ scale: 0.97 }}>
                                        ✕ Cancel SOS
                                    </motion.button>

                                    {/* Direct call 112 */}
                                    <motion.a href="tel:112"
                                        style={{
                                            display: 'block', marginTop: '12px',
                                            padding: '14px', borderRadius: '14px',
                                            background: 'linear-gradient(135deg, #ff1744, #c62828)',
                                            color: 'white', textDecoration: 'none',
                                            fontSize: '15px', fontWeight: 700
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}>
                                        📞 Call 112 Now
                                    </motion.a>
                                </>
                            ) : (
                                <>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200 }}
                                        style={{ fontSize: '72px', marginBottom: '16px' }}>
                                        ✅
                                    </motion.div>
                                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937', marginBottom: '8px' }}>
                                        SOS Sent!
                                    </h2>
                                    <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px' }}>
                                        Emergency report filed, community alerted, and emergency contact called.
                                        Help is on the way!
                                    </p>
                                    <motion.button
                                        onClick={() => { setActive(false); setSent(false); }}
                                        className="btn-primary"
                                        style={{ width: '100%' }}
                                        whileHover={{ scale: 1.02 }}>
                                        I'm Safe Now
                                    </motion.button>
                                    <motion.a href="tel:112"
                                        style={{
                                            display: 'block', marginTop: '12px',
                                            padding: '14px', borderRadius: '14px',
                                            background: 'linear-gradient(135deg, #ff1744, #c62828)',
                                            color: 'white', textDecoration: 'none',
                                            fontSize: '15px', fontWeight: 700, textAlign: 'center'
                                        }}
                                        whileHover={{ scale: 1.02 }}>
                                        📞 Still need help? Call 112
                                    </motion.a>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}