import React, { useEffect, useState } from 'react';
import { facilitiesAPI } from '../services/api';
import SimpleLeafletMapPicker from '../components/SimpleLeafletMapPicker';

interface Facility {
  id: string;
  name: string;
  lat: number;
  lng: number;
  facilityType?: string;
  isActive: boolean;
}

type Mode = 'list' | 'create' | 'edit';

const emptyForm = {
  id: '',
  name: '',
  lat: '',
  lng: '',
  facilityType: '',
  isActive: true,
};

const ManageFacilitiesPage: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('list');
  const [form, setForm] = useState({
    id: '',
    name: '',
    lat: '',
    lng: '',
    facilityType: '',
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);

  const loadFacilities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await facilitiesAPI.getFacilities();
      const raw = Array.isArray(data) ? data : (data?.data || []);
      const mapped: Facility[] = (raw || []).map((f: any) => ({
        id: String(f.id),
        name: f.name || '',
        lat: typeof f.lat === 'number' ? f.lat : Number(f.lat),
        lng: typeof f.lng === 'number' ? f.lng : Number(f.lng),
        facilityType: f.facilityType || f.facility_type || '',
        isActive: typeof f.isActive === 'boolean' ? f.isActive : f.is_active !== false,
      })).filter(f => f.name && Number.isFinite(f.lat) && Number.isFinite(f.lng));
      setFacilities(mapped);
    } catch (e: any) {
      console.error('Failed to load facilities', e);
      setError(e?.message || 'ไม่สามารถโหลดข้อมูลสถานพยาบาลได้');
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = () => {
    setForm(emptyForm);
    setMode('create');
    setError(null);
  };

  const handleEdit = (facility: Facility) => {
    setForm({
      id: facility.id,
      name: facility.name,
      lat: String(facility.lat),
      lng: String(facility.lng),
      facilityType: facility.facilityType || '',
      isActive: facility.isActive,
    });
    setMode('edit');
    setError(null);
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError('กรุณาระบุชื่อสถานพยาบาล');
      return false;
    }
    const lat = Number(form.lat);
    const lng = Number(form.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError('กรุณาระบุพิกัดละติจูด/ลองจิจูดให้ถูกต้อง');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    const payload: any = {
      name: form.name.trim(),
      lat: Number(form.lat),
      lng: Number(form.lng),
      facilityType: form.facilityType.trim() || undefined,
      isActive: form.isActive,
    };

    try {
      if (mode === 'create') {
        await facilitiesAPI.createFacility(payload);
      } else if (mode === 'edit' && form.id) {
        await facilitiesAPI.updateFacility(form.id, payload);
      }
      await loadFacilities();
      setMode('list');
      setForm(emptyForm);
    } catch (e: any) {
      console.error('Failed to save facility', e);
      setError(e?.message || 'ไม่สามารถบันทึกข้อมูลสถานพยาบาลได้');
    }
  };

  const handleCancel = () => {
    setMode('list');
    setForm(emptyForm);
    setError(null);
  };

  const handleToggleActive = async (facility: Facility) => {
    try {
      await facilitiesAPI.updateFacility(facility.id, { isActive: !facility.isActive });
      await loadFacilities();
    } catch (e: any) {
      console.error('Failed to toggle active', e);
      setError(e?.message || 'ไม่สามารถเปลี่ยนสถานะการใช้งานได้');
    }
  };

  const handleMapLocationChange = (coords: { lat: number; lng: number }) => {
    setForm(prev => ({
      ...prev,
      lat: String(coords.lat),
      lng: String(coords.lng),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">จัดการสถานพยาบาล</h1>
          <p className="text-gray-600 text-sm mt-1">
            เพิ่ม/แก้ไขรายชื่อโรงพยาบาลและสถานพยาบาลปลายทางสำหรับคำขอเดินทาง
          </p>
        </div>
        {mode === 'list' && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-lg bg-[var(--wecare-blue)] text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            + เพิ่มสถานพยาบาล
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {mode === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">รายการสถานพยาบาล</h2>
            {loading && <span className="text-xs text-gray-500">กำลังโหลด...</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-2">ชื่อ</th>
                  <th className="px-4 py-2">ประเภท</th>
                  <th className="px-4 py-2">ละติจูด</th>
                  <th className="px-4 py-2">ลองจิจูด</th>
                  <th className="px-4 py-2">สถานะ</th>
                  <th className="px-4 py-2 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {facilities.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      ยังไม่มีข้อมูลสถานพยาบาล
                    </td>
                  </tr>
                )}
                {facilities.map(f => (
                  <tr key={f.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">{f.name}</td>
                    <td className="px-4 py-2">{f.facilityType || '-'}</td>
                    <td className="px-4 py-2 font-mono text-xs">{f.lat}</td>
                    <td className="px-4 py-2 font-mono text-xs">{f.lng}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${f.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {f.isActive ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(f)}
                        className="px-3 py-1 text-xs rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleToggleActive(f)}
                        className={`px-3 py-1 text-xs rounded border ${f.isActive
                          ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                          }`}
                      >
                        {f.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mode !== 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {mode === 'create' ? 'เพิ่มสถานพยาบาลใหม่' : 'แก้ไขสถานพยาบาล'}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อสถานพยาบาล
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--wecare-blue)] focus:border-[var(--wecare-blue)]"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-1">
                    ละติจูด (Lat)
                  </label>
                  <input
                    id="lat"
                    name="lat"
                    type="number"
                    step="any"
                    value={form.lat}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-1">
                    ลองจิจูด (Lng)
                  </label>
                  <input
                    id="lng"
                    name="lng"
                    type="number"
                    step="any"
                    value={form.lng}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="facilityType" className="block text-sm font-medium text-gray-700 mb-1">
                  ประเภท (เช่น โรงพยาบาลชุมชน, รพ.สต.)
                </label>
                <input
                  id="facilityType"
                  name="facilityType"
                  type="text"
                  value={form.facilityType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="ถ้าไม่ระบุ สามารถเว้นว่างได้"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-[var(--wecare-blue)] border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  ใช้งานอยู่ (แสดงใน dropdown ปลายทางให้ผู้ใช้เลือก)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[var(--wecare-blue)] text-white text-sm font-semibold hover:bg-blue-700"
                >
                  บันทึก
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">
                เลือกตำแหน่งบนแผนที่
              </div>
              <SimpleLeafletMapPicker
                position={{
                  lat: form.lat ? Number(form.lat) : 19.904394846183447,
                  lng: form.lng ? Number(form.lng) : 99.19735149982482,
                }}
                onLocationChange={handleMapLocationChange}
                markerTitle={form.name || 'ตำแหน่งสถานพยาบาล'}
                markerDescription={form.facilityType || ''}
                height="400px"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFacilitiesPage;
