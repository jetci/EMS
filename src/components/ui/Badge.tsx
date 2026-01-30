import React from 'react';
import { cn } from '../../utils/cn';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-blue-600 text-white',
  secondary: 'bg-gray-200 text-gray-900',
  destructive: 'bg-red-500 text-white',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-white',
  outline: 'border border-gray-300 text-gray-900',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  return (
    <div className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', variantClasses[variant], className)} {...props} />
  );
};

export default Badge;
