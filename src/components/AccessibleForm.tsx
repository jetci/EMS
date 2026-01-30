/**
 * Accessible Form Components
 * WCAG 2.1 compliant form elements
 */

import React from 'react';

// Form Field Wrapper
interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
}) => {
  const errorId = error ? `${htmlFor}-error` : undefined;
  const hintId = hint ? `${htmlFor}-hint` : undefined;

  return (
    <div className="mb-4">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && (
          <span className="text-red-600 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-sm text-gray-500 mb-2">
          {hint}
        </p>
      )}

      {React.cloneElement(children as React.ReactElement, {
        id: htmlFor,
        'aria-required': required,
        'aria-invalid': !!error,
        'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
      })}

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Accessible Input
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  error = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors';
  const errorStyles = error
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

  return (
    <input
      className={`${baseStyles} ${errorStyles} ${className}`}
      {...props}
    />
  );
};

// Accessible Select
interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const AccessibleSelect: React.FC<AccessibleSelectProps> = ({
  error = false,
  options,
  placeholder,
  className = '',
  ...props
}) => {
  const baseStyles = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors';
  const errorStyles = error
    ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

  return (
    <select className={`${baseStyles} ${errorStyles} ${className}`} {...props}>
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Accessible Textarea
interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const AccessibleTextarea: React.FC<AccessibleTextareaProps> = ({
  error = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors';
  const errorStyles = error
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

  return (
    <textarea
      className={`${baseStyles} ${errorStyles} ${className}`}
      {...props}
    />
  );
};

// Accessible Checkbox
interface AccessibleCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const AccessibleCheckbox: React.FC<AccessibleCheckboxProps> = ({
  label,
  id,
  className = '',
  ...props
}) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        className={`h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
      />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
        {label}
      </label>
    </div>
  );
};

// Accessible Radio Group
interface RadioOption {
  value: string;
  label: string;
}

interface AccessibleRadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
}

export const AccessibleRadioGroup: React.FC<AccessibleRadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  error = false,
}) => {
  return (
    <div role="radiogroup" className="space-y-2">
      {options.map((option) => (
        <div key={option.value} className="flex items-center">
          <input
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            className={`h-5 w-5 border-gray-300 focus:ring-2 focus:ring-blue-500 ${
              error ? 'text-red-600' : 'text-blue-600'
            }`}
          />
          <label
            htmlFor={`${name}-${option.value}`}
            className="ml-2 block text-sm text-gray-900"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
};
