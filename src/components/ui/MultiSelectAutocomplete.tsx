import React, { useState, useRef, useEffect } from 'react';
import XIcon from '../icons/XIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';

interface MultiSelectAutocompleteProps {
    id?: string;
    options: string[];
    selectedItems: string[];
    setSelectedItems: (items: string[]) => void;
    placeholder?: string;
}

const MultiSelectAutocomplete: React.FC<MultiSelectAutocompleteProps> = ({
    id,
    options,
    selectedItems,
    setSelectedItems,
    placeholder = 'เลือกหรือพิมพ์เพื่อค้นหา...'
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(
        option =>
            !selectedItems.includes(option) &&
            option.toLowerCase().includes(inputValue.toLowerCase())
    );

    const handleSelect = (item: string) => {
        setSelectedItems([...selectedItems, item]);
        setInputValue('');
        setIsOpen(false);
    };

    const handleRemove = (itemToRemove: string) => {
        setSelectedItems(selectedItems.filter(item => item !== itemToRemove));
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <div className="flex flex-wrap items-center w-full p-2 border border-gray-400 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-[#005A9C]">
                {selectedItems.map(item => (
                    <div key={item} className="flex items-center bg-green-100 text-green-800 text-sm font-medium mr-2 mb-1 px-2.5 py-1 rounded-full">
                        <span>{item}</span>
                        <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            className="ml-2 text-green-600 hover:text-green-800 focus:outline-none"
                            aria-label={`Remove ${item}`}
                        >
                            <XIcon className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                <div className="flex-grow flex items-center min-w-[150px]">
                    <input
                        id={id}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        className="flex-grow bg-transparent border-none focus:ring-0 p-1 text-sm outline-none w-full"
                    />
                     <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredOptions.map(option => (
                        <li
                            key={option}
                            onClick={() => handleSelect(option)}
                            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MultiSelectAutocomplete;
