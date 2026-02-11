import React, { useState, useMemo } from 'react';
import { NewsArticle } from '../types';
import PublicNewsCard from '../components/news/PublicNewsCard';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import NewspaperIcon from '../components/icons/NewspaperIcon';

interface PublicNewsListingPageProps {
    onViewArticle: (articleId: string) => void;
}

const ITEMS_PER_PAGE = 5;

const PublicNewsListingPage: React.FC<PublicNewsListingPageProps> = ({ onViewArticle }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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
                // Try without trailing slash first, then with slash
                let resp = await fetch(joinUrl(baseUrl, '/api/news'), { method: 'GET', mode: 'cors', headers: { 'Accept': 'application/json' } });
                if (!resp.ok) {
                    // Try alternate path with trailing slash
                    const alt = await fetch(joinUrl(baseUrl, '/api/news/'), { method: 'GET', mode: 'cors', headers: { 'Accept': 'application/json' } });
                    if (alt.ok) {
                        resp = alt;
                    } else {
                        // Fallback to same-origin proxy (avoids CORS)
                        const proxyUrl = joinUrl(window.location.origin, `${(import.meta as any).env?.VITE_BASE || '/'}api-proxy/news.php`);
                        const prox = await fetch(proxyUrl.replace(/\/$/, ''), { method: 'GET', headers: { 'Accept': 'application/json' } });
                        if (!prox.ok) {
                            let detail = '';
                            try { detail = await prox.text(); } catch {}
                            throw new Error(`Failed to load news via proxy: ${prox.status} ${detail}`.trim());
                        }
                        resp = prox;
                    }
                }
                const data = await resp.json();
                const list = Array.isArray(data) ? data : (data.items || []);
                const mapped = (Array.isArray(list) ? list : []).map((item: any) => ({
                    ...item,
                    author: item.author || item.author_name || 'ไม่ระบุ',
                    status: item.status || (item.is_published ? 'published' : 'draft'),
                    publishedDate: item.publishedDate || item.published_date || item.publishedDate,
                    featuredImageUrl: item.featuredImageUrl || item.image_url || item.featuredImageUrl,
                }));
                setArticles(mapped);
            } catch (e: any) {
                setError(e.message || 'เกิดข้อผิดพลาดในการโหลดข่าวสาร');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const publishedArticles = useMemo(() => {
        return articles
            .filter(article => article.status === 'published' && (article as any).publishedDate)
            .sort((a: any, b: any) => new Date(b.publishedDate!).getTime() - new Date(a.publishedDate!).getTime());
    }, [articles]);

    const totalPages = Math.ceil(publishedArticles.length / ITEMS_PER_PAGE);
    const paginatedArticles = publishedArticles.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <div className="bg-white pt-20">
            <main className="py-12 sm:py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading && (
                        <div className="text-center py-8 text-gray-600">กำลังโหลดข่าวสาร...</div>
                    )}
                    {error && (
                        <div className="text-center py-8 text-red-600">{error}</div>
                    )}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#005A9C]">
                            ข่าวสารและประชาสัมพันธ์
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            ติดตามข่าวสาร, กิจกรรม, และประกาศล่าสุดจากโครงการ WeCare
                        </p>
                    </div>

                    {paginatedArticles.length > 0 ? (
                        <div className="space-y-8">
                            {paginatedArticles.map(article => (
                                <PublicNewsCard 
                                    key={article.id} 
                                    article={article} 
                                    onViewArticle={onViewArticle} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-4 bg-gray-50 rounded-lg">
                            <NewspaperIcon className="mx-auto h-16 w-16 text-gray-400" />
                            <h3 className="mt-4 text-xl font-semibold text-gray-800">ยังไม่มีข่าวสารในขณะนี้</h3>
                            <p className="mt-2 text-gray-500">กรุณากลับมาตรวจสอบอีกครั้งในภายหลัง</p>
                        </div>
                    )}
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-12 border-t pt-6">
                            <button 
                                onClick={handlePrevPage} 
                                disabled={currentPage === 1}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                                หน้าก่อนหน้า
                            </button>
                            <span className="text-sm text-gray-600">
                                หน้า {currentPage} จาก {totalPages}
                            </span>
                            <button 
                                onClick={handleNextPage} 
                                disabled={currentPage === totalPages}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                หน้าถัดไป
                                <ChevronRightIcon className="w-5 h-5 ml-2" />
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PublicNewsListingPage;

