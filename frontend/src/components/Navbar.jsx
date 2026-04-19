import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Navbar() {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate('/');
    };

    return (
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid #ffe0ec',
                padding: '0 32px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                height: '64px',
                boxShadow: '0 2px 12px rgba(255,105,155,0.08)',
                position: 'sticky', top: 0, zIndex: 100,
            }}
        >
            <Link to="/" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: 36, height: 36,
                        background: 'linear-gradient(135deg, #ff4d88, #e6005c)',
                        borderRadius: '10px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                        boxShadow: '0 4px 12px rgba(255,77,136,0.3)'
                    }}>🛡️</div>
                    <span style={{
                        fontWeight: 800, fontSize: '17px',
                        background: 'linear-gradient(135deg, #ff4d88, #e6005c)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>SafeHer</span>
                </div>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                {user?.role === 'user' && (
                    <>
                        <NavLink to="/dashboard">My Reports</NavLink>
                        <NavLink to="/community">Community Alerts</NavLink>
                        <Link to="/report">
                            <button className="btn-primary" style={{
                                padding: '8px 18px', fontSize: '13px',
                                background: 'linear-gradient(135deg, #ff4d88, #e6005c)',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}>
                                🚨 Report Incident
                            </button>
                        </Link>
                    </>
                )}
                {user?.role === 'admin' && (
                    <NavLink to="/admin">Admin Dashboard</NavLink>
                )}
                {user?.role === 'authority' && (
                    <NavLink to="/authority">My Cases</NavLink>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                    <motion.div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#fff0f5', padding: '7px 14px',
                        borderRadius: '20px', border: '1px solid #ffb3cc',
                        cursor: 'pointer'
                    }}
                        whileHover={{ background: '#ffe0ec', borderColor: '#ff4d88' }}>
                        <div style={{
                            width: 26, height: 26,
                            background: 'linear-gradient(135deg, #ff4d88, #e6005c)',
                            borderRadius: '50%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '11px', fontWeight: 700
                        }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>
                            {user?.name?.split(' ')[0]}
                        </span>
                        <span style={{
                            fontSize: '10px', background: '#ffe0ec', color: '#e6005c',
                            padding: '2px 8px', borderRadius: '10px', fontWeight: 700
                        }}>
                            {user?.role?.toUpperCase()}
                        </span>
                    </motion.div>
                </Link>
                <button onClick={handleLogout} className="btn-secondary"
                    style={{ padding: '7px 16px', fontSize: '13px' }}>
                    Logout
                </button>
            </div>
        </motion.nav>
    );
}

const NavLink = ({ to, children }) => (
    <Link to={to} style={{
        textDecoration: 'none', fontSize: '14px', fontWeight: 600,
        color: '#4b5563', transition: 'color 0.2s',
    }}
        onMouseEnter={e => e.target.style.color = '#ff4d88'}
        onMouseLeave={e => e.target.style.color = '#4b5563'}
    >
        {children}
    </Link>
);