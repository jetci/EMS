import { Button } from '@/components/ui/button.jsx'

const LandingPage = ({ onLoginClick, onRegisterClick }) => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 min-h-[calc(100vh-64px)] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-600 tracking-tight">
                WeCare
              </h1>
              <p className="mt-4 text-xl sm:text-2xl text-gray-700">
                เชื่อมต่อทุกการเดินทาง เพื่อการดูแลที่ไม่สะดุด
              </p>
              <p className="mt-4 max-w-xl mx-auto lg:mx-0 text-lg text-gray-600">
                แพลตฟอร์มกลางสำหรับประสานงานการเดินทางของผู้ป่วย เชื่อมต่อระหว่างเจ้าหน้าที่ ชุมชน และคนขับรถ 
                เพื่อการเดินทางไปพบแพทย์ที่สะดวกและไว้วางใจได้
              </p>
              <div className="mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
                <Button
                  onClick={onLoginClick}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                >
                  เข้าสู่ระบบ
                </Button>
                <Button
                  onClick={onRegisterClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                >
                  สมัครสมาชิก
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg"
                >
                  เรียนรู้เพิ่มเติม
                </Button>
              </div>
            </div>
            
            {/* Illustration */}
            <div className="hidden lg:block">
              <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🚑</div>
                  <div className="text-2xl font-semibold text-gray-700">Emergency Medical Services</div>
                  <div className="text-lg text-gray-600 mt-2">ระบบบริการการแพทย์ฉุกเฉิน</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              ฟีเจอร์หลักของระบบ
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              ระบบที่ครอบคลุมทุกความต้องการในการจัดการการเดินทางของผู้ป่วย
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900">จัดการชุมชน</h3>
              <p className="mt-2 text-gray-600">
                ลงทะเบียนและจัดการข้อมูลผู้ป่วยในชุมชน
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold text-gray-900">บริการขนส่ง</h3>
              <p className="mt-2 text-gray-600">
                ประสานงานการเดินทางกับคนขับรถที่ได้รับการรับรอง
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🏥</div>
              <h3 className="text-xl font-semibold text-gray-900">เชื่อมต่อโรงพยาบาล</h3>
              <p className="mt-2 text-gray-600">
                ติดต่อประสานงานกับเจ้าหน้าที่โรงพยาบาล
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
