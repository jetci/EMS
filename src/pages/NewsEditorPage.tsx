import React, { useState, useEffect } from 'react';
import { NewsArticle, OfficerView, AdminView } from '../types';
import { apiRequest } from '../services/api';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import SimpleRichTextEditor from '../components/news/SimpleRichTextEditor';
import PublishingPanel from '../components/news/PublishingPanel';
import Toast from '../components/Toast';

interface NewsEditorPageProps {
    setActiveView: (view: OfficerView | AdminView) => void;
    articleId?: string;
}

const emptyArticle: Omit<NewsArticle, 'id'> = {
    title: '',
    content: '',
    author: '',
    status: 'draft',
    featuredImageUrl: undefined,
    publishedDate: undefined,
    scheduledDate: undefined,
};

const NewsEditorPage: React.FC<NewsEditorPageProps> = ({ setActiveView, articleId }) => {
    const [article, setArticle] = useState<Omit<NewsArticle, 'id'>>(emptyArticle);
    const [isNew, setIsNew] = useState(true);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (articleId) {
            loadArticle(articleId);
        } else {
            // Get current user from localStorage
            const storedUser = localStorage.getItem('wecare_user');
            let initialAuthor = 'Admin';
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    initialAuthor = user.full_name || user.name || user.email || 'Admin';
                } catch (e) {
                    console.error('Failed to parse user from localStorage', e);
                }
            }
            setArticle({ ...emptyArticle, author: initialAuthor });
            setIsNew(true);
        }
    }, [articleId]);

    const loadArticle = async (id: string) => {
        try {
            const data = await apiRequest(`/news/${id}`);
            // Map backend data to frontend model
            setArticle({
                ...data,
                author: data.author_name || data.author || '',
                tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags
            });
            setIsNew(false);
        } catch (err) {
            console.error('Failed to load article:', err);
            showToast('❌ ไม่สามารถโหลดข้อมูลข่าวได้');
        }
    };

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleSave = async (status: 'draft' | 'published') => {
        setError(null);

        // Strict Validation
        if (!article.title.trim()) {
            setError('กรุณาระบุหัวข้อข่าว (ห้ามเว้นว่าง)');
            return;
        }
        if (!article.content.trim()) {
            setError('กรุณาระบุเนื้อหาข่าว');
            return;
        }
        if (!article.author.trim()) {
            setError('กรุณาระบุชื่อผู้เขียน');
            return;
        }

        try {
            // Map to backend payload
            const payload = {
                ...article,
                title: article.title.trim(),
                author_name: article.author.trim(), // Backend expects author_name
                status: status === 'published' ? 'published' : 'draft', // Ensure string match
                is_published: status === 'published',
                published_date: status === 'published' ? new Date().toISOString() : null
            };

            if (isNew) {
                await apiRequest('/news', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
                showToast(`🎉 บันทึกข่าว "${article.title}" เรียบร้อยแล้ว`);
            } else {
                await apiRequest(`/news/${articleId}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
                showToast(`✅ อัปเดตข่าว "${article.title}" เรียบร้อยแล้ว`);
            }

            // Delay for toast before going back
            setTimeout(() => {
                setActiveView('news');
            }, 1500);
        } catch (err) {
            console.error('Failed to save article:', err);
            showToast('❌ บันทึกไม่สำเร็จ');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => setActiveView('news')} className="flex items-center text-gray-600 hover:text-gray-900 font-semibold">
                    <ArrowLeftIcon className="w-6 h-6 mr-2" />
                    <span>กลับไปหน้ารายการข่าว</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
                    ⚠️ {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อข่าว</label>
                            <input
                                type="text"
                                placeholder="ใส่หัวข้อข่าวที่นี่"
                                value={article.title}
                                onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full text-xl font-bold border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ผู้เขียน</label>
                            <input
                                type="text"
                                placeholder="ชื่อผู้เขียน"
                                value={article.author}
                                onChange={(e) => setArticle(prev => ({ ...prev, author: e.target.value }))}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">เนื้อหาข่าว</label>
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

            <Toast message={toastMessage} />
        </div>
    );
};

export default NewsEditorPage;

