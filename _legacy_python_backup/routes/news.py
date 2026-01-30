from flask import Blueprint, request, jsonify
from src.models.ems_models import db, NewsArticle
from src.routes.auth import token_required, role_required
from datetime import datetime

news_bp = Blueprint('news', __name__)

@news_bp.route('/', methods=['GET'])
def get_published_news():
    """Public endpoint to get published news articles"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        query = NewsArticle.query.filter_by(status='published')
        
        total_articles = query.count()
        total_pages = (total_articles + limit - 1) // limit
        
        articles = query.order_by(NewsArticle.published_date.desc())\
                       .offset((page - 1) * limit)\
                       .limit(limit)\
                       .all()
        
        articles_data = []
        for article in articles:
            articles_data.append({
                'id': article.id,
                'title': article.title,
                'summary': article.content[:200] + '...' if len(article.content) > 200 else article.content,
                'coverImage': article.featured_image_url,
                'publishedAt': article.published_date.isoformat() if article.published_date else None,
                'author': {'name': article.author}
            })
        
        return jsonify(articles_data), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get news articles', 'error': str(e)}), 500

@news_bp.route('/<article_id>', methods=['GET'])
def get_single_article(article_id):
    """Public endpoint to get a single published news article"""
    try:
        article = NewsArticle.query.filter_by(id=article_id, status='published').first()
        
        if not article:
            return jsonify({'message': 'Article not found'}), 404
        
        article_data = {
            'id': article.id,
            'title': article.title,
            'content': article.content,
            'coverImage': article.featured_image_url,
            'author': {'name': article.author},
            'publishedAt': article.published_date.isoformat() if article.published_date else None,
            'tags': []  # Mock tags - in real app this would be stored
        }
        
        return jsonify(article_data), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get article', 'error': str(e)}), 500

@news_bp.route('/manage', methods=['GET'])
@token_required
@role_required(['office', 'OFFICER', 'admin', 'DEVELOPER'])
def get_all_news_for_management(current_user):
    """Admin endpoint to get all news articles for management"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        status = request.args.get('status', '', type=str)
        
        query = NewsArticle.query
        
        if status and status != 'all':
            query = query.filter(NewsArticle.status == status)
        
        total_articles = query.count()
        total_pages = (total_articles + limit - 1) // limit
        
        articles = query.order_by(NewsArticle.created_at.desc())\
                       .offset((page - 1) * limit)\
                       .limit(limit)\
                       .all()
        
        articles_data = []
        for article in articles:
            articles_data.append(article.to_dict())
        
        return jsonify({
            'articles': articles_data,
            'totalPages': total_pages
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get news articles', 'error': str(e)}), 500

@news_bp.route('/manage/<article_id>', methods=['GET'])
@token_required
@role_required(['office', 'OFFICER', 'admin', 'DEVELOPER'])
def get_article_for_editing(current_user, article_id):
    """Admin endpoint to get a single article for editing"""
    try:
        article = NewsArticle.query.filter_by(id=article_id).first()
        
        if not article:
            return jsonify({'message': 'Article not found'}), 404
        
        return jsonify(article.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get article', 'error': str(e)}), 500

@news_bp.route('/manage', methods=['POST'])
@token_required
@role_required(['office', 'OFFICER', 'admin', 'DEVELOPER'])
def create_article(current_user):
    """Admin endpoint to create a new news article"""
    try:
        data = request.get_json()
        
        if not data or not data.get('title') or not data.get('content'):
            return jsonify({'message': 'Title and content are required'}), 400
        
        article = NewsArticle(
            title=data['title'],
            content=data['content'],
            author=current_user.name,
            status=data.get('status', 'draft'),
            featured_image_url=data.get('featuredImageUrl')
        )
        
        # Handle scheduled publishing
        if data.get('scheduledDate'):
            try:
                article.scheduled_date = datetime.fromisoformat(data['scheduledDate'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'message': 'Invalid scheduled date format'}), 400
        
        # If publishing immediately
        if article.status == 'published':
            article.published_date = datetime.utcnow()
        
        db.session.add(article)
        db.session.commit()
        
        return jsonify({
            'id': article.id,
            'message': 'Article created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create article', 'error': str(e)}), 500

@news_bp.route('/manage/<article_id>', methods=['PUT'])
@token_required
@role_required(['office', 'OFFICER', 'admin', 'DEVELOPER'])
def update_article(current_user, article_id):
    """Admin endpoint to update a news article"""
    try:
        article = NewsArticle.query.filter_by(id=article_id).first()
        
        if not article:
            return jsonify({'message': 'Article not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'title' in data:
            article.title = data['title']
        if 'content' in data:
            article.content = data['content']
        if 'featuredImageUrl' in data:
            article.featured_image_url = data['featuredImageUrl']
        
        # Handle status changes
        if 'status' in data:
            old_status = article.status
            new_status = data['status']
            article.status = new_status
            
            # If changing from draft to published
            if old_status == 'draft' and new_status == 'published':
                article.published_date = datetime.utcnow()
        
        # Handle scheduled publishing
        if 'scheduledDate' in data:
            if data['scheduledDate']:
                try:
                    article.scheduled_date = datetime.fromisoformat(data['scheduledDate'].replace('Z', '+00:00'))
                except ValueError:
                    return jsonify({'message': 'Invalid scheduled date format'}), 400
            else:
                article.scheduled_date = None
        
        db.session.commit()
        
        return jsonify({
            'id': article.id,
            'message': 'Article updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update article', 'error': str(e)}), 500

@news_bp.route('/manage/<article_id>', methods=['DELETE'])
@token_required
@role_required(['office', 'OFFICER', 'admin', 'DEVELOPER'])
def delete_article(current_user, article_id):
    """Admin endpoint to delete a news article"""
    try:
        article = NewsArticle.query.filter_by(id=article_id).first()
        
        if not article:
            return jsonify({'message': 'Article not found'}), 404
        
        db.session.delete(article)
        db.session.commit()
        
        return jsonify({'message': 'Article deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to delete article', 'error': str(e)}), 500
