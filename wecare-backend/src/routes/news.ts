import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { sqliteDB } from '../db/sqliteDB';

const router = express.Router();

interface News {
  id: string;
  title: string;
  content: string;
  author_id?: string;
  author_name?: string;
  category?: string;
  tags?: string; // JSON
  image_url?: string;
  published_date?: string;
  is_published: number;
  views: number;
}

const generateNewsId = (): string => {
  const news = sqliteDB.all<{ id: string }>('SELECT id FROM news ORDER BY id DESC LIMIT 1');
  if (news.length === 0) return 'NEWS-001';
  const lastId = news[0].id;
  const num = parseInt(lastId.split('-')[1]) + 1;
  return `NEWS-${String(num).padStart(3, '0')}`;
};

// GET /api/news - Public access for published news
router.get('/', async (req, res) => {
  try {
    const { published } = req.query;
    let sql = 'SELECT * FROM news';
    const params: any[] = [];

    if (published === 'true') {
      sql += ' WHERE is_published = 1';
    }

    sql += ' ORDER BY published_date DESC';
    const news = sqliteDB.all<News>(sql, params);

    const parsed = news.map(n => ({
      ...n,
      tags: n.tags ? JSON.parse(n.tags) : [],
      is_published: n.is_published === 1
    }));
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/news/:id - Public access for published news
router.get('/:id', async (req, res) => {
  try {
    const article = sqliteDB.get<News>('SELECT * FROM news WHERE id = ?', [req.params.id]);
    if (!article) return res.status(404).json({ error: 'News not found' });

    // Increment views
    sqliteDB.update('news', req.params.id, { views: article.views + 1 });

    res.json({
      ...article,
      tags: article.tags ? JSON.parse(article.tags) : [],
      is_published: article.is_published === 1,
      views: article.views + 1
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/news - Requires authentication
router.post('/', authenticateToken, requireRole(['admin', 'DEVELOPER', 'OFFICER']), async (req, res) => {
  try {
    const newId = generateNewsId();
    const newNews = {
      id: newId,
      title: req.body.title,
      content: req.body.content,
      author_id: req.body.author_id || null,
      author_name: req.body.author_name || null,
      category: req.body.category || null,
      tags: JSON.stringify(req.body.tags || []),
      image_url: req.body.image_url || null,
      published_date: req.body.published_date || new Date().toISOString(),
      is_published: req.body.is_published ? 1 : 0,
      views: 0
    };
    sqliteDB.insert('news', newNews);
    const created = sqliteDB.get<News>('SELECT * FROM news WHERE id = ?', [newId]);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/news/:id - Requires authentication
router.put('/:id', authenticateToken, requireRole(['admin', 'DEVELOPER', 'OFFICER']), async (req, res) => {
  try {
    const updateData: any = {};
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.content) updateData.content = req.body.content;
    if (req.body.category) updateData.category = req.body.category;
    if (req.body.tags) updateData.tags = JSON.stringify(req.body.tags);
    if (req.body.image_url) updateData.image_url = req.body.image_url;
    if (req.body.is_published !== undefined) updateData.is_published = req.body.is_published ? 1 : 0;

    sqliteDB.update('news', req.params.id, updateData);
    const updated = sqliteDB.get<News>('SELECT * FROM news WHERE id = ?', [req.params.id]);
    if (!updated) return res.status(404).json({ error: 'News not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/news/:id - Requires authentication
router.delete('/:id', authenticateToken, requireRole(['admin', 'DEVELOPER']), async (req, res) => {
  try {
    const result = sqliteDB.delete('news', req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'News not found' });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
