import React, { useState } from 'react';
import XIcon from '../icons/XIcon';
import DownloadIcon from '../icons/DownloadIcon';

interface ExportReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose }) => {
    const [reportType, setReportType] = useState('summary');
    const [fileFormat, setFileFormat] = useState('csv'); // Default to CSV as it's supported

    if (!isOpen) return null;

    const handleDownload = async () => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const url = `${baseUrl}/executive/reports/export?type=${reportType}&format=${fileFormat}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to download report');
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `report_${reportType}.${fileFormat}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            onClose();
        } catch (err: any) {
            console.error('Export failed:', err);
            alert(`เกิดข้อผิดพลาดในการส่งออก: ${err.message}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-scale-in">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">เลือกรายงานที่ต้องการส่งออก</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div>
                        <label htmlFor="reportType" className="block text-sm font-medium text-gray-700">ประเภทรายงาน</label>
                        <select
                            id="reportType"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="mt-1 w-full"
                        >
                            <option value="summary">รายงานสรุปภาพรวม</option>
                            <option value="detailed_rides">รายงานการเดินทางทั้งหมด (ละเอียด)</option>
                            <option value="patient_by_village">รายงานผู้ป่วยแยกตามหมู่บ้าน</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">รูปแบบไฟล์</label>
                        <div className="mt-2 space-y-2">
                            <label className="flex items-center">
                                <input type="radio" name="fileFormat" value="pdf" checked={fileFormat === 'pdf'} onChange={(e) => setFileFormat(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300" />
                                <span className="ml-3 text-sm text-gray-700">PDF (เร็วๆ นี้)</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" name="fileFormat" value="csv" checked={fileFormat === 'csv'} onChange={(e) => setFileFormat(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300" />
                                <span className="ml-3 text-sm text-gray-700">Excel (CSV)</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center p-4 bg-gray-50 border-t">
                    <button
                        onClick={handleDownload}
                        className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-[#005A9C] rounded-lg shadow-sm hover:bg-blue-800 transition-colors"
                    >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        <span>ดาวน์โหลด</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportReportModal;
