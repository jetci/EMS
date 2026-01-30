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
                setUser(parsed as User);
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
            const roleMapping: Record<string, User['role']> = {
                'admin': UserRole.ADMIN,
                'DEVELOPER': UserRole.DEVELOPER,
                'driver': UserRole.DRIVER,
                'community': UserRole.COMMUNITY,
                'radio': UserRole.RADIO,
                'radio_center': UserRole.RADIO_CENTER,
                'OFFICER': UserRole.OFFICER,
                'EXECUTIVE': UserRole.EXECUTIVE,
            };

            const userRole = roleMapping[loggedInUser?.role] || UserRole.COMMUNITY;
            console.log('🔄 Role mapping:', { original: loggedInUser?.role, mapped: userRole });

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
