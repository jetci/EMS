import React, { useState } from 'react';
import MenuIcon from './icons/MenuIcon';
import XIcon from './icons/XIcon';

interface PublicHeaderProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogoClick: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
  // FIX: Add missing onNewsClick prop to handle navigation to the news page.
  onNewsClick: () => void;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({
  onLoginClick,
  onRegisterClick,
  onLogoClick,
  onAboutClick,
  onContactClick,
  onNewsClick,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = (
    <>
      <button onClick={() => { onAboutClick(); setIsMenuOpen(false); }} className="text-gray-600 hover:text-[#005A9C] px-3 py-2 rounded-md text-sm font-medium text-left">เกี่ยวกับเรา</button>
      <button onClick={() => { onContactClick(); setIsMenuOpen(false); }} className="text-gray-600 hover:text-[#005A9C] px-3 py-2 rounded-md text-sm font-medium text-left">ติดต่อเรา</button>
      {/* FIX: Add a button for news navigation. */}
      <button onClick={() => { onNewsClick(); setIsMenuOpen(false); }} className="text-gray-600 hover:text-[#005A9C] px-3 py-2 rounded-md text-sm font-medium text-left">ข่าวสาร</button>
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button onClick={onLogoClick} className="text-2xl font-bold text-[#005A9C]">
              WeCare
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks}
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={onLoginClick}
              className="text-[#005A9C] border border-[#005A9C] px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition duration-300"
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={onRegisterClick}
              className="bg-[#005A9C] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition duration-300"
            >
              สมัครสมาชิก
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            {navLinks}
          </div>
          <div className="px-4 pb-4 border-t border-gray-200">
             <div className="mt-4 flex flex-col space-y-3">
                <button
                onClick={() => { onLoginClick(); setIsMenuOpen(false); }}
                className="w-full text-center text-[#005A9C] border border-[#005A9C] px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition duration-300"
                >
                เข้าสู่ระบบ
                </button>
                <button
                onClick={() => { onRegisterClick(); setIsMenuOpen(false); }}
                className="w-full text-center bg-[#005A9C] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition duration-300"
                >
                สมัครสมาชิก
                </button>
             </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;