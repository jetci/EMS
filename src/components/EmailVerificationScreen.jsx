import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

const EmailVerificationScreen = ({ 
  userEmail, 
  onResendEmail, 
  onBackToLogin, 
  isLoading = false 
}) => {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    setResendError('');
    setResendSuccess(false);
    
    try {
      const success = await onResendEmail(userEmail);
      if (success) {
        setResendSuccess(true);
        setCountdown(60); // 60 second cooldown
        setTimeout(() => setResendSuccess(false), 5000);
      } else {
        setResendError('เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error) {
      setResendError('เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ตรวจสอบอีเมลของคุณ
          </h1>
          <p className="text-gray-600">
            เราได้ส่งลิงก์ยืนยันไปยังอีเมลของคุณแล้ว
          </p>
        </div>

        {/* Email Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center">
            <Mail className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-700 font-medium">{userEmail}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">ขั้นตอนถัดไป:</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
              เปิดอีเมลของคุณ
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
              ค้นหาอีเมลจาก "ระบบ EMS WeCare"
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
              คลิกปุ่ม "ยืนยันอีเมลของฉัน"
            </li>
          </ol>
        </div>

        {/* Success Message */}
        {resendSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 text-sm">
                ส่งอีเมลยืนยันใหม่เรียบร้อยแล้ว!
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {resendError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800 text-sm">{resendError}</span>
            </div>
          </div>
        )}

        {/* Resend Button */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">ไม่ได้รับอีเมล?</p>
          <button
            onClick={handleResendEmail}
            disabled={resendLoading || countdown > 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {resendLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                กำลังส่ง...
              </>
            ) : countdown > 0 ? (
              `ส่งใหม่ได้ใน ${countdown} วินาที`
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                ส่งอีเมลยืนยันใหม่
              </>
            )}
          </button>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-yellow-800 mb-2">💡 เคล็ดลับ:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• ตรวจสอบโฟลเดอร์ Spam หรือ Junk Mail</li>
            <li>• อีเมลอาจใช้เวลา 2-3 นาทีในการส่ง</li>
            <li>• ลิงก์ยืนยันจะหมดอายุใน 24 ชั่วโมง</li>
          </ul>
        </div>

        {/* Back to Login */}
        <button
          onClick={onBackToLogin}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับไปหน้าเข้าสู่ระบบ
        </button>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            หากยังมีปัญหา กรุณาติดต่อเจ้าหน้าที่
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationScreen;
