import { Button } from '@/components/ui/button.jsx'

const PublicHeader = ({ onLoginClick, onRegisterClick, onLogoClick, onAboutClick, onContactClick, onNewsClick }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={onLogoClick}
          >
            <div className="text-2xl font-bold text-blue-600">
              WeCare
            </div>
            <div className="ml-2 text-sm text-gray-600">
              EMS Platform
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={onLogoClick}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              หน้าหลัก
            </button>
            <button 
              onClick={onAboutClick}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              เกี่ยวกับเรา
            </button>
            <button 
              onClick={onNewsClick}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              ข่าวสาร
            </button>
            <button 
              onClick={onContactClick}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              ติดต่อเรา
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button 
              onClick={onRegisterClick}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              สมัครสมาชิก
            </Button>
            <Button 
              onClick={onLoginClick}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              เข้าสู่ระบบ
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default PublicHeader
