import React, { useState } from 'react';
import { SystemSettings } from '../types';
import SaveIcon from '../components/icons/SaveIcon';
import AlertTriangleIcon from '../components/icons/AlertTriangleIcon';
import ToggleSwitch from '../components/ui/ToggleSwitch';

// FIX: Added missing properties to the mock object to ensure it conforms to the SystemSettings interface.
const mockSettings: SystemSettings = {
    appName: 'WeCare Platform',
    organizationName: 'องค์การบริหารส่วนตำบลเวียง',
    contactEmail: 'contact@wecare.dev',
    googleRecaptchaSiteKey: 'your-recaptcha-site-key-here',
    googleRecaptchaSecretKey: 'your-recaptcha-secret-key-here',
    maintenanceMode: false,
    maintenanceMessage: 'ระบบกำลังปิดปรับปรุงชั่วคราว ขออภัยในความไม่สะดวก',
    schedulingModel: 'individual',
};

type SettingsTab = 'general' | 'ride_schedule';

const AdminSystemSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<SystemSettings>(mockSettings);
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (name: keyof SystemSettings, checked: boolean) => {
        setSettings(prev => ({...prev, [name]: checked}));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Saving settings:", settings);
        // Here you would call an API to save the settings
        alert("Settings saved successfully!");
    };
    
    const TabButton: React.FC<{ tabId: SettingsTab; label: string }> = ({ tabId, label }) => {
        const isActive = activeTab === tabId;
        return (
            <button
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tabId)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
                    isActive
                        ? 'border-b-2 border-[var(--wecare-blue)] text-[var(--wecare-blue)]'
                        : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                {label}
            </button>
        );
    };


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">ตั้งค่าระบบ</h1>
            <p className="text-gray-600">จัดการการตั้งค่าหลักของแอปพลิเคชัน</p>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton tabId="general" label="การตั้งค่าทั่วไป" />
                    <TabButton tabId="ride_schedule" label="การตั้งค่าการเดินทาง" />
                </nav>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                
                {activeTab === 'general' && (
                    <div className="space-y-8 animate-scale-in">
                        {/* General Settings */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">ข้อมูลทั่วไป</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="appName" className="block text-sm font-medium text-gray-700">ชื่อแอปพลิเคชัน</label>
                                    <input type="text" name="appName" id="appName" value={settings.appName} onChange={handleChange} className="mt-1 w-full md:w-1/2" />
                                </div>
                                <div>
                                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">อีเมลสำหรับติดต่อ (สาธารณะ)</label>
                                    <input type="email" name="contactEmail" id="contactEmail" value={settings.contactEmail} onChange={handleChange} className="mt-1 w-full md:w-1/2" />
                                </div>
                            </div>
                        </div>

                        {/* Maintenance Mode */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
                            <div className="flex items-start">
                                <AlertTriangleIcon className="h-6 w-6 text-red-500 mr-4 flex-shrink-0" />
                                <div>
                                    <h2 className="text-xl font-bold text-red-700">โหมดบำรุงรักษา</h2>
                                    <p className="text-sm text-gray-600 mt-1 mb-4">เมื่อเปิดใช้งาน ผู้ใช้ทั้งหมด (ยกเว้น Admin) จะไม่สามารถเข้าสู่ระบบได้ และจะเห็นข้อความแจ้งเตือนการบำรุงรักษา</p>
                                    <div className="flex items-center space-x-4 mb-4">
                                        <label htmlFor="maintenanceMode" className="block text-sm font-medium text-gray-700">ปิด / เปิด โหมดบำรุงรักษา</label>
                                        <ToggleSwitch
                                            name="maintenanceMode"
                                            checked={settings.maintenanceMode}
                                            onChange={(checked) => handleToggle('maintenanceMode', checked)}
                                        />
                                    </div>
                                    {settings.maintenanceMode && (
                                        <div className="animate-scale-in">
                                            <label htmlFor="maintenanceMessage" className="block text-sm font-medium text-gray-700">ข้อความที่จะแสดง</label>
                                            <textarea name="maintenanceMessage" id="maintenanceMessage" rows={3} value={settings.maintenanceMessage} onChange={handleChange} className="mt-1 w-full"></textarea>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'ride_schedule' && (
                    <div className="animate-scale-in">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">รูปแบบการจัดการตารางเวรคนขับ</h2>
                            <p className="text-sm text-gray-600 mb-4">การตั้งค่านี้จะเปลี่ยน UI ของหน้า "จัดการตารางเวร" สำหรับ Role OFFICE</p>
                            <div className="space-y-4">
                                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${settings.schedulingModel === 'individual' ? 'bg-blue-50 border-blue-400' : 'border-gray-300 hover:bg-gray-50'}`}>
                                    <input type="radio" name="schedulingModel" value="individual" checked={settings.schedulingModel === 'individual'} onChange={handleChange} className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5" />
                                    <div className="ml-4">
                                        <span className="block text-md font-semibold text-gray-800">รายบุคคล (Individual Shifts)</span>
                                        <span className="block text-sm text-gray-600 mt-1">เจ้าหน้าที่ OFFICE จะกำหนดกะการทำงาน (เช่น กะเช้า, กะบ่าย) ให้กับคนขับแต่ละคนโดยตรง</span>
                                    </div>
                                </label>
                                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${settings.schedulingModel === 'team' ? 'bg-blue-50 border-blue-400' : 'border-gray-300 hover:bg-gray-50'}`}>
                                    <input type="radio" name="schedulingModel" value="team" checked={settings.schedulingModel === 'team'} onChange={handleChange} className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5" />
                                    <div className="ml-4">
                                        <span className="block text-md font-semibold text-gray-800">แบบชุดเวร (Team-based Shifts)</span>
                                        <span className="block text-sm text-gray-600 mt-1">เจ้าหน้าที่ OFFICE จะจัดทีม (คนขับ+เจ้าหน้าที่) และกำหนดวันเข้าเวรแบบ 24 ชั่วโมงให้กับทั้งทีม</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t">
                    <button
                        type="submit"
                        className="flex items-center justify-center px-6 py-3 font-semibold text-white bg-[var(--wecare-blue)] rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                    >
                        <SaveIcon className="w-5 h-5 mr-2" />
                        <span>บันทึกการตั้งค่า</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSystemSettingsPage;