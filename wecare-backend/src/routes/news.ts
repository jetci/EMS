import express from 'express';

const router = express.Router();

// Mock news data
const mockNews = [
  { 
    id: 'NEWS-001', 
    title: 'ประกาศเปิดให้บริการ', 
    content: 'ระบบ WeCare เปิดให้บริการแล้ว', 
    author: 'Admin',
    publishedDate: '2024-09-01',
    status: 'Published',
    category: 'Announcement'
  },
  { 
    id: 'NEWS-002', 
    title: 'อัพเดทระบบใหม่', 
    content: 'เพิ่มฟีเจอร์ใหม่', 
    author: 'Admin',
    publishedDate: '2024-09-10',
    status: 'Published',
    category: 'Update'
  },
];

// GET /api/news
router.get('/', async (_req, res) => {
  try {
    res.json(mockNews);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/news/:id
router.get('/:id', async (req, res) => {
  try {
    const news = mockNews.find(n => n.id === req.params.id);
    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }
    res.json(news);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/news
router.post('/', async (req, res) => {
  try {
    const newNews = {
      id: `NEWS-${String(mockNews.length + 1).padStart(3, '0')}`,
      ...req.body,
      publishedDate: new Date().toISOString().split('T')[0],
      status: 'Draft'
    };
    mockNews.push(newNews);
    res.status(201).json(newNews);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/news/:id
router.put('/:id', async (req, res) => {
  try {
    const index = mockNews.findIndex(n => n.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'News not found' });
    }
    mockNews[index] = { ...mockNews[index], ...req.body };
    res.json(mockNews[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/news/:id
router.delete('/:id', async (req, res) => {
  try {
    const index = mockNews.findIndex(n => n.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'News not found' });
    }
    mockNews.splice(index, 1);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
