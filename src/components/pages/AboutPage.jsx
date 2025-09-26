import { Button } from '@/components/ui/button.jsx'
import PublicHeader from '../PublicHeader'

const AboutPage = ({ onBackClick, onAboutClick, onContactClick, onNewsClick, onLoginClick, onRegisterClick }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <PublicHeader 
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
        onLogoClick={onBackClick}
        onAboutClick={onAboutClick}
        onContactClick={onContactClick}
        onNewsClick={onNewsClick}
      />
      
      {/* Page Title */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">เกี่ยวกับเรา</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ระบบบริการการแพทย์ฉุกเฉิน WeCare
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                WeCare เป็นแพลตฟอร์มการจัดการบริการการแพทย์ฉุกเฉินที่ครอบคลุม 
                ออกแบบมาเพื่อเชื่อมต่อชุมชน เจ้าหน้าที่การแพทย์ และผู้ขับขี่รถพยาบาล 
                เข้าด้วยกันในระบบเดียว
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                เราให้บริการการลงทะเบียนผู้ป่วย การจองรถพยาบาล การติดตามสถานะ 
                และการจัดการข้อมูลการแพทย์อย่างมีประสิทธิภาพ
              </p>
              <p className="text-gray-700 leading-relaxed">
                ด้วยเทคโนโลยีที่ทันสมัยและการออกแบบที่เน้นผู้ใช้เป็นศูนย์กลาง 
                WeCare ช่วยให้การเข้าถึงบริการการแพทย์ฉุกเฉินเป็นไปอย่างรวดเร็วและมีประสิทธิภาพ
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                บริการหลักของเรา
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">การลงทะเบียนผู้ป่วย</h4>
                    <p className="text-gray-600 text-sm">จัดการข้อมูลผู้ป่วยและประวัติการรักษา</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">การจองรถพยาบาล</h4>
                    <p className="text-gray-600 text-sm">จองและจัดการการเดินทางด้วยรถพยาบาล</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">การติดตามสถานะ</h4>
                    <p className="text-gray-600 text-sm">ติดตามสถานะการเดินทางแบบเรียลไทม์</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">4</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">การจัดการข้อมูล</h4>
                    <p className="text-gray-600 text-sm">ระบบจัดการข้อมูลที่ปลอดภัยและมีประสิทธิภาพ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-blue-50 rounded-lg p-8">
            <h3 className="text-xl font-bold text-blue-900 mb-4">พันธกิจ</h3>
            <p className="text-blue-800 leading-relaxed">
              มุ่งมั่นที่จะพัฒนาระบบบริการการแพทย์ฉุกเฉินที่มีคุณภาพ 
              เพื่อให้ทุกคนสามารถเข้าถึงการรักษาพยาบาลได้อย่างรวดเร็วและมีประสิทธิภาพ
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-8">
            <h3 className="text-xl font-bold text-green-900 mb-4">วิสัยทัศน์</h3>
            <p className="text-green-800 leading-relaxed">
              เป็นแพลตฟอร์มชั้นนำในการจัดการบริการการแพทย์ฉุกเฉิน 
              ที่ช่วยยกระดับคุณภาพชีวิตและความปลอดภัยของประชาชน
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
