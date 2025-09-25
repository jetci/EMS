import React, { useState, useMemo } from 'react';
import { NewsArticle } from '../types';
import { mockNews } from '../data/mockData';
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
    
    const publishedArticles = useMemo(() => {
        return mockNews
            .filter(article => article.status === 'published' && article.publishedDate)
            .sort((a, b) => new Date(b.publishedDate!).getTime() - new Date(a.publishedDate!).getTime());
    }, []);

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
