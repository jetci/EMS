/**
 * Step 3: Contact & Address Information
 * Patient registration wizard - Contact details
 */

import React, { useState } from 'react';
import SimpleLeafletMapPicker from '../../../components/SimpleLeafletMapPicker';

interface Step3Props {
  onNext?: (data: any) => void;
  onBack?: () => void;
  formData?: any;
  isFirstStep?: boolean;
  isLastStep?: boolean;
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

const Step3Contact: React.FC<Step3Props> = ({ onNext, onBack, formData = {} as any }) => {
  const [data, setData] = useState({
    contactPhone: formData.contactPhone || '',
    idCardAddress: formData.idCardAddress || {
      houseNumber: '',
      village: '',
      tambon: 'เวียง',
      amphoe: 'ฝาง',
      changwat: 'เชียงใหม่',
    },
    currentAddress: formData.currentAddress || {
      houseNumber: '',
      village: '',
      tambon: 'เวียง',
      amphoe: 'ฝาง',
      changwat: 'เชียงใหม่',
    },
    emergencyContactName: formData.emergencyContactName || '',
    emergencyContactPhone: formData.emergencyContactPhone || '',
    emergencyContactRelation: formData.emergencyContactRelation || '',
    landmark: formData.landmark || '',
    latitude: formData.latitude || '19.9213',
    longitude: formData.longitude || '99.2131',
    ...formData,
  });

  const [addressOption, setAddressOption] = useState(formData.addressOption || 'same');
  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleIdCardAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newIdCardAddress = {
      ...data.idCardAddress,
      [name]: value,
    };

    setData({
      ...data,
      idCardAddress: newIdCardAddress,
      currentAddress: addressOption === 'same' ? newIdCardAddress : data.currentAddress,
    });
  };

