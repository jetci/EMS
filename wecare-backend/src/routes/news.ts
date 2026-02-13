import express from 'express';
import { authenticateToken, AuthRequest, optionalAuth, requireRole } from '../middleware/auth';
import { db } from '../db';

const router = express.Router();

interface News {
  id: string;
  title: string;
  content: string;
  author_id?: string;
  author_name?: string;
  category?: string;
  tags?: string | string[]; // JSON in DB
  image_url?: string;
  published_date?: string;
  is_published: number;
  views: number;
}

const generateNewsId = async (): Promise<string> => {
  const news = await db.all<{ id: string }>('SELECT id FROM news ORDER BY id DESC LIMIT 1');
  if (news.length === 0) return 'NEWS-001';
  const lastId = news[0].id;
  const num = parseInt(lastId.split('-')[1]) + 1;
  return `NEWS-${String(num).padStart(3, '0')}`;
};

const normalizeRole = (role: any): string => String(role || '').trim().toUpperCase();

const canManageNews = (req: AuthRequest): boolean => {
  const role = normalizeRole(req.user?.role);
  return role === 'ADMIN' || role === 'DEVELOPER' || role === 'OFFICER' || role === 'RADIO_CENTER';
};

const normalizeTags = (tags: any): string[] => {
  if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed.map(t => String(t).trim()).filter(Boolean);
    } catch { }
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
};

const mapNewsToClient = (n: any) => {
  const isPublished = n?.is_published === 1 || n?.is_published === true;
  const publishedDate = n?.published_date || null;
  return {
    ...n,
    author: n?.author_name || n?.author || 'ไม่ระบุ',
    featuredImageUrl: n?.image_url || n?.featuredImageUrl,
    publishedDate,
    status: isPublished ? 'published' : 'draft',
    is_published: isPublished,
    tags: Array.isArray(n?.tags) ? n.tags : (typeof n?.tags === 'string' ? (normalizeTags(n.tags)) : []),
  };
};

// GET /api/news - Public access for published news
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { published } = req.query;
    let sql = 'SELECT * FROM news';
    const params: any[] = [];

    const hasManageAccess = canManageNews(req);
    const shouldReturnAll = hasManageAccess && published !== 'true';

    if (!shouldReturnAll) {
      sql += ' WHERE is_published = 1';
    }

    sql += ' ORDER BY published_date DESC, created_at DESC';
    const news = await db.all<News>(sql, params);

    res.json(news.map(mapNewsToClient));
  } catch (err: any) {
    console.error('Fetch news error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/news/:id - Public access for published news
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const article = await db.get<News>('SELECT * FROM news WHERE id = $1', [req.params.id]);
    if (!article) return res.status(404).json({ error: 'News not found' });

    const isPublished = article.is_published === 1;
    if (!isPublished && !canManageNews(req)) {
      return res.status(404).json({ error: 'News not found' });
    }

    // Increment views for published articles only
    if (isPublished) {
      await db.update('news', req.params.id, { views: article.views + 1 });
    }

    res.json(mapNewsToClient({
      ...article,
      views: isPublished ? article.views + 1 : article.views
    }));
  } catch (err: any) {
    console.error('Fetch news article error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/news - Requires authentication
router.post('/', authenticateToken, requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio_center']), async (req: AuthRequest, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const content = String(req.body.content || '').trim();
    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const inputStatus = String(req.body.status || '').trim().toLowerCase();
    const isPublished = req.body.is_published === true || req.body.isPublished === true || inputStatus === 'published';
    const publishedDateInput = req.body.published_date || req.body.publishedDate || null;
    const publishedDate = isPublished ? (publishedDateInput || new Date().toISOString()) : null;

    const currentUserId = req.user?.id || null;
    const userRow = currentUserId ? await db.get<any>('SELECT full_name, email FROM users WHERE id = $1', [currentUserId]) : null;
    const authorName = (req.body.author_name || req.body.author || userRow?.full_name || userRow?.email || null);

    const newId = await generateNewsId();
    const newNews = {
      id: newId,
      title,
      content,
      author_id: req.body.author_id || req.body.authorId || currentUserId,
      author_name: authorName,
      category: req.body.category || null,
      tags: JSON.stringify(normalizeTags(req.body.tags)),
      image_url: req.body.image_url || req.body.featuredImageUrl || null,
      published_date: publishedDate,
      is_published: isPublished ? 1 : 0,
      views: 0
    };
    await db.insert('news', newNews);
    const created = await db.get<News>('SELECT * FROM news WHERE id = $1', [newId]);
    res.status(201).json(mapNewsToClient(created));
  } catch (err: any) {
    console.error('Create news article error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/news/:id - Requires authentication
router.put('/:id', authenticateToken, requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio_center']), async (req: AuthRequest, res) => {
  try {
    const existing = await db.get<News>('SELECT * FROM news WHERE id = $1', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'News not found' });

    const updateData: any = {};
    if (req.body.title !== undefined) updateData.title = String(req.body.title).trim();
    if (req.body.content !== undefined) updateData.content = String(req.body.content).trim();
    if (req.body.author_name || req.body.author !== undefined) updateData.author_name = req.body.author_name || req.body.author;
    if (req.body.category) updateData.category = req.body.category;
    if (req.body.tags !== undefined) updateData.tags = JSON.stringify(normalizeTags(req.body.tags));
    if (req.body.image_url !== undefined || req.body.featuredImageUrl !== undefined) updateData.image_url = req.body.image_url || req.body.featuredImageUrl || null;

    const inputStatus = String(req.body.status || '').trim().toLowerCase();
    const isPublishedInput =
      req.body.is_published !== undefined ? req.body.is_published === true
        : req.body.isPublished !== undefined ? req.body.isPublished === true
          : inputStatus ? inputStatus === 'published'
            : undefined;

    if (isPublishedInput !== undefined) {
      updateData.is_published = isPublishedInput ? 1 : 0;
      if (isPublishedInput) {
        const publishedDateInput = req.body.published_date || req.body.publishedDate || null;
        updateData.published_date = publishedDateInput || existing.published_date || new Date().toISOString();
      } else {
        updateData.published_date = null;
      }
    }

    await db.update('news', req.params.id, updateData);
    const updated = await db.get<News>('SELECT * FROM news WHERE id = $1', [req.params.id]);
    if (!updated) return res.status(404).json({ error: 'News not found' });
    res.json(mapNewsToClient(updated));
  } catch (err: any) {
    console.error('Update news article error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/news/:id - Requires authentication
router.delete('/:id', authenticateToken, requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio_center']), async (req, res) => {
  try {
    await db.delete('news', req.params.id);
    res.status(204).send();
  } catch (err: any) {
    console.error('Delete news article error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
