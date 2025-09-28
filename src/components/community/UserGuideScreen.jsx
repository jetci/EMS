import React from 'react'
import { Button } from '@/components/ui/button.jsx'
import CommunityLayout from '../layouts/CommunityLayout.jsx'

const UserGuideScreen = ({ user, onNavigate }) => {
  return (
    <CommunityLayout user={user} onNavigate={onNavigate} currentPage="user-guide">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">คู่มือการใช้งาน</h1>
          <p className="text-gray-600">คู่มือและวิธีการใช้งานระบบ WeCareEMS</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">การใช้งานเบื้องต้น</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">1. การลงทะเบียนผู้ป่วย</h3>
              <p className="text-gray-600 ml-4">กรอกข้อมูลผู้ป่วยตามขั้นตอนที่กำหนด</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">2. การติดตามรถพยาบาล</h3>
              <p className="text-gray-600 ml-4">ดูสถานะและตำแหน่งรถพยาบาลแบบเรียลไทม์</p>
            </div>
          </div>
        </div>
      </div>
    </CommunityLayout>
  )
}

export default UserGuideScreen
