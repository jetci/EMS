import { SystemSettings } from '../types';
import { apiRequest } from '../services/api';

const DEFAULTS: SystemSettings = {
    appName: 'WeCare Platform',
    organizationName: 'องค์การบริหารส่วนตำบลเวียง',
    organizationAddress: 'เลขที่ 666 ถ.รอบเวียงสุทโธ ม.3 ต.เวียง อ.ฝาง จ.เชียงใหม่ 50110',
    organizationPhone: '053-382670',
    contactEmail: 'contact@wecare.dev',
    logoUrl: undefined,
    googleMapsApiKey: '',
    mapCenterLat: 19.904394846183447,
    mapCenterLng: 99.19735149982482,
    googleRecaptchaSiteKey: 'your-recaptcha-site-key-here',
    googleRecaptchaSecretKey: 'your-recaptcha-secret-key-here',
    maintenanceMode: false,
    maintenanceMessage: 'ระบบกำลังปิดปรับปรุงชั่วคราว ขออภัยในความไม่สะดวก',
    schedulingModel: 'individual',
    developerName: 'เจษฎา มูลมาวัน',
    developerTitle: 'ผู้ช่วยนักวิชาการคอมพิวเตอร์, สังกัด สำนักปลัด',
};

export const getAppSettings = (): SystemSettings => {
    try {
        const settings: SystemSettings = {
            ...DEFAULTS,
            appName: localStorage.getItem('wecare_appName') || DEFAULTS.appName,
            organizationName: localStorage.getItem('wecare_organizationName') || DEFAULTS.organizationName,
            organizationAddress: localStorage.getItem('wecare_organizationAddress') || DEFAULTS.organizationAddress,
            organizationPhone: localStorage.getItem('wecare_organizationPhone') || DEFAULTS.organizationPhone,
            contactEmail: localStorage.getItem('wecare_contactEmail') || DEFAULTS.contactEmail,
            logoUrl: localStorage.getItem('wecare_logoUrl') || DEFAULTS.logoUrl,
            googleMapsApiKey: localStorage.getItem('wecare_googleMapsApiKey') || DEFAULTS.googleMapsApiKey,
            mapCenterLat: parseFloat(localStorage.getItem('wecare_mapCenterLat') || String(DEFAULTS.mapCenterLat)),
            mapCenterLng: parseFloat(localStorage.getItem('wecare_mapCenterLng') || String(DEFAULTS.mapCenterLng)),
            developerName: localStorage.getItem('wecare_developerName') || DEFAULTS.developerName,
            developerTitle: localStorage.getItem('wecare_developerTitle') || DEFAULTS.developerTitle,
            maintenanceMode: localStorage.getItem('wecare_maintenanceMode') === 'true',
            maintenanceMessage: localStorage.getItem('wecare_maintenanceMessage') || DEFAULTS.maintenanceMessage,
            schedulingModel: (localStorage.getItem('wecare_schedulingModel') as 'individual' | 'team') || DEFAULTS.schedulingModel,
            googleRecaptchaSiteKey: localStorage.getItem('wecare_googleRecaptchaSiteKey') || DEFAULTS.googleRecaptchaSiteKey,
            googleRecaptchaSecretKey: localStorage.getItem('wecare_googleRecaptchaSecretKey') || DEFAULTS.googleRecaptchaSecretKey,
        };
        return settings;
    } catch (error) {
        console.error("Could not load settings from localStorage", error);
        return DEFAULTS;
    }
};

export const fetchLogoFromAPI = async (): Promise<string | undefined> => {
    try {
        // Try authenticated endpoint first (for logged-in users)
        try {
            const response = await apiRequest<any>('/admin/settings', { method: 'GET' });
            return response?.logoUrl || undefined;
        } catch (authError) {
            // Fall back to public endpoint if not authenticated
            const response = await apiRequest<any>('/settings/public', { method: 'GET' });
            return response?.logoUrl || undefined;
        }
    } catch (error) {
        console.error('Error fetching logo from API:', error);
        return undefined;
    }
};

// New helper to avoid unnecessary /admin/settings calls for non-admin users
export const fetchSettingsOptimized = async (userRole?: string): Promise<SystemSettings | null> => {
    try {
        // If the role is not admin, use the public endpoint directly to avoid 401/403 spam
        if (!userRole || (userRole !== 'admin' && userRole !== 'superadmin')) {
            const publicRes = await apiRequest<any>('/settings/public', { method: 'GET' });
            return publicRes || null;
        }
        // Admin roles can access the admin endpoint
        const adminRes = await apiRequest<any>('/admin/settings', { method: 'GET' });
        return adminRes || null;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return null;
    }
};
