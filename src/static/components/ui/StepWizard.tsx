// src/components/ui/StepWizard.tsx
import React, { useState, ReactNode } from 'react';

interface StepWizardProps {
  children: ReactNode[];
  onComplete: (data: any) => void;
  className?: string;
}

interface StepProps {
  title: string;
  children: ReactNode;
  onNext?: (data: any) => boolean; // Return true if validation passes
  onBack?: () => void;
  isLastStep?: boolean;
}

export const Step: React.FC<StepProps> = ({ children }) => {
  return <div>{children}</div>;
};

const StepWizard: React.FC<StepWizardProps> = ({ 
  children, 
  onComplete, 
  className = "" 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});

  const totalSteps = React.Children.count(children);
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = (stepData?: any) => {
    if (stepData) {
      setFormData(prev => ({ ...prev, ...stepData }));
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step - submit
      const finalData = { ...formData, ...stepData };
      onComplete(finalData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      setCurrentStep(stepIndex);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            ลงทะเบียนผู้ป่วยใหม่
          </h2>
          <span className="text-sm text-gray-600">
            ขั้นตอนที่ {currentStep + 1} จาก {totalSteps}
          </span>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-4">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-colors ${
                  index <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
                onClick={() => goToStep(index)}
              >
                {index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6 min-h-[500px]">
        {React.Children.map(children, (child, index) => {
          if (index === currentStep) {
            return React.cloneElement(child as React.ReactElement, {
              onNext: handleNext,
              onBack: handleBack,
              isLastStep: currentStep === totalSteps - 1,
              currentData: formData
            });
          }
          return null;
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            currentStep === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ← ย้อนกลับ
        </button>

        <div className="text-sm text-gray-500 self-center">
          {Math.round(progressPercentage)}% เสร็จสิ้น
        </div>

        <button
          type="button"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          form={`step-${currentStep}-form`}
        >
          {currentStep === totalSteps - 1 ? 'ยืนยันการลงทะเบียน' : 'ถัดไป →'}
        </button>
      </div>
    </div>
  );
};

export default StepWizard;

