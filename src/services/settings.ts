import { SystemSettings } from '../../types';

const DEFAULTS: SystemSettings = {
    appName: 'WeCare Platform',
    organizationName: 'EMS WeCare HQ',
    organizationAddress: 'กรุงเทพมหานคร',
    organizationPhone: '02-000-0000',
    contactEmail: 'contact@wecare.dev',
    logoUrl: undefined,
    googleMapsApiKey: '', // Default to empty string
    mapCenterLat: 19.904394846183447, // Default centered as per user request
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

export const saveAppSettings = (settings: SystemSettings): void => {
    try {
        localStorage.setItem('wecare_appName', settings.appName);
        localStorage.setItem('wecare_organizationName', settings.organizationName);
        localStorage.setItem('wecare_organizationAddress', settings.organizationAddress || '');
        localStorage.setItem('wecare_organizationPhone', settings.organizationPhone || '');
        localStorage.setItem('wecare_contactEmail', settings.contactEmail);
        localStorage.setItem('wecare_logoUrl', settings.logoUrl || '');
        localStorage.setItem('wecare_googleMapsApiKey', settings.googleMapsApiKey || '');
        localStorage.setItem('wecare_mapCenterLat', String(settings.mapCenterLat));
        localStorage.setItem('wecare_mapCenterLng', String(settings.mapCenterLng));
        localStorage.setItem('wecare_developerName', settings.developerName || '');
        localStorage.setItem('wecare_developerTitle', settings.developerTitle || '');
        localStorage.setItem('wecare_maintenanceMode', String(settings.maintenanceMode));
        localStorage.setItem('wecare_maintenanceMessage', settings.maintenanceMessage || '');
        localStorage.setItem('wecare_schedulingModel', settings.schedulingModel);
        localStorage.setItem('wecare_googleRecaptchaSiteKey', settings.googleRecaptchaSiteKey || '');
        localStorage.setItem('wecare_googleRecaptchaSecretKey', settings.googleRecaptchaSecretKey || '');
    } catch (error) {
        console.error("Could not save settings to localStorage", error);
        throw error;
    }
};
