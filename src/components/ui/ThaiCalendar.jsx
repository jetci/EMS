import React, { useState } from 'react'

const ThaiCalendar = ({ 
  value, 
  onChange, 
  placeholder = "วว/ดด/ปปปป (พ.ศ.)", 
  maxDate = new Date(),
  minDate = new Date(1900, 0, 1),
  error = null,
  className = "",
  disabled = false,
  readOnly = false
}) => {
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarDate, setCalendarDate] = useState(new Date())

  const generateCalendarDays = () => {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      
      if (currentDate.getMonth() === month) {
        days.push(currentDate.getDate())
      } else {
        days.push(null)
      }
    }
    return days
  }

  const handleDateSelect = (day) => {
    const selectedDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day)
    
    // ตรวจสอบว่าวันที่ที่เลือกไม่เกิน maxDate และไม่น้อยกว่า minDate
    if (selectedDate > maxDate || selectedDate < minDate) {
      return
    }
    
    const buddhistYear = selectedDate.getFullYear() + 543
    const formattedDate = `${day.toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${buddhistYear}`
    
    onChange(formattedDate, selectedDate)
    setShowCalendar(false)
  }

  const isSelectedDate = (day) => {
    if (!value || !day) return false
    const [selectedDay, selectedMonth, selectedYear] = value.split('/')
    const calendarYear = calendarDate.getFullYear() + 543
    return parseInt(selectedDay) === day && 
           parseInt(selectedMonth) === calendarDate.getMonth() + 1 && 
           parseInt(selectedYear) === calendarYear
  }

  const isDisabledDate = (day) => {
    if (!day) return true
    const dateToCheck = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day)
    return dateToCheck > maxDate || dateToCheck < minDate
  }

  const canNavigateNext = () => {
    const nextMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1)
    return nextMonth <= maxDate
  }

  const canNavigatePrev = () => {
    const prevMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1)
    const lastDayPrevMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 0)
    return lastDayPrevMonth >= minDate
  }

  const handleInputClick = () => {
    if (!disabled && !readOnly) {
      setShowCalendar(!showCalendar)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : readOnly ? 'bg-gray-50 cursor-pointer' : 'cursor-pointer'}`}
        onClick={handleInputClick}
        readOnly
        disabled={disabled}
      />
      <button
        type="button"
        onClick={handleInputClick}
        disabled={disabled}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
      >
        📅
      </button>
      
      {showCalendar && !disabled && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 min-w-[280px]">
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={() => canNavigatePrev() && setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
              className={`p-1 rounded ${canNavigatePrev() ? 'hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
              disabled={!canNavigatePrev()}
            >
              ‹
            </button>
            <div className="text-sm font-medium">
              {calendarDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
            </div>
            <button
              type="button"
              onClick={() => canNavigateNext() && setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
              className={`p-1 rounded ${canNavigateNext() ? 'hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
              disabled={!canNavigateNext()}
            >
              ›
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
            <div className="font-medium text-gray-600 p-2">อา</div>
            <div className="font-medium text-gray-600 p-2">จ</div>
            <div className="font-medium text-gray-600 p-2">อ</div>
            <div className="font-medium text-gray-600 p-2">พ</div>
            <div className="font-medium text-gray-600 p-2">พฤ</div>
            <div className="font-medium text-gray-600 p-2">ศ</div>
            <div className="font-medium text-gray-600 p-2">ส</div>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => day && !isDisabledDate(day) && handleDateSelect(day)}
                className={`p-2 text-xs rounded transition-colors ${
                  !day ? 'invisible' : 
                  isDisabledDate(day) ? 'text-gray-300 cursor-not-allowed' :
                  isSelectedDate(day) ? 'bg-blue-500 text-white' : 
                  'text-gray-900 hover:bg-blue-100'
                }`}
                disabled={!day || isDisabledDate(day)}
              >
                {day || ''}
              </button>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setShowCalendar(false)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  )
}

export default ThaiCalendar
