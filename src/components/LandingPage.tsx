import React from 'react';
import HeroIllustration from './illustrations/HeroIllustration';
import Button from './ui/Button';

interface LandingPageProps {
  onRegisterClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onRegisterClick }) => {
    return (
        <div className="bg-white text-gray-800">
            {/* Hero Section */}
            <section className="pt-24 pb-12 sm:pt-32 sm:pb-16 min-h-[calc(100vh-80px)] flex items-center">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Text Content */}
                        <div className="text-center lg:text-left">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-green-600 tracking-tight">
                                WeCare
                            </h1>
                            <p className="mt-4 text-xl sm:text-2xl text-gray-700">
                                เชื่อมต่อทุกการเดินทาง เพื่อการดูแลที่ไม่สะดุด
                            </p>
                            <p className="mt-4 max-w-xl mx-auto lg:mx-0 text-md text-gray-600">
                                แพลตฟอร์มกลางสำหรับประสานงานการเดินทางของผู้ป่วย เชื่อมต่อระหว่างเจ้าหน้าที่, ชุมชน, และคนขับรถ เพื่อการเดินทางไปพบแพทย์ที่สะดวกและไว้วางใจได้
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-3">
                                <Button onClick={onRegisterClick} size="lg">
                                    สมัครสมาชิก
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => { try { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); } catch {} }}
                                >
                                    เรียนรู้เพิ่มเติม
                                </Button>
                            </div>
                        </div>
                        {/* Illustration */}
                        <div className="hidden lg:block">
                            <HeroIllustration className="w-full h-auto max-w-lg mx-auto" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
