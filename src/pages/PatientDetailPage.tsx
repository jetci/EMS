import React, { useState, useEffect } from 'react';
import { CommunityView, Patient, Ride, RideStatus, Attachment } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import { defaultProfileImage } from '../assets/defaultProfile';
import { formatDateToThai, formatDateTimeToThai } from '../utils/dateUtils';
import StatusBadge from '../components/ui/StatusBadge';
import UserIcon from '../components/icons/UserIcon';
import CalendarIcon from '../components/icons/CalendarIcon';
import EditIcon from '../components/icons/EditIcon';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import ExternalLinkIcon from '../components/icons/ExternalLinkIcon';
import DownloadIcon from '../components/icons/DownloadIcon';
import { patientsAPI, ridesAPI } from '../services/api';

interface PatientDetailPageProps {
    patientId: string;
    setActiveView: (view: CommunityView, context?: any) => void;
}

const PatientDetailPage: React.FC<PatientDetailPageProps> = ({ patientId, setActiveView }) => {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [rideHistory, setRideHistory] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [patientId]);

    // ✅ Normalize backend data (snake_case) into Patient shape (camelCase)
    const normalizePatient = (data: any): Patient => {
        const parseArray = (v: any): string[] => {
            if (Array.isArray(v)) return v;
            if (typeof v === 'string') {
                try {
                    const parsed = JSON.parse(v);
                    if (Array.isArray(parsed)) return parsed;
                } catch {}
                return v ? v.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
            }
            return [];
        };

        // Sanitize text values to avoid garbage like "???????????" or "undefined-undefined-undefined"
        const sanitizeText = (v: any): string => {
            if (v === null || v === undefined) return '';
            const s = String(v).trim();
            if (!s) return '';
            if (/^\?+$/.test(s)) return '';
            if (s.toLowerCase() === 'invalid date') return '';
            if (s.toLowerCase() === 'null') return '';
            return s;
        };

        const dobRaw: any = data?.dob || data?.birthDate || data?.date_of_birth || data?.dateOfBirth || '';
        const dobStr: string = sanitizeText(dobRaw) === 'undefined-undefined-undefined' ? '' : sanitizeText(dobRaw);
        const calcAge = (d: string): number => {
            if (!d) return data?.age || 0;
            let date: Date;
            if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
                date = new Date(`${d}T00:00:00`);
            } else if (/^\d{2}\/(\d{2})\/\d{4}$/.test(d)) {
                const [dd, mm, yyyy] = d.split('/');
                date = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
            } else {
                date = new Date(d);
            }
            if (isNaN(date.getTime())) return data?.age || 0;
            const now = new Date();
            let age = now.getFullYear() - date.getFullYear();
            const m = now.getMonth() - date.getMonth();
            if (m < 0 || (m === 0 && now.getDate() < date.getDate())) age--;
            return age;
        };

        const attachmentsRaw = data?.attachments || data?.files || data?.documents || [];
        const attachments: Attachment[] = (attachmentsRaw || []).map((f: any) => {
            const sizeVal = f?.size_bytes ?? f?.sizeBytes ?? f?.size_kb ?? f?.sizeKB ?? f?.size;
            let sizeStr = '';
            if (typeof sizeVal === 'number') {
                if (sizeVal > 1024 * 1024) sizeStr = `${(sizeVal / 1024 / 1024).toFixed(2)} MB`;
                else if (sizeVal > 1024) sizeStr = `${(sizeVal / 1024).toFixed(1)} KB`;
                else sizeStr = `${sizeVal} B`;
            } else {
                sizeStr = sizeVal || '';
            }
            return {
                name: sanitizeText(
                    f?.name_th || f?.nameTh || f?.thai_name || f?.name_thai || f?.name_th_full || f?.file_name_th ||
                    f?.display_name || f?.original_name || f?.originalName || f?.title || f?.name || f?.filename || 'ไฟล์แนบ'
                ),
                url: f?.url || f?.file_url || f?.path || f?.download_url || '',
                size: sizeStr,
            };
        });

        return {
            id: data?.id?.toString?.() || data?.patient_id?.toString?.() || '',
            fullName: sanitizeText(data?.fullName || data?.full_name || `${data?.first_name || data?.firstName || ''} ${data?.last_name || data?.lastName || ''}`.trim()),
            profileImageUrl: data?.profileImageUrl || data?.profile_image_url || undefined,

            // Personal Info
            title: sanitizeText(data?.title || data?.prefix || ''),
            gender: sanitizeText(data?.gender || data?.sex || ''),
            nationalId: sanitizeText(data?.nationalId || data?.national_id || data?.idCard || data?.citizen_id || ''),
            dob: dobStr,
            age: calcAge(dobStr),
            patientTypes: parseArray(data?.patientTypes || data?.patient_types),

            // Medical Info
            bloodType: sanitizeText(data?.bloodType || data?.blood_type || ''),
            rhFactor: sanitizeText(data?.rhFactor || data?.rh_factor || ''),
            healthCoverage: sanitizeText(data?.healthCoverage || data?.health_coverage || data?.medicalCoverage || data?.insuranceType || ''),
            chronicDiseases: parseArray(data?.chronicDiseases || data?.chronic_diseases),
            allergies: parseArray(data?.allergies || data?.allergy_list || data?.allergies),

            // Contact & Address
            contactPhone: sanitizeText(data?.contactPhone || data?.phone || data?.contact_phone || ''),
            idCardAddress: (() => {
                const a = data?.registeredAddress || data?.registered_address || data?.idCardAddress || data?.id_card_address;
                if (a && typeof a === 'object') {
                    return {
                        houseNumber: sanitizeText(a.houseNumber || a.house_number || ''),
                        village: sanitizeText(a.village || ''),
                        tambon: sanitizeText(a.tambon || ''),
                        amphoe: sanitizeText(a.amphoe || ''),
                        changwat: sanitizeText(a.changwat || ''),
                    };
                }
                return {
                    houseNumber: sanitizeText(data?.id_card_house_number || data?.registered_house_number || ''),
                    village: sanitizeText(data?.id_card_village || data?.registered_village || ''),
                    tambon: sanitizeText(data?.id_card_tambon || data?.registered_tambon || ''),
                    amphoe: sanitizeText(data?.id_card_amphoe || data?.registered_amphoe || ''),
                    changwat: sanitizeText(data?.id_card_changwat || data?.registered_changwat || ''),
                };
            })(),
            currentAddress: (() => {
                const a = data?.currentAddress || data?.current_address || data?.address;
                if (a && typeof a === 'object') {
                    return {
                        houseNumber: sanitizeText(a.houseNumber || a.house_number || ''),
                        village: sanitizeText(a.village || ''),
                        tambon: sanitizeText(a.tambon || ''),
                        amphoe: sanitizeText(a.amphoe || ''),
                        changwat: sanitizeText(a.changwat || ''),
                    };
                }
                return {
                    houseNumber: sanitizeText(data?.current_house_number || ''),
                    village: sanitizeText(data?.current_village || ''),
                    tambon: sanitizeText(data?.current_tambon || ''),
                    amphoe: sanitizeText(data?.current_amphoe || ''),
                    changwat: sanitizeText(data?.current_changwat || ''),
                };
            })(),
            landmark: sanitizeText(data?.landmark || ''),
            latitude: (data?.latitude ?? data?.lat ?? '')?.toString?.() || '',
            longitude: (data?.longitude ?? data?.lng ?? '')?.toString?.() || '',

            // Emergency Contact (flat fields)
            emergencyContactName: sanitizeText(data?.emergency_contact_name || data?.emergencyContact?.name || ''),
            emergencyContactPhone: sanitizeText(data?.emergency_contact_phone || data?.emergencyContact?.phone || ''),
            emergencyContactRelation: sanitizeText(data?.emergency_contact_relation || data?.emergencyContact?.relation || ''),

            // Attachments
            attachments,

            // Metadata
            registeredDate: sanitizeText(data?.registeredDate || data?.registered_date || data?.created_at || ''),
            registeredBy: sanitizeText(data?.registeredBy || data?.created_by || ''),
            keyInfo: sanitizeText(data?.key_info || data?.keyInfo || ''),
            caregiverName: sanitizeText(data?.caregiver_name || data?.caregiverName || ''),
            caregiverPhone: sanitizeText(data?.caregiver_phone || data?.caregiverPhone || ''),
            createdAt: data?.created_at || data?.createdAt,
            updatedAt: data?.updated_at || data?.updatedAt,
        };
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load patient details
            const patientData = await patientsAPI.getPatientById(patientId);

            // 🐛 FIX: Debug log to see actual data structure
            console.log('🔍 Patient Data Received:', patientData);
            console.log('🔍 Profile Image URL:', patientData.profileImageUrl || patientData.profile_image_url);
            console.log('🔍 Address Data:', patientData.currentAddress || patientData.address);

            // ✅ Normalize and set patient for consistent rendering
            setPatient(normalizePatient(patientData));

            // Load ride history (filtering all rides for this patient)
            const allRides = await ridesAPI.getRides();
            const ridesArray = Array.isArray(allRides) ? allRides : (allRides.rides || []);
            const patientIdStr = String(patientId);
            const patientRides = ridesArray
                .filter((r: any) => String(r.patientId ?? r.patient_id) === patientIdStr)
                .sort((a: Ride, b: Ride) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime());

            setRideHistory(patientRides);

        } catch (err: any) {
            console.error('Failed to load patient details:', err);
            setError(err.message || 'ไม่สามารถโหลดข้อมูลผู้ป่วยได้');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePatient = async (updatedPatient: Patient) => {
        try {
            // Map frontend Patient to backend format
            const backendData = {
                full_name: updatedPatient.fullName,
                title: updatedPatient.title,
                gender: updatedPatient.gender,
                national_id: updatedPatient.nationalId,
                dob: updatedPatient.dob,
                patient_types: updatedPatient.patientTypes,
                blood_type: updatedPatient.bloodType,
                rh_factor: updatedPatient.rhFactor,
                health_coverage: updatedPatient.healthCoverage,
                chronic_diseases: updatedPatient.chronicDiseases,
                allergies: updatedPatient.allergies,
                contact_phone: updatedPatient.contactPhone,
                emergencyContactName: updatedPatient.emergencyContactName,
                emergencyContactPhone: updatedPatient.emergencyContactPhone,
                emergencyContactRelation: updatedPatient.emergencyContactRelation,
                id_card_address: updatedPatient.idCardAddress,
                current_address: updatedPatient.currentAddress,
                landmark: updatedPatient.landmark,
                latitude: updatedPatient.latitude,
                longitude: updatedPatient.longitude,
                attachments: updatedPatient.attachments,
                key_info: updatedPatient.keyInfo,
                caregiverName: updatedPatient.caregiverName,
                caregiverPhone: updatedPatient.caregiverPhone,
            };

            await patientsAPI.updatePatient(updatedPatient.id, backendData);
            // Remove setIsModalOpen(false) after update since modal is no longer used
            alert('บันทึกข้อมูลสำเร็จ');
            // Reload latest data to reflect server state
            await loadData();
        } catch (err: any) {
            console.error('Failed to update patient:', err);
            alert(`ไม่สามารถบันทึกข้อมูลได้: ${err?.message || 'Unknown error'}`);
        }
    };

    if (loading) return <div className="text-center py-10">กำลังโหลดข้อมูล...</div>;
    if (error || !patient) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-semibold text-red-600">{error || 'ไม่พบข้อมูลผู้ป่วย'}</h2>
                <button onClick={() => setActiveView('patients')} className="mt-4 text-blue-600 hover:underline">
                    กลับไปที่หน้ารายชื่อผู้ป่วย
                </button>
            </div>
        );
    }

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${patient.latitude},${patient.longitude}`;

    return (
        <div className="space-y-6">
            {/* Header and Back Button */}
            <button onClick={() => setActiveView('patients')} className="flex items-center text-gray-600 hover:text-gray-900 font-semibold">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                <span>กลับไปหน้ารายชื่อ</span>
            </button>

            {/* Patient Summary Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* 🐛 FIX: Support both profileImageUrl and profile_image_url with correct Base URL */}
                    <img
                        src={(() => {
                            const url = (patient as any).profileImageUrl || (patient as any).profile_image_url;
                            if (!url) return defaultProfileImage;
                            if (url.startsWith('http') || url.startsWith('data:')) return url;

                            // Construct absolute URL for relative paths
                            const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '/api';
                            const rootUrl = apiBase.replace(/\/api\/?$/, ''); // Remove /api suffix
                            return `${rootUrl}${url.startsWith('/') ? '' : '/'}${url}`;
                        })()}
                        alt={patient.fullName}
                        className="w-32 h-32 rounded-full flex-shrink-0 object-cover border-4 border-blue-200"
                        onError={(e) => {
                            console.error('🖼️ Image load failed, using default');
                            (e.target as HTMLImageElement).src = defaultProfileImage;
                        }}
                    />
                    <div className="flex-grow text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-gray-800">{patient.fullName}</h1>
                        {/* 🐛 FIX: Show full ID with break-all to prevent truncation */}
                        <p className="text-gray-500 mt-1 break-all">อายุ {patient.age} ปี | ID: <span className="font-mono text-sm">{patient.id}</span></p>
                        <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                            {patient.patientTypes.map((type, index) => (
                                <span key={`${type}-${index}`} className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{type}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => setActiveView('edit_patient', { patientId: patient.id })} className="flex items-center justify-center px-4 py-2 font-semibold text-[var(--wecare-blue)] bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                            <EditIcon className="w-5 h-5 mr-2" /> แก้ไขข้อมูล
                        </button>
                        <button onClick={() => setActiveView('request_ride', { patientId: patient.id })} className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-[var(--wecare-green)] rounded-lg shadow-sm hover:bg-green-600 transition-colors">
                            <PlusCircleIcon className="w-5 h-5 mr-2" /> ร้องขอการเดินทาง
                        </button>
                    </div>
                </div>
            </div>

            {/* ✅ NEW: ข้อมูลส่วนตัวครบถ้วน */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">ข้อมูลส่วนตัว</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                    {/* 1. คำนำหน้าชื่อ */}
                    <div>
                        <dt className="font-semibold text-gray-600">คำนำหน้าชื่อ:</dt>
                        <dd className="text-gray-800">
                            {(() => {
                                // Debug logging with JSON.stringify
                                const titleData = (patient as any).title || (patient as any).prefix;
                                const genderData = (patient as any).gender || (patient as any).sex;
                                console.log('🔍 Title Debug:', JSON.stringify({ title: titleData, gender: genderData }));

                                // Try to get title from patient data
                                if (titleData && titleData !== '-' && titleData !== 'undefined') return titleData;

                                // Infer from gender (case-insensitive)
                                const gender = (genderData || '').toString().toLowerCase();
                                if (gender.includes('ชาย') || gender.includes('male')) return 'นาย';
                                if (gender.includes('หญิง') || gender.includes('female')) return 'นางสาว';

                                return '-';
                            })()}
                        </dd>
                    </div>

                    {/* 2. เพศ */}
                    <div>
                        <dt className="font-semibold text-gray-600">เพศ:</dt>
                        <dd className="text-gray-800">{(patient as any).gender || (patient as any).sex || '-'}</dd>
                    </div>

                    {/* 3. ชื่อ */}
                    <div>
                        <dt className="font-semibold text-gray-600">ชื่อ:</dt>
                        <dd className="text-gray-800">{(patient as any).firstName || (patient as any).first_name || patient.fullName.split(' ')[0] || '-'}</dd>
                    </div>

                    {/* 4. นามสกุล */}
                    <div>
                        <dt className="font-semibold text-gray-600">นามสกุล:</dt>
                        <dd className="text-gray-800">{(patient as any).lastName || (patient as any).last_name || patient.fullName.split(' ').slice(1).join(' ') || '-'}</dd>
                    </div>

                    {/* 5. เลขบัตรประชาชน */}
                    <div className="sm:col-span-2">
                        <dt className="font-semibold text-gray-600">เลขบัตรประชาชน:</dt>
                        <dd className="text-gray-800 font-mono">{(patient as any).nationalId || (patient as any).national_id || (patient as any).idCard || 'ไม่ระบุ'}</dd>
                    </div>

                    {/* 6. วันเกิด */}
                    <div>
                        <dt className="font-semibold text-gray-600">วันเกิด:</dt>
                        <dd className="text-gray-800">
                            {(() => {
                                // Try different field names
                                const dob = (patient as any).dob || (patient as any).birthDate || (patient as any).dateOfBirth;
                                // console.log('🔍 Birth Date Debug:', JSON.stringify({ dob, type: typeof dob }));

                                // Check for garbage values
                                if (!dob || dob === 'undefined-undefined-undefined' || dob === 'Invalid Date') return 'ไม่ระบุ';

                                try {
                                    // Robust Date Parsing
                                    const date = new Date(dob);
                                    if (isNaN(date.getTime())) return 'ไม่ระบุ';

                                    // Format to Thai Date
                                    return date.toLocaleDateString('th-TH', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    });
                                } catch (e) {
                                    return 'ไม่ระบุ';
                                }
                            })()}
                        </dd>
                    </div>

                    {/* 7. อายุ */}
                    <div>
                        <dt className="font-semibold text-gray-600">อายุ:</dt>
                        <dd className="text-gray-800">{patient.age || '-'} ปี</dd>
                    </div>

                    {/* 8. ประเภทผู้ป่วย */}
                    <div className="sm:col-span-2 lg:col-span-3">
                        <dt className="font-semibold text-gray-600">ประเภทผู้ป่วย:</dt>
                        <dd className="text-gray-800">
                            <div className="flex flex-wrap gap-2 mt-1">
                                {(patient.patientTypes || []).map((type, index) => (
                                    <span key={`${type}-${index}`} className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{type}</span>
                                ))}
                                {(!patient.patientTypes || patient.patientTypes.length === 0) && <span className="text-gray-500">-</span>}
                            </div>
                        </dd>
                    </div>
                </dl>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    {/* ✅ NEW: ที่อยู่ตามบัตรประชาชน */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">ที่อยู่ตามบัตรประชาชน</h2>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="font-semibold text-gray-600">ที่อยู่:</dt>
                                <dd className="text-gray-800 whitespace-pre-wrap break-words">
                                    {(() => {
                                        // Try registeredAddress object first
                                        if ((patient as any).registeredAddress) {
                                            const addr = (patient as any).registeredAddress;
                                            return `${addr.houseNumber || ''} ${addr.village || ''}, ต.${addr.tambon || ''}, อ.${addr.amphoe || ''}, จ.${addr.changwat || ''} ${addr.postalCode || ''}`;
                                        }
                                        // Try registered_address
                                        if ((patient as any).registered_address) {
                                            return (patient as any).registered_address;
                                        }
                                        // Try idCardAddress
                                        if ((patient as any).idCardAddress) {
                                            const addr = (patient as any).idCardAddress;
                                            return `${addr.houseNumber || ''} ${addr.village || ''}, ต.${addr.tambon || ''}, อ.${addr.amphoe || ''}, จ.${addr.changwat || ''} ${addr.postalCode || ''}`;
                                        }
                                        // Try id_card* fields
                                        const hn = (patient as any).id_card_house_number || '';
                                        const v = (patient as any).id_card_village || '';
                                        const t = (patient as any).id_card_tambon || '';
                                        const a = (patient as any).id_card_amphoe || '';
                                        const c = (patient as any).id_card_changwat || '';
                                        const pc = (patient as any).id_card_postal_code || '';
                                        const parts = [hn, v].filter(Boolean).join(' ');
                                        const addrStr = `${parts}${parts ? ', ' : ''}ต.${t || ''}, อ.${a || ''}, จ.${c || ''} ${pc || ''}`.trim();
                                        return addrStr || 'ไม่มีข้อมูลที่อยู่ตามบัตรประชาชน';
                                    })()}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* ที่อยู่ปัจจุบัน */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">ข้อมูลติดต่อและที่อยู่ปัจจุบัน</h2>
                        <dl className="space-y-3 text-sm">
                            {/* 🐛 FIX: Support multiple address formats */}
                            <div>
                                <dt className="font-semibold text-gray-600">ที่อยู่:</dt>
                                <dd className="text-gray-800 whitespace-pre-wrap break-words">
                                    {(() => {
                                        // Try currentAddress object first
                                        if (patient.currentAddress) {
                                            const addr = patient.currentAddress;
                                            const base = `${addr.houseNumber || ''} ${addr.village || ''}`.trim();
                                            const tail = `ต.${addr.tambon || ''}, อ.${addr.amphoe || ''}, จ.${addr.changwat || ''}`.replace(/\b[,\s]+$/,'');
                                            return `${base}${base ? ', ' : ''}${tail}`.trim();
                                        }
                                        // Try address string
                                        if ((patient as any).address) {
                                            return (patient as any).address;
                                        }
                                        // Try full_address
                                        if ((patient as any).full_address) {
                                            return (patient as any).full_address;
                                        }
                                        // Try current_* fields
                                        const hn = (patient as any).current_house_number || '';
                                        const v = (patient as any).current_village || '';
                                        const t = (patient as any).current_tambon || '';
                                        const a = (patient as any).current_amphoe || '';
                                        const c = (patient as any).current_changwat || '';
                                        const parts = [hn, v].filter(Boolean).join(' ');
                                        const addrStr = `${parts}${parts ? ', ' : ''}ต.${t || ''}, อ.${a || ''}, จ.${c || ''}`.trim();
                                        return addrStr || 'ไม่มีข้อมูลที่อยู่';
                                    })()}
                                </dd>
                            </div>
                            <div><dt className="font-semibold text-gray-600">เบอร์โทรศัพท์:</dt><dd className="text-gray-800">{patient.contactPhone || (patient as any).phone || (patient as any).contact_phone || 'ไม่มีข้อมูล'}</dd></div>
                            <div><dt className="font-semibold text-gray-600">จุดสังเกต:</dt><dd className="text-gray-800 whitespace-pre-wrap">{patient.landmark || (patient as any).landmark || 'ไม่มี'}</dd></div>
                            <div><dt className="font-semibold text-gray-600">พิกัด:</dt><dd className="text-gray-800 font-mono text-xs break-all">{`Lat: ${patient.latitude || (patient as any).lat || 'N/A'}, Long: ${patient.longitude || (patient as any).lng || 'N/A'}`}</dd></div>
                        </dl>
                        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800">
                            ดูตำแหน่งบนแผนที่ <ExternalLinkIcon className="w-4 h-4 ml-2" />
                        </a>

                        {/* Emergency Contact */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <h3 className="font-semibold text-gray-700 mb-2">ผู้ติดต่อฉุกเฉิน</h3>
                            <dl className="space-y-2">
                                <div><dt className="font-semibold text-gray-600">ชื่อ:</dt><dd className="text-gray-800">{patient.emergencyContactName || (patient as any).emergency_contact_name || (patient as any).emergencyContact?.name || '-'}</dd></div>
                                <div><dt className="font-semibold text-gray-600">ความสัมพันธ์:</dt><dd className="text-gray-800">{patient.emergencyContactRelation || (patient as any).emergency_contact_relation || (patient as any).emergencyContact?.relation || '-'}</dd></div>
                                <div><dt className="font-semibold text-gray-600">เบอร์โทรศัพท์:</dt><dd className="text-gray-800">{patient.emergencyContactPhone || (patient as any).emergency_contact_phone || (patient as any).emergencyContact?.phone || '-'}</dd></div>
                            </dl>

                            {/* Caregiver Info */}
                            <div className="mt-4">
                                <h3 className="font-semibold text-gray-700 mb-2">ผู้ดูแล</h3>
                                <dl className="space-y-2">
                                    <div><dt className="font-semibold text-gray-600">ชื่อผู้ดูแล:</dt><dd className="text-gray-800">{patient.caregiverName || (patient as any).caregiver_name || '-'}</dd></div>
                                    <div><dt className="font-semibold text-gray-600">เบอร์โทรผู้ดูแล:</dt><dd className="text-gray-800">{patient.caregiverPhone || (patient as any).caregiver_phone || '-'}</dd></div>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">ข้อมูลทางการแพทย์</h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
                            <div><dt className="font-semibold text-gray-600">กรุ๊ปเลือด:</dt><dd className="text-gray-800">{`${patient.bloodType || '-'} ${patient.rhFactor || ''}`}</dd></div>
                            <div className="sm:col-span-2"><dt className="font-semibold text-gray-600">สิทธิการรักษา:</dt><dd className="text-gray-800">{patient.healthCoverage || 'ไม่ระบุ'}</dd></div>
                        </dl>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><h3 className="text-sm font-semibold text-gray-600 mb-2">โรคประจำตัว</h3><ul className="list-disc list-inside text-sm text-gray-800 space-y-1">{(patient.chronicDiseases || []).map((d, i) => <li key={`${d}-${i}`}>{d}</li>)}</ul></div>
                            <div><h3 className="text-sm font-semibold text-gray-600 mb-2">ประวัติการแพ้ยา/อาหาร</h3><ul className="list-disc list-inside text-sm text-gray-800 space-y-1">{(patient.allergies || []).map((a, i) => <li key={`${a}-${i}`}>{a}</li>)}</ul></div>
                        </div>
                    </div>
                </div>
                {/* Right Column */}
                <div className="space-y-8">
                    {/* Registration Meta */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">ข้อมูลการลงทะเบียน</h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="font-semibold text-gray-600">วันที่ลงทะเบียน:</dt>
                                <dd className="text-gray-800">{(() => {
                                    const d = patient.registeredDate || (patient as any).registered_date || (patient as any).created_at || '';
                                    try { return d ? formatDateToThai(d) : '-'; } catch { return d || '-'; }
                                })()}</dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-gray-600">ผู้สร้างข้อมูล:</dt>
                                <dd className="text-gray-800">{patient.registeredBy || (patient as any).created_by || '-'}</dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-gray-600">สร้างเมื่อ:</dt>
                                <dd className="text-gray-800">{(() => {
                                    const d = patient.createdAt || (patient as any).created_at || '';
                                    try { return d ? formatDateToThai(d) : '-'; } catch { return d || '-'; }
                                })()}</dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-gray-600">แก้ไขล่าสุด:</dt>
                                <dd className="text-gray-800">{(() => {
                                    const d = patient.updatedAt || (patient as any).updated_at || '';
                                    try { return d ? formatDateToThai(d) : '-'; } catch { return d || '-'; }
                                })()}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Key Info */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">ข้อมูลสำคัญ</h2>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{patient.keyInfo || (patient as any).key_info || 'ไม่มีข้อมูลสำคัญ'}</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-[var(--wecare-blue)] p-6 pb-4">ประวัติการเดินทางล่าสุด</h2>
                        <div className="overflow-x-auto"><table className="w-full text-sm">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50/75"><tr className="text-left">
                                <th className="px-6 py-3 font-semibold">วัน-เวลา</th><th className="px-6 py-3 font-semibold">ปลายทาง</th><th className="px-6 py-3 font-semibold">สถานะ</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-200">
                                {rideHistory.map(ride => (
                                    <tr key={ride.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 whitespace-nowrap">{formatDateTimeToThai(ride.appointmentTime)}</td>
                                        <td className="px-6 py-4">{ride.destination}</td>
                                        <td className="px-6 py-4"><StatusBadge status={ride.status} /></td>
                                    </tr>
                                ))}
                                {rideHistory.length === 0 && (
                                    <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">ไม่มีประวัติการเดินทาง</td></tr>
                                )}
                            </tbody>
                        </table></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailPage;

