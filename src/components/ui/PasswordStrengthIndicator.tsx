import React from 'react';

export interface PasswordStrengthIndicatorProps {
    password: string;
    className?: string;
}

/**
 * Calculate password strength score (0-100)
 */
const calculatePasswordStrength = (password: string): number => {
    let score = 0;

    if (!password) return 0;

    // Length bonus
    score += Math.min(password.length * 4, 40);

    // Character variety
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;

    // Penalty for common patterns
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
    if (/^[0-9]+$/.test(password)) score -= 20; // Only numbers
    if (/^[a-zA-Z]+$/.test(password)) score -= 10; // Only letters

    return Math.max(0, Math.min(100, score));
};

/**
 * Get strength level and color based on score
 */
const getStrengthInfo = (score: number): { level: string; color: string; bgColor: string } => {
    if (score >= 80) {
        return { level: 'Very Strong', color: 'text-green-700', bgColor: 'bg-green-500' };
    } else if (score >= 60) {
        return { level: 'Strong', color: 'text-green-600', bgColor: 'bg-green-400' };
    } else if (score >= 40) {
        return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-400' };
    } else if (score >= 20) {
        return { level: 'Weak', color: 'text-orange-600', bgColor: 'bg-orange-400' };
    } else {
        return { level: 'Very Weak', color: 'text-red-600', bgColor: 'bg-red-400' };
    }
};

/**
 * Validate password and return error messages
 */
export const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (!password || password.length === 0) {
        errors.push('Password is required');
        return errors;
    }

    if (password.length < 8) {
        errors.push('At least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('One uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('One lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('One number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('One special character');
    }

    return errors;
};

/**
 * Password Strength Indicator Component
 * Displays visual feedback for password strength
 */
const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password, className = '' }) => {
    const score = calculatePasswordStrength(password);
    const { level, color, bgColor } = getStrengthInfo(score);
    const errors = validatePassword(password);

    if (!password) {
        return null;
    }

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Strength Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full ${bgColor} transition-all duration-300 ease-out`}
                    style={{ width: `${score}%` }}
                />
            </div>

            {/* Strength Label */}
            <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${color}`}>
                    {level}
                </span>
                <span className="text-xs text-gray-500">
                    {score}%
                </span>
            </div>

            {/* Requirements Checklist */}
            {errors.length > 0 && (
                <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-gray-700">Password must contain:</p>
                    <ul className="text-xs space-y-0.5">
                        <li className={password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                            {password.length >= 8 ? '✓' : '○'} At least 8 characters
                        </li>
                        <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                            {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                        </li>
                        <li className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                            {/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter
                        </li>
                        <li className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                            {/[0-9]/.test(password) ? '✓' : '○'} One number
                        </li>
                        <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                            {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? '✓' : '○'} One special character
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PasswordStrengthIndicator;
