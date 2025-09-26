import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Users, ArrowRight } from 'lucide-react';

const EmailVerificationSuccess = ({ user, onContinueToLogin }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onContinueToLogin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onContinueToLogin]);

  const getStatusInfo = (verificationStatus) => {
    switch (verificationStatus) {
      case 'pending_verification':
        return {
          icon: <Clock className="w-6 h-6 text-yellow-600" />,
          title: 'รอการตรวจสอบ',
          description: 'บัญชีของคุณอยู่ในสถานะรอการตรวจสอบโดยเจ้าหน้าที่',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      case 'verified':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          title: 'ยืนยันแล้ว',
          description: 'บัญชีของคุณได้รับการยืนยันและพร้อมใช้งานเต็มรูปแบบ',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      default:
        return {
          icon: <Users className="w-6 h-6 text-blue-600" />,
          title: 'ยืนยันเรียบร้อย',
          description: 'อีเมลของคุณได้รับการยืนยันแล้ว',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        };
    }
  };

  const statusInfo = getStatusInfo(user?.verification_status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ยืนยันอีเมลสำเร็จ! 🎉
          </h1>
          <p className="text-gray-600">
            ขอบคุณที่ยืนยันอีเมลของคุณ
          </p>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-1">
              สวัสดี {user?.name}!
            </h3>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>

        {/* Status Info */}
        <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-4 mb-6`}>
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              {statusInfo.icon}
            </div>
            <div>
              <h4 className={`font-semibold ${statusInfo.textColor} mb-1`}>
                {statusInfo.title}
              </h4>
              <p className={`text-sm ${statusInfo.textColor}`}>
                {statusInfo.description}
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">ขั้นตอนถัดไป:</h3>
          
          {user?.verification_status === 'pending_verification' ? (
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">เข้าสู่ระบบได้แล้ว</p>
                  <p className="text-xs text-gray-500">คุณสามารถเข้าสู่ระบบด้วยอีเมลและรหัสผ่านได้</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-yellow-100 text-yellow-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">รอการอนุมัติ</p>
                  <p className="text-xs text-gray-500">เจ้าหน้าที่จะตรวจสอบและอนุมัติบัญชีของคุณ</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">ใช้งานเต็มรูปแบบ</p>
                  <p className="text-xs text-gray-500">หลังได้รับการอนุมัติ คุณจะสามารถใช้งานได้ครบทุกฟีเจอร์</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-700">
                คุณสามารถเข้าสู่ระบบและใช้งานได้เต็มรูปแบบแล้ว!
              </p>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinueToLogin}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center mb-4"
        >
          <span>เข้าสู่ระบบ</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>

        {/* Auto redirect notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            กำลังนำคุณไปหน้าเข้าสู่ระบบใน {countdown} วินาที...
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            © 2025 ระบบ EMS WeCare - ระบบบริการการแพทย์ฉุกเฉิน
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationSuccess;
