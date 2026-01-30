import React from 'react';
import { cn } from '../../utils/cn';
import Button from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, className }) => {
  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <p className="text-sm text-neutral-700">
        หน้า <span className="font-medium">{currentPage}</span> จาก{' '}
        <span className="font-medium">{Math.max(totalPages, 1)}</span>
      </p>
      <div className="flex items-center space-x-2">
        <Button onClick={handlePrevious} disabled={currentPage === 1} variant="outline" size="sm">
          ก่อนหน้า
        </Button>
        <Button onClick={handleNext} disabled={currentPage === totalPages || totalPages === 0} variant="outline" size="sm">
          ถัดไป
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
