import React, { useState, useEffect } from 'react';
import { Patient, Attachment } from '../../types';
import XIcon from '../icons/XIcon';
import ThaiDatePicker from '../ui/ThaiDatePicker';
import MapTest from '../MapTest';
import TagInput from '../ui/TagInput';
import MultiSelectAutocomplete from '../ui/MultiSelectAutocomplete';
import UploadIcon from '../icons/UploadIcon';
import PaperclipIcon from '../icons/PaperclipIcon';
import TrashIcon from '../icons/TrashIcon';
import { defaultProfileImage } from '../../assets/defaultProfile';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Patient) => void;
  patient: Patient;
}

const villages = [
    "หมู่ 1 บ้านหนองตุ้ม", "หมู่ 2 ป่าบง", "หมู่ 3 เต๋าดิน, เวียงสุทโธ",
    "หมู่ 4 สวนดอก", "หมู่ 5 ต้นหนุน", "หมู่ 6 สันทรายคองน้อย",
    "หมู่ 7 แม่ใจใต้", "หมู่ 8 แม่ใจเหนือ", "หมู่ 9 ริมฝาง,สันป่าไหน่",
    "หมู่ 10 ห้วยเฮี่ยน,สันป่ายางยาง", "หมู่ 11 ท่าสะแล", "หมู่ 12 โป่งถืบ",
    "หมู่ 13 ห้วยบอน", "หมู่ 14 เสาหิน", "หมู่ 15 โป่งถืบใน",
    "หมู่ 16 ปางผึ้ง", "หมู่ 17 ใหม่คองน้อย", "หมู่ 18 ศรีดอนชัย",
    "หมู่ 19 ใหม่ชยาราม", "หมู่ 20 สระนิคม"
];

const titles = ["นาย", "นาง", "นางสาว", "เด็กชาย", "เด็กหญิง"];
const bloodTypes = ["A", "B", "AB", "O"];
const rhFactors = ["Rh+", "Rh-"];
const healthCoverages = ["สิทธิบัตรทอง (UC)", "ประกันสังคม", "ข้าราชการ", "ชำระเงินเอง", "อื่นๆ"];
const patientTypeOptions = ['ผู้ป่วยติดเตียง', 'ผู้ป่วยภาวะพึงพิง', 'ผู้ป่วยยากไร้'];


