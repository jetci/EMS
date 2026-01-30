import React from 'react';
import ImageIcon from '../icons/ImageIcon';

interface SimpleRichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const SimpleRichTextEditor: React.FC<SimpleRichTextEditorProps> = ({ value, onChange }) => {
    return (
        <div>
            {/* Toolbar */}
            <div className="flex items-center p-2 border-b mb-2 space-x-2 bg-gray-50 rounded-t-md">
                <button type="button" className="p-2 rounded hover:bg-gray-200 font-bold">B</button>
                <button type="button" className="p-2 rounded hover:bg-gray-200 italic">I</button>
                <button type="button" className="p-2 rounded hover:bg-gray-200">List</button>
                <button type="button" className="p-2 rounded hover:bg-gray-200">Link</button>
                <button type="button" className="p-2 rounded hover:bg-gray-200"><ImageIcon className="w-5 h-5"/></button>
            </div>
            
            {/* Text Area */}
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="เริ่มเขียนเนื้อหาของคุณ..."
                className="w-full h-96 p-2 border-gray-300 rounded-b-md focus:ring-[#005A9C] focus:border-[#005A9C]"
            />
        </div>
    );
};

export default SimpleRichTextEditor;
