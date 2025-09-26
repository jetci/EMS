import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import './App.css'

// Import components
import LoginScreen from './components/LoginScreen'
import RegisterScreen from './components/RegisterScreen'
import LandingPage from './components/LandingPage'
import PublicHeader from './components/PublicHeader'
import AuthenticatedLayout from './components/AuthenticatedLayout'
import EmailVerificationScreen from './components/EmailVerificationScreen'
import EmailVerificationSuccess from './components/EmailVerificationSuccess'
import AboutPage from './components/pages/AboutPage'
import ContactPage from './components/pages/ContactPage'
import NewsPage from './components/pages/NewsPage'

function App() {
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('landing')
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('')

  const handleLogin = async (email, password) => {
    try {
      // Import API service dynamically
      const { default: apiService } = await import('./services/api.js')
      
      const response = await apiService.login(email, password)
      
      if (response.user) {
        setUser({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          phone: response.user.phone,
          email_verified: response.user.email_verified,
          verification_status: response.user.verification_status
        })
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login failed:', error)
      
      // Check if it's an email verification error
      if (error.message.includes('กรุณายืนยันอีเมล')) {
        setPendingVerificationEmail(email)
        setCurrentView('email-verification')
        return false
      }
      
      return false
    }
  }

  const handleLogout = async () => {
    try {
      const { default: apiService } = await import('./services/api.js')
      await apiService.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
      setCurrentView('landing')
    }
  }

  const handleRegister = async (userData) => {
    try {
      const { default: apiService } = await import('./services/api.js')
      
      const response = await apiService.register(userData)
      
      if (response.success) {
        // Set email for verification screen
        setPendingVerificationEmail(userData.email)
        setCurrentView('email-verification')
        return { success: true, message: response.message }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, message: error.message || 'การสมัครสมาชิกล้มเหลว' }
    }
  }

  const showLogin = () => setCurrentView('login')
  const showRegister = () => setCurrentView('register')
  const showLanding = () => setCurrentView('landing')

  // Email verification handlers
  const handleResendEmail = async (email) => {
    try {
      const { default: apiService } = await import('./services/api.js')
      const response = await apiService.resendVerificationEmail(email)
      return response.success
    } catch (error) {
      console.error('Resend email failed:', error)
      return false
    }
  }

  const handleEmailVerificationSuccess = (verifiedUser) => {
    setUser(verifiedUser)
    setCurrentView('verification-success')
  }

  const handleBackToLogin = () => {
    setPendingVerificationEmail('')
    setCurrentView('login')
  }

  if (user && currentView !== 'verification-success') {
    return <AuthenticatedLayout user={user} onLogout={handleLogout} />
  }

  // Email verification success screen
  if (currentView === 'verification-success') {
    return (
      <EmailVerificationSuccess 
        user={user} 
        onContinueToLogin={() => {
          setCurrentView('landing')
          // Keep user logged in after verification
        }}
      />
    )
  }

  // Email verification screen
  if (currentView === 'email-verification') {
    return (
      <EmailVerificationScreen 
        userEmail={pendingVerificationEmail}
        onResendEmail={handleResendEmail}
        onBackToLogin={handleBackToLogin}
      />
    )
  }

  // Show specific pages
  if (currentView === 'about') {
    return (
      <AboutPage 
        onBackClick={showLanding}
        onAboutClick={() => setCurrentView('about')}
        onContactClick={() => setCurrentView('contact')}
        onNewsClick={() => setCurrentView('news')}
        onLoginClick={showLogin}
        onRegisterClick={showRegister}
      />
    )
  }
  
  if (currentView === 'contact') {
    return (
      <ContactPage 
        onBackClick={showLanding}
        onAboutClick={() => setCurrentView('about')}
        onContactClick={() => setCurrentView('contact')}
        onNewsClick={() => setCurrentView('news')}
        onLoginClick={showLogin}
        onRegisterClick={showRegister}
      />
    )
  }
  
  if (currentView === 'news') {
    return (
      <NewsPage 
        onBackClick={showLanding}
        onAboutClick={() => setCurrentView('about')}
        onContactClick={() => setCurrentView('contact')}
        onNewsClick={() => setCurrentView('news')}
        onLoginClick={showLogin}
        onRegisterClick={showRegister}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader 
        onLoginClick={showLogin}
        onRegisterClick={showRegister}
        onLogoClick={showLanding}
        onAboutClick={() => setCurrentView('about')}
        onContactClick={() => setCurrentView('contact')}
        onNewsClick={() => setCurrentView('news')}
      />
      <main>
        {currentView === 'landing' && <LandingPage onLoginClick={showLogin} onRegisterClick={showRegister} />}
        {currentView === 'login' && <LoginScreen onLogin={handleLogin} onBackClick={showLanding} />}
        {currentView === 'register' && <RegisterScreen onRegisterSuccess={handleRegister} onBackClick={showLanding} />}
      </main>
    </div>
  )
}

export default App
