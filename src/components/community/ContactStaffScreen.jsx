import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import CommunityLayout from '../layouts/CommunityLayout.jsx'

const ContactStaffScreen = ({ user, onNavigate }) => {
  const [selectedContact, setSelectedContact] = useState(null)
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
    priority: 'normal'
  })
  const [showMessageForm, setShowMessageForm] = useState(false)

  const staffContacts = [
    {
      id: 1,
      name: 'ศูนย์ควบคุมการเดินทาง',
      role: 'ศูนย์ควบคุม',
      phone: '02-123-4567',
      email: 'control@ems.healthcare.go.th',
      available: true,
      description: 'สำหรับการจองรถ ติดตามสถานะ และปัญหาเร่งด่วน',
      workingHours: '24 ชั่วโมง'
    },
    {
      id: 2,
      name: 'นาย สมชาย ใจดี',
      role: 'หัวหน้าทีมชุมชน',
      phone: '081-234-5678',
      email: 'somchai@ems.healthcare.go.th',
      available: true,
      description: 'สำหรับปัญหาเกี่ยวกับการดูแลผู้ป่วยในชุมชน',
      workingHours: '08:00 - 17:00 น.'
    },
    {
      id: 3,
      name: 'นาง สมหญิง รักดี',
      role: 'เจ้าหน้าที่ประสานงาน',
      phone: '082-345-6789',
      email: 'somying@ems.healthcare.go.th',
      available: false,
      description: 'สำหรับการประสานงานและข้อมูลทั่วไป',
      workingHours: '08:00 - 17:00 น.'
    },
    {
      id: 4,
      name: 'แผนกเทคนิค',
      role: 'ฝ่ายเทคนิค',
      phone: '02-987-6543',
      email: 'tech@ems.healthcare.go.th',
      available: true,
      description: 'สำหรับปัญหาการใช้งานระบบและเทคนิค',
      workingHours: '08:00 - 20:00 น.'
    }
  ]

  const emergencyContacts = [
    {
      name: 'หน่วยฉุกเฉิน',
      phone: '1669',
      description: 'สำหรับเหตุฉุกเฉินที่ต้องการความช่วยเหลือทันที'
    },
    {
      name: 'ศูนย์รับแจ้งเหตุฉุกเฉิน',
      phone: '191',
      description: 'สำหรับเหตุฉุกเฉินทั่วไป'
    }
  ]

  const handleCall = (phone) => {
    window.open(`tel:${phone}`)
  }

  const handleEmail = (email) => {
    window.open(`mailto:${email}`)
  }

  const handleSendMessage = (contact) => {
    setSelectedContact(contact)
    setShowMessageForm(true)
  }

  const handleSubmitMessage = (e) => {
    e.preventDefault()
    // Here you would typically send the message to the backend
    alert('ส่งข้อความเรียบร้อยแล้ว เจ้าหน้าที่จะติดต่อกลับภายใน 24 ชั่วโมง')
    setShowMessageForm(false)
    setMessageForm({ subject: '', message: '', priority: 'normal' })
    setSelectedContact(null)
  }

  const handleFormChange = (field, value) => {
    setMessageForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <CommunityLayout 
      user={user} 
      onNavigate={onNavigate} 
      currentPage="contact-staff"
    >
      <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ติดต่อเจ้าหน้าที่
            </h1>
            <p className="text-gray-600 mt-1">
              ช่องทางการติดต่อและขอความช่วยเหลือ
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

      {/* Emergency Contacts */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center">
          🚨 เหตุฉุกเฉิน
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-red-200">
              <h3 className="font-medium text-gray-900 mb-2">{contact.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{contact.description}</p>
              <Button
                onClick={() => handleCall(contact.phone)}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                📞 โทร {contact.phone}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Contacts */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            เจ้าหน้าที่ประจำ
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {staffContacts.map((contact) => (
            <div key={contact.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {contact.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      contact.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {contact.available ? 'พร้อมให้บริการ' : 'ไม่พร้อมให้บริการ'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">ตำแหน่ง:</span> {contact.role}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">เวลาทำการ:</span> {contact.workingHours}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">โทรศัพท์:</span> {contact.phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">อีเมล:</span> {contact.email}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {contact.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-6">
                  <Button
                    onClick={() => handleCall(contact.phone)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={!contact.available}
                  >
                    📞 โทร
                  </Button>
                  <Button
                    onClick={() => handleEmail(contact.email)}
                    variant="outline"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    📧 อีเมล
                  </Button>
                  <Button
                    onClick={() => handleSendMessage(contact)}
                    variant="outline"
                    className="text-purple-600 hover:text-purple-700"
                  >
                    💬 ส่งข้อความ
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Form Modal */}
      {showMessageForm && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ส่งข้อความถึง {selectedContact.name}
            </h3>
            
            <form onSubmit={handleSubmitMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ระดับความสำคัญ
                </label>
                <select
                  value={messageForm.priority}
                  onChange={(e) => handleFormChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">ไม่เร่งด่วน</option>
                  <option value="normal">ปกติ</option>
                  <option value="high">เร่งด่วน</option>
                  <option value="urgent">ฉุกเฉิน</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หัวข้อ
                </label>
                <input
                  type="text"
                  value={messageForm.subject}
                  onChange={(e) => handleFormChange('subject', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="หัวข้อข้อความ"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ข้อความ
                </label>
                <textarea
                  value={messageForm.message}
                  onChange={(e) => handleFormChange('message', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="รายละเอียดข้อความ"
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  ส่งข้อความ
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowMessageForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Contact Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-blue-800 mb-4">
          💡 เคล็ดลับการติดต่อ
        </h2>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• สำหรับเหตุฉุกเฉิน โปรดโทร 1669 ทันที</p>
          <p>• การจองรถและติดตามสถานะ ติดต่อศูนย์ควบคุมการเดินทาง</p>
          <p>• ปัญหาการใช้งานระบบ ติดต่อแผนกเทคนิค</p>
          <p>• ข้อสงสัยทั่วไป ส่งข้อความผ่านระบบหรือโทรในเวลาทำการ</p>
        </div>
      </div>
      </div>
    </CommunityLayout>
  )
}

export default ContactStaffScreen
