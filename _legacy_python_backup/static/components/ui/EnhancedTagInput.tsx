// src/components/ui/EnhancedTagInput.tsx
import React, { useState, useRef, useEffect } from 'react';

interface EnhancedTagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
  maxTags?: number;
}

const EnhancedTagInput: React.FC<EnhancedTagInputProps> = ({
  value = [],
  onChange,
  suggestions = [],
  placeholder = "เพิ่มแท็ก...",
  className = "",
  maxTags = 10
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions.filter(
        suggestion => 
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(suggestion)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      const availableSuggestions = suggestions.filter(s => !value.includes(s));
      setFilteredSuggestions(availableSuggestions);
      setShowSuggestions(false);
    }
  }, [inputValue, suggestions, value]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag) && value.length < maxTags) {
      onChange([...value, trimmedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      const availableSuggestions = suggestions.filter(s => !value.includes(s));
      setFilteredSuggestions(availableSuggestions);
      setShowSuggestions(true);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="min-h-[48px] p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          placeholder={value.length === 0 ? placeholder : ""}
          className="w-full border-none outline-none bg-transparent text-sm"
          disabled={value.length >= maxTags}
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {value.length >= maxTags && (
        <p className="text-xs text-gray-500 mt-1">
          สามารถเพิ่มได้สูงสุด {maxTags} รายการ
        </p>
      )}
    </div>
  );
};

export default EnhancedTagInput;

