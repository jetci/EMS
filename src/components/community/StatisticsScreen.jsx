import React from 'react'
import { Button } from '@/components/ui/button.jsx'
import CommunityLayout from '../layouts/CommunityLayout.jsx'

const StatisticsScreen = ({ user, onNavigate }) => {
  return (
    <CommunityLayout user={user} onNavigate={onNavigate} currentPage="statistics">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">รายงานสถิติ</h1>
          <p className="text-gray-600">สถิติการใช้บริการและข้อมูลต่างๆ</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-2">🚑</div>
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-gray-600">การใช้บริการทั้งหมด</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600">10</div>
            <div className="text-gray-600">สำเร็จ</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-2xl font-bold text-orange-600">2</div>
            <div className="text-gray-600">รอดำเนินการ</div>
          </div>
        </div>
      </div>
    </CommunityLayout>
  )
}

export default StatisticsScreen
