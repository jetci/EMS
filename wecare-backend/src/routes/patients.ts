import express from 'express';

const router = express.Router();

// Mock patients data
const mockPatients: any[] = [
  { id: 'PAT-001', full_name: 'Patient One', phone: '0891111111', address: 'หมู่ 1', patient_types: 'ฟอกไต', key_info: 'ต้องการรถเข็น', registered_date: '2024-01-01' },
  { id: 'PAT-002', full_name: 'Patient Two', phone: '0892222222', address: 'หมู่ 2', patient_types: 'กายภาพบำบัด', key_info: '', registered_date: '2024-01-02' },
  { id: 'PAT-003', full_name: 'Patient Three', phone: '0893333333', address: 'หมู่ 3', patient_types: 'รับยา', key_info: '', registered_date: '2024-01-03' },
];

// GET /api/patients - fetch all patients
router.get('/', async (_req, res) => {
  try {
    res.json(mockPatients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients/:id - fetch patient by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const patient = mockPatients.find(p => p.id === id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/patients - create new patient
router.post('/', async (req, res) => {
  try {
    const newPatient = {
      id: `PAT-${String(mockPatients.length + 1).padStart(3, '0')}`,
      ...req.body,
      registered_date: new Date().toISOString().split('T')[0]
    };
    mockPatients.push(newPatient);
    res.status(201).json(newPatient);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/patients/:id - update patient
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const index = mockPatients.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    mockPatients[index] = { ...mockPatients[index], ...req.body };
    res.json(mockPatients[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/patients/:id - delete patient
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const index = mockPatients.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    mockPatients.splice(index, 1);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
