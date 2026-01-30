import React from 'react';
import { NewsArticle } from '../../types';

interface NewsStatusBadgeProps {
  status: NewsArticle['status'];
}

const statusStyles: { [key in NewsArticle['status']]: { text: string; classes: string } } = {
  published: { text: 'เผยแพร่แล้ว', classes: 'bg-green-100 text-green-800' },
  draft: { text: 'ฉบับร่าง', classes: 'bg-gray-200 text-gray-700' },
};

const NewsStatusBadge: React.FC<NewsStatusBadgeProps> = ({ status }) => {
  const style = statusStyles[status];
  
  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${style.classes}`}>
      {style.text}
    </span>
  );
};

export default NewsStatusBadge;
