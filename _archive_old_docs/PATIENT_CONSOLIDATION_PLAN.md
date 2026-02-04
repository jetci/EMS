# 🚀 แผนการควบรวมหน้า Patient Management

**วันที่**: 16 มกราคม 2569  
**เวลา**: 11:05 น.  
**สถานะ**: 🔄 **กำลังดำเนินการ**

---

## 📊 Progress Tracker

| ขั้นตอน | สถานะ | เวลาที่ใช้ | หมายเหตุ |
|---------|-------|----------|---------|
| 1. สร้าง Shared Components | 🔄 1/3 | 10 นาที | PatientListTable ✅ |
| 2. สร้าง Unified Page | ⏳ รอ | - | - |
| 3. สร้าง Wrapper Pages | ⏳ รอ | - | - |
| 4. ทดสอบ | ⏳ รอ | - | - |
| **รวม** | **25%** | **10/240 นาที** | **4 ชั่วโมง** |

---

## ✅ ขั้นตอนที่ 1: สร้าง Shared Components (1 ชั่วโมง)

### 1.1 PatientListTable.tsx ✅ เสร็จแล้ว

**ไฟล์**: `src/components/patient/PatientListTable.tsx`

**ฟีเจอร์**:
- ✅ แสดงรายการผู้ป่วยแบบ Table
- ✅ Role-based Actions (canEdit, canDelete)
- ✅ Loading State
- ✅ Empty State
- ✅ Responsive Design

**Props**:
```typescript
interface PatientListTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
  onViewDetails: (patientId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  isLoading?: boolean;
}
```

---

### 1.2 PatientForm.tsx ⏳ รอสร้าง

**ไฟล์**: `src/components/patient/PatientForm.tsx`

**ฟีเจอร์**:
- แบบฟอร์มลงทะเบียนผู้ป่วย
- Validation (Joi Schema)
- Multi-step Wizard
- File Upload (Profile Image, Attachments)
- Map Picker (Location)

**Props**:
```typescript
interface PatientFormProps {
  initialData?: Partial<Patient>;
  onSubmit: (data: Patient) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
  isSubmitting?: boolean;
}
```

**Steps**:
1. ข้อมูลส่วนตัว (Personal Info)
2. ข้อมูลติดต่อ (Contact Info)
3. ที่อยู่ (Address)
4. ข้อมูลทางการแพทย์ (Medical Info)
5. เอกสารแนบ (Attachments)

---

### 1.3 EditPatientModal.tsx ⏳ รอสร้าง

**ไฟล์**: `src/components/patient/EditPatientModal.tsx`

**ฟีเจอร์**:
- Modal สำหรับแก้ไขผู้ป่วย
- ใช้ PatientForm ภายใน
- Close on backdrop click
- Keyboard shortcuts (ESC to close)

**Props**:
```typescript
interface EditPatientModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Patient) => Promise<void>;
}
```

---

## ⏳ ขั้นตอนที่ 2: สร้าง Unified Page (1.5 ชั่วโมง)

### 2.1 UnifiedPatientManagementPage.tsx ⏳ รอสร้าง

**ไฟล์**: `src/pages/unified/UnifiedPatientManagementPage.tsx`

**ฟีเจอร์**:
- ✅ Role-based Data Filtering
  - Community: เฉพาะผู้ป่วยที่ตัวเองสร้าง
  - Officer: ผู้ป่วยทั้งหมด
- ✅ CRUD Operations
  - Create Patient
  - Read Patient List
  - Update Patient
  - Delete Patient
- ✅ Search & Filter
- ✅ Pagination
- ✅ Export to Excel/PDF

**Structure**:
```typescript
const UnifiedPatientManagementPage: React.FC<{ userRole: string }> = ({ userRole }) => {
  // State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Role-based permissions
  const canEdit = ['community', 'OFFICER', 'admin'].includes(userRole);
  const canDelete = ['community', 'OFFICER', 'admin'].includes(userRole);
  const canViewAll = ['OFFICER', 'admin', 'EXECUTIVE'].includes(userRole);
  
  // Fetch patients (with role-based filtering)
  useEffect(() => {
    fetchPatients();
  }, [userRole]);
  
  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await patientsAPI.getAll();
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handlers
  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditModalOpen(true);
  };
  
  const handleDelete = async (patientId: string) => {
    if (!confirm('คุณต้องการลบผู้ป่วยนี้หรือไม่?')) return;
    
    try {
      await patientsAPI.delete(patientId);
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };
  
  const handleSave = async (data: Patient) => {
    try {
      if (selectedPatient) {
        await patientsAPI.update(selectedPatient.id, data);
      } else {
        await patientsAPI.create(data);
      }
      fetchPatients();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };
  
  return (
    <div className="unified-patient-management">
      <div className="page-header">
        <h1>จัดการข้อมูลผู้ป่วย</h1>
        <button onClick={() => setIsEditModalOpen(true)}>
          <i className="fas fa-plus"></i> ลงทะเบียนผู้ป่วยใหม่
        </button>
      </div>
      
      <PatientListTable
        patients={patients}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={(id) => navigate(`/patients/${id}`)}
        canEdit={canEdit}
        canDelete={canDelete}
        isLoading={isLoading}
      />
      
      <EditPatientModal
        patient={selectedPatient}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};
```

---

## ⏳ ขั้นตอนที่ 3: สร้าง Wrapper Pages (30 นาที)

### 3.1 CommunityPatientWrapper.tsx ⏳ รอสร้าง

**ไฟล์**: `src/pages/wrappers/CommunityPatientWrapper.tsx`

