import { Button } from '@/components/ui/button.jsx'
import PublicHeader from '../PublicHeader'

const NewsPage = ({ onBackClick, onAboutClick, onContactClick, onNewsClick, onLoginClick, onRegisterClick }) => {
  const newsItems = [
    {
      id: 1,
      title: "เปิดตัวระบบ WeCare EMS Platform อย่างเป็นทางการ",
      date: "26 กันยายน 2568",
      category: "ข่าวประชาสัมพันธ์",
      summary: "องค์การบริหารส่วนตำบลเวียง เปิดตัวระบบบริการการแพทย์ฉุกเฉินออนไลน์ เพื่อให้บริการประชาชนได้อย่างรวดเร็วและมีประสิทธิภาพ",
      image: "📢"
    },
    {
      id: 2,
      title: "การอบรมการใช้งานระบบสำหรับเจ้าหน้าที่",
      date: "20 กันยายน 2568",
      category: "การอบรม",
      summary: "จัดการอบรมการใช้งานระบบ WeCare สำหรับเจ้าหน้าที่และผู้ขับขี่รถพยาบาล เพื่อให้สามารถใช้งานได้อย่างมีประสิทธิภาพ",
      image: "👨‍🏫"
    },
    {
      id: 3,
      title: "ขยายพื้นที่บริการครอบคลุมทั้งตำบลเวียง",
      date: "15 กันยายน 2568",
      category: "ข่าวบริการ",
      summary: "ระบบ WeCare ขยายพื้นที่บริการครอบคลุมทุกหมู่บ้านในตำบลเวียง พร้อมเพิ่มจำนวนรถพยาบาลให้บริการ",
      image: "🚑"
    },
    {
      id: 4,
      title: "คู่มือการใช้งานสำหรับประชาชน",
      date: "10 กันยายน 2568",
      category: "คู่มือ",
      summary: "เผยแพร่คู่มือการใช้งานระบบ WeCare สำหรับประชาชน พร้อมวิดีโอสาธิตการใช้งานแบบง่ายๆ",
      image: "📖"
    },
    {
      id: 5,
      title: "การบำรุงรักษาระบบประจำเดือน",
      date: "5 กันยายน 2568",
      category: "ประกาศ",
      summary: "แจ้งกำหนดการบำรุงรักษาระบบประจำเดือน วันที่ 1 ตุลาคม 2568 เวลา 02:00-04:00 น.",
      image: "🔧"
    },
    {
      id: 6,
      title: "สถิติการใช้บริการเดือนสิงหาคม",
      date: "1 กันยายน 2568",
      category: "รายงาน",
      summary: "รายงานสถิติการใช้บริการระบบ WeCare ในเดือนสิงหาคม มีการใช้บริการเพิ่มขึ้น 25% จากเดือนก่อน",
      image: "📊"
    }
  ]

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
          <h1 className="text-3xl font-bold text-gray-900">ข่าวสาร</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured News */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">📢</span>
              <div>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                  ข่าวประชาสัมพันธ์
                </span>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">
              เปิดตัวระบบ WeCare EMS Platform อย่างเป็นทางการ
            </h2>
            <p className="text-blue-100 mb-4 leading-relaxed">
              องค์การบริหารส่วนตำบลเวียง เปิดตัวระบบบริการการแพทย์ฉุกเฉินออนไลน์ 
              เพื่อให้บริการประชาชนได้อย่างรวดเร็วและมีประสิทธิภาพ พร้อมให้บริการตลอด 24 ชั่วโมง
            </p>
            <div className="flex items-center text-blue-200">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0a1 1 0 00-1 1v10a1 1 0 001 1h6a1 1 0 001-1V8a1 1 0 00-1-1" />
              </svg>
              26 กันยายน 2568
            </div>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.slice(1).map((news) => (
            <div key={news.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{news.image}</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {news.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {news.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {news.summary}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0a1 1 0 00-1 1v10a1 1 0 001 1h6a1 1 0 001-1V8a1 1 0 00-1-1" />
                    </svg>
                    {news.date}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    อ่านต่อ
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button 
            variant="outline"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            โหลดข่าวเพิ่มเติม
          </Button>
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-16 bg-gray-100 rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              รับข่าวสารล่าสุด
            </h3>
            <p className="text-gray-600 mb-6">
              สมัครรับข่าวสารและการอัปเดตจากระบบ WeCare
            </p>
            
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="กรอกอีเมลของคุณ"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                สมัคร
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsPage
