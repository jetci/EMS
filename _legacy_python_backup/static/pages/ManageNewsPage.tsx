import React, { useState, useMemo } from 'react';
import { NewsArticle, OfficeView, AdminView } from '../types';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import SearchIcon from '../components/icons/SearchIcon';
import EditIcon from '../components/icons/EditIcon';
import TrashIcon from '../components/icons/TrashIcon';
import PreviewIcon from '../components/icons/PreviewIcon';
import NewsStatusBadge from '../components/ui/NewsStatusBadge';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Toast from '../components/Toast';
import { formatDateToThai } from '../utils/dateUtils';
import { mockNews } from '../data/mockData';

interface ManageNewsPageProps {
    setActiveView: (view: OfficeView | AdminView, context?: any) => void;
}

const ManageNewsPage: React.FC<ManageNewsPageProps> = ({ setActiveView }) => {
    const [articles, setArticles] = useState<NewsArticle[]>(mockNews);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const filteredArticles = useMemo(() => {
        return articles.filter(article => {
            const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [articles, searchTerm, statusFilter]);

    const handleOpenDeleteConfirm = (article: NewsArticle) => {
        setArticleToDelete(article);
        setIsConfirmOpen(true);
    };

    const handleDeleteArticle = () => {
        if (articleToDelete) {
            setArticles(prev => prev.filter(a => a.id !== articleToDelete.id));
            showToast(`🗑️ ลบข่าว "${articleToDelete.title}" เรียบร้อยแล้ว`);
        }
        setIsConfirmOpen(false);
        setArticleToDelete(null);
    };

    return (
        <div>
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">จัดการข่าวสารและประชาสัมพันธ์</h1>
                <button
                    onClick={() => setActiveView('edit_news')}
                    className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-[#005A9C] rounded-lg shadow-sm hover:bg-blue-800 transition-colors"
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    <span>เขียนข่าวใหม่</span>
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-3 md:space-y-0 p-4 bg-white rounded-lg shadow-sm border">
                <div className="relative w-full md:w-1/3">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon className="w-5 h-5 text-gray-400" /></span>
                    <input type="text" placeholder="ค้นหาหัวข้อข่าว..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="w-full md:w-auto">
                    <option value="all">สถานะทั้งหมด</option>
                    <option value="published">เผยแพร่แล้ว</option>
                    <option value="draft">ฉบับร่าง</option>
                </select>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">หัวข้อข่าว</th>
                                <th className="px-6 py-3">สถานะ</th>
                                <th className="px-6 py-3">ผู้เขียน</th>
                                <th className="px-6 py-3">วันที่เผยแพร่</th>
                                <th className="px-6 py-3 text-center">การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredArticles.map(article => (
                                <tr key={article.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{article.title}</td>
                                    <td className="px-6 py-4"><NewsStatusBadge status={article.status} /></td>
                                    <td className="px-6 py-4">{article.author}</td>
                                    <td className="px-6 py-4">{article.publishedDate ? formatDateToThai(article.publishedDate) : 'ยังไม่เผยแพร่'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button onClick={() => alert('Previewing...')} className="text-gray-500 hover:text-green-600" title="ดูตัวอย่าง"><PreviewIcon className="w-5 h-5" /></button>
                                            <button onClick={() => setActiveView('edit_news', { articleId: article.id })} className="text-gray-500 hover:text-blue-600" title="แก้ไข"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleOpenDeleteConfirm(article)} className="text-gray-500 hover:text-red-600" title="ลบ"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDeleteArticle}
                title={`ยืนยันการลบข่าว`}
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบข่าว "${articleToDelete?.title}"?`}
            />
            <Toast message={toastMessage} />
        </div>
    );
};

export default ManageNewsPage;
