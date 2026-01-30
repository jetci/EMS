import React from 'react';
import BuildingIcon from './icons/BuildingIcon';
import PhoneIcon from './icons/PhoneIcon';

const PublicFooter: React.FC = () => {
    return (
        <footer className="bg-[#005A9C] text-white">
            <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm">
                    {/* Organization Information */}
                    <div className="lg:col-span-2">
                        <h3 className="text-base font-semibold tracking-wider uppercase">องค์การบริหารส่วนตำบลเวียง</h3>
                        <div className="mt-4 space-y-3">
                            <div className="flex items-start">
                                <BuildingIcon className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                                <span>เลขที่ 666 ถ.รอบเวียงสุทโธ ม.3 ต.เวียง อ.ฝาง จ.เชียงใหม่ 50110</span>
                            </div>
                            <div className="flex items-start">
                                <PhoneIcon className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                                <span>โทรศัพท์: 053-382670, โทรสาร (FAX): 053-382670</span>
                            </div>
                        </div>
                    </div>
                    {/* Developer Credit */}
                    <div>
                        <h3 className="text-base font-semibold tracking-wider uppercase">ผู้พัฒนา</h3>
                        <p className="mt-4">เจษฎา มูลมาวัน (ผู้ช่วยนักวิชาการคอมพิวเตอร์)</p>
                    </div>
                </div>
                <div className="mt-8 border-t border-blue-700 pt-6 text-center text-xs text-blue-200">
                    <p>&copy; 2568 องค์การบริหารส่วนตำบลเวียง. สงวนลิขสิทธิ์</p>
                </div>
            </div>
        </footer>
    )
}

export default PublicFooter;