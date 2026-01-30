import React, { useEffect } from 'react';
import { cn } from '../../utils/cn';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className, showCloseButton = true }) => {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', onEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={cn('relative z-50 bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4', className)}>
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between mb-4">
            {title && <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>}
            {showCloseButton && (
              <Button onClick={onClose} variant="ghost" size="icon" aria-label="ปิดหน้าต่าง">✕</Button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