**วัตถุประสงค์**: Wrapper สำหรับ Community Role

```typescript
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UnifiedPatientManagementPage from '../unified/UnifiedPatientManagementPage';

const CommunityPatientWrapper: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <UnifiedPatientManagementPage 
      userRole={user?.role || 'community'}
    />
  );
};

export default CommunityPatientWrapper;
```

**Route**:
```typescript
// ใน App.tsx หรือ Router
<Route path="/community/patients" element={<CommunityPatientWrapper />} />
```

---

### 3.2 OfficePatientWrapper.tsx ⏳ รอสร้าง

**ไฟล์**: `src/pages/wrappers/OfficePatientWrapper.tsx`

**วัตถุประสงค์**: Wrapper สำหรับ Officer Role

```typescript
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UnifiedPatientManagementPage from '../unified/UnifiedPatientManagementPage';

const OfficePatientWrapper: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <UnifiedPatientManagementPage 
      userRole={user?.role || 'OFFICER'}
    />
  );
};

export default OfficePatientWrapper;
```

**Route**:
```typescript
<Route path="/office/patients" element={<OfficePatientWrapper />} />
```

---

### 3.3 อัปเดต Existing Pages (Backward Compatibility)

**ManagePatientsPage.tsx** → ใช้ CommunityPatientWrapper
```typescript
// d:\EMS\src\pages\ManagePatientsPage.tsx
import CommunityPatientWrapper from './wrappers/CommunityPatientWrapper';

const ManagePatientsPage = CommunityPatientWrapper;

export default ManagePatientsPage;
```

**OfficeManagePatientsPage.tsx** → ใช้ OfficePatientWrapper
```typescript
// d:\EMS\src\pages\OfficeManagePatientsPage.tsx
import OfficePatientWrapper from './wrappers/OfficePatientWrapper';

const OfficeManagePatientsPage = OfficePatientWrapper;

export default OfficeManagePatientsPage;
```

---

## ⏳ ขั้นตอนที่ 4: ทดสอบ (1 ชั่วโมง)

### 4.1 Unit Tests

**Test Cases**:
- [ ] PatientListTable renders correctly
- [ ] PatientForm validation works
- [ ] EditPatientModal opens/closes
- [ ] Role-based permissions work

### 4.2 Integration Tests

**Test Cases**:
- [ ] Community User can CRUD own patients
- [ ] Community User cannot see other patients
- [ ] Officer can see all patients
- [ ] Officer can CRUD all patients

### 4.3 Manual Tests

**Test Scenarios**:
1. Login as Community User
   - [ ] ลงทะเบียนผู้ป่วยใหม่
   - [ ] แก้ไขผู้ป่วยของตัวเอง
   - [ ] ลบผู้ป่วยของตัวเอง
   - [ ] ไม่เห็นผู้ป่วยของคนอื่น

2. Login as Officer
   - [ ] เห็นผู้ป่วยทั้งหมด
   - [ ] แก้ไขผู้ป่วยทุกคน
   - [ ] ลบผู้ป่วยทุกคน

---

## 📁 ไฟล์ที่ต้องสร้าง

### Shared Components (3 ไฟล์)
- [x] `src/components/patient/PatientListTable.tsx` ✅
- [ ] `src/components/patient/PatientForm.tsx`
- [ ] `src/components/patient/EditPatientModal.tsx`

### Unified Page (1 ไฟล์)
- [ ] `src/pages/unified/UnifiedPatientManagementPage.tsx`

### Wrapper Pages (2 ไฟล์)
- [ ] `src/pages/wrappers/CommunityPatientWrapper.tsx`
- [ ] `src/pages/wrappers/OfficePatientWrapper.tsx`

### Updated Pages (2 ไฟล์)
- [ ] `src/pages/ManagePatientsPage.tsx` (อัปเดต)
- [ ] `src/pages/OfficeManagePatientsPage.tsx` (อัปเดต)

**รวม**: 8 ไฟล์ (1 สร้างแล้ว, 7 รอสร้าง)

---

## 🎯 ขั้นตอนถัดไป

### Option 1: ทำต่อเลย (แนะนำ)
```bash
# สร้างไฟล์ที่เหลือทีละไฟล์
1. PatientForm.tsx
2. EditPatientModal.tsx
3. UnifiedPatientManagementPage.tsx
4. Wrapper Pages
5. ทดสอบ
```

### Option 2: สร้าง Implementation Guide
```bash
# สร้างคู่มือสำหรับทีมพัฒนา
- Step-by-step instructions
- Code examples
- Test cases
```

### Option 3: สร้าง Prototype
```bash
# สร้าง Prototype เพื่อทดสอบ Concept
- Basic Unified Page
- Simple Wrapper
- ทดสอบ Role-based Logic
```

---

## 💡 ข้อเสนอแนะ

**ควรทำ**:
1. ✅ สร้างทีละ Component
2. ✅ ทดสอบหลังสร้างแต่ละไฟล์
3. ✅ Commit Code บ่อยๆ
4. ✅ เขียน Tests

**ไม่ควรทำ**:
1. ❌ สร้างทุกไฟล์พร้อมกัน
2. ❌ ลบหน้าเดิมทันที
3. ❌ เปลี่ยน API
4. ❌ ข้าม Testing

---

**สถานะ**: 🔄 **กำลังดำเนินการ 25%**  
**เวลาที่ใช้**: 10 นาที / 4 ชั่วโมง  
**ไฟล์ที่สร้าง**: 1/8 ไฟล์
