import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'

const LoginScreen = ({ onLogin, onBackClick }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await onLogin(email, password)
      if (!success) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth login
    alert('ฟีเจอร์เข้าสู่ระบบด้วย Google จะพร้อมใช้งานเร็วๆ นี้')
  }

  const quickLogin = (userEmail, userPassword) => {
    setEmail(userEmail)
    setPassword(userPassword)
    onLogin(userEmail, userPassword)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            เข้าสู่ระบบ WeCare
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ระบบบริการการแพทย์ฉุกเฉิน
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                อีเมล
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="กรุณาใส่อีเมล"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                รหัสผ่าน
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="กรุณาใส่รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">หรือ</span>
            </div>
          </div>

          <div>
            <Button
              type="button"
              onClick={handleGoogleLogin}
              variant="outline"
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              เข้าสู่ระบบด้วย Google
            </Button>
          </div>

          {/* Quick Login Buttons for Development */}
          <div className="mt-6">
            <div className="text-center text-sm text-gray-600 mb-3">
              บัญชีทดสอบ (สำหรับการพัฒนา)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => quickLogin('driver1@wecare.dev', 'password')}
                className="text-xs"
              >
                คนขับรถ
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => quickLogin('community1@wecare.dev', 'password')}
                className="text-xs"
              >
                ชุมชน
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => quickLogin('office1@wecare.dev', 'password')}
                className="text-xs"
              >
                เจ้าหน้าที่
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => quickLogin('admin@wecare.dev', 'password')}
                className="text-xs"
              >
                ผู้ดูแลระบบ
              </Button>
            </div>
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={onBackClick}
              className="text-blue-600 hover:text-blue-500"
            >
              ← กลับหน้าหลัก
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginScreen
