import React from 'react';
import MissionIcon from './icons/MissionIcon';
import BuildingIcon from './icons/BuildingIcon';
import UserIcon from './icons/UserIcon';

const AboutUsScreen: React.FC = () => {
  return (
    <div className="bg-white text-gray-800 pt-16">
      <main>
        <section className="py-16 sm:py-24 bg-[#F0F4F8]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#005A9C]">
                เกี่ยวกับ WeCare
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                เรามุ่งมั่นที่จะลดช่องว่างในการเข้าถึงบริการสุขภาพ
                ด้วยการสร้างแพลตฟอร์มที่เชื่อมโยงทุกการเดินทางของผู้ป่วยให้เป็นไปอย่างราบรื่นและปลอดภัย
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {/* Our Mission */}
            <div className="text-center">
              <div className="inline-block bg-[#005A9C] p-4 rounded-full">
                <MissionIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="mt-4 text-3xl font-bold text-[#005A9C]">ภารกิจของเรา</h2>
              <p className="mt-4 max-w-3xl mx-auto text-gray-700 text-lg">
                เพื่อสร้างระบบประสานงานการเดินทางที่มีประสิทธิภาพและน่าเชื่อถือ
                สำหรับผู้ป่วยที่ต้องการการดูแลเป็นพิเศษ
                โดยเชื่อมต่อเครือข่ายคนขับรถอาสาสมัครเข้ากับหน่วยงานสาธารณสุขและชุมชน
                เพื่อให้ผู้ป่วยทุกคนได้รับการดูแลที่ไม่สะดุด
              </p>
            </div>
            
            <div className="border-t border-gray-200 pt-16">
              <h2 className="text-3xl font-bold text-center text-[#005A9C] mb-12">บุคลากรสำคัญเบื้องหลังโครงการ</h2>
              <div className="grid grid-cols-1 gap-10">
                {/* Project Leadership */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col sm:flex-row items-center p-6 border border-gray-100">
                  <img
                    src="https://i.pravatar.cc/150?u=varaporn"
                    alt="นางสาววราภรณ์ พรหมสุวรรณ์"
                    className="w-32 h-32 rounded-full flex-shrink-0 object-cover border-4 border-[#005A9C]"
                  />
                  <div className="mt-6 sm:mt-0 sm:ml-8 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-gray-900">นางสาววราภรณ์ พรหมสุวรรณ์</h3>
                    <p className="text-md font-semibold text-[#005A9C]">นายกองค์การบริหารส่วนตำบลเวียง</p>
                    <p className="mt-2 text-gray-600 italic">
                      "ผู้ผลักดันโครงการ และวางแผนแนวนโยบายการพัฒนา"
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Responsible Organization */}
                    <div className="bg-[#F0F4F8] p-6 rounded-xl text-center">
                        <div className="inline-flex items-center justify-center bg-white p-3 rounded-full shadow-md">
                            <BuildingIcon className="h-8 w-8 text-[#005A9C]" />
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-gray-800">หน่วยงานผู้รับผิดชอบ</h3>
                        <p className="mt-1 text-gray-600">องค์การบริหารส่วนตำบลเวียง</p>
                    </div>

                    {/* Developer */}
                    <div className="bg-[#F0F4F8] p-6 rounded-xl text-center">
                        <div className="inline-flex items-center justify-center bg-white p-3 rounded-full shadow-md">
                            <UserIcon className="h-8 w-8 text-[#005A9C]" />
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-gray-800">ผู้พัฒนา</h3>
                        <p className="mt-1 text-gray-600">เจษฎา มูลมาวัน</p>
                        <p className="text-sm text-gray-500">ผู้ช่วยนักวิชาการคอมพิวเตอร์, สังกัด สำนักปลัด</p>
                    </div>
                </div>

              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutUsScreen;
