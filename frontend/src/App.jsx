import UserProfile from './pages/UserProfile';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import PageTransition from './components/PageTransition';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import ReportIncident from './pages/ReportIncident';
import CommunityAlerts from './pages/CommunityAlerts';
import './index.css';

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="spinner" style={{ margin: '100px auto' }} />;
    if (!user) return <Navigate to="/login" />;
    if (role && user.role !== role) return <Navigate to="/" />;
    return children;
};

const AnimatedRoutes = () => {
    const location = useLocation();
    const { user } = useAuth();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                    <PageTransition>
                        {user ? (
                            user.role === 'admin'     ? <Navigate to="/admin"     /> :
                            user.role === 'authority' ? <Navigate to="/authority" /> :
                                                       <Navigate to="/dashboard"  />
                        ) : <Landing />}
                    </PageTransition>
                } />
                <Route path="/login" element={
                    <PageTransition>{!user ? <Login /> : <Navigate to="/" />}</PageTransition>
                } />
                <Route path="/register" element={
                    <PageTransition>{!user ? <Register /> : <Navigate to="/" />}</PageTransition>
                } />
                <Route path="/dashboard" element={
                    <PageTransition>
                        <ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>
                    </PageTransition>
                } />
                <Route path="/report" element={
                    <PageTransition>
                        <ProtectedRoute role="user"><ReportIncident /></ProtectedRoute>
                    </PageTransition>
                } />
                <Route path="/community" element={
                    <PageTransition>
                        <ProtectedRoute role="user"><CommunityAlerts /></ProtectedRoute>
                    </PageTransition>
                } />
                <Route path="/admin" element={
                    <PageTransition>
                        <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
                    </PageTransition>
                } />
                <Route path="/authority" element={
                    <PageTransition>
                        <ProtectedRoute role="authority"><AuthorityDashboard /></ProtectedRoute>
                    </PageTransition>
                } />
                <Route path="/profile" element={
    <PageTransition>
        <ProtectedRoute><UserProfile /></ProtectedRoute>
    </PageTransition>
} />
            </Routes>
        </AnimatePresence>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AnimatedRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}