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
import EditPatientModal from '../components/modals/EditPatientModal';
import { patientsAPI, ridesAPI } from '../src/services/api';

interface PatientDetailPageProps {
    patientId: string;
    setActiveView: (view: CommunityView, context?: any) => void;
}

const PatientDetailPage: React.FC<PatientDetailPageProps> = ({ patientId, setActiveView }) => {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [rideHistory, setRideHistory] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [patientId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load patient details
            const patientData = await patientsAPI.getPatientById(patientId);
            setPatient(patientData);

            // Load ride history (filtering all rides for this patient)
            const allRides = await ridesAPI.getRides();
            const patientRides = (Array.isArray(allRides) ? allRides : (allRides.rides || []))
                .filter((r: any) => r.patientId === patientId || r.patient_id === patientId)
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
            await patientsAPI.updatePatient(updatedPatient.id, updatedPatient);
            setPatient(updatedPatient);
            setIsModalOpen(false);
            alert('บันทึกข้อมูลสำเร็จ');
        } catch (err: any) {
            console.error('Failed to update patient:', err);
            alert('ไม่สามารถบันทึกข้อมูลได้');
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
                    <img src={patient.profileImageUrl || defaultProfileImage} alt={patient.fullName} className="w-32 h-32 rounded-full flex-shrink-0 object-cover border-4 border-blue-200" />
                    <div className="flex-grow text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-gray-800">{patient.fullName}</h1>
                        <p className="text-gray-500 mt-1">อายุ {patient.age} ปี | ID: {patient.id}</p>
                        <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                            {patient.patientTypes.map(type => (
                                <span key={type} className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{type}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center px-4 py-2 font-semibold text-[var(--wecare-blue)] bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                            <EditIcon className="w-5 h-5 mr-2" /> แก้ไขข้อมูล
                        </button>
                        <button onClick={() => setActiveView('request_ride', { patientId: patient.id })} className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-[var(--wecare-green)] rounded-lg shadow-sm hover:bg-green-600 transition-colors">
                            <PlusCircleIcon className="w-5 h-5 mr-2" /> ร้องขอการเดินทาง
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">ข้อมูลติดต่อและที่อยู่ปัจจุบัน</h2>
                        <dl className="space-y-3 text-sm">
                            <div><dt className="font-semibold text-gray-600">ที่อยู่:</dt><dd className="text-gray-800">{`${patient.currentAddress?.houseNumber || ''} ${patient.currentAddress?.village || ''}, ต.${patient.currentAddress?.tambon || ''}, อ.${patient.currentAddress?.amphoe || ''}, จ.${patient.currentAddress?.changwat || ''}`}</dd></div>
                            <div><dt className="font-semibold text-gray-600">เบอร์โทรศัพท์:</dt><dd className="text-gray-800">{patient.contactPhone}</dd></div>
                            <div><dt className="font-semibold text-gray-600">จุดสังเกต:</dt><dd className="text-gray-800">{patient.landmark || 'ไม่มี'}</dd></div>
                            <div><dt className="font-semibold text-gray-600">พิกัด:</dt><dd className="text-gray-800 font-mono text-xs">{`Lat: ${patient.latitude}, Long: ${patient.longitude}`}</dd></div>
                        </dl>
                        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800">
                            ดูตำแหน่งบนแผนที่ <ExternalLinkIcon className="w-4 h-4 ml-2" />
                        </a>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">ข้อมูลทางการแพทย์</h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
                            <div><dt className="font-semibold text-gray-600">กรุ๊ปเลือด:</dt><dd className="text-gray-800">{`${patient.bloodType || '-'} ${patient.rhFactor || ''}`}</dd></div>
                            <div className="sm:col-span-2"><dt className="font-semibold text-gray-600">สิทธิการรักษา:</dt><dd className="text-gray-800">{patient.healthCoverage || '-'}</dd></div>
                        </dl>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><h3 className="text-sm font-semibold text-gray-600 mb-2">โรคประจำตัว</h3><ul className="list-disc list-inside text-sm text-gray-800 space-y-1">{(patient.chronicDiseases || []).map(d => <li key={d}>{d}</li>)}</ul></div>
                            <div><h3 className="text-sm font-semibold text-gray-600 mb-2">ประวัติการแพ้ยา/อาหาร</h3><ul className="list-disc list-inside text-sm text-gray-800 space-y-1">{(patient.allergies || []).map(a => <li key={a}>{a}</li>)}</ul></div>
                        </div>
                    </div>
                </div>
                {/* Right Column */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">เอกสารแนบ</h2>
                        <ul className="space-y-2">{(patient.attachments || []).map(file => (
                            <li key={file.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border">
                                <div><p className="text-sm font-medium text-gray-800">{file.name}</p><p className="text-xs text-gray-500">{file.size}</p></div>
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800"><DownloadIcon className="w-5 h-5" /></a>
                            </li>))}
                            {(patient.attachments || []).length === 0 && <p className="text-sm text-center text-gray-500 py-4">ไม่มีเอกสารแนบ</p>}
                        </ul>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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

            <EditPatientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                patient={patient}
                onSave={handleSavePatient}
            />
        </div>
    );
};

export default PatientDetailPage;
