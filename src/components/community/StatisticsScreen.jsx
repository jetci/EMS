import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button.jsx'
import CommunityLayout from '../layouts/CommunityLayout.jsx'

const StatisticsScreen = ({ user, onNavigate }) => {
  const [chartData, setChartData] = useState([
    { name: 'ม.ค.', 'บริการสำเร็จ': 4000, 'บริการรอดำเนินการ': 2400 },
    { name: 'ก.พ.', 'บริการสำเร็จ': 3000, 'บริการรอดำเนินการ': 1398 },
    { name: 'มี.ค.', 'บริการสำเร็จ': 2000, 'บริการรอดำเนินการ': 9800 },
    { name: 'เม.ย.', 'บริการสำเร็จ': 2780, 'บริการรอดำเนินการ': 3908 },
    { name: 'พ.ค.', 'บริการสำเร็จ': 1890, 'บริการรอดำเนินการ': 4800 },
    { name: 'มิ.ย.', 'บริการสำเร็จ': 2390, 'บริการรอดำเนินการ': 3800 },
    { name: 'ก.ค.', 'บริการสำเร็จ': 3490, 'บริการรอดำเนินการ': 4300 },
  ]);
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

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">สถิติการใช้บริการรายเดือน</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="บริการสำเร็จ" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="บริการรอดำเนินการ" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </CommunityLayout>
  )
}

export default StatisticsScreen
