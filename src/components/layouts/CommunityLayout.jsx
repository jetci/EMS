import React, { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import Sidebar from '../ui/Sidebar.jsx'

const CommunityLayout = ({ children, onNavigate, currentPage, user }) => {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setShowMenu(true)}
              variant="ghost"
              size="sm"
              className="lg:hidden"
            >
              ☰
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">W</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">WeCareEMS</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-gray-600">สวัสดี,</span>
              <span className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <Button
              onClick={() => onNavigate('login')}
              variant="outline"
              size="sm"
            >
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          showMenu={showMenu} 
          setShowMenu={setShowMenu} 
          onNavigate={onNavigate}
          currentPage={currentPage}
        />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default CommunityLayout
