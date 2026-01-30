/**
 * File Validation Utilities
 * Purpose: Validate file uploads (size, type, security)
 * 
 * Features:
 * - File size validation
 * - File type validation
 * - File extension validation
 * - Dangerous file detection
 * - Image dimension validation
 */

export interface FileValidationError {
    file: string;
    message: string;
}

export interface FileValidationResult {
    isValid: boolean;
    errors: FileValidationError[];
}

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
    IMAGE: 5 * 1024 * 1024,      // 5 MB
    DOCUMENT: 10 * 1024 * 1024,  // 10 MB
    VIDEO: 50 * 1024 * 1024,     // 50 MB
    MAX: 10 * 1024 * 1024        // 10 MB default
};

/**
 * Allowed file types
 */
export const ALLOWED_FILE_TYPES = {
    IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
};

/**
 * Dangerous file extensions (security)
 */
export const DANGEROUS_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
    '.jar', '.msi', '.app', '.deb', '.rpm', '.dmg', '.pkg',
    '.sh', '.bash', '.ps1', '.psm1', '.psd1'
];

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate file size
 */
export const validateFileSize = (
    file: File,
    maxSize: number = FILE_SIZE_LIMITS.MAX
): FileValidationError | null => {
    if (file.size > maxSize) {
        return {
            file: file.name,
            message: `ไฟล์ ${file.name} มีขนาด ${formatFileSize(file.size)} ใหญ่เกินไป (สูงสุด ${formatFileSize(maxSize)})`
        };
    }
    return null;
};

/**
 * Validate file type
 */
export const validateFileType = (
    file: File,
    allowedTypes: string[]
): FileValidationError | null => {
    if (!allowedTypes.includes(file.type)) {
        return {
            file: file.name,
            message: `ไฟล์ ${file.name} เป็นประเภทที่ไม่รองรับ (${file.type})`
        };
    }
    return null;
};

/**
 * Validate file extension
 */
export const validateFileExtension = (
    file: File
): FileValidationError | null => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (DANGEROUS_EXTENSIONS.includes(extension)) {
        return {
            file: file.name,
            message: `ไฟล์ ${file.name} เป็นประเภทที่อันตราย (${extension})`
        };
    }
    return null;
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): FileValidationResult => {
    const errors: FileValidationError[] = [];

    // Check file size
    const sizeError = validateFileSize(file, FILE_SIZE_LIMITS.IMAGE);
    if (sizeError) errors.push(sizeError);

    // Check file type
    const typeError = validateFileType(file, ALLOWED_FILE_TYPES.IMAGE);
    if (typeError) errors.push(typeError);

    // Check dangerous extension
    const extError = validateFileExtension(file);
    if (extError) errors.push(extError);

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate document file
 */
export const validateDocumentFile = (file: File): FileValidationResult => {
    const errors: FileValidationError[] = [];

    // Check file size
    const sizeError = validateFileSize(file, FILE_SIZE_LIMITS.DOCUMENT);
    if (sizeError) errors.push(sizeError);

    // Check file type
    const typeError = validateFileType(file, ALLOWED_FILE_TYPES.DOCUMENT);
    if (typeError) errors.push(typeError);

    // Check dangerous extension
    const extError = validateFileExtension(file);
    if (extError) errors.push(extError);

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate multiple files
 */
export const validateMultipleFiles = (
    files: File[],
    maxFiles: number = 5,
    validator: (file: File) => FileValidationResult = validateDocumentFile
): FileValidationResult => {
    const errors: FileValidationError[] = [];

    // Check number of files
    if (files.length > maxFiles) {
        errors.push({
            file: 'multiple',
            message: `สามารถอัปโหลดได้สูงสุด ${maxFiles} ไฟล์ (คุณเลือก ${files.length} ไฟล์)`
        });
    }

    // Validate each file
    files.forEach(file => {
        const result = validator(file);
        if (!result.isValid) {
            errors.push(...result.errors);
        }
    });

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate image dimensions
 */
export const validateImageDimensions = (
    file: File,
    maxWidth: number = 4000,
    maxHeight: number = 4000
): Promise<FileValidationError | null> => {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            if (img.width > maxWidth || img.height > maxHeight) {
                resolve({
                    file: file.name,
                    message: `ภาพ ${file.name} มีขนาด ${img.width}x${img.height} ใหญ่เกินไป (สูงสุด ${maxWidth}x${maxHeight})`
                });
            } else {
                resolve(null);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({
                file: file.name,
                message: `ไม่สามารถอ่านไฟล์ภาพ ${file.name} ได้`
            });
        };

        img.src = url;
    });
};

/**
 * Format validation errors for display
 */
export const formatFileValidationErrors = (errors: FileValidationError[]): string => {
    if (errors.length === 0) return '';

    return errors.map(err => `• ${err.message}`).join('\n');
};

/**
 * Get file validation error for specific file
 */
export const getFileError = (errors: FileValidationError[], fileName: string): string | null => {
    const error = errors.find(err => err.file === fileName);
    return error ? error.message : null;
};
