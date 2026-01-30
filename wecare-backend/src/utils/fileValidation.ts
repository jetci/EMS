/**
 * File Type Validation Utility
 * Validates file types using magic numbers (file signatures)
 */

import fs from 'fs';

/**
 * Magic numbers (file signatures) for common file types
 * First few bytes that identify file type
 */
const FILE_SIGNATURES: Record<string, Buffer[]> = {
    // Images
    'image/jpeg': [
        Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]),  // JPEG JFIF
        Buffer.from([0xFF, 0xD8, 0xFF, 0xE1]),  // JPEG EXIF
        Buffer.from([0xFF, 0xD8, 0xFF, 0xE2]),  // JPEG
        Buffer.from([0xFF, 0xD8, 0xFF, 0xE3]),  // JPEG
    ],
    'image/png': [
        Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])  // PNG
    ],
    'image/webp': [
        Buffer.from([0x52, 0x49, 0x46, 0x46])  // RIFF (WebP starts with RIFF)
    ],

    // Documents
    'application/pdf': [
        Buffer.from([0x25, 0x50, 0x44, 0x46])  // %PDF
    ],

    // MS Office (ZIP-based)
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        Buffer.from([0x50, 0x4B, 0x03, 0x04]),  // PK (ZIP)
        Buffer.from([0x50, 0x4B, 0x05, 0x06]),  // PK (ZIP empty)
        Buffer.from([0x50, 0x4B, 0x07, 0x08])   // PK (ZIP spanned)
    ],

    // Old MS Office
    'application/msword': [
        Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])  // DOC
    ]
};

/**
 * Validate file type by reading magic numbers
 * @param filePath - Path to file
 * @param expectedMimeType - Expected MIME type
 * @returns True if file matches expected type
 */
export const validateFileType = async (filePath: string, expectedMimeType: string): Promise<boolean> => {
    try {
        // Read first 16 bytes of file
        const buffer = Buffer.alloc(16);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, 16, 0);
        fs.closeSync(fd);

        // Get signatures for expected type
        const signatures = FILE_SIGNATURES[expectedMimeType];

        if (!signatures) {
            console.warn(`No signature defined for MIME type: ${expectedMimeType}`);
            return true; // Allow if no signature defined
        }

        // Check if file starts with any of the valid signatures
        for (const signature of signatures) {
            if (buffer.subarray(0, signature.length).equals(signature)) {
                return true;
            }
        }

        console.warn(`File signature mismatch for ${filePath}. Expected: ${expectedMimeType}`);
        return false;
    } catch (error) {
        console.error('Error validating file type:', error);
        return false;
    }
};

/**
 * Check if file contains dangerous content
 * @param filePath - Path to file
 * @returns True if file appears safe
 */
export const checkFileSafety = async (filePath: string): Promise<{ safe: boolean; reason?: string }> => {
    try {
        // Read first 1KB of file
        const buffer = Buffer.alloc(1024);
        const fd = fs.openSync(filePath, 'r');
        const bytesRead = fs.readSync(fd, buffer, 0, 1024, 0);
        fs.closeSync(fd);

        const content = buffer.subarray(0, bytesRead).toString('utf8', 0, Math.min(bytesRead, 512));

        // Check for script tags
        if (/<script/i.test(content)) {
            return { safe: false, reason: 'Contains script tags' };
        }

        // Check for PHP tags
        if (/<\?php/i.test(content)) {
            return { safe: false, reason: 'Contains PHP code' };
        }

        // Check for executable signatures
        const executableSignatures = [
            Buffer.from([0x4D, 0x5A]),  // MZ (Windows EXE)
            Buffer.from([0x7F, 0x45, 0x4C, 0x46])  // ELF (Linux executable)
        ];

        for (const sig of executableSignatures) {
            if (buffer.subarray(0, sig.length).equals(sig)) {
                return { safe: false, reason: 'Executable file detected' };
            }
        }

        return { safe: true };
    } catch (error) {
        console.error('Error checking file safety:', error);
        return { safe: false, reason: 'Error reading file' };
    }
};

/**
 * Get file size in bytes
 * @param filePath - Path to file
 * @returns File size in bytes
 */
export const getFileSize = (filePath: string): number => {
    try {
        const stats = fs.statSync(filePath);
        return stats.size;
    } catch (error) {
        console.error('Error getting file size:', error);
        return 0;
    }
};
