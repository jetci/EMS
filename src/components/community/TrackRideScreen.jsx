import React, { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import CommunityLayout from '../layouts/CommunityLayout.jsx'

const TrackRideScreen = ({ user, onNavigate }) => {
  const [trackingCode, setTrackingCode] = useState('')

  return (
    <CommunityLayout user={user} onNavigate={onNavigate} currentPage="track-ride">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ติดตามรถพยาบาล</h1>
          <p className="text-gray-600">ติดตามสถานะและตำแหน่งรถพยาบาลแบบเรียลไทม์</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รหัสติดตาม
            </label>
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="กรอกรหัสติดตาม"
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            ติดตาม
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">สถานะปัจจุบัน</h2>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🚑</div>
            <p className="text-gray-600">กรุณากรอกรหัสติดตามเพื่อดูสถานะ</p>
          </div>
        </div>
      </div>
    </CommunityLayout>
  )
}

export default TrackRideScreen
