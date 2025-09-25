import React, { useState } from 'react';
import BuildingIcon from './icons/BuildingIcon';
import PhoneIcon from './icons/PhoneIcon';

const ContactUsScreen: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsSubmitting(true);
        setSubmitMessage('');

        // Simulate API call
        setTimeout(() => {
            console.log('Form submitted:', formData);
            setSubmitMessage('ขอบคุณสำหรับข้อความของคุณ! เราจะติดต่อกลับโดยเร็วที่สุด');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="bg-white text-gray-800 pt-16">
            <main className="py-16 sm:py-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#005A9C]">
                            ติดต่อเรา
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            เรายินดีรับฟังความคิดเห็นของคุณ หากมีคำถามหรือข้อเสนอแนะ โปรดติดต่อเราผ่านช่องทางด้านล่าง
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Information */}
                        <div className="bg-[#F0F4F8] p-8 rounded-xl shadow-sm">
                            <h2 className="text-2xl font-bold text-[#005A9C] mb-6">ข้อมูลการติดต่อ</h2>
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 bg-[#005A9C] p-3 rounded-full">
                                        <BuildingIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">ที่อยู่</h3>
                                        <p className="text-gray-600">เลขที่ 666 ถ.รอบเวียงสุทโธ ม.3 ต.เวียง อ.ฝาง จ.เชียงใหม่ 50110</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 bg-[#005A9C] p-3 rounded-full">
                                        <PhoneIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">โทรศัพท์ / โทรสาร</h3>
                                        <p className="text-gray-600">โทรศัพท์: 053-382670</p>
                                        <p className="text-gray-600">โทรสาร (FAX): 053-382670</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white p-8 rounded-xl border border-gray-200">
                            <h2 className="text-2xl font-bold text-[#005A9C] mb-6">ส่งข้อความถึงเรา</h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">ชื่อ</label>
                                    <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#005A9C] focus:border-[#005A9C] sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">อีเมล</label>
                                    <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#005A9C] focus:border-[#005A9C] sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">หัวข้อ</label>
                                    <input type="text" name="subject" id="subject" required value={formData.subject} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#005A9C] focus:border-[#005A9C] sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">ข้อความ</label>
                                    <textarea name="message" id="message" rows={4} required value={formData.message} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#005A9C] focus:border-[#005A9C] sm:text-sm"></textarea>
                                </div>
                                
                                <div>
                                    <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#005A9C] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                                        {isSubmitting ? 'กำลังส่ง...' : 'ส่งข้อความ'}
                                    </button>
                                </div>
                                {submitMessage && <p className={`text-center text-sm font-medium ${submitMessage.includes('ขอบคุณ') ? 'text-green-600' : 'text-[#DC3545]'}`}>{submitMessage}</p>}
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContactUsScreen;