import React from 'react';
import { NewsArticle } from '../types';
import { formatFullDateToThai } from '../utils/dateUtils';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

interface PublicSingleNewsPageProps {
    articleId: string;
    onBackToList: () => void;
}

const PublicSingleNewsPage: React.FC<PublicSingleNewsPageProps> = ({ articleId, onBackToList }) => {
    const [article, setArticle] = React.useState<NewsArticle | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const joinUrl = (base: string, p: string) => {
            const b = base.replace(/\/$/, '');
            const s = p.startsWith('/') ? p : `/${p}`;
            return `${b}${s}`;
        };

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || window.location.origin;
                let resp = await fetch(joinUrl(baseUrl, `/api/news/${articleId}`), { method: 'GET', mode: 'cors', headers: { 'Accept': 'application/json' } });
                if (!resp.ok) {
                    // Try trailing slash version
                    const alt = await fetch(joinUrl(baseUrl, `/api/news/${articleId}/`), { method: 'GET', mode: 'cors', headers: { 'Accept': 'application/json' } });
                    if (alt.ok) {
                        resp = alt;
                    } else {
                        // Fallback to same-origin proxy
                        const proxyUrl = joinUrl(window.location.origin, `${(import.meta as any).env?.VITE_BASE || '/'}api-proxy/news_item.php?id=${encodeURIComponent(articleId)}`);
                        const prox = await fetch(proxyUrl.replace(/\/$/, ''), { method: 'GET', headers: { 'Accept': 'application/json' } });
                        if (!prox.ok) {
                            let detail = '';
                            try { detail = await prox.text(); } catch {}
                            throw new Error(`Failed to load news detail via proxy: ${prox.status} ${detail}`.trim());
                        }
                        resp = prox;
                    }
                }
                const data = await resp.json();
                setArticle(data as NewsArticle);
            } catch (e: any) {
                setError(e.message || 'เกิดข้อผิดพลาดในการโหลดข่าว');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [articleId]);

    if (loading) {
        return (
            <div className="bg-white pt-20">
                <main className="py-16 sm:py-24 text-center">
                    <div className="text-gray-600">กำลังโหลดข่าว...</div>
                </main>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="bg-white pt-20">
                <main className="py-16 sm:py-24 text-center">
                    <h2 className="text-2xl font-bold text-red-600">ไม่พบข่าวสาร</h2>
                    <p className="mt-4 text-gray-600">{error || 'ข่าวที่คุณกำลังค้นหาอาจถูกลบหรือยังไม่ได้รับการเผยแพร่'}</p>
                    <button onClick={onBackToList} className="mt-8 inline-flex items-center px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        กลับไปที่หน้ารวมข่าวสาร
                    </button>
                </main>
            </div>
        );
    }
    
    // Simple way to render content; in a real app, use a library like `react-html-parser` or `dangerouslySetInnerHTML` with caution.
    const contentHtml = { __html: (article.content || '').replace(/\n/g, '<br />') };

    return (
        <div className="bg-white pt-20">
            <main className="py-12 sm:py-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button onClick={onBackToList} className="mb-8 inline-flex items-center font-semibold text-gray-600 hover:text-gray-900">
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        กลับไปที่หน้ารวมข่าวสาร
                    </button>

                    <article>
                        <header className="mb-8">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                                {article.title}
                            </h1>
                            <p className="mt-4 text-md text-gray-500">
                                เผยแพร่เมื่อ {formatFullDateToThai(article.publishedDate!)} โดย {article.author}
                            </p>
                        </header>

                        {article.featuredImageUrl && (
                            <figure className="mb-8">
                                <img src={article.featuredImageUrl} alt={article.title} className="w-full h-auto rounded-lg shadow-lg object-cover" />
                            </figure>
                        )}
                        
                        <div 
                            className="prose prose-lg max-w-none text-gray-700"
                            dangerouslySetInnerHTML={contentHtml}
                        />
                    </article>
                </div>
            </main>
        </div>
    );
};

export default PublicSingleNewsPage;

