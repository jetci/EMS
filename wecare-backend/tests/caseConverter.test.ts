/**
 * Unit Tests for Case Converter Utility
 * Tests snake_case ↔ camelCase conversion
 */

import {
    snakeToCamelString,
    camelToSnakeString,
    snakeToCamel,
    camelToSnake,
    transformResponse,
    transformRequest
} from '../src/utils/caseConverter';

describe('Case Converter Utility', () => {

    describe('snakeToCamelString', () => {
        it('should convert snake_case to camelCase', () => {
            expect(snakeToCamelString('user_name')).toBe('userName');
            expect(snakeToCamelString('patient_id')).toBe('patientId');
            expect(snakeToCamelString('full_name')).toBe('fullName');
            expect(snakeToCamelString('contact_phone')).toBe('contactPhone');
        });

        it('should handle single word (no conversion needed)', () => {
            expect(snakeToCamelString('name')).toBe('name');
            expect(snakeToCamelString('id')).toBe('id');
        });

        it('should handle multiple underscores', () => {
            expect(snakeToCamelString('user_full_name')).toBe('userFullName');
            expect(snakeToCamelString('patient_contact_phone')).toBe('patientContactPhone');
        });
    });

    describe('camelToSnakeString', () => {
        it('should convert camelCase to snake_case', () => {
            expect(camelToSnakeString('userName')).toBe('user_name');
            expect(camelToSnakeString('patientId')).toBe('patient_id');
            expect(camelToSnakeString('fullName')).toBe('full_name');
            expect(camelToSnakeString('contactPhone')).toBe('contact_phone');
        });

        it('should handle single word (no conversion needed)', () => {
            expect(camelToSnakeString('name')).toBe('name');
            expect(camelToSnakeString('id')).toBe('id');
        });

        it('should handle multiple capitals', () => {
            expect(camelToSnakeString('userFullName')).toBe('user_full_name');
            expect(camelToSnakeString('patientContactPhone')).toBe('patient_contact_phone');
        });
    });

    describe('snakeToCamel (Object)', () => {
        it('should convert simple object keys', () => {
            const input = {
                user_name: 'John Doe',
                patient_id: 'PAT-001',
                contact_phone: '0812345678'
            };

            const expected = {
                userName: 'John Doe',
                patientId: 'PAT-001',
                contactPhone: '0812345678'
            };

            expect(snakeToCamel(input)).toEqual(expected);
        });

        it('should handle nested objects', () => {
            const input = {
                user_name: 'John',
                current_address: {
                    house_number: '123',
                    village_name: 'Test Village'
                }
            };

            const expected = {
                userName: 'John',
                currentAddress: {
                    houseNumber: '123',
                    villageName: 'Test Village'
                }
            };

            expect(snakeToCamel(input)).toEqual(expected);
        });

        it('should handle arrays', () => {
            const input = [
                { user_name: 'John', patient_id: 'PAT-001' },
                { user_name: 'Jane', patient_id: 'PAT-002' }
            ];

            const expected = [
                { userName: 'John', patientId: 'PAT-001' },
                { userName: 'Jane', patientId: 'PAT-002' }
            ];

            expect(snakeToCamel(input)).toEqual(expected);
        });

        it('should handle null values', () => {
            const input = {
                user_name: 'John',
                profile_image: null,
                contact_phone: undefined
            };

            const expected = {
                userName: 'John',
                profileImage: null,
                contactPhone: undefined
            };

            expect(snakeToCamel(input)).toEqual(expected);
        });

        it('should handle arrays inside objects', () => {
            const input = {
                patient_name: 'John',
                chronic_diseases: ['Diabetes', 'Hypertension'],
                patient_types: ['ผู้สูงอายุ', 'ผู้พิการ']
            };

            const expected = {
                patientName: 'John',
                chronicDiseases: ['Diabetes', 'Hypertension'],
                patientTypes: ['ผู้สูงอายุ', 'ผู้พิการ']
            };

            expect(snakeToCamel(input)).toEqual(expected);
        });

        it('should handle deeply nested structures', () => {
            const input = {
                patient_id: 'PAT-001',
                patient_info: {
                    full_name: 'John Doe',
                    current_address: {
                        house_number: '123',
                        sub_district: 'Test'
                    }
                }
            };

            const expected = {
                patientId: 'PAT-001',
                patientInfo: {
                    fullName: 'John Doe',
                    currentAddress: {
                        houseNumber: '123',
                        subDistrict: 'Test'
                    }
                }
            };

            expect(snakeToCamel(input)).toEqual(expected);
        });

        it('should return null/undefined as-is', () => {
            expect(snakeToCamel(null)).toBeNull();
            expect(snakeToCamel(undefined)).toBeUndefined();
        });

        it('should return primitives as-is', () => {
            expect(snakeToCamel('string')).toBe('string');
            expect(snakeToCamel(123)).toBe(123);
            expect(snakeToCamel(true)).toBe(true);
        });
    });

    describe('camelToSnake (Object)', () => {
        it('should convert simple object keys', () => {
            const input = {
                userName: 'John Doe',
                patientId: 'PAT-001',
                contactPhone: '0812345678'
            };

            const expected = {
                user_name: 'John Doe',
                patient_id: 'PAT-001',
                contact_phone: '0812345678'
            };

            expect(camelToSnake(input)).toEqual(expected);
        });

        it('should handle nested objects', () => {
            const input = {
                userName: 'John',
                currentAddress: {
                    houseNumber: '123',
                    villageName: 'Test Village'
                }
            };

            const expected = {
                user_name: 'John',
                current_address: {
                    house_number: '123',
                    village_name: 'Test Village'
                }
            };

            expect(camelToSnake(input)).toEqual(expected);
        });

        it('should handle arrays', () => {
            const input = [
                { userName: 'John', patientId: 'PAT-001' },
                { userName: 'Jane', patientId: 'PAT-002' }
            ];

            const expected = [
                { user_name: 'John', patient_id: 'PAT-001' },
                { user_name: 'Jane', patient_id: 'PAT-002' }
            ];

            expect(camelToSnake(input)).toEqual(expected);
        });
    });

    describe('transformResponse', () => {
        it('should transform database response to API format', () => {
            const dbResponse = {
                id: 'PAT-001',
                full_name: 'John Doe',
                national_id: '1234567890123',
                contact_phone: '0812345678',
                current_address: {
                    house_number: '123',
                    village: 'Test Village'
                }
            };

            const apiResponse = transformResponse(dbResponse);

            expect(apiResponse).toHaveProperty('fullName', 'John Doe');
            expect(apiResponse).toHaveProperty('nationalId', '1234567890123');
            expect(apiResponse).toHaveProperty('contactPhone', '0812345678');
            expect(apiResponse.currentAddress).toHaveProperty('houseNumber', '123');
            expect(apiResponse).not.toHaveProperty('full_name');
            expect(apiResponse).not.toHaveProperty('national_id');
        });
    });

    describe('transformRequest', () => {
        it('should transform API request to database format', () => {
            const apiRequest = {
                fullName: 'John Doe',
                nationalId: '1234567890123',
                contactPhone: '0812345678',
                currentAddress: {
                    houseNumber: '123',
                    village: 'Test Village'
                }
            };

            const dbData = transformRequest(apiRequest);

            expect(dbData).toHaveProperty('full_name', 'John Doe');
            expect(dbData).toHaveProperty('national_id', '1234567890123');
            expect(dbData).toHaveProperty('contact_phone', '0812345678');
            expect(dbData.current_address).toHaveProperty('house_number', '123');
            expect(dbData).not.toHaveProperty('fullName');
            expect(dbData).not.toHaveProperty('nationalId');
        });
    });

    describe('Real-world scenarios', () => {
        it('should handle patient data from database', () => {
            const dbPatient = {
                id: 'PAT-001',
                full_name: 'สมชาย ใจดี',
                national_id: '1234567890123',
                dob: '1950-01-01',
                age: 74,
                gender: 'ชาย',
                blood_type: 'O',
                rh_factor: '+',
                health_coverage: 'บัตรทอง',
                contact_phone: '0812345678',
                current_house_number: '123',
                current_village: 'หมู่ 1',
                current_tambon: 'ตำบลทดสอบ',
                landmark: 'ใกล้วัด',
                latitude: '13.7563',
                longitude: '100.5018',
                patient_types: '["ผู้สูงอายุ","ผู้พิการ"]',
                chronic_diseases: '["เบาหวาน","ความดันโลหิตสูง"]',
                registered_date: '2024-01-01',
                created_by: 'USR-001'
            };

            const apiPatient = snakeToCamel(dbPatient);

            expect(apiPatient.fullName).toBe('สมชาย ใจดี');
            expect(apiPatient.nationalId).toBe('1234567890123');
            expect(apiPatient.contactPhone).toBe('0812345678');
            expect(apiPatient.currentHouseNumber).toBe('123');
            expect(apiPatient.currentVillage).toBe('หมู่ 1');
            expect(apiPatient.patientTypes).toBe('["ผู้สูงอายุ","ผู้พิการ"]');
            expect(apiPatient.chronicDiseases).toBe('["เบาหวาน","ความดันโลหิตสูง"]');
            expect(apiPatient.registeredDate).toBe('2024-01-01');
            expect(apiPatient.createdBy).toBe('USR-001');
        });

        it('should handle ride data from database', () => {
            const dbRide = {
                id: 'RIDE-001',
                patient_id: 'PAT-001',
                patient_name: 'สมชาย ใจดี',
                patient_phone: '0812345678',
                driver_id: 'DRV-001',
                driver_name: 'สมศักดิ์ ขับดี',
                pickup_location: 'บ้านเลขที่ 123',
                destination: 'โรงพยาบาล',
                appointment_time: '2024-01-15T09:00:00Z',
                special_needs: '["wheelchair","oxygen"]',
                status: 'PENDING'
            };

            const apiRide = snakeToCamel(dbRide);

            expect(apiRide.patientId).toBe('PAT-001');
            expect(apiRide.patientName).toBe('สมชาย ใจดี');
            expect(apiRide.driverId).toBe('DRV-001');
            expect(apiRide.pickupLocation).toBe('บ้านเลขที่ 123');
            expect(apiRide.appointmentTime).toBe('2024-01-15T09:00:00Z');
            expect(apiRide.specialNeeds).toBe('["wheelchair","oxygen"]');
        });
    });
});
