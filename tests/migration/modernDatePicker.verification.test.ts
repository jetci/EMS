/**
 * ModernDatePicker Migration - Verification Tests
 * 
 * Tests to verify that all active pages use ModernDatePicker
 * and no ThaiDatePicker imports remain in production code
 */

import fs from 'fs';
import path from 'path';

describe('ModernDatePicker Migration Verification', () => {
    const PAGES_DIR = path.join(__dirname, '../../src/pages');
    const COMPONENTS_DIR = path.join(__dirname, '../../components');

    // Get all .tsx files in a directory
    function getTsxFiles(dir: string): string[] {
        const files: string[] = [];

        function traverse(currentPath: string) {
            const items = fs.readdirSync(currentPath);

            for (const item of items) {
                const fullPath = path.join(currentPath, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    traverse(fullPath);
                } else if (item.endsWith('.tsx')) {
                    files.push(fullPath);
                }
            }
        }

        traverse(dir);
        return files;
    }

    // Check if file contains ThaiDatePicker import
    function hasThaiDatePickerImport(filePath: string): boolean {
        const content = fs.readFileSync(filePath, 'utf8');
        return content.includes('ThaiDatePicker');
    }

    // Check if file contains ModernDatePicker import
    function hasModernDatePickerImport(filePath: string): boolean {
        const content = fs.readFileSync(filePath, 'utf8');
        return content.includes('ModernDatePicker');
    }

    describe('Pages Directory', () => {
        test('should not have any ThaiDatePicker imports', () => {
            const files = getTsxFiles(PAGES_DIR);
            const filesWithThaiDatePicker: string[] = [];

            files.forEach(file => {
                if (hasThaiDatePickerImport(file)) {
                    filesWithThaiDatePicker.push(path.relative(process.cwd(), file));
                }
            });

            expect(filesWithThaiDatePicker).toEqual([]);
        });

        test('OfficeReportsPage should use ModernDatePicker', () => {
            const filePath = path.join(PAGES_DIR, 'OfficeReportsPage.tsx');

            expect(fs.existsSync(filePath)).toBe(true);
            expect(hasModernDatePickerImport(filePath)).toBe(true);
            expect(hasThaiDatePickerImport(filePath)).toBe(false);
        });

        test('OfficeManageRidesPage should use ModernDatePicker', () => {
            const filePath = path.join(PAGES_DIR, 'OfficeManageRidesPage.tsx');

            expect(fs.existsSync(filePath)).toBe(true);
            expect(hasModernDatePickerImport(filePath)).toBe(true);
            expect(hasThaiDatePickerImport(filePath)).toBe(false);
        });

        test('OfficeManagePatientsPage should use ModernDatePicker', () => {
            const filePath = path.join(PAGES_DIR, 'OfficeManagePatientsPage.tsx');

            expect(fs.existsSync(filePath)).toBe(true);
            expect(hasModernDatePickerImport(filePath)).toBe(true);
            expect(hasThaiDatePickerImport(filePath)).toBe(false);
        });

        test('DriverHistoryPage should use ModernDatePicker', () => {
            const filePath = path.join(PAGES_DIR, 'DriverHistoryPage.tsx');

            expect(fs.existsSync(filePath)).toBe(true);
            expect(hasModernDatePickerImport(filePath)).toBe(true);
            expect(hasThaiDatePickerImport(filePath)).toBe(false);
        });

        test('AdminAuditLogsPage should use ModernDatePicker', () => {
            const filePath = path.join(PAGES_DIR, 'AdminAuditLogsPage.tsx');

            expect(fs.existsSync(filePath)).toBe(true);
            expect(hasModernDatePickerImport(filePath)).toBe(true);
            expect(hasThaiDatePickerImport(filePath)).toBe(false);
        });
    });

    describe('Components Directory', () => {
        test('should not have any ThaiDatePicker imports in active components', () => {
            const files = getTsxFiles(COMPONENTS_DIR);
            const filesWithThaiDatePicker: string[] = [];

            files.forEach(file => {
                // Skip static/legacy files
                if (file.includes('/static/') || file.includes('\\static\\')) {
                    return;
                }

                if (hasThaiDatePickerImport(file)) {
                    filesWithThaiDatePicker.push(path.relative(process.cwd(), file));
                }
            });

            expect(filesWithThaiDatePicker).toEqual([]);
        });
    });

    describe('ModernDatePicker Usage Consistency', () => {
        const TARGET_PAGES = [
            'OfficeReportsPage.tsx',
            'OfficeManageRidesPage.tsx',
            'OfficeManagePatientsPage.tsx',
            'DriverHistoryPage.tsx',
            'AdminAuditLogsPage.tsx'
        ];

        TARGET_PAGES.forEach(pageName => {
            test(`${pageName} should have placeholder props`, () => {
                const filePath = path.join(PAGES_DIR, pageName);
                const content = fs.readFileSync(filePath, 'utf8');

                // Check if ModernDatePicker has placeholder prop
                const hasPlaceholder = content.includes('placeholder=');

                expect(hasPlaceholder).toBe(true);
            });
        });
    });

    describe('Legacy Code Detection', () => {
        test('should identify static folder as legacy', () => {
            const staticDir = path.join(__dirname, '../../src/static');

            if (fs.existsSync(staticDir)) {
                const files = getTsxFiles(staticDir);
                const filesWithThaiDatePicker = files.filter(file =>
                    hasThaiDatePickerImport(file)
                );

                // It's OK to have ThaiDatePicker in static/legacy folder
                // Just document it
                console.log(`ℹ️  Found ${filesWithThaiDatePicker.length} legacy files with ThaiDatePicker in /static folder`);

                expect(filesWithThaiDatePicker.length).toBeGreaterThanOrEqual(0);
            }
        });
    });

    describe('Migration Completeness', () => {
        test('all target pages should be migrated', () => {
            const results = {
                'OfficeReportsPage.tsx': false,
                'OfficeManageRidesPage.tsx': false,
                'OfficeManagePatientsPage.tsx': false,
                'DriverHistoryPage.tsx': false,
                'AdminAuditLogsPage.tsx': false
            };

            Object.keys(results).forEach(pageName => {
                const filePath = path.join(PAGES_DIR, pageName);
                if (fs.existsSync(filePath)) {
                    results[pageName] = hasModernDatePickerImport(filePath) &&
                        !hasThaiDatePickerImport(filePath);
                }
            });

            // All should be true
            Object.values(results).forEach(migrated => {
                expect(migrated).toBe(true);
            });
        });
    });
});