  const handleCurrentAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData({
      ...data,
      currentAddress: {
        ...data.currentAddress,
        [name]: value,
      },
    });
  };

  const handleAddressOptionChange = (option: string) => {
    setAddressOption(option);
    if (option === 'same') {
      setData({
        ...data,
        currentAddress: data.idCardAddress,
      });
    }
  };

  const handleLocationChange = (coords: { lat: number; lng: number }) => {
    setData({
      ...data,
      latitude: coords.lat.toString(),
      longitude: coords.lng.toString(),
    });
  };

  const validate = () => {
    const newErrors: any = {};

    if (!data.contactPhone?.trim()) {
      newErrors.contactPhone = 'กรุณากรอกเบอร์โทรศัพท์';
    } else if (!/^0\d{8,9}$/.test(data.contactPhone)) {
      newErrors.contactPhone = 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0 และมี 9-10 หลัก)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate() && onNext) {
      onNext({ ...data, addressOption });
    }
  };

  const currentPosition = {
    lat: parseFloat(data.latitude) || 19.9213,
    lng: parseFloat(data.longitude) || 99.2131
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          ข้อมูลติดต่อ
        </h2>
        <p className="text-sm text-gray-600">
          กรุณากรอกข้อมูลที่อยู่และผู้ติดต่อฉุกเฉิน
        </p>
      </div>

      {/* Contact Phone */}
      <div>
        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
          เบอร์โทรศัพท์ <span className="text-red-600">*</span>
        </label>
        <input
          type="tel"
          id="contactPhone"
          name="contactPhone"
          value={data.contactPhone}
          onChange={handleChange}
          maxLength={10}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.contactPhone ? 'border-red-300' : 'border-gray-300'
            }`}
          placeholder="0812345678 หรือ 053382670"
        />
        {errors.contactPhone && (
          <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>
        )}
      </div>

      {/* ID Card Address */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">ที่อยู่ตามทะเบียนบ้าน</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="idCardHouseNumber" className="block text-sm font-medium text-gray-700 mb-1">
              บ้านเลขที่
            </label>
            <input
              type="text"
              id="idCardHouseNumber"
              name="houseNumber"
              value={data.idCardAddress.houseNumber}
              onChange={handleIdCardAddressChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="123"
            />
          </div>

          <div>
            <label htmlFor="idCardVillage" className="block text-sm font-medium text-gray-700 mb-1">
              หมู่บ้าน
            </label>
            <select
              id="idCardVillage"
              name="village"
              value={data.idCardAddress.village}
              onChange={handleIdCardAddressChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- เลือกหมู่บ้าน --</option>
              {villages.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="idCardTambon" className="block text-sm font-medium text-gray-700 mb-1">
              ตำบล
            </label>
            <input
              type="text"
              id="idCardTambon"
              name="tambon"
              value={data.idCardAddress.tambon}
              onChange={handleIdCardAddressChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="ตำบล"
            />
          </div>

          <div>
            <label htmlFor="idCardAmphoe" className="block text-sm font-medium text-gray-700 mb-1">
              อำเภอ
            </label>
            <input
              type="text"
              id="idCardAmphoe"
              name="amphoe"
              value={data.idCardAddress.amphoe}
              onChange={handleIdCardAddressChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="อำเภอ"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="idCardChangwat" className="block text-sm font-medium text-gray-700 mb-1">
              จังหวัด
            </label>
            <input
              type="text"
              id="idCardChangwat"
              name="changwat"
              value={data.idCardAddress.changwat}
              onChange={handleIdCardAddressChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="จังหวัด"
            />
          </div>
        </div>
      </div>

      {/* Address Option */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ที่อยู่ปัจจุบัน
        </label>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="addressOption"
              value="same"
              checked={addressOption === 'same'}
              onChange={() => handleAddressOptionChange('same')}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">ตามทะเบียนบ้าน</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="addressOption"
              value="new"
              checked={addressOption === 'new'}
              onChange={() => handleAddressOptionChange('new')}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">ระบุใหม่</span>
          </label>
        </div>

        {addressOption === 'new' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="currentHouseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                บ้านเลขที่
              </label>
              <input
                type="text"
                id="currentHouseNumber"
                name="houseNumber"
                value={data.currentAddress.houseNumber}
                onChange={handleCurrentAddressChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="123"
              />
            </div>

            <div>
              <label htmlFor="currentVillage" className="block text-sm font-medium text-gray-700 mb-1">
                หมู่บ้าน
              </label>
              <select
                id="currentVillage"
                name="village"
                value={data.currentAddress.village}
                onChange={handleCurrentAddressChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- เลือกหมู่บ้าน --</option>
                {villages.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="currentTambon" className="block text-sm font-medium text-gray-700 mb-1">
                ตำบล
              </label>
              <input
                type="text"
                id="currentTambon"
                name="tambon"
                value={data.currentAddress.tambon}
                onChange={handleCurrentAddressChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="ตำบล"
              />
            </div>

            <div>
              <label htmlFor="currentAmphoe" className="block text-sm font-medium text-gray-700 mb-1">
                อำเภอ
              </label>
              <input
                type="text"
                id="currentAmphoe"
                name="amphoe"
                value={data.currentAddress.amphoe}
                onChange={handleCurrentAddressChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="อำเภอ"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="currentChangwat" className="block text-sm font-medium text-gray-700 mb-1">
                จังหวัด
              </label>
              <input
                type="text"
                id="currentChangwat"
                name="changwat"
                value={data.currentAddress.changwat}
                onChange={handleCurrentAddressChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="จังหวัด"
              />
            </div>
          </div>
        )}
      </div>

      {/* Landmark */}
      <div>
        <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-1">
          จุดสังเกต/รายละเอียดที่อยู่เพิ่มเติม
        </label>
        <textarea
          id="landmark"
          name="landmark"
          value={data.landmark}
          onChange={handleChange}
          rows={2}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="เช่น ใกล้วัด, ข้างโรงเรียน, ฯลฯ"
        />
      </div>

      {/* Map */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ระบุตำแหน่งบ้านผู้ป่วยบนแผนที่
        </label>
        <div className="border rounded-lg overflow-hidden h-[400px]">
          <SimpleLeafletMapPicker
            position={currentPosition}
            onLocationChange={handleLocationChange}
            markerTitle="ที่อยู่ผู้ป่วย"
            markerDescription={data.landmark || "ลากหมุดเพื่อระบุตำแหน่งที่อยู่ปัจจุบันของผู้ป่วย"}
          />
        </div>

        {/* Coordinates Display - Below Map */}
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-semibold text-sm">📍 พิกัดที่เลือก:</span>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-600">Lat:</span>
                <span className="font-mono text-gray-900">{currentPosition.lat.toFixed(6)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-600">Lng:</span>
                <span className="font-mono text-gray-900">{currentPosition.lng.toFixed(6)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">ผู้ติดต่อฉุกเฉิน</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อ-นามสกุล
            </label>
            <input
              type="text"
              id="emergencyContactName"
              name="emergencyContactName"
              value={data.emergencyContactName}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="เช่น สมหญิง ใจดี"
            />
          </div>

          <div>
            <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-1">
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              value={data.emergencyContactPhone}
              onChange={handleChange}
              maxLength={10}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="0898765432"
            />
          </div>

          <div>
            <label htmlFor="emergencyContactRelation" className="block text-sm font-medium text-gray-700 mb-1">
              ความสัมพันธ์
            </label>
            <input
              type="text"
              id="emergencyContactRelation"
              name="emergencyContactRelation"
              value={data.emergencyContactRelation}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="เช่น บุตร, คู่สมรส"
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          ย้อนกลับ
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
};

export default Step3Contact;
