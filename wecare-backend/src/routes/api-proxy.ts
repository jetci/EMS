import express from 'express';
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

/**
 * PHP-style proxy endpoints for frontend fallback compatibility
 * These endpoints mimic the old PHP API structure
 */

// GET /api-proxy/news.php - Get all published news
router.get('/news.php', async (req, res) => {
  try {
    const sql = 'SELECT * FROM news WHERE is_published = 1 ORDER BY published_date DESC';
    const news = await db.all<News>(sql);

    const parsed = news.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      authorId: n.author_id,
      authorName: n.author_name,
      category: n.category,
      tags: typeof n.tags === 'string' ? JSON.parse(n.tags) : (n.tags || []),
      imageUrl: n.image_url,
      publishedDate: n.published_date,
      status: n.is_published === 1 ? 'published' : 'draft',
      views: n.views
    }));

    res.json(parsed);
  } catch (err: any) {
    console.error('[API-PROXY] Error fetching news:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message
      }
    });
  }
});

// GET /api-proxy/news_item.php?id=xxx - Get single news item
router.get('/news_item.php', async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETER',
          message: 'Missing required parameter: id'
        }
      });
    }

    const article = await db.get<News>('SELECT * FROM news WHERE id = $1 AND is_published = 1', [id as string]);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'News article not found'
        }
      });
    }

    // Increment views
    await db.update('news', id as string, { views: (article.views || 0) + 1 });

    const parsed = {
      id: article.id,
      title: article.title,
      content: article.content,
      authorId: article.author_id,
      authorName: article.author_name,
      category: article.category,
      tags: typeof article.tags === 'string' ? JSON.parse(article.tags) : (article.tags || []),
      imageUrl: article.image_url,
      publishedDate: article.published_date,
      status: article.is_published === 1 ? 'published' : 'draft',
      views: (article.views || 0) + 1
    };

    res.json(parsed);
  } catch (err: any) {
    console.error('[API-PROXY] Error fetching news item:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message
      }
    });
  }
});

export default router;
