import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'

const UserGuideScreen = ({ user, onNavigate }) => {
  const [selectedSection, setSelectedSection] = useState('overview')

  const guideContent = {
    overview: {
      title: 'ภาพรวมระบบ',
      icon: '📋',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">ยินดีต้อนรับสู่ระบบ WeCare EMS</h3>
          <p className="text-gray-700">
            ระบบ WeCare EMS เป็นระบบจัดการการเดินทางสำหรับผู้ป่วยในชุมชน ที่ช่วยให้คุณสามารถ:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>ลงทะเบียนและจัดการข้อมูลผู้ป่วย</li>
            <li>จองรถสำหรับการเดินทางไปโรงพยาบาล</li>
            <li>ติดตามสถานะการเดินทางแบบเรียลไทม์</li>
            <li>ดูประวัติการใช้บริการ</li>
            <li>รับการแจ้งเตือนสำคัญ</li>
            <li>ติดต่อเจ้าหน้าที่เมื่อต้องการความช่วยเหลือ</li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              💡 <strong>เคล็ดลับ:</strong> ใช้เมนูด้านบนเพื่อเข้าถึงฟีเจอร์ต่างๆ ได้อย่างรวดเร็ว
            </p>
          </div>
        </div>
      )
    },
    registration: {
      title: 'การลงทะเบียนผู้ป่วย',
      icon: '👥',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">วิธีการลงทะเบียนผู้ป่วยใหม่</h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
              <div>
                <p className="font-medium text-gray-900">คลิกปุ่ม "ลงทะเบียนผู้ป่วยใหม่"</p>
                <p className="text-gray-600 text-sm">จากหน้าหลักหรือการดำเนินการด่วน</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
              <div>
                <p className="font-medium text-gray-900">กรอกข้อมูลส่วนบุคคล</p>
                <p className="text-gray-600 text-sm">ชื่อ-นามสกุล, อายุ, เพศ, เลขบัตรประชาชน</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
              <div>
                <p className="font-medium text-gray-900">กรอกข้อมูลการติดต่อ</p>
                <p className="text-gray-600 text-sm">หมายเลขโทรศัพท์, ที่อยู่, ผู้ติดต่อฉุกเฉิน</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">4</span>
              <div>
                <p className="font-medium text-gray-900">ระบุข้อมูลทางการแพทย์</p>
                <p className="text-gray-600 text-sm">โรคประจำตัว, ยาที่แพ้, ข้อมูลสำคัญอื่นๆ</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">5</span>
              <div>
                <p className="font-medium text-gray-900">ตรวจสอบและบันทึก</p>
                <p className="text-gray-600 text-sm">ตรวจสอบความถูกต้องแล้วคลิก "บันทึกข้อมูล"</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>หมายเหตุ:</strong> ข้อมูลที่มี * เป็นข้อมูลที่จำเป็นต้องกรอก
            </p>
          </div>
        </div>
      )
    },
    booking: {
      title: 'การจองรถ',
      icon: '🚗',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">วิธีการจองรถสำหรับผู้ป่วย</h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
              <div>
                <p className="font-medium text-gray-900">เลือกผู้ป่วย</p>
                <p className="text-gray-600 text-sm">เลือกผู้ป่วยจากรายการหรือคลิก "จองรถ" ข้างชื่อผู้ป่วย</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
              <div>
                <p className="font-medium text-gray-900">เลือกจุดหมาย</p>
                <p className="text-gray-600 text-sm">เลือกโรงพยาบาลหรือสถานพยาบาลที่ต้องการไป</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
              <div>
                <p className="font-medium text-gray-900">กำหนดวันและเวลา</p>
                <p className="text-gray-600 text-sm">เลือกวันที่และเวลาที่ต้องการเดินทาง</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">4</span>
              <div>
                <p className="font-medium text-gray-900">ระบุรายละเอียดเพิ่มเติม</p>
                <p className="text-gray-600 text-sm">ความต้องการพิเศษ, อุปกรณ์ที่ต้องการ</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">5</span>
              <div>
                <p className="font-medium text-gray-900">ยืนยันการจอง</p>
                <p className="text-gray-600 text-sm">ตรวจสอบข้อมูลและคลิก "ยืนยันการจอง"</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              ✅ <strong>เคล็ดลับ:</strong> จองล่วงหน้าอย่างน้อย 24 ชั่วโมงเพื่อให้มั่นใจว่าจะมีรถพร้อมให้บริการ
            </p>
          </div>
        </div>
      )
    },
    tracking: {
      title: 'การติดตามสถานะ',
      icon: '📍',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">วิธีการติดตามสถานะการเดินทาง</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">สถานะต่างๆ ที่อาจพบ:</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">รอจัดรถ</span>
                  <span className="text-gray-600 text-sm">ระบบกำลังหารถและคนขับ</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">จัดรถแล้ว</span>
                  <span className="text-gray-600 text-sm">มีรถและคนขับพร้อมแล้ว</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">กำลังเดินทาง</span>
                  <span className="text-gray-600 text-sm">คนขับกำลังเดินทางไปรับหรือส่ง</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">เสร็จสิ้น</span>
                  <span className="text-gray-600 text-sm">การเดินทางเสร็จสิ้นแล้ว</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">วิธีการติดตาม:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>คลิกปุ่ม "ติดตามสถานะ" ในรายการการเดินทาง</li>
                <li>ดูข้อมูลคนขับและรถที่จัดให้</li>
                <li>ติดตามตำแหน่งรถแบบเรียลไทม์ (ถ้ามี)</li>
                <li>รับการแจ้งเตือนเมื่อสถานะเปลี่ยนแปลง</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              📱 <strong>การแจ้งเตือน:</strong> คุณจะได้รับการแจ้งเตือนผ่านระบบเมื่อสถานะเปลี่ยนแปลง
            </p>
          </div>
        </div>
      )
    },
    notifications: {
      title: 'การแจ้งเตือน',
      icon: '🔔',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">การจัดการการแจ้งเตือน</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">ประเภทการแจ้งเตือน:</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <p className="font-medium text-gray-900">การจองสำเร็จ</p>
                    <p className="text-gray-600 text-sm">เมื่อการจองรถได้รับการยืนยัน</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xl">ℹ️</span>
                  <div>
                    <p className="font-medium text-gray-900">ข้อมูลการเดินทาง</p>
                    <p className="text-gray-600 text-sm">ข้อมูลคนขับ รถ และเวลาเดินทาง</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-medium text-gray-900">การเปลี่ยนแปลง</p>
                    <p className="text-gray-600 text-sm">เมื่อมีการเปลี่ยนแปลงหรือยกเลิก</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xl">⏰</span>
                  <div>
                    <p className="font-medium text-gray-900">การแจ้งเตือนล่วงหน้า</p>
                    <p className="text-gray-600 text-sm">แจ้งเตือนก่อนเวลานัดหมาย</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">การตั้งค่าการแจ้งเตือน:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>เข้าไปที่เมนู "ตั้งค่าการแจ้งเตือน"</li>
                <li>เลือกประเภทการแจ้งเตือนที่ต้องการ</li>
                <li>กำหนดเวลาการแจ้งเตือนล่วงหน้า</li>
                <li>เลือกช่องทางการแจ้งเตือน (ระบบ, อีเมล, SMS)</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    troubleshooting: {
      title: 'การแก้ไขปัญหา',
      icon: '🔧',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">ปัญหาที่พบบ่อยและวิธีแก้ไข</h3>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">ไม่สามารถจองรถได้</h4>
              <div className="text-gray-700 text-sm space-y-1">
                <p><strong>สาเหตุที่เป็นไปได้:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>ไม่มีรถว่างในช่วงเวลาที่ต้องการ</li>
                  <li>ข้อมูลผู้ป่วยไม่ครบถ้วน</li>
                  <li>ปัญหาการเชื่อมต่ออินเทอร์เน็ต</li>
                </ul>
                <p><strong>วิธีแก้ไข:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>ลองเลือกเวลาอื่น</li>
                  <li>ตรวจสอบข้อมูลผู้ป่วย</li>
                  <li>รีเฟรชหน้าเว็บ</li>
                  <li>ติดต่อเจ้าหน้าที่</li>
                </ul>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">ไม่ได้รับการแจ้งเตือน</h4>
              <div className="text-gray-700 text-sm space-y-1">
                <p><strong>วิธีแก้ไข:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>ตรวจสอบการตั้งค่าการแจ้งเตือน</li>
                  <li>ตรวจสอบหมายเลขโทรศัพท์และอีเมล</li>
                  <li>ดูในโฟลเดอร์ Spam ของอีเมล</li>
                  <li>ติดต่อแผนกเทคนิค</li>
                </ul>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">ลืมรหัสผ่าน</h4>
              <div className="text-gray-700 text-sm space-y-1">
                <p><strong>วิธีแก้ไข:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>คลิก "ลืมรหัสผ่าน" ในหน้าเข้าสู่ระบบ</li>
                  <li>กรอกอีเมลที่ลงทะเบียนไว้</li>
                  <li>ตรวจสอบอีเมลและทำตามขั้นตอน</li>
                  <li>หากยังไม่ได้ ติดต่อเจ้าหน้าที่</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              🆘 <strong>ต้องการความช่วยเหลือเพิ่มเติม?</strong> ติดต่อเจ้าหน้าที่ผ่านเมนู "ติดต่อเจ้าหน้าที่"
            </p>
          </div>
        </div>
      )
    }
  }

  const menuItems = [
    { key: 'overview', title: 'ภาพรวมระบบ', icon: '📋' },
    { key: 'registration', title: 'การลงทะเบียนผู้ป่วย', icon: '👥' },
    { key: 'booking', title: 'การจองรถ', icon: '🚗' },
    { key: 'tracking', title: 'การติดตามสถานะ', icon: '📍' },
    { key: 'notifications', title: 'การแจ้งเตือน', icon: '🔔' },
    { key: 'troubleshooting', title: 'การแก้ไขปัญหา', icon: '🔧' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              คู่มือการใช้งาน
            </h1>
            <p className="text-gray-600 mt-1">
              วิธีการใช้งานระบบ WeCare EMS อย่างละเอียด
            </p>
          </div>
          <Button
            onClick={() => onNavigate('dashboard')}
            variant="outline"
          >
            ← กลับหน้าหลัก
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">หัวข้อ</h2>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSelectedSection(item.key)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedSection === item.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">{guideContent[selectedSection].icon}</span>
              <h2 className="text-xl font-bold text-gray-900">
                {guideContent[selectedSection].title}
              </h2>
            </div>
            
            <div className="prose max-w-none">
              {guideContent[selectedSection].content}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          การดำเนินการด่วน
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={() => onNavigate('register-patient')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            👥 ลงทะเบียนผู้ป่วย
          </Button>
          <Button 
            onClick={() => onNavigate('book-ride')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            🚗 จองรถ
          </Button>
          <Button 
            onClick={() => onNavigate('contact-staff')}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            📞 ติดต่อเจ้าหน้าที่
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UserGuideScreen
