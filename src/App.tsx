import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import LandingPage from './components/LandingPage';
import PublicHeader from './components/PublicHeader';
import RegisterScreen from './components/RegisterScreen';
import AboutUsScreen from './components/AboutUsScreen';
import PublicFooter from './components/PublicFooter';
import ContactUsScreen from './components/ContactUsScreen';
import AuthenticatedLayout from './components/layout/AuthenticatedLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { User, UserRole } from './types';
import PublicNewsListingPage from './pages/PublicNewsListingPage';
import PublicSingleNewsPage from './pages/PublicSingleNewsPage';
import { authAPI } from './services/api';

type PublicView = 'landing' | 'login' | 'register' | 'about' | 'contact' | 'news' | 'news_single';

const App: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);

    // Restore user session from localStorage on app start
    useEffect(() => {
        try {
            const token = localStorage.getItem('wecare_token');
            const userData = localStorage.getItem('wecare_user');
            if (token && userData) {
                const parsed = JSON.parse(userData);
                const storedRole = String((parsed as any)?.role || '').trim();
                if (storedRole === 'radio') {
                    const upgraded = { ...(parsed as any), role: UserRole.RADIO_CENTER };
                    localStorage.setItem('wecare_user', JSON.stringify(upgraded));
                    setUser(upgraded as User);
                } else {
                    setUser(parsed as User);
                }
            }
        } catch { }
    }, []);

    const handleLogin = async (email: string, pass: string): Promise<boolean> => {
        console.log('🔐 handleLogin called with:', { email, password: '***' });
        try {
            console.log('📡 Calling authAPI.login...');
            const { user: loggedInUser, token } = await authAPI.login(email, pass);
            console.log('✅ Login API success:', { user: loggedInUser?.email, role: loggedInUser?.role, fullResponse: loggedInUser });

            // Map role to UserRole enum
            const rawRole = String(loggedInUser?.role || '').trim();
            const normalizedRole = rawRole.toUpperCase();
            const roleMapping: Record<string, User['role']> = {
                ADMIN: UserRole.ADMIN,
                DEVELOPER: UserRole.DEVELOPER,
                DRIVER: UserRole.DRIVER,
                COMMUNITY: UserRole.COMMUNITY,
                RADIO_CENTER: UserRole.RADIO_CENTER,
                OFFICER: UserRole.OFFICER,
                EXECUTIVE: UserRole.EXECUTIVE,
            };

            const userRole = normalizedRole === 'RADIO' ? UserRole.RADIO_CENTER : (roleMapping[normalizedRole] || UserRole.COMMUNITY);
            console.log('🔄 Role mapping:', { original: rawRole, normalized: normalizedRole, mapped: userRole });

            const mappedUser: User = {
                id: loggedInUser?.id,
                name: loggedInUser?.full_name || loggedInUser?.name || email,
                email: loggedInUser?.email || email,
                role: userRole,
            };

            try {
                localStorage.setItem('wecare_token', token);
                localStorage.setItem('wecare_user', JSON.stringify(mappedUser));
                console.log('💾 Token saved to localStorage');
            } catch (storageError) {
                console.error('⚠️ localStorage error:', storageError);
            }

            setUser(mappedUser);
            console.log('✅ User state updated, login successful');
            return true;
        } catch (e) {
            console.error('❌ Login error:', e);
            return false;
        }
    };

    // Dev-only auto login via query params
    useEffect(() => {
        if (!import.meta.env.DEV) return;
        if (user) return; // already logged in

        // Parse query params
        const params = new URLSearchParams(location.search);
        const autoLoginRole = params.get('autologin'); // e.g., COMMUNITY, DEVELOPER, DRIVER
        if (!autoLoginRole) return;

        const testCreds: Record<string, { email: string; pass: string }> = {
            ADMIN: { email: 'admin@wecare.ems', pass: 'password123' },
            DEVELOPER: { email: 'dev@wecare.ems', pass: 'password123' },
            RADIO_CENTER: { email: 'radio_center@wecare.dev', pass: 'password123' },
            OFFICER: { email: 'officer1@wecare.dev', pass: 'password123' },
            DRIVER: { email: 'driver1@wecare.dev', pass: 'password123' },
            COMMUNITY: { email: 'community1@wecare.dev', pass: 'password123' },
            EXECUTIVE: { email: 'executive1@wecare.dev', pass: 'password123' },
        };

        const creds = testCreds[autoLoginRole.toUpperCase()];
        if (!creds) {
            console.warn('⚠️ Unknown autologin role:', autoLoginRole);
            return;
        }

        (async () => {
            const ok = await handleLogin(creds.email, creds.pass);
            if (!ok) return;

            // Optional: initial view setup via query params
            const open = params.get('open'); // e.g., 'patient_detail', 'rides', etc.
            const patientId = params.get('patientId') || params.get('pid') || '';
            if (open) {
                try {
                    localStorage.setItem('initial_view', open);
                    localStorage.setItem('view_context', JSON.stringify({ patientId }));
                    console.log('🧭 Initial view stored:', { open, patientId });
                } catch {}
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, location.search]);

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('jwt');
        localStorage.removeItem('wecare_token');
        localStorage.removeItem('wecare_user');
        // Clear CSRF token
        try {
            const { clearCsrfToken } = require('./services/api');
            clearCsrfToken();
        } catch { }
        navigate('/');
    };

    if (user) {
        return (
            <AuthenticatedLayout user={user} onLogout={handleLogout} onUpdateUser={setUser} />
        );
    }

    return (
        <ErrorBoundary>
            <div className="bg-slate-50 min-h-screen">
                <PublicHeader
                    onLoginClick={() => navigate('/login')}
                    onRegisterClick={() => navigate('/register')}
                    onLogoClick={() => navigate('/')}
                    onAboutClick={() => navigate('/about')}
                    onContactClick={() => navigate('/contact')}
                    onNewsClick={() => navigate('/news')}
                />
                <main>
                    <Routes>
                        <Route path="/" element={<LandingPage onRegisterClick={() => navigate('/register')} />} />
                        <Route path="/login" element={<LoginScreen onLogin={handleLogin} onRegisterClick={() => navigate('/register')} />} />
                        <Route path="/register" element={<RegisterScreen onLoginClick={() => navigate('/login')} />} />
                        <Route path="/about" element={<AboutUsScreen />} />
                        <Route path="/contact" element={<ContactUsScreen />} />
                        <Route path="/news" element={<PublicNewsListingPage onViewArticle={(id) => navigate(`/news/${id}`)} />} />
                        <Route path="/news/:id" element={<PublicSingleNewsPage onBackToList={() => navigate('/news')} />} />
                        <Route path="*" element={<LandingPage onRegisterClick={() => navigate('/register')} />} />
                    </Routes>
                </main>
                {/* Show footer on specific public pages */}
                {['/', '/about', '/contact', '/news'].some(path => location.pathname === path || location.pathname.startsWith('/news')) && <PublicFooter />}
            </div>
        </ErrorBoundary>
    );
};

export default App;
