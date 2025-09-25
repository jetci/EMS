import React, { useState, useEffect } from 'react';
import { NewsArticle, OfficeView, AdminView } from '../types';
import { mockNews } from '../data/mockData';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import SimpleRichTextEditor from '../components/news/SimpleRichTextEditor';
import PublishingPanel from '../components/news/PublishingPanel';

interface NewsEditorPageProps {
    setActiveView: (view: OfficeView | AdminView) => void;
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
            const existingArticle = mockNews.find(a => a.id === articleId);
            if (existingArticle) {
                setArticle(existingArticle);
                setIsNew(false);
            }
        } else {
            setArticle(emptyArticle);
            setIsNew(true);
        }
    }, [articleId]);

    const handleSave = (status: 'draft' | 'published') => {
        console.log("Saving article with status:", status, article);
        alert(`Article "${article.title}" has been saved as ${status}!`);
        setActiveView('news');
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
