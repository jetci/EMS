/**
 * Simple Error Fallback Component
 * Used as fallback UI for ErrorBoundary
 */

import React from 'react';

interface ErrorFallbackProps {
    error?: Error;
    resetError?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
    return (
        <div style={{
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '0.5rem',
                padding: '2rem',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1a202c' }}>
                    เกิดข้อผิดพลาด
                </h2>
                <p style={{ color: '#4a5568', marginBottom: '1.5rem' }}>
                    ขออภัย เกิดข้อผิดพลาดในการแสดงผล กรุณาลองใหม่อีกครั้ง
                </p>

                {process.env.NODE_ENV === 'development' && error && (
                    <div style={{
                        textAlign: 'left',
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: '#f7fafc',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        color: '#2d3748',
                        overflow: 'auto'
                    }}>
                        <strong>Error:</strong> {error.message}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    {resetError && (
                        <button
                            onClick={resetError}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            ลองใหม่
                        </button>
                    )}
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#e2e8f0',
                            color: '#2d3748',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        กลับหน้าหลัก
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorFallback;
