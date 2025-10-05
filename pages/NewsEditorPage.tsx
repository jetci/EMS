import React, { useState, useEffect } from 'react';
import { NewsArticle, OfficerView, AdminView } from '../types';
import { apiRequest } from '../src/services/api';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import SimpleRichTextEditor from '../components/news/SimpleRichTextEditor';
import PublishingPanel from '../components/news/PublishingPanel';

interface NewsEditorPageProps {
    setActiveView: (view: OfficerView | AdminView) => void;
    articleId?: string;
}

const emptyArticle: Omit<NewsArticle, 'id'> = {
    title: '',
    content: '',
    author: 'Current User', // This would be dynamic in a real app
    status: 'draft',
    featuredImageUrl: undefined,
    publishedDate: undefined,
    scheduledDate: undefined,
};

const NewsEditorPage: React.FC<NewsEditorPageProps> = ({ setActiveView, articleId }) => {
    const [article, setArticle] = useState<Omit<NewsArticle, 'id'>>(emptyArticle);
    const [isNew, setIsNew] = useState(true);

    useEffect(() => {
        if (articleId) {
            loadArticle(articleId);
        } else {
            setArticle(emptyArticle);
            setIsNew(true);
        }
    }, [articleId]);

    const loadArticle = async (id: string) => {
        try {
            const data = await apiRequest(`/news/${id}`);
            setArticle(data);
            setIsNew(false);
        } catch (err) {
            console.error('Failed to load article:', err);
        }
    };

    const handleSave = async (status: 'draft' | 'published') => {
        try {
            const articleData = { ...article, status };
            if (isNew) {
                await apiRequest('/news', {
                    method: 'POST',
                    body: JSON.stringify(articleData),
                });
            } else {
                await apiRequest(`/news/${articleId}`, {
                    method: 'PUT',
                    body: JSON.stringify(articleData),
                });
            }
            alert(`Article "${article.title}" has been saved as ${status}!`);
            setActiveView('news');
        } catch (err) {
            console.error('Failed to save article:', err);
            alert('Failed to save article');
        }
    };

    return (
        <div>
            <button onClick={() => setActiveView('news')} className="flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6">
                <ArrowLeftIcon className="w-6 h-6 mr-2" />
                <span>กลับไปหน้ารายการข่าว</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <input
                            type="text"
                            placeholder="ใส่หัวข้อข่าวที่นี่"
                            value={article.title}
                            onChange={(e) => setArticle(prev => ({...prev, title: e.target.value}))}
                            className="w-full text-3xl font-bold border-none focus:ring-0 p-2 -ml-2"
                        />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <SimpleRichTextEditor
                            value={article.content}
                            onChange={(content) => setArticle(prev => ({ ...prev, content }))}
                        />
                    </div>
                </div>

                {/* Publishing Panel */}
                <div className="lg:col-span-1">
                    <PublishingPanel 
                        article={article}
                        onArticleChange={setArticle}
                        onSave={handleSave}
                        isNew={isNew}
                    />
                </div>
            </div>
        </div>
    );
};

export default NewsEditorPage;
