import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModernDatePicker from '../../src/components/ui/ModernDatePicker';

describe('ModernDatePicker', () => {
    const mockOnChange = jest.fn();

    it('should show future years in the year dropdown when no max constraint is provided', () => {
        render(
            <ModernDatePicker
                name="test-date"
                value=""
                onChange={mockOnChange}
            />
        );

        // Open the date picker
        const input = screen.getByText('เลือกวันที่');
        fireEvent.click(input);

        // Look for the year select element
        // In the code, it's a <select> with className containing "text-base font-semibold"
        const yearSelect = screen.getByRole('combobox');

        // Get all options
        const options = Array.from(yearSelect.querySelectorAll('option'));
        const years = options.map(opt => parseInt(opt.value));

        const currentYearBE = new Date().getFullYear() + 543;
        const futureYearBE = currentYearBE + 10;

        // Check if current year and matches what we expect
        expect(years).toContain(currentYearBE);

        // Verify that future year is present (should be up to current + 20)
        expect(years).toContain(futureYearBE);

        // The highest year should be >= currentYearBE + 20
        const maxYear = Math.max(...years);
        expect(maxYear).toBeGreaterThanOrEqual(currentYearBE + 20);
    });

    it('should respect the max constraint for year range', () => {
        const maxDate = '2025-12-31';
        const maxYearBE = 2025 + 543;

        render(
            <ModernDatePicker
                name="test-date"
                value=""
                onChange={mockOnChange}
                max={maxDate}
            />
        );

        // Open the date picker
        const input = screen.getByText('เลือกวันที่');
        fireEvent.click(input);

        const yearSelect = screen.getByRole('combobox');
        const options = Array.from(yearSelect.querySelectorAll('option'));
        const years = options.map(opt => parseInt(opt.value));

        // The highest year should be exactly maxYearBE
        expect(Math.max(...years)).toBe(maxYearBE);
    });
});
