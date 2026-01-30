import React from 'react';
import { NewsArticle } from '../../types';
import UploadIcon from '../icons/UploadIcon';
import ThaiDatePicker from '../ui/ThaiDatePicker';
import ThaiTimePicker from '../ui/ThaiTimePicker';

interface PublishingPanelProps {
    article: Omit<NewsArticle, 'id'>;
    onArticleChange: (article: Omit<NewsArticle, 'id'>) => void;
    onSave: (status: 'draft' | 'published') => void;
    isNew: boolean;
}

const PublishingPanel: React.FC<PublishingPanelProps> = ({ article, onArticleChange, onSave, isNew }) => {
    
    const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                onArticleChange({ ...article, featuredImageUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDateChange = (e: { target: { name: string; value: string } }) => {
        const { value } = e.target;
        const currentScheduled = article.scheduledDate ? new Date(article.scheduledDate) : new Date();
        currentScheduled.setFullYear(parseInt(value.substring(0, 4), 10));
        currentScheduled.setMonth(parseInt(value.substring(5, 7), 10) - 1);
        currentScheduled.setDate(parseInt(value.substring(8, 10), 10));
        onArticleChange({...article, scheduledDate: currentScheduled.toISOString() });
    };

    const handleTimeChange = (e: { target: { name: string; value: string } }) => {
         const { value } = e.target;
        const currentScheduled = article.scheduledDate ? new Date(article.scheduledDate) : new Date();
        currentScheduled.setHours(parseInt(value.substring(0, 2), 10));
        currentScheduled.setMinutes(parseInt(value.substring(3, 5), 10));
        onArticleChange({...article, scheduledDate: currentScheduled.toISOString() });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
            {/* Action Buttons */}
            <div className="space-y-3 border-b pb-6">
                 <button 
                    onClick={() => onSave('draft')}
                    className="w-full text-center px-4 py-2 font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                    บันทึกฉบับร่าง
                </button>
                <button
                    onClick={() => onSave('published')}
                    className="w-full text-center px-4 py-2 font-semibold text-white bg-[#005A9C] rounded-lg shadow-sm hover:bg-blue-800"
                >
                    {isNew ? 'เผยแพร่' : 'อัปเดต'}
                </button>
            </div>
            
            {/* Status */}
            <div>
                <h3 className="font-semibold text-gray-800 mb-2">สถานะ</h3>
                 <div className="flex items-center">
                    <input type="radio" id="status_published" name="status" value="published" checked={article.status === 'published'} onChange={() => onArticleChange({...article, status: 'published'})} />
                    <label htmlFor="status_published" className="ml-2">เผยแพร่แล้ว</label>
                </div>
                <div className="flex items-center">
                    <input type="radio" id="status_draft" name="status" value="draft" checked={article.status === 'draft'} onChange={() => onArticleChange({...article, status: 'draft'})} />
                    <label htmlFor="status_draft" className="ml-2">ฉบับร่าง</label>
                </div>
            </div>

            {/* Featured Image */}
            <div>
                 <h3 className="font-semibold text-gray-800 mb-2">รูปภาพหน้าปก</h3>
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {article.featuredImageUrl ? (
                        <img src={article.featuredImageUrl} alt="Featured" className="w-full h-auto rounded-md mb-2" />
                    ) : (
                        <UploadIcon className="mx-auto h-10 w-10 text-gray-400" />
                    )}
                    <label htmlFor="featuredImage" className="mt-2 block text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                        {article.featuredImageUrl ? 'เปลี่ยนรูปภาพ' : 'อัปโหลดรูปภาพ'}
                        <input type="file" id="featuredImage" accept="image/*" onChange={handleFeaturedImageChange} className="sr-only" />
                    </label>
                 </div>
            </div>

            {/* Scheduling */}
            <div>
                <h3 className="font-semibold text-gray-800 mb-2">กำหนดเวลาเผยแพร่</h3>
                <p className="text-xs text-gray-500 mb-2">หากไม่กำหนด จะเผยแพร่ทันที</p>
                <div className="space-y-3">
                    <ThaiDatePicker 
                        name="scheduledDate"
                        value={article.scheduledDate ? article.scheduledDate.split('T')[0] : ''}
                        onChange={handleDateChange}
                    />
                    <ThaiTimePicker 
                        name="scheduledTime"
                        value={article.scheduledDate ? new Date(article.scheduledDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : ''}
                        onChange={handleTimeChange}
                    />
                </div>
            </div>

        </div>
    );
};

export default PublishingPanel;
