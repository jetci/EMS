import React, { useState, useEffect } from 'react';
import { CommunityView } from '../types';
import MapTest from '../components/MapTest';
import { formatDateToThai } from '../utils/dateUtils';
import CameraIcon from '../components/icons/CameraIcon';
import UploadIcon from '../components/icons/UploadIcon';
import PaperclipIcon from '../components/icons/PaperclipIcon';
import TrashIcon from '../components/icons/TrashIcon';
import { defaultProfileImage } from '../assets/defaultProfile';
import TagInput from '../components/ui/TagInput';
import MultiSelectAutocomplete from '../components/ui/MultiSelectAutocomplete';
import ThaiDatePicker from '../components/ui/ThaiDatePicker';

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

interface CommunityRegisterPatientPageProps {
    setActiveView: (view: CommunityView) => void;
}

const CommunityRegisterPatientPage: React.FC<CommunityRegisterPatientPageProps> = ({ setActiveView }) => {
    const [formData, setFormData] = useState({
        title: '',
        firstName: '',
        lastName: '',
        gender: '',
        nationalId: '',
        dob: '',
        age: '',
        bloodType: '',
        rhFactor: '',
        healthCoverage: '',
        idCardAddress: {
            houseNumber: '',
            village: '',
            tambon: 'เวียง',
            amphoe: 'ฝาง',
            changwat: 'เชียงใหม่',
        },
        currentAddress: {
            houseNumber: '',
            village: '',
            tambon: 'เวียง',
            amphoe: 'ฝาง',
            changwat: 'เชียงใหม่',
        },
        addressOption: 'same', // 'same' or 'new'
        contactPhone: '',
        landmark: '',
        latitude: '19.9213',
        longitude: '99.2131',
    });
    const [patientTypes, setPatientTypes] = useState<string[]>([]);
    const [chronicDiseases, setChronicDiseases] = useState<string[]>([]);
    const [allergies, setAllergies] = useState<string[]>([]);
    const [profileImage, setProfileImage] = useState<{ file: File | null, previewUrl: string | null }>({ file: null, previewUrl: null });
    const [attachments, setAttachments] = useState<File[]>([]);

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
            setFormData(prev => ({ ...prev, age: age >= 0 ? `${age} ปี` : '' }));
        } else {
            setFormData(prev => ({ ...prev, age: '' }));
        }
    }, [formData.dob]);
    
    useEffect(() => {
        if (formData.addressOption === 'same') {
            setFormData(prev => ({
                ...prev,
                currentAddress: prev.idCardAddress
            }));
        }
    }, [formData.idCardAddress, formData.addressOption]);

    const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, addressType: 'idCardAddress' | 'currentAddress') => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [addressType]: { ...prev[addressType], [name]: value }
        }));
    };

    const handleAddressOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, addressOption: e.target.value }));
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
            if (attachments.length + newFiles.length > 5) {
                alert("คุณสามารถอัปโหลดเอกสารได้สูงสุด 5 ไฟล์เท่านั้น");
                return;
            }
            setAttachments(prev => [...prev, ...newFiles]);
        }
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleLocationChange = (coords: { lat: number; lng: number }) => {
        setFormData(prev => ({ ...prev, latitude: coords.lat.toString(), longitude: coords.lng.toString() }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Saving new patient:", { formData, patientTypes, chronicDiseases, allergies });
        alert('บันทึกข้อมูลผู้ป่วยใหม่สำเร็จ!');
        setActiveView('patients');
    };
    
    const today = new Date().toISOString().split('T')[0];
    const currentPosition = { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) };

    const readonlyClasses = "mt-1 w-full bg-gray-100 rounded-lg py-2.5 px-3.5 text-gray-800 text-sm";

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">ลงทะเบียนผู้ป่วยใหม่</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Personal Identification */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">1. ข้อมูลระบุตัวตน</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 flex flex-col items-center">
                             <img src={profileImage.previewUrl || defaultProfileImage} alt="Patient profile" className="w-36 h-36 rounded-full object-cover border-4 border-gray-200" />
                            <label htmlFor="profileImage" className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                                อัปโหลดรูปภาพ
                                <input type="file" id="profileImage" accept="image/*" onChange={handleProfileImageChange} className="sr-only" />
                            </label>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">คำนำหน้าชื่อ</label>
                                <select name="title" value={formData.title} onChange={handleBasicChange} className="mt-1" required>
                                    <option value="" disabled>-- เลือก --</option>
                                    {titles.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">เพศ</label>
                                <div className={readonlyClasses}>{formData.gender || '-'}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleBasicChange} className="mt-1" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">นามสกุล</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleBasicChange} className="mt-1" required />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">เลขบัตรประชาชน</label>
                                <input type="text" name="nationalId" value={formData.nationalId} onChange={handleBasicChange} className="mt-1" maxLength={13} pattern="\d{13}" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">วัน/เดือน/ปีเกิด</label>
                                <ThaiDatePicker name="dob" value={formData.dob} onChange={handleBasicChange} max={today} required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">อายุ</label>
                                <div className={readonlyClasses}>{formData.age || '-'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Medical Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">2. ข้อมูลทางการแพทย์เบื้องต้น</h2>
                    <div className="space-y-6">
                        <MultiSelectAutocomplete id="patientType" options={patientTypeOptions} selectedItems={patientTypes} setSelectedItems={setPatientTypes} placeholder="เลือกประเภทผู้ป่วย (ได้มากกว่า 1)..."/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TagInput tags={chronicDiseases} setTags={setChronicDiseases} placeholder="เพิ่มโรคประจำตัว...ทีละรายการ" />
                            <TagInput tags={allergies} setTags={setAllergies} placeholder="เพิ่มประวัติการแพ้ยา/อาหาร..." />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <select name="bloodType" value={formData.bloodType} onChange={handleBasicChange}><option value="">-- กรุ๊ปเลือด --</option>{bloodTypes.map(b => <option key={b} value={b}>{b}</option>)}</select>
                            <select name="rhFactor" value={formData.rhFactor} onChange={handleBasicChange}><option value="">-- Rh --</option>{rhFactors.map(rh => <option key={rh} value={rh}>{rh}</option>)}</select>
                            <select name="healthCoverage" value={formData.healthCoverage} onChange={handleBasicChange}><option value="">-- สิทธิการรักษา --</option>{healthCoverages.map(hc => <option key={hc} value={hc}>{hc}</option>)}</select>
                        </div>
                    </div>
                </div>

                {/* Section 3: Address & Contact */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">3. ที่อยู่และข้อมูลติดต่อ</h2>
                    
                    <div className="border-b border-gray-200 pb-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">ส่วนที่ 1: ที่อยู่ตามบัตรประชาชน</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">บ้านเลขที่</label>
                                <input type="text" name="houseNumber" value={formData.idCardAddress.houseNumber} onChange={e => handleAddressChange(e, 'idCardAddress')} className="mt-1"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">หมู่บ้าน</label>
                                <select name="village" value={formData.idCardAddress.village} onChange={e => handleAddressChange(e, 'idCardAddress')} className="mt-1">
                                    <option value="">-- เลือก --</option>
                                    {villages.map(v=><option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ตำบล</label>
                                <div className="mt-1 p-2.5 bg-gray-100 rounded-lg text-gray-800 text-sm">{formData.idCardAddress.tambon}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">อำเภอ</label>
                                <div className="mt-1 p-2.5 bg-gray-100 rounded-lg text-gray-800 text-sm">{formData.idCardAddress.amphoe}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">จังหวัด</label>
                                <div className="mt-1 p-2.5 bg-gray-100 rounded-lg text-gray-800 text-sm">{formData.idCardAddress.changwat}</div>
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-gray-200 pb-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">ส่วนที่ 2: ที่อยู่ปัจจุบัน</h3>
                        <div className="flex items-center space-x-6">
                            <label className="flex items-center">
                                <input type="radio" name="addressOption" value="same" checked={formData.addressOption === 'same'} onChange={handleAddressOptionChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                                <span className="ml-2 text-sm text-gray-700">ใช้ที่อยู่เดียวกับบัตรประชาชน</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" name="addressOption" value="new" checked={formData.addressOption === 'new'} onChange={handleAddressOptionChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                                <span className="ml-2 text-sm text-gray-700">กรอกที่อยู่ใหม่</span>
                            </label>
                        </div>
                        {formData.addressOption === 'new' && 
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 animate-scale-in">
                                <div><label className="block text-sm font-medium text-gray-700">บ้านเลขที่</label><input type="text" name="houseNumber" value={formData.currentAddress.houseNumber} onChange={e => handleAddressChange(e, 'currentAddress')} className="mt-1"/></div>
                                <div><label className="block text-sm font-medium text-gray-700">หมู่บ้าน</label><select name="village" value={formData.currentAddress.village} onChange={e => handleAddressChange(e, 'currentAddress')} className="mt-1"><option value="">-- เลือก --</option>{villages.map(v=><option key={v} value={v}>{v}</option>)}</select></div>
                                <div><label className="block text-sm font-medium text-gray-700">ตำบล</label><input type="text" name="tambon" value={formData.currentAddress.tambon} onChange={e => handleAddressChange(e, 'currentAddress')} className="mt-1"/></div>
                                <div><label className="block text-sm font-medium text-gray-700">อำเภอ</label><input type="text" name="amphoe" value={formData.currentAddress.amphoe} onChange={e => handleAddressChange(e, 'currentAddress')} className="mt-1"/></div>
                                <div><label className="block text-sm font-medium text-gray-700">จังหวัด</label><input type="text" name="changwat" value={formData.currentAddress.changwat} onChange={e => handleAddressChange(e, 'currentAddress')} className="mt-1"/></div>
                            </div>
                        }
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">ส่วนที่ 3: ข้อมูลติดต่อเพิ่มเติม</h3>
                        <div className="space-y-4">
                           <div>
                                <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์ผู้ป่วย/ผู้ดูแล</label>
                                <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleBasicChange} className="mt-1" required/>
                           </div>
                           <div>
                                <label className="block text-sm font-medium text-gray-700">จุดสังเกต/รายละเอียดที่อยู่เพิ่มเติม</label>
                                <textarea name="landmark" rows={2} value={formData.landmark} onChange={handleBasicChange} className="mt-1"></textarea>
                           </div>
                           <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">ปักหมุดตำแหน่งที่อยู่ปัจจุบัน</label>
                                <div className="border rounded-lg overflow-hidden">
                                    <MapTest position={currentPosition} onLocationChange={handleLocationChange} />
                                </div>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: Attachments */}
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-[var(--wecare-blue)] mb-4">4. เอกสารแนบ</h2>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <label htmlFor="attachments" className="mt-2 block text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer">เลือกไฟล์ (สูงสุด 5 ไฟล์)<input type="file" id="attachments" multiple onChange={handleAttachmentChange} className="sr-only" /></label>
                    </div>
                    {attachments.length > 0 ? (
                        <div className="mt-4">
                            <h3 className="text-sm font-medium">ไฟล์ที่อัปโหลดแล้ว:</h3>
                            <ul className="mt-2 divide-y border rounded-md">{attachments.map((file, index) => (
                                <li key={index} className="flex items-center justify-between p-3">
                                    <div className="flex items-center min-w-0"><PaperclipIcon className="w-5 h-5 text-gray-400"/><p className="ml-2 text-sm truncate">{file.name}</p></div>
                                    <button type="button" onClick={() => handleRemoveAttachment(index)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5" /></button>
                                </li>))}
                            </ul>
                        </div>
                    ) : (
                        <div className="mt-4 text-center text-sm text-gray-500">
                            <p>ยังไม่มีเอกสารแนบ</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                    <button type="button" onClick={() => setActiveView('patients')} className="px-6 py-2.5 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">ยกเลิก</button>
                    <button type="submit" className="px-6 py-2.5 font-semibold text-white bg-[var(--wecare-green)] rounded-lg shadow-sm hover:bg-green-600">บันทึกข้อมูลผู้ป่วย</button>
                </div>
            </form>
        </div>
    );
};

export default CommunityRegisterPatientPage;