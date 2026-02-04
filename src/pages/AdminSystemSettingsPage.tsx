import React, { useState, useEffect } from 'react';
import { SystemSettings, User } from '../types';
import SaveIcon from '../components/icons/SaveIcon';
import AlertTriangleIcon from '../components/icons/AlertTriangleIcon';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import UploadIcon from '../components/icons/UploadIcon';
import TrashIcon from '../components/icons/TrashIcon';
import { getAppSettings } from '../utils/settings';
import { apiRequest } from '../services/api';

type SettingsTab = 'general' | 'api' | 'ride_schedule' | 'developer';

interface AdminSystemSettingsPageProps {
    currentUser: User;
}

const AdminSystemSettingsPage: React.FC<AdminSystemSettingsPageProps> = ({ currentUser }) => {
    const [settings, setSettings] = useState<SystemSettings>(getAppSettings());
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await apiRequest('/admin/settings');
            if (data) setSettings(data);
        } catch (err) {
            console.error('Failed to load settings', err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleToggle = (name: keyof SystemSettings, checked: boolean) => {
        setSettings(prev => ({ ...prev, [name]: checked }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setSettings(prev => ({ ...prev, logoUrl: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await apiRequest('/admin/settings', {
                method: 'PUT',
                body: JSON.stringify(settings)
            });

            // Also update localStorage for immediate client-side access (compatibility)
            localStorage.setItem('wecare_appName', settings.appName);
            localStorage.setItem('wecare_organizationName', settings.organizationName);
            localStorage.setItem('wecare_organizationAddress', settings.organizationAddress || '');
            localStorage.setItem('wecare_organizationPhone', settings.organizationPhone || '');
            localStorage.setItem('wecare_contactEmail', settings.contactEmail);
            localStorage.setItem('wecare_googleMapsApiKey', settings.googleMapsApiKey);
            localStorage.setItem('wecare_mapCenterLat', String(settings.mapCenterLat));
            localStorage.setItem('wecare_mapCenterLng', String(settings.mapCenterLng));
            localStorage.setItem('wecare_developerName', settings.developerName || '');
            localStorage.setItem('wecare_developerTitle', settings.developerTitle || '');

            window.dispatchEvent(new CustomEvent('settingsChanged'));

            alert("บันทึกการตั้งค่าสำเร็จ!");
        } catch (err) {
            console.error('Failed to save settings:', err);
            alert("เกิดข้อผิดพลาดในการบันทึกการตั้งค่า");
        }
    };

    const TabButton: React.FC<{ tabId: SettingsTab; label: string }> = ({ tabId, label }) => {
        const isActive = activeTab === tabId;
        return (
            <button
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tabId)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${isActive
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
                    <TabButton tabId="api" label="API & Integration" />
                    <TabButton tabId="ride_schedule" label="การตั้งค่าการเดินทาง" />
                    {currentUser.role === 'DEVELOPER' && <TabButton tabId="developer" label="Developer Zone" />}
                </nav>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {activeTab === 'general' && (
                    <div className="space-y-8 animate-scale-in">
                        {/* General Settings */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">ข้อมูลทั่วไป</h2>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="appName" className="block text-sm font-medium text-gray-700">ชื่อแอปพลิเคชัน</label>
                                    <input type="text" name="appName" id="appName" value={settings.appName} onChange={handleChange} className="mt-1 w-full md:w-1/2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">โลโก้องค์กร</label>
                                    <div className="mt-2 flex items-center gap-6">
                                        <div className="w-32 h-16 bg-gray-100 border rounded-md flex items-center justify-center">
                                            {settings.logoUrl ? (
                                                <img src={settings.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                                            ) : (
                                                <span className="text-xs text-gray-500">ไม่มีโลโก้</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <label htmlFor="logoUpload" className="cursor-pointer px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100">
                                                <span>อัปโหลดโลโก้</span>
                                                <input id="logoUpload" name="logoUpload" type="file" className="sr-only" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoChange} />
                                            </label>
                                            {settings.logoUrl && (
                                                <button type="button" onClick={handleRemoveLogo} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="ลบโลโก้">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Organization Settings */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">การตั้งค่าองค์กรและผู้พัฒนา</h2>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">ชื่อองค์กร</label>
                                    <input type="text" name="organizationName" id="organizationName" value={settings.organizationName} onChange={handleChange} className="mt-1 w-full md:w-1/2" />
                                </div>
                                <div>
                                    <label htmlFor="organizationAddress" className="block text-sm font-medium text-gray-700">ที่อยู่องค์กร</label>
                                    <textarea name="organizationAddress" id="organizationAddress" rows={3} value={settings.organizationAddress || ''} onChange={handleChange} className="mt-1 w-full md:w-1/2"></textarea>
                                </div>
                                <div>
                                    <label htmlFor="organizationPhone" className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์องค์กร</label>
                                    <input type="tel" name="organizationPhone" id="organizationPhone" value={settings.organizationPhone || ''} onChange={handleChange} className="mt-1 w-full md:w-1/2" />
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

                {activeTab === 'api' && (
                    <div className="space-y-8 animate-scale-in">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">Google Maps Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="googleMapsApiKey" className="block text-sm font-medium text-gray-700">Google Maps API Key</label>
                                    <input type="text" name="googleMapsApiKey" id="googleMapsApiKey" value={settings.googleMapsApiKey} onChange={handleChange} className="mt-1 w-full" placeholder="ใส่ API Key ของคุณที่นี่" />
                                    <p className="text-xs text-gray-500 mt-1">จำเป็นต้องรีโหลดหน้าเว็บใหม่หลังการเปลี่ยนแปลง</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="mapCenterLat" className="block text-sm font-medium text-gray-700">พิกัดศูนย์กลาง (ละติจูด)</label>
                                        <input type="number" step="any" name="mapCenterLat" id="mapCenterLat" value={settings.mapCenterLat} onChange={handleChange} className="mt-1 w-full" />
                                    </div>
                                    <div>
                                        <label htmlFor="mapCenterLng" className="block text-sm font-medium text-gray-700">พิกัดศูนย์กลาง (ลองจิจูด)</label>
                                        <input type="number" step="any" name="mapCenterLng" id="mapCenterLng" value={settings.mapCenterLng} onChange={handleChange} className="mt-1 w-full" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">ใช้สำหรับกำหนดค่าเริ่มต้นของแผนที่เมื่อเปิดใช้งานครั้งแรก (เช่น ศูนย์กลางของพื้นที่ให้บริการ)</p>
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

                {activeTab === 'developer' && currentUser.role === 'DEVELOPER' && (
                    <div className="animate-scale-in">
                        <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg border border-gray-700">
                            <h2 className="text-xl font-bold text-green-400 mb-4 font-mono">Terminal / Developer Console</h2>
                            <div className="space-y-6 font-mono text-sm">
                                <div>
                                    <h3 className="text-gray-400 mb-2">System Information</h3>
                                    <div className="bg-gray-800 p-4 rounded border border-gray-700">
                                        <p><span className="text-blue-400">Environment:</span> development</p>
                                        <p><span className="text-blue-400">Database:</span> SQLite (wecare.db)</p>
                                        <p><span className="text-blue-400">API Endpoint:</span> /api</p>
                                        <p><span className="text-blue-400">User ID:</span> {currentUser.id}</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-gray-400 mb-2">Quick Actions</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button type="button" onClick={() => window.open('/api/audit-logs', '_blank')} className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-left">
                                            <span className="block text-green-400 font-bold">View Raw Audit Logs</span>
                                            <span className="text-xs text-gray-500">Open JSON response in new tab</span>
                                        </button>
                                        <button type="button" onClick={() => window.open('/api/users', '_blank')} className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-left">
                                            <span className="block text-green-400 font-bold">View Raw Users Data</span>
                                            <span className="text-xs text-gray-500">Open JSON response in new tab</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 bg-red-900/30 border border-red-800 rounded">
                                    <h3 className="text-red-400 font-bold mb-2">⚠️ Danger Zone</h3>
                                    <p className="text-gray-400 mb-4">Actions here are irreversible. Proceed with caution.</p>
                                    <button type="button" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold opacity-50 cursor-not-allowed" title="Not implemented yet">
                                        Reset Database (Coming Soon)
                                    </button>
                                </div>
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
