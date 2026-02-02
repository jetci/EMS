// Manual mock for src/services/api.ts
export const apiRequest = jest.fn();

export const authAPI = {
    login: jest.fn(),
    register: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
};

export const patientsAPI = {
    getPatients: jest.fn(),
    getPatientById: jest.fn(),
    createPatient: jest.fn(),
    updatePatient: jest.fn(),
    deletePatient: jest.fn(),
};

export const driversAPI = {
    getDrivers: jest.fn(),
};

export const ridesAPI = {
    getRides: jest.fn(),
    getRideById: jest.fn(),
};

export const clearCsrfToken = jest.fn();
