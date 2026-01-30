/**
 * Temporary Test Page for UnifiedRadioDashboard
 * ใช้ทดสอบก่อนเปลี่ยน routing จริง
 * 
 * ⚠️ ไฟล์นี้เป็นไฟล์ชั่วคราว จะลบหลังจาก test เสร็จ
 */

import React, { useState } from 'react';
import UnifiedRadioDashboard from './unified/UnifiedRadioDashboard';
import { RadioView, RadioCenterView } from '../types';

const TestUnifiedRadioPage: React.FC = () => {
    const [currentRole, setCurrentRole] = useState<'radio' | 'radio_center'>('radio');
    const [activeView, setActiveView] = useState<RadioView | RadioCenterView>('dashboard');

    const handleSetActiveView = (view: RadioView | RadioCenterView, context?: any) => {
        console.log('setActiveView called:', view, context);
        setActiveView(view);
    };

    return (
        <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
            {/* Test Controls */}
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ margin: '0 0 15px 0', color: '#333' }}>🧪 Test Controls</h2>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <button
                        onClick={() => setCurrentRole('radio')}
                        style={{
                            padding: '10px 20px',
                            background: currentRole === 'radio' ? '#667eea' : '#e0e0e0',
                            color: currentRole === 'radio' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Test Radio Role
                    </button>
                    <button
                        onClick={() => setCurrentRole('radio_center')}
                        style={{
                            padding: '10px 20px',
                            background: currentRole === 'radio_center' ? '#667eea' : '#e0e0e0',
                            color: currentRole === 'radio_center' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Test Radio Center Role
                    </button>
                </div>
                <div style={{
                    padding: '10px',
                    background: '#f0f0f0',
                    borderRadius: '5px',
                    fontSize: '14px'
                }}>
                    <strong>Current Role:</strong> {currentRole}<br />
                    <strong>Active View:</strong> {activeView}
                </div>
            </div>

            {/* UnifiedRadioDashboard Component */}
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <UnifiedRadioDashboard
                    role={currentRole}
                    setActiveView={handleSetActiveView}
                />
            </div>
        </div>
    );
};

export default TestUnifiedRadioPage;
