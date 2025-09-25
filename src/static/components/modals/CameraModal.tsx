import React, { useRef, useEffect, useState, useCallback } from 'react';
import CameraIcon from '../icons/CameraIcon';
import XIcon from '../icons/XIcon';

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (imageDataUrl: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    const stopStream = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            const setupCamera = async () => {
                try {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                        video: { facingMode: 'user' } 
                    });
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    setError("ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบการอนุญาตในเบราว์เซอร์ของคุณ");
                }
            };
            setupCamera();
        } else {
            stopStream();
        }

        return () => {
            stopStream();
        };
    }, [isOpen, stopStream]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                onCapture(imageDataUrl);
            }
        }
    };
    
    const handleClose = () => {
        stopStream();
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="camera-modal-title">
            <h2 id="camera-modal-title" className="sr-only">Camera for profile picture</h2>
            <div className="relative w-full max-w-lg aspect-square bg-black rounded-lg overflow-hidden shadow-2xl">
                {error ? (
                    <div className="flex flex-col items-center justify-center h-full text-white p-4">
                        <CameraIcon className="w-16 h-16 text-red-400 mb-4" />
                        <p className="text-center">{error}</p>
                    </div>
                ) : (
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover"
                    />
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            <div className="flex items-center justify-around w-full max-w-lg mt-6">
                <button
                    onClick={handleClose}
                    className="flex flex-col items-center justify-center text-white font-semibold"
                    aria-label="Close camera"
                >
                     <div className="w-16 h-16 rounded-full bg-gray-700 bg-opacity-50 flex items-center justify-center mb-1">
                        <XIcon className="w-8 h-8" />
                     </div>
                     <span>ยกเลิก</span>
                </button>
                <button
                    onClick={handleCapture}
                    disabled={!!error}
                    className="flex flex-col items-center justify-center text-white font-semibold disabled:opacity-50"
                    aria-label="Capture photo"
                >
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center p-1.5 shadow-lg mb-1">
                        <div className="w-full h-full rounded-full border-4 border-black"></div>
                    </div>
                    <span>ถ่ายภาพ</span>
                </button>
                {/* Placeholder for future flip camera button */}
                 <div className="w-16 h-16"></div>
            </div>
        </div>
    );
};

export default CameraModal;