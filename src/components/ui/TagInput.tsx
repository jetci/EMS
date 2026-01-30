import React, { useState } from 'react';
import XIcon from '../icons/XIcon';
import PlusIcon from '../icons/PlusIcon';

interface TagInputProps {
    tags: string[];
    setTags: (tags: string[]) => void;
    placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags, placeholder }) => {
    const [inputValue, setInputValue] = useState('');

    const addTag = (tagValue: string) => {
        const trimmedValue = tagValue.trim();
        if (trimmedValue && !tags.includes(trimmedValue)) {
            setTags([...tags, trimmedValue]);
        }
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission on Enter
            addTag(inputValue);
        }
    };
    
    const handleBlur = () => {
        addTag(inputValue);
    };

    const handleAddButtonClick = () => {
        addTag(inputValue);
    };

    const handleMouseDownOnButton = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Prevents the input's onBlur from firing before the button's onClick
        e.preventDefault();
    };

    const removeTag = (indexToRemove: number) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="flex flex-wrap items-center w-full p-2 border border-gray-400 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-[#005A9C]">
            {tags.map((tag, index) => (
                <div key={index} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium mr-2 mb-1 px-2.5 py-1 rounded-full">
                    <span>{tag}</span>
                    <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                        aria-label={`Remove ${tag}`}
                    >
                        <XIcon className="w-3 h-3" />
                    </button>
                </div>
            ))}
            <div className="flex-grow flex items-center min-w-[150px]">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    placeholder={placeholder || "เพิ่ม...ทีละรายการ"}
                    className="flex-grow bg-transparent border-none focus:ring-0 p-1 text-sm outline-none w-full"
                />
                {inputValue.trim() && (
                    <button
                        type="button"
                        onClick={handleAddButtonClick}
                        onMouseDown={handleMouseDownOnButton}
                        className="flex-shrink-0 ml-2 p-1.5 bg-[#005A9C] text-white rounded-full hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        aria-label="Add item"
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default TagInput;
