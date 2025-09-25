import React, { useState, useEffect } from 'react';
import { Ride } from '../../types';
import XIcon from '../icons/XIcon';
import StarRating from '../ui/StarRating';

interface RideRatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rideId: string, ratingData: { rating: number; tags: string[]; comment: string }) => void;
    ride: Ride | null;
}

const feedbackTags = ['สุภาพ', 'ตรงต่อเวลา', 'ขับรถดี', 'ช่วยเหลือดี', 'รถสะอาด'];

const RideRatingModal: React.FC<RideRatingModalProps> = ({ isOpen, onClose, onSubmit, ride }) => {
    const [rating, setRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (isOpen) {
            setRating(0);
            setSelectedTags([]);
            setComment('');
        }
    }, [isOpen]);

    if (!isOpen || !ride) return null;

    const handleTagClick = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating > 0) {
            onSubmit(ride.id, { rating, tags: selectedTags, comment });
        } else {
            alert('กรุณาให้คะแนนอย่างน้อย 1 ดาว');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-scale-in">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">ให้คะแนนการเดินทาง</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="text-center">
                            <p className="text-gray-600">ให้คะแนนการบริการสำหรับ</p>
                            <p className="font-semibold text-lg text-gray-800">{ride.patientName}</p>
                            <p className="text-sm text-gray-500">คนขับ: {ride.driverName}</p>
                        </div>
                        <div className="flex justify-center">
                            <StarRating rating={rating} onRatingChange={setRating} />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 mb-2">คำชมเชย (เลือกได้หลายข้อ)</p>
                            <div className="flex flex-wrap gap-2">
                                {feedbackTags.map(tag => (
                                    <button
                                        type="button"
                                        key={tag}
                                        onClick={() => handleTagClick(tag)}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-colors ${
                                            selectedTags.includes(tag)
                                                ? 'bg-blue-500 border-blue-500 text-white'
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="comment" className="block font-semibold text-gray-700 mb-1">ความคิดเห็นเพิ่มเติม (ไม่บังคับ)</label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                rows={3}
                                className="w-full"
                                placeholder="เล่าประสบการณ์ของคุณ..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100">ยกเลิก</button>
                        <button type="submit" disabled={rating === 0} className="px-4 py-2 text-sm font-medium text-white bg-[#005A9C] rounded-md hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed">ส่งคะแนน</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RideRatingModal;
