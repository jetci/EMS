import React from 'react';
import XIcon from '../icons/XIcon';

interface ReportPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: any[];
}

const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({ isOpen, onClose, title, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 overflow-auto flex-1">
                    {(!data || data.length === 0) ? (
                        <p className="text-center text-gray-500 py-8">ไม่พบข้อมูลตามเงื่อนไขที่เลือก</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {Object.keys(data[0]).map((key) => (
                                            <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.map((row, idx) => (
                                        <tr key={idx}>
                                            {Object.values(row).map((val: any, i) => (
                                                <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="p-6 border-t bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportPreviewModal;
