/**
 * Multer error handling middleware
 * Provides user-friendly error messages for file upload failures
 */

import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    error: 'File too large',
                    message: 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB ต่อไฟล์)',
                    code: 'FILE_TOO_LARGE',
                    maxSize: '5MB'
                });

            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    error: 'Too many files',
                    message: 'อัปโหลดไฟล์ได้สูงสุด 5 ไฟล์ต่อครั้ง',
                    code: 'TOO_MANY_FILES',
                    maxFiles: 5
                });

            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    error: 'Unexpected field',
                    message: 'ฟิลด์ไฟล์ไม่ถูกต้อง',
                    code: 'UNEXPECTED_FIELD',
                    field: err.field
                });

            default:
                return res.status(400).json({
                    error: 'File upload error',
                    message: err.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์',
                    code: err.code || 'UPLOAD_ERROR'
                });
        }
    }

    // Custom file validation errors
    if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
            error: 'Invalid file type',
            message: 'ประเภทไฟล์ไม่ถูกต้อง อนุญาตเฉพาะ JPEG, PNG, WEBP, PDF, DOC, DOCX',
            code: 'INVALID_FILE_TYPE',
            allowedTypes: ['JPEG', 'PNG', 'WEBP', 'PDF', 'DOC', 'DOCX']
        });
    }

    if (err.code === 'INVALID_FILE_EXTENSION') {
        return res.status(400).json({
            error: 'Invalid file extension',
            message: 'นามสกุลไฟล์ไม่ถูกต้อง',
            code: 'INVALID_FILE_EXTENSION',
            allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx']
        });
    }

    // Pass to next error handler if not a multer error
    next(err);
};

/**
 * Cleanup uploaded files on error
 * Prevents orphaned files when upload fails
 */
export const cleanupFilesOnError = (files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] }) => {
    const fs = require('fs');

    try {
        if (Array.isArray(files)) {
            // Single field upload
            files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        } else {
            // Multiple fields upload
            Object.values(files).forEach(fileArray => {
                fileArray.forEach(file => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error cleaning up files:', error);
    }
};