const EditPatientModal: React.FC<EditPatientModalProps> = ({ isOpen, onClose, onSave, patient }) => {
    const [formData, setFormData] = useState(patient);
    const [patientTypes, setPatientTypes] = useState<string[]>([]);
    const [chronicDiseases, setChronicDiseases] = useState<string[]>([]);
    const [allergies, setAllergies] = useState<string[]>([]);
    const [profileImage, setProfileImage] = useState<{ file: File | null, previewUrl: string | null }>({ file: null, previewUrl: null });
    const [newAttachments, setNewAttachments] = useState<File[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
    const [addressOption, setAddressOption] = useState('same');

    useEffect(() => {
        if (patient && isOpen) {
            const isSameAddress = JSON.stringify(patient.idCardAddress) === JSON.stringify(patient.currentAddress);
            setAddressOption(isSameAddress ? 'same' : 'new');
            
            setFormData({ ...patient });
            setPatientTypes(patient.patientTypes || []);
            setChronicDiseases(patient.chronicDiseases || []);
            setAllergies(patient.allergies || []);
            setProfileImage({ file: null, previewUrl: patient.profileImageUrl || defaultProfileImage });
            setNewAttachments([]); // Reset new attachments on open
            setExistingAttachments(patient.attachments || []);
        }
    }, [patient, isOpen]);

    useEffect(() => {
        const titleToGenderMap: { [key: string]: string } = {
            "นาย": "ชาย", "เด็กชาย": "ชาย", "นาง": "หญิง",
            "นางสาว": "หญิง", "เด็กหญิง": "หญิง",
        };
        setFormData(prev => ({ ...prev, gender: titleToGenderMap[prev.title] || '' }));
    }, [formData.title]);
    
    useEffect(() => {
        if (formData.dob) {
            const birthDate = new Date(formData.dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            setFormData(prev => ({ ...prev, age: age >= 0 ? age : 0 }));
        } else {
             setFormData(prev => ({ ...prev, age: 0 }));
        }
    }, [formData.dob]);
    
    useEffect(() => {
        if (addressOption === 'same') {
            setFormData(prev => ({
                ...prev,
                currentAddress: prev.idCardAddress
            }));
        }
    }, [formData.idCardAddress, addressOption]);

    const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleDateChange = (e: { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, addressType: 'idCardAddress' | 'currentAddress') => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [addressType]: { ...prev[addressType], [name]: value }
        }));
    };

    const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setProfileImage({ file, previewUrl: URL.createObjectURL(file) });
        }
    };
    
    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (existingAttachments.length + newAttachments.length + newFiles.length > 5) {
                alert("คุณสามารถอัปโหลดเอกสารได้สูงสุด 5 ไฟล์เท่านั้น");
                return;
            }
            setNewAttachments(prev => [...prev, ...newFiles]);
        }
    };

    const handleRemoveNewAttachment = (index: number) => {
        setNewAttachments(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleRemoveExistingAttachment = (index: number) => {
        setExistingAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleLocationChange = (coords: { lat: number; lng: number }) => {
        setFormData(prev => ({ ...prev, latitude: coords.lat.toString(), longitude: coords.lng.toString() }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedPatient: Patient = {
            ...formData,
            patientTypes: patientTypes,
            chronicDiseases: chronicDiseases,
            allergies: allergies,
            attachments: existingAttachments, // In real app, handle newAttachments upload
        };
        onSave(updatedPatient);
    };
    
    if (!isOpen) return null;
    
    const today = new Date().toISOString().split('T')[0];
    const currentPosition = { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="edit-patient-modal-title">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 id="edit-patient-modal-title" className="text-xl font-bold text-gray-800">แก้ไขข้อมูลผู้ป่วย - ID: <span className="font-mono">{patient.id}</span></h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Section 1: Personal Identification */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-[#005A9C] mb-4">1. ข้อมูลระบุตัวตน</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 flex flex-col items-center">
                         <img src={profileImage.previewUrl || defaultProfileImage} alt="Patient profile" className="w-36 h-36 rounded-full object-cover border-4 border-gray-200" />
                        <label htmlFor="profileImageModal" className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                            อัปโหลดรูปภาพ
                            <input type="file" id="profileImageModal" accept="image/*" onChange={handleProfileImageChange} className="sr-only" />
                        </label>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">คำนำหน้าชื่อ</label>
                            <select name="title" value={formData.title} onChange={handleBasicChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm bg-white" required>
                                <option value="" disabled>-- เลือก --</option>
                                {titles.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">เพศ</label>
                            <input type="text" name="gender" value={formData.gender} readOnly className="mt-1 w-full border-gray-300 rounded-md shadow-sm bg-gray-100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
                            <input type="text" name="fullName" value={formData.fullName.split(' ')[0] || ''} onChange={e => setFormData(f => ({...f, fullName: `${e.target.value} ${f.fullName.split(' ')[1] || ''}`}))} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">นามสกุล</label>
                            <input type="text" name="lastName" value={formData.fullName.split(' ')[1] || ''} onChange={e => setFormData(f => ({...f, fullName: `${f.fullName.split(' ')[0] || ''} ${e.target.value}`}))} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">เลขบัตรประชาชน</label>
                            <input type="text" name="nationalId" value={formData.nationalId} onChange={handleBasicChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" maxLength={13} pattern="\d{13}" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">วัน/เดือน/ปีเกิด</label>
                            <ThaiDatePicker
                                name="dob"
                                value={formData.dob}
                                onChange={handleDateChange}
                                max={today}
                                required
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">อายุ</label>
                            <input type="text" name="age" value={`${formData.age} ปี`} readOnly className="mt-1 w-full border-gray-300 rounded-md shadow-sm bg-gray-100" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Medical Info */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-[#005A9C] mb-4">2. ข้อมูลทางการแพทย์เบื้องต้น</h2>
                <div className="space-y-6">
                    <MultiSelectAutocomplete id="patientTypeModal" options={patientTypeOptions} selectedItems={patientTypes} setSelectedItems={setPatientTypes} placeholder="เลือกประเภทผู้ป่วย (ได้มากกว่า 1)..."/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TagInput tags={chronicDiseases} setTags={setChronicDiseases} placeholder="เพิ่มโรคประจำตัว...ทีละรายการ" />
                        <TagInput tags={allergies} setTags={setAllergies} placeholder="เพิ่มประวัติการแพ้ยา/อาหาร..." />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <select name="bloodType" value={formData.bloodType} onChange={handleBasicChange} className="w-full border-gray-300 rounded-md shadow-sm bg-white"><option value="">-- กรุ๊ปเลือด --</option>{bloodTypes.map(b => <option key={b} value={b}>{b}</option>)}</select>
                        <select name="rhFactor" value={formData.rhFactor} onChange={handleBasicChange} className="w-full border-gray-300 rounded-md shadow-sm bg-white"><option value="">-- Rh --</option>{rhFactors.map(rh => <option key={rh} value={rh}>{rh}</option>)}</select>
                        <select name="healthCoverage" value={formData.healthCoverage} onChange={handleBasicChange} className="w-full border-gray-300 rounded-md shadow-sm bg-white"><option value="">-- สิทธิการรักษา --</option>{healthCoverages.map(hc => <option key={hc} value={hc}>{hc}</option>)}</select>
                    </div>
                </div>
            </div>

            {/* Section 3: Address & Contact */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-[#005A9C] mb-4">3. ที่อยู่และข้อมูลติดต่อ</h2>
                <div className="border-b border-gray-200 pb-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">ส่วนที่ 1: ที่อยู่ตามบัตรประชาชน</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium">บ้านเลขที่</label><input type="text" name="houseNumber" value={formData.idCardAddress.houseNumber} onChange={e => handleAddressChange(e, 'idCardAddress')} className="mt-1 w-full border-gray-300 rounded-md"/></div>
                        <div><label className="block text-sm font-medium">หมู่บ้าน</label><select name="village" value={formData.idCardAddress.village} onChange={e => handleAddressChange(e, 'idCardAddress')} className="mt-1 w-full border-gray-300 rounded-md bg-white"><option value="">-- เลือก --</option>{villages.map(v=><option key={v} value={v}>{v}</option>)}</select></div>
                        <div><label className="block text-sm font-medium">ตำบล</label><input type="text" name="tambon" value={formData.idCardAddress.tambon} onChange={e => handleAddressChange(e, 'idCardAddress')} className="mt-1 w-full border-gray-300 rounded-md"/></div>
                        <div><label className="block text-sm font-medium">อำเภอ</label><input type="text" name="amphoe" value={formData.idCardAddress.amphoe} onChange={e => handleAddressChange(e, 'idCardAddress')} className="mt-1 w-full border-gray-300 rounded-md"/></div>
                        <div><label className="block text-sm font-medium">จังหวัด</label><input type="text" name="changwat" value={formData.idCardAddress.changwat} onChange={e => handleAddressChange(e, 'idCardAddress')} className="mt-1 w-full border-gray-300 rounded-md"/></div>
                    </div>
                </div>
                 <div className="border-b border-gray-200 pb-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">ส่วนที่ 2: ที่อยู่ปัจจุบัน</h3>
                    <div className="flex space-x-6"><label><input type="radio" name="addressOption" value="same" checked={addressOption === 'same'} onChange={e => setAddressOption(e.target.value)}/> ใช้ที่อยู่เดียวกับบัตรประชาชน</label><label><input type="radio" name="addressOption" value="new" checked={addressOption === 'new'} onChange={e => setAddressOption(e.target.value)}/> กรอกที่อยู่ใหม่</label></div>
                    {addressOption === 'new' && <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium">บ้านเลขที่</label><input type="text" name="houseNumber" value={formData.currentAddress.houseNumber} onChange={e => handleAddressChange(e, 'currentAddress')} className="mt-1 w-full border-gray-300 rounded-md"/></div>
                        <div><label className="block text-sm font-medium">หมู่บ้าน</label><select name="village" value={formData.currentAddress.village} onChange={e => handleAddressChange(e, 'currentAddress')} className="mt-1 w-full border-gray-300 rounded-md bg-white"><option value="">-- เลือก --</option>{villages.map(v=><option key={v} value={v}>{v}</option>)}</select></div>
                        <div><label className="block text-sm font-medium">ตำบล</label><input type="text" name="tambon" value={formData.currentAddress.tambon} onChange={e => handleAddressChange(e, 'currentAddress')} className="mt-1 w-full border-gray-300 rounded-md"/></div>
                        <div><label className="block text-sm font-medium">อำเภอ</label><input type="text" name="amphoe" value={formData.currentAddress.amphoe} onChange={e => handleAddressChange(e, 'currentAddress')} className="mt-1 w-full border-gray-300 rounded-md"/></div>
                        <div><label className="block text-sm font-medium">จังหวัด</label><input type="text" name="changwat" value={formData.currentAddress.changwat} onChange={e => handleAddressChange(e, 'currentAddress')} className="mt-1 w-full border-gray-300 rounded-md"/></div>
                    </div>}
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">ส่วนที่ 3: ข้อมูลติดต่อเพิ่มเติม</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div><label className="block text-sm font-medium">เบอร์โทรศัพท์ผู้ป่วย/ผู้ดูแล</label><input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleBasicChange} className="mt-1 w-full border-gray-300 rounded-md" required/></div>
                       <div className="md:col-span-2"><label className="block text-sm font-medium">จุดสังเกต/รายละเอียดที่อยู่เพิ่มเติม</label><textarea name="landmark" rows={2} value={formData.landmark} onChange={handleBasicChange} className="mt-1 w-full border-gray-300 rounded-md"></textarea></div>
                       <div className="md:col-span-2"><div className="mt-2 border rounded-lg overflow-hidden"><MapTest position={currentPosition} onLocationChange={handleLocationChange} /></div></div>
                    </div>
                </div>
            </div>
            
            {/* Section 4: Attachments */}
             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-[#005A9C] mb-4">4. เอกสารแนบ</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <label htmlFor="attachmentsModal" className="mt-2 block text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer">เลือกไฟล์ (สูงสุด 5 ไฟล์)<input type="file" id="attachmentsModal" multiple onChange={handleAttachmentChange} className="sr-only" /></label>
                </div>
                {(existingAttachments.length > 0 || newAttachments.length > 0) ? (
                    <div className="mt-4 space-y-4">
                        {existingAttachments.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium">เอกสารที่มีอยู่แล้ว:</h3>
                                <ul className="mt-2 divide-y border rounded-md">{existingAttachments.map((file, index) => (
                                    <li key={index} className="flex items-center justify-between p-3">
                                        <div className="flex items-center min-w-0"><PaperclipIcon className="w-5 h-5 text-gray-400"/><p className="ml-2 text-sm truncate">{file.name}</p></div>
                                        <button type="button" onClick={() => handleRemoveExistingAttachment(index)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5" /></button>
                                    </li>))}
                                </ul>
                            </div>
                        )}
                        {newAttachments.length > 0 && (
                             <div>
                                <h3 className="text-sm font-medium">ไฟล์ที่อัปโหลดใหม่:</h3>
                                <ul className="mt-2 divide-y border rounded-md">{newAttachments.map((file, index) => (
                                    <li key={index} className="flex items-center justify-between p-3">
                                        <div className="flex items-center min-w-0"><PaperclipIcon className="w-5 h-5 text-gray-400"/><p className="ml-2 text-sm truncate">{file.name}</p></div>
                                        <button type="button" onClick={() => handleRemoveNewAttachment(index)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5" /></button>
                                    </li>))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mt-4 text-center text-sm text-gray-500">
                        <p>ยังไม่มีเอกสารแนบ</p>
                    </div>
                )}
            </div>
          </div>
          {/* Footer */}
          <div className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3 flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100">
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#005A9C] rounded-md hover:bg-blue-800"
            >
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPatientModal;