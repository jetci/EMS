

import React, { useState } from 'react';
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

type PublicView = 'landing' | 'login' | 'register' | 'about' | 'contact' | 'news' | 'news_single';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [publicView, setPublicView] = useState<PublicView>('landing');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const handleLogin = (email: string, pass: string): boolean => {
    const lowerEmail = email.toLowerCase();
    // Mock authentication based on the provided handbook
    if (lowerEmail === 'driver1@wecare.dev' && pass === 'password') {
      setUser({ name: 'Driver One', email: 'driver1@wecare.dev', role: 'driver' });
      return true;
    }
    if (lowerEmail === 'community1@wecare.dev' && pass === 'password') {
        setUser({ name: 'Community User', email: 'community1@wecare.dev', role: 'community' });
        return true;
    }
    if (lowerEmail === 'office1@wecare.dev' && pass === 'password') {
        setUser({ name: 'Office Operator', email: 'office1@wecare.dev', role: 'office' });
        return true;
    }
    if (lowerEmail === 'officer1@wecare.dev' && pass === 'password') {
        setUser({ name: 'Officer User', email: 'officer1@wecare.dev', role: 'OFFICER' });
        return true;
    }
    if (lowerEmail === 'executive1@wecare.dev' && pass === 'password') {
        setUser({ name: 'Executive User', email: 'executive1@wecare.dev', role: 'EXECUTIVE' });
        return true;
    }
    if (lowerEmail === 'admin@wecare.dev' && pass === 'password') {
        setUser({ name: 'Admin User', email: 'admin@wecare.dev', role: 'admin' });
        return true;
    }
    if (lowerEmail === 'jetci.j@gmail.com' && pass === 'g0KEk,^],k;yo') {
        setUser({ name: 'Developer User', email: 'jetci.j@gmail.com', role: 'DEVELOPER' });
        return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUser(null);
    setPublicView('landing'); // Go back to landing page on logout
  };

  const showLogin = () => setPublicView('login');
  const showRegister = () => setPublicView('register');
  const showLanding = () => setPublicView('landing');
  const showAbout = () => setPublicView('about');
  const showContact = () => setPublicView('contact');
  const showNews = () => {
    setSelectedArticleId(null);
    setPublicView('news');
  };

  const handleViewArticle = (articleId: string) => {
    setSelectedArticleId(articleId);
    setPublicView('news_single');
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
  );
};

export default App;