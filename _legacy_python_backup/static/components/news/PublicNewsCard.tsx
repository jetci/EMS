import React from 'react';
import { NewsArticle } from '../../types';
import { formatDateToThai } from '../../utils/dateUtils';
import ArrowRightIcon from '../icons/ArrowRightIcon';

interface PublicNewsCardProps {
    article: NewsArticle;
    onViewArticle: (articleId: string) => void;
}

const PublicNewsCard: React.FC<PublicNewsCardProps> = ({ article, onViewArticle }) => {
    
    // Create a short excerpt from the content
    const createExcerpt = (content: string, maxLength: number = 120) => {
        if (!content) return '';
        const strippedContent = content.replace(/<[^>]+>/g, ''); // Remove HTML tags
        if (strippedContent.length <= maxLength) {
            return strippedContent;
        }
        return strippedContent.substring(0, maxLength) + '...';
    };

    const excerpt = createExcerpt(article.content);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row group transition-all duration-300 hover:shadow-lg hover:border-blue-300">
            {article.featuredImageUrl && (
                <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                    <img 
                        src={article.featuredImageUrl} 
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            )}
            <div className="p-6 flex flex-col flex-1">
                <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {article.title}
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                    เผยแพร่เมื่อ: {formatDateToThai(article.publishedDate!)} โดย {article.author}
                </p>
                <p className="text-gray-600 mt-4 flex-grow">
                    {excerpt}
                </p>
                <div className="mt-4">
                    <button
                        onClick={() => onViewArticle(article.id)}
                        className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-800"
                    >
                        อ่านต่อ...
                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PublicNewsCard;
