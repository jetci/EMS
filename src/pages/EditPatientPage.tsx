import React, { useEffect, useState } from 'react';
import { AuthenticatedView, Patient } from '../types';
import EditPatientModal from '../components/modals/EditPatientModal';
import { patientsAPI } from '../services/api';

interface EditPatientPageProps {
  patientId: string;
  setActiveView: (view: AuthenticatedView, context?: any) => void;
}

const EditPatientPage: React.FC<EditPatientPageProps> = ({ patientId, setActiveView }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await patientsAPI.getPatientById(patientId);
        setPatient(data);
      } catch (err: any) {
        console.error('Failed to load patient:', err);
        setError(err?.message || 'ไม่สามารถโหลดข้อมูลผู้ป่วยได้');
      } finally {
        setLoading(false);
      }
    };
    loadPatient();
  }, [patientId]);

  const handleSavePatient = async (updatedPatient: Patient) => {
    try {
      const backendData = {
        full_name: updatedPatient.fullName,
        profileImageUrl: updatedPatient.profileImageUrl,
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
      alert('บันทึกข้อมูลสำเร็จ');
      setActiveView('patient_detail', { patientId: updatedPatient.id });
    } catch (err: any) {
      console.error('Failed to update patient:', err);
      alert(`ไม่สามารถบันทึกข้อมูลได้: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleClose = () => {
    setActiveView('patient_detail', { patientId });
  };

  if (loading) return <div className="text-center py-10">กำลังโหลดข้อมูลผู้ป่วย...</div>;
  if (error || !patient) return (
    <div className="text-center py-10">
      <h2 className="text-xl font-semibold text-red-600">{error || 'ไม่พบข้อมูลผู้ป่วย'}</h2>
      <button onClick={() => setActiveView('patients')} className="mt-4 text-blue-600 hover:underline">
        กลับไปที่หน้ารายชื่อผู้ป่วย
      </button>
    </div>
  );

  return (
    <div>
      <EditPatientModal
        mode="page"
        isOpen={true}
        onClose={handleClose}
        patient={patient}
        onSave={handleSavePatient}
      />
    </div>
  );
};

export default EditPatientPage;
