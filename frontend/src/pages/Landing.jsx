import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const useInView = (threshold = 0.15) => {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setInView(true); },
            { threshold }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    return [ref, inView];
};

const FadeUp = ({ children, delay = 0, style = {} }) => {
    const [ref, inView] = useInView();
    return (
        <motion.div ref={ref} style={style}
            initial={{ opacity: 0, y: 60 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
            {children}
        </motion.div>
    );
};

const SlideIn = ({ children, delay = 0, from = 'left' }) => {
    const [ref, inView] = useInView();
    return (
        <motion.div ref={ref}
            initial={{ opacity: 0, x: from === 'left' ? -80 : 80 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
            {children}
        </motion.div>
    );
};

const Float = ({ style, children }) => (
    <motion.div style={{ position: 'absolute', ...style }}
        animate={{ y: [0, -18, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        {children}
    </motion.div>
);

const WomanIllustration = () => (
    <svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 380 }}>
        <motion.ellipse cx="200" cy="380" rx="180" ry="120" fill="#ffe0ec" opacity="0.6"
            animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 4, repeat: Infinity }} />
        <motion.path d="M140 480 C140 420 160 380 200 360 C240 380 260 420 260 480Z" fill="#ff4d88"
            animate={{ scaleY: [1, 1.02, 1] }} transition={{ duration: 3, repeat: Infinity }} />
        <path d="M155 430 C170 410 200 400 230 410 L260 480 L140 480Z" fill="#e6005c" opacity="0.4" />
        <motion.path d="M140 370 C110 360 90 340 95 310 C100 290 120 290 130 310 C140 330 145 360 160 370Z"
            fill="#f4a261" animate={{ rotate: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} />
        <path d="M260 370 C290 360 310 340 305 310 C300 290 280 290 270 310 C260 330 255 360 240 370Z" fill="#f4a261" />
        <rect x="188" y="300" width="24" height="40" rx="12" fill="#f4a261" />
        <motion.circle cx="200" cy="270" r="65" fill="#f4a261"
            animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.path d="M145 250 C145 180 170 155 200 155 C230 155 255 180 255 250 C250 230 240 215 220 220 C215 200 210 195 200 195 C190 195 185 200 180 220 C160 215 150 230 145 250Z"
            fill="#2d1b00" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} />
        <circle cx="182" cy="268" r="6" fill="#2d1b00" />
        <circle cx="218" cy="268" r="6" fill="#2d1b00" />
        <path d="M188 285 Q200 295 212 285" stroke="#2d1b00" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <motion.g animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <circle cx="310" cy="180" r="32" fill="white" opacity="0.9" style={{ filter: 'drop-shadow(0 4px 12px rgba(255,77,136,0.3))' }} />
            <text x="310" y="188" textAnchor="middle" fontSize="24">🛡️</text>
        </motion.g>
        <motion.g animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}>
            <circle cx="90" cy="220" r="24" fill="white" opacity="0.9" style={{ filter: 'drop-shadow(0 4px 12px rgba(255,77,136,0.2))' }} />
            <text x="90" y="228" textAnchor="middle" fontSize="18">📍</text>
        </motion.g>
        <motion.g animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}>
            <circle cx="320" cy="320" r="22" fill="white" opacity="0.9" style={{ filter: 'drop-shadow(0 4px 12px rgba(255,77,136,0.2))' }} />
            <text x="320" y="328" textAnchor="middle" fontSize="16">🔔</text>
        </motion.g>
    </svg>
);

export default function Landing() {
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 500], [0, -80]);
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const [activeNav, setActiveNav] = useState('home');

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setActiveNav(id);
    };

    return (
        <div style={{ overflowX: 'hidden', background: 'white' }}>

            {/* NAVBAR */}
            <motion.nav
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '18px 60px',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(16px)',
                    borderBottom: '1px solid #ffe0ec',
                    position: 'sticky', top: 0, zIndex: 100,
                    boxShadow: '0 2px 20px rgba(255,77,136,0.06)'
                }}>
                <motion.div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                    whileHover={{ scale: 1.03 }} onClick={() => scrollTo('home')}>
                    <motion.div style={{
                        width: 42, height: 42,
                        background: 'linear-gradient(135deg, #ff4d88, #e6005c)',
                        borderRadius: '13px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '22px',
                        boxShadow: '0 4px 14px rgba(255,77,136,0.35)'
                    }}
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}>
                        🛡️
                    </motion.div>
                    <span style={{
                        fontWeight: 800, fontSize: '22px',
                        background: 'linear-gradient(135deg, #ff4d88, #e6005c)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>SafeHer</span>
                </motion.div>

                {/* Nav links */}
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                    {[
                        { id: 'home',     label: 'Home'       },
                        { id: 'mission',  label: 'Mission'    },
                        { id: 'features', label: 'Features'   },
                        { id: 'how',      label: 'How it Works'},
                        { id: 'about',    label: 'About'      },
                        { id: 'contact',  label: 'Contact'    },
                    ].map(n => (
                        <motion.span key={n.id}
                            onClick={() => scrollTo(n.id)}
                            style={{
                                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                                color: activeNav === n.id ? '#ff4d88' : '#6b7280',
                                borderBottom: activeNav === n.id ? '2px solid #ff4d88' : '2px solid transparent',
                                paddingBottom: '2px', transition: 'all 0.2s'
                            }}
                            whileHover={{ color: '#ff4d88' }}>
                            {n.label}
                        </motion.span>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <motion.button onClick={() => navigate('/login')} className="btn-secondary"
                        whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                        Sign In
                    </motion.button>
                    <motion.button onClick={() => navigate('/register')} className="btn-primary"
                        whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                        Get Started
                    </motion.button>
                </div>
            </motion.nav>

            {/* HERO */}
            <div id="home" style={{
                minHeight: '94vh',
                background: 'linear-gradient(135deg, #fff0f5 0%, #ffe8f0 40%, #fff5f8 100%)',
                display: 'flex', alignItems: 'center',
                padding: '60px 60px 40px', position: 'relative', overflow: 'hidden'
            }}>
                <Float style={{ top: '8%', right: '8%', opacity: 0.12 }}>
                    <div style={{ width: 300, height: 300, borderRadius: '50%', background: 'linear-gradient(135deg, #ff4d88, #ffb3cc)' }} />
                </Float>
                <Float style={{ bottom: '10%', left: '5%', opacity: 0.08 }}>
                    <div style={{ width: 200, height: 200, borderRadius: '50%', background: '#ff4d88' }} />
                </Float>
                {[...Array(8)].map((_, i) => (
                    <motion.div key={i} style={{
                        position: 'absolute', width: 8, height: 8, borderRadius: '50%',
                        background: '#ff4d88', opacity: 0.25,
                        top: `${15 + i * 10}%`, right: `${40 + (i % 3) * 3}%`
                    }}
                        animate={{ scale: [1, 1.8, 1], opacity: [0.25, 0.5, 0.25] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }} />
                ))}

                <motion.div style={{
                    maxWidth: 1200, margin: '0 auto', width: '100%',
                    display: 'grid', gridTemplateColumns: '1.1fr 1fr',
                    gap: '60px', alignItems: 'center',
                    y: heroY, opacity: heroOpacity
                }}>
                    <div>
                        <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                            <motion.div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: '#ffe0ec', color: '#e6005c',
                                padding: '8px 18px', borderRadius: '20px',
                                fontSize: '13px', fontWeight: 700, marginBottom: '24px',
                                boxShadow: '0 2px 12px rgba(255,77,136,0.15)'
                            }}
                                animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                                🚨 India's Women Safety Platform
                            </motion.div>

                            <h1 style={{
                                fontSize: '58px', fontWeight: 900, lineHeight: 1.1,
                                color: '#1f2937', marginBottom: '22px', letterSpacing: '-1px'
                            }}>
                                Your Safety,<br />
                                <motion.span style={{
                                    background: 'linear-gradient(135deg, #ff4d88, #e6005c)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    display: 'inline-block'
                                }}>
                                    Our Priority
                                </motion.span>
                            </h1>

                            <motion.p style={{
                                fontSize: '17px', color: '#6b7280', lineHeight: 1.8,
                                marginBottom: '38px', maxWidth: '460px'
                            }}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.8 }}>
                                Report incidents, alert your community, and get help fast.
                                SafeHer connects women with authorities and nearby community
                                members for immediate support — anytime, anywhere.
                            </motion.p>

                            <motion.div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}>
                                <motion.button onClick={() => navigate('/register')} className="btn-primary"
                                    style={{ fontSize: '15px', padding: '15px 34px' }}
                                    whileHover={{ scale: 1.05, y: -3, boxShadow: '0 8px 28px rgba(255,77,136,0.45)' }}
                                    whileTap={{ scale: 0.97 }}>
                                    🛡️ Get Protected Now
                                </motion.button>
                                <motion.button onClick={() => scrollTo('how')} className="btn-secondary"
                                    style={{ fontSize: '15px', padding: '15px 34px' }}
                                    whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                                    Learn More ↓
                                </motion.button>
                            </motion.div>

                            <motion.div style={{ display: 'flex', gap: '40px', marginTop: '52px' }}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                                {[
                                    { value: '24/7', label: 'Available' },
                                    { value: '100%', label: 'Confidential' },
                                    { value: 'Fast', label: 'Response' },
                                ].map((s, i) => (
                                    <motion.div key={i} whileHover={{ y: -4 }}
                                        transition={{ type: 'spring', stiffness: 300 }}>
                                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#ff4d88' }}>{s.value}</div>
                                        <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500, marginTop: '2px' }}>{s.label}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 60, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                        <WomanIllustration />
                    </motion.div>
                </motion.div>

                <motion.div style={{
                    position: 'absolute', bottom: '32px', left: '50%',
                    transform: 'translateX(-50%)', display: 'flex',
                    flexDirection: 'column', alignItems: 'center', gap: '6px'
                }}
                    animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, #ff4d88, transparent)' }} />
                    <div style={{ fontSize: '11px', color: '#ff4d88', fontWeight: 600, letterSpacing: '1px' }}>SCROLL</div>
                </motion.div>
            </div>

            {/* MISSION */}
            <div id="mission" style={{
                padding: '100px 60px',
                background: 'linear-gradient(135deg, #1f2937, #111827)'
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
                        <SlideIn from="left">
                            <div style={{ display: 'inline-block', background: 'rgba(255,77,136,0.2)', color: '#ff4d88', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '20px', letterSpacing: '1px' }}>
                                OUR MISSION
                            </div>
                            <h2 style={{ fontSize: '44px', fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: '24px' }}>
                                Because no woman should ever feel
                                <span style={{ color: '#ff4d88' }}> unsafe.</span>
                            </h2>
                            <p style={{ fontSize: '16px', color: '#9ca3af', lineHeight: 1.9, marginBottom: '20px' }}>
                                Every day, women and children across India face harassment, stalking, and violence.
                                SafeHer was built with one mission — to give every woman a platform to speak up,
                                get help fast, and know that her community stands behind her.
                            </p>
                            <p style={{ fontSize: '16px', color: '#9ca3af', lineHeight: 1.9 }}>
                                We believe technology should protect people — not just connect them.
                                SafeHer is that protection.
                            </p>
                        </SlideIn>

                        <SlideIn from="right" delay={0.2}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {[
                                    { emoji: '⚡', title: 'Immediate Action', desc: 'Every second counts. Our platform ensures reports reach the right people instantly.' },
                                    { emoji: '🔒', title: 'Confidential & Safe', desc: 'Your identity and information is always protected. Report safely, always.' },
                                    { emoji: '🤝', title: 'Community First', desc: 'A safety net of real people around you — ready to step in and help.' },
                                ].map((item, i) => (
                                    <motion.div key={i} style={{
                                        display: 'flex', gap: '16px', alignItems: 'flex-start',
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '20px', borderRadius: '16px',
                                        border: '1px solid rgba(255,77,136,0.2)'
                                    }}
                                        whileHover={{ background: 'rgba(255,77,136,0.08)', borderColor: '#ff4d88' }}
                                        transition={{ duration: 0.2 }}>
                                        <div style={{
                                            width: 44, height: 44, minWidth: 44,
                                            background: 'rgba(255,77,136,0.15)',
                                            borderRadius: '12px', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                                        }}>{item.emoji}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'white', marginBottom: '6px', fontSize: '15px' }}>{item.title}</div>
                                            <div style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.6 }}>{item.desc}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </SlideIn>
                    </div>
                </div>
            </div>

            {/* FEATURES */}
            <div id="features" style={{ padding: '100px 60px', background: 'white' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <FadeUp>
                        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                            <div style={{ display: 'inline-block', background: '#ffe0ec', color: '#e6005c', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '14px', letterSpacing: '1px' }}>
                                FEATURES
                            </div>
                            <h2 style={{ fontSize: '42px', fontWeight: 800, color: '#1f2937', marginBottom: '12px' }}>
                                Everything you need to stay safe
                            </h2>
                            <p style={{ fontSize: '16px', color: '#9ca3af', maxWidth: '480px', margin: '0 auto' }}>
                                One platform for reporting, alerting, and tracking your safety.
                            </p>
                        </div>
                    </FadeUp>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        {[
                            { emoji: '🚨', title: 'SOS Report', desc: 'File an emergency report with your live location, incident details, and criminal description.', color: '#ffe0ec' },
                            { emoji: '📢', title: 'Community Alert', desc: 'Alert nearby community members instantly. Real people around you can respond and help.', color: '#e0f0ff' },
                            { emoji: '📍', title: 'Live Location', desc: 'GPS coordinates automatically captured and shared with authorities and responders.', color: '#e0ffe8' },
                            { emoji: '👤', title: 'Criminal Description', desc: 'Describe the perpetrator — age, height, appearance — even guesswork helps catch them.', color: '#fff3e0' },
                            { emoji: '📎', title: 'Evidence Upload', desc: 'Attach CCTV footage, images, documents, or witness statements directly to your report.', color: '#f3e0ff' },
                            { emoji: '📋', title: 'Case Tracking', desc: 'Track every report from filing to resolution. Know exactly what\'s happening with your case.', color: '#ffe0ec' },
                        ].map((f, i) => (
                            <FadeUp key={i} delay={i * 0.08}>
                                <motion.div style={{
                                    background: 'white', borderRadius: '20px', padding: '28px',
                                    border: '1px solid #f3f4f6', height: '100%',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                                }}
                                    whileHover={{ y: -8, boxShadow: '0 16px 40px rgba(255,77,136,0.12)', borderColor: '#ffb3cc' }}
                                    transition={{ type: 'spring', stiffness: 300 }}>
                                    <motion.div style={{
                                        width: 52, height: 52, borderRadius: '14px',
                                        background: f.color, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        fontSize: '24px', marginBottom: '16px'
                                    }}
                                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                                        transition={{ duration: 0.4 }}>
                                        {f.emoji}
                                    </motion.div>
                                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>{f.title}</h3>
                                    <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.7 }}>{f.desc}</p>
                                </motion.div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </div>

            {/* HOW IT WORKS */}
            <div id="how" style={{ padding: '100px 60px', background: 'linear-gradient(135deg, #fff0f5, #ffe8f0)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <FadeUp>
                        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                            <div style={{ display: 'inline-block', background: '#ffe0ec', color: '#e6005c', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '14px', letterSpacing: '1px' }}>
                                HOW IT WORKS
                            </div>
                            <h2 style={{ fontSize: '42px', fontWeight: 800, color: '#1f2937' }}>Three steps to safety</h2>
                        </div>
                    </FadeUp>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', position: 'relative' }}>
                        <div style={{
                            position: 'absolute', top: '52px', left: '20%', right: '20%',
                            height: '2px', background: 'linear-gradient(to right, #ffb3cc, #ff4d88, #ffb3cc)'
                        }} />
                        {[
                            { step: '01', emoji: '📝', title: 'Report or Alert', desc: 'File a detailed incident report or send a quick community alert with your location.' },
                            { step: '02', emoji: '📍', title: 'Location Shared', desc: 'Your live GPS location is automatically shared with authorities and responders.' },
                            { step: '03', emoji: '✅', title: 'Help Arrives', desc: 'Authorities and community members respond and your case is tracked to resolution.' },
                        ].map((s, i) => (
                            <FadeUp key={i} delay={i * 0.15}>
                                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                                    <motion.div style={{
                                        width: 80, height: 80, margin: '0 auto 20px',
                                        background: 'white', borderRadius: '24px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '34px', boxShadow: '0 4px 20px rgba(255,77,136,0.15)'
                                    }}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: 'spring', stiffness: 300 }}>
                                        {s.emoji}
                                    </motion.div>
                                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#ff4d88', marginBottom: '8px', letterSpacing: '1.5px' }}>STEP {s.step}</div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', marginBottom: '10px' }}>{s.title}</h3>
                                    <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.7 }}>{s.desc}</p>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </div>

            {/* ABOUT */}
            <div id="about" style={{ padding: '100px 60px', background: 'white' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <FadeUp>
                        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                            <div style={{ display: 'inline-block', background: '#ffe0ec', color: '#e6005c', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '14px', letterSpacing: '1px' }}>
                                ABOUT
                            </div>
                            <h2 style={{ fontSize: '42px', fontWeight: 800, color: '#1f2937' }}>The person behind SafeHer</h2>
                        </div>
                    </FadeUp>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '60px', alignItems: 'center' }}>
                        <SlideIn from="left">
                            <motion.div style={{
                                background: 'linear-gradient(135deg, #fff0f5, #ffe0ec)',
                                borderRadius: '28px', padding: '40px',
                                textAlign: 'center', border: '2px solid #ffb3cc',
                                boxShadow: '0 8px 32px rgba(255,77,136,0.12)'
                            }}
                                whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(255,77,136,0.2)' }}>
                                <motion.div style={{
                                    width: 100, height: 100, margin: '0 auto 16px',
                                    background: 'linear-gradient(135deg, #ff4d88, #e6005c)',
                                    borderRadius: '50%', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    fontSize: '44px', boxShadow: '0 8px 24px rgba(255,77,136,0.4)'
                                }}
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 3, repeat: Infinity }}>
                                    👩‍💻
                                </motion.div>
                                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1f2937', marginBottom: '6px' }}>
                                    Grisha Gawand
                                </h3>
                                <p style={{ fontSize: '13px', color: '#ff4d88', fontWeight: 700, marginBottom: '4px' }}>
                                    SEB213
                                </p>
                                <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
                                    S.E. Computer Engineering<br />
                                    Lokmanya Tilak College of Engineering
                                </p>
                                <motion.a href="https://github.com/GG98-xx" target="_blank" rel="noreferrer"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        background: '#1f2937', color: 'white',
                                        padding: '10px 20px', borderRadius: '10px',
                                        textDecoration: 'none', fontSize: '13px', fontWeight: 600
                                    }}
                                    whileHover={{ scale: 1.05, background: '#374151' }}>
                                    <span>🐙</span> GitHub
                                </motion.a>
                            </motion.div>
                        </SlideIn>

                        <SlideIn from="right" delay={0.2}>
                            <div>
                                <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#1f2937', marginBottom: '20px', lineHeight: 1.3 }}>
                                    Built with purpose.<br />
                                    <span style={{ color: '#ff4d88' }}>Driven by responsibility.</span>
                                </h3>
                                <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.9, marginBottom: '16px' }}>
                                    SafeHer was built as part of the DBMS Lab project at LTCE, but the motivation behind it
                                    goes far beyond academics. In a country where women and children face harassment,
                                    stalking, and violence every single day — the need for a fast, accessible reporting
                                    platform is real and urgent.
                                </p>
                                <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.9, marginBottom: '28px' }}>
                                    SafeHer combines a full-stack web application with a MySQL database to create a
                                    platform where incidents can be reported, evidence uploaded, communities alerted,
                                    and cases tracked — all in one place.
                                </p>
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    {['React', 'Node.js', 'MySQL', 'Express', 'Framer Motion', 'Cloudinary'].map((tech, i) => (
                                        <motion.span key={i} style={{
                                            background: '#fff0f5', color: '#ff4d88',
                                            padding: '6px 14px', borderRadius: '20px',
                                            fontSize: '13px', fontWeight: 600,
                                            border: '1px solid #ffb3cc'
                                        }}
                                            whileHover={{ scale: 1.08, background: '#ffe0ec' }}>
                                            {tech}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                        </SlideIn>
                    </div>
                </div>
            </div>

            {/* CONTACT */}
            <div id="contact" style={{
                padding: '100px 60px',
                background: 'linear-gradient(135deg, #1f2937, #111827)'
            }}>
                <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
                    <FadeUp>
                        <div style={{ display: 'inline-block', background: 'rgba(255,77,136,0.2)', color: '#ff4d88', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '20px', letterSpacing: '1px' }}>
                            CONTACT
                        </div>
                        <h2 style={{ fontSize: '42px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
                            Get in touch
                        </h2>
                        <p style={{ fontSize: '16px', color: '#9ca3af', lineHeight: 1.8, marginBottom: '40px' }}>
                            Have feedback, want to contribute, or just want to say hi?
                            Reach out — every message is read and appreciated.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <motion.a href="https://github.com/GG98-xx" target="_blank" rel="noreferrer"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                                    background: 'rgba(255,255,255,0.08)', color: 'white',
                                    padding: '14px 28px', borderRadius: '14px',
                                    textDecoration: 'none', fontSize: '14px', fontWeight: 600,
                                    border: '1px solid rgba(255,255,255,0.12)'
                                }}
                                whileHover={{ background: 'rgba(255,255,255,0.15)', y: -3 }}>
                                🐙 GitHub
                            </motion.a>
                            <motion.button onClick={() => navigate('/register')}
                                className="btn-primary"
                                style={{ padding: '14px 28px', fontSize: '14px' }}
                                whileHover={{ scale: 1.05, y: -3 }}>
                                🛡️ Try SafeHer
                            </motion.button>
                        </div>
                    </FadeUp>
                </div>
            </div>

            {/* CTA */}
            <div style={{
                background: 'linear-gradient(135deg, #ff4d88, #e6005c)',
                padding: '80px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden'
            }}>
                <Float style={{ top: '-20%', left: '-5%', opacity: 0.1 }}>
                    <div style={{ width: 300, height: 300, borderRadius: '50%', background: 'white' }} />
                </Float>
                <Float style={{ bottom: '-30%', right: '-5%', opacity: 0.1 }}>
                    <div style={{ width: 400, height: 400, borderRadius: '50%', background: 'white' }} />
                </Float>
                <FadeUp>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <motion.div style={{ fontSize: '48px', marginBottom: '16px' }}
                            animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}>
                            🛡️
                        </motion.div>
                        <h2 style={{ fontSize: '40px', fontWeight: 800, color: 'white', marginBottom: '14px' }}>
                            Stay Safe. Stay Connected.
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '32px', fontSize: '17px', maxWidth: '480px', margin: '0 auto 32px' }}>
                            Join SafeHer and never face danger alone.
                        </p>
                        <motion.button onClick={() => navigate('/register')}
                            style={{
                                background: 'white', color: '#e6005c', border: 'none',
                                padding: '16px 40px', borderRadius: '14px', fontSize: '16px',
                                fontWeight: 700, cursor: 'pointer',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
                            }}
                            whileHover={{ scale: 1.06, y: -3 }}
                            whileTap={{ scale: 0.97 }}>
                            🛡️ Join SafeHer Now — It's Free
                        </motion.button>
                    </div>
                </FadeUp>
            </div>

            {/* FOOTER */}
            <div style={{
                background: '#111827', padding: '32px 60px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>🛡️</span>
                    <span style={{ fontWeight: 700, color: 'white', fontSize: '16px' }}>SafeHer</span>
                </div>
                <div style={{ color: '#6b7280', fontSize: '13px' }}>
                    © 2025 SafeHer by Grisha Gawand — DBMS Lab PCL402 | LTCE
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    {['Home', 'Mission', 'Features', 'About', 'Contact'].map(l => (
                        <span key={l} style={{ color: '#6b7280', fontSize: '13px', cursor: 'pointer', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.target.style.color = '#ff4d88'}
                            onMouseLeave={e => e.target.style.color = '#6b7280'}
                            onClick={() => scrollTo(l.toLowerCase())}>
                            {l}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}