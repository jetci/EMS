import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginScreen from './components/LoginScreen';
import LandingPage from './components/LandingPage';
import PublicHeader from './components/PublicHeader';
import RegisterScreen from './components/RegisterScreen';
import AboutUsScreen from './components/AboutUsScreen';
import PublicFooter from './components/PublicFooter';
import ContactUsScreen from './components/ContactUsScreen';
import AuthenticatedLayout from './components/layout/AuthenticatedLayout';
import { User } from './types';
import PublicNewsListingPage from './pages/PublicNewsListingPage';
import PublicSingleNewsPage from './pages/PublicSingleNewsPage';
import { authAPI } from './src/services/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

type PublicView = 'landing' | 'login' | 'register' | 'about' | 'contact' | 'news' | 'news_single';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [publicView, setPublicView] = useState<PublicView>('landing');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  // Minimal router for path-based navigation under staging base
  // Prefer runtime detection from current URL to ensure correct base on hosting
  const ENV_BASE = ((import.meta as any)?.env?.VITE_BASE as string | undefined) || '/';
  const RUNTIME_BASE = (() => {
    const p = window.location.pathname;
    // Common hosting path for staging
    if (p.startsWith('/ems_staging/')) return '/ems_staging/';
    // Fallback: if index is exactly at /ems_staging
    if (p === '/ems_staging') return '/ems_staging/';
    return ENV_BASE;
  })();
  const normBase = RUNTIME_BASE.endsWith('/') ? RUNTIME_BASE : RUNTIME_BASE + '/';

  const applyRoute = (pathname: string) => {
    // Normalize: remove base prefix and ensure p starts with a single '/'
    let p = pathname;
    if (normBase !== '/' && p.startsWith(normBase)) {
      p = '/' + p.slice(normBase.length);
    }
    // Ensure leading slash
    if (!p.startsWith('/')) p = '/' + p;
    const parts = p.replace(/^\/+/, '').split('/'); // e.g., ['news'] or ['news','abc123']
    const head = parts[0] || '';
    if (head === '' || head === 'index.html') { setPublicView('landing'); setSelectedArticleId(null); return; }
    if (head === 'login') { setPublicView('login'); setSelectedArticleId(null); return; }
    if (head === 'register') { setPublicView('register'); setSelectedArticleId(null); return; }
    if (head === 'about') { setPublicView('about'); setSelectedArticleId(null); return; }
    if (head === 'contact') { setPublicView('contact'); setSelectedArticleId(null); return; }
    if (head === 'news') {
      const id = parts[1];
      if (id) { setSelectedArticleId(id); setPublicView('news_single'); return; }
      setSelectedArticleId(null); setPublicView('news'); return;
    }
    // Fallback
    setPublicView('landing'); setSelectedArticleId(null);
  };

  useEffect(() => {
    applyRoute(window.location.pathname);
    const onPop = () => applyRoute(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore user session from localStorage on app start
  useEffect(() => {
    try {
      const token = localStorage.getItem('wecare_token');
      const userData = localStorage.getItem('wecare_user');
      if (token && userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed as User);
      }
    } catch {}
  }, []);

  const handleLogin = (email: string, pass: string): boolean => {
    // Kick off async login via backend API; keep boolean return for LoginScreen UX
    (async () => {
      try {
        const lowerEmail = email.toLowerCase();
        const { user: loggedInUser, token } = await authAPI.login(email, pass);
        const mappedUser: User = {
          id: loggedInUser?.id,
          name: loggedInUser?.full_name || loggedInUser?.name || email,
          email: loggedInUser?.email || email,
          role: (loggedInUser?.role || 'user') as User['role'],
        };
        if (lowerEmail === 'office1@wecare.dev' && pass === 'password') {
          setUser({ name: 'Radio Center Staff', email: 'office1@wecare.dev', role: 'radio' });
          return true;
        }
        try {
          localStorage.setItem('wecare_token', token);
          localStorage.setItem('wecare_user', JSON.stringify(mappedUser));
        } catch {}
        setUser(mappedUser);
      } catch (e) {
        console.error('Login error', e);
        alert('ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบอีเมล/รหัสผ่าน');
      }
    })();
    return true;
  };

  const handleLogout = () => {
    setUser(null);
    setPublicView('landing'); // Go back to landing page on logout
    try {
      localStorage.removeItem('jwt');
      localStorage.removeItem('wecare_token');
      localStorage.removeItem('wecare_user');
    } catch {}
  };

  const navigate = (path: string) => {
    const url = (normBase.replace(/\/$/, '')) + (path.startsWith('/') ? path : `/${path}`);
    window.history.pushState({}, '', url);
    applyRoute(window.location.pathname);
  };

  const showLogin = () => navigate('/login');
  const showRegister = () => navigate('/register');
  const showLanding = () => navigate('/');
  const showAbout = () => navigate('/about');
  const showContact = () => navigate('/contact');
  const showNews = () => navigate('/news');

  const handleViewArticle = (articleId: string) => {
    navigate(`/news/${articleId}`);
  };

  if (user) {
    return (
        <AuthenticatedLayout user={user} onLogout={handleLogout} />
    );
  }
  
  const showFooter = publicView === 'landing' || publicView === 'about' || publicView === 'contact' || publicView === 'news' || publicView === 'news_single';
  
  const renderPublicContent = () => {
    switch(publicView) {
      case 'landing': return <LandingPage onRegisterClick={showRegister} />;
      case 'login': return <LoginScreen onLogin={handleLogin} onRegisterClick={showRegister} />;
      case 'register': return <RegisterScreen onLoginClick={showLogin} />;
      case 'about': return <AboutUsScreen />;
      case 'contact': return <ContactUsScreen />;
      case 'news': return <PublicNewsListingPage onViewArticle={handleViewArticle} />;
      case 'news_single': 
        if (selectedArticleId) {
          return <PublicSingleNewsPage articleId={selectedArticleId} onBackToList={showNews} />;
        }
        return <PublicNewsListingPage onViewArticle={handleViewArticle} />; // Fallback
      default: return <LandingPage onRegisterClick={showRegister} />;
    }
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="bg-slate-50 min-h-screen">
        <PublicHeader
            onLoginClick={showLogin}
            onRegisterClick={showRegister}
            onLogoClick={showLanding}
            onAboutClick={showAbout}
            onContactClick={showContact}
            onNewsClick={showNews}
        />
        <main>
            {renderPublicContent()}
        </main>
        {showFooter && <PublicFooter />}
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;