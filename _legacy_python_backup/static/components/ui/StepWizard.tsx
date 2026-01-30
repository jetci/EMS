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
  currentData?: any;
}

export const Step: React.FC<StepProps> = ({ children, onNext, onBack, isLastStep, currentData }) => {
  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement, {
            onNext,
            onBack,
            isLastStep,
            currentData
          });
        }
        return child;
      })}
    </>
  );
};

const StepWizard: React.FC<StepWizardProps> = ({
  children,
  onComplete,
  className = ""
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});

  // Filter children to only count valid Step components (ignore comments, fragments, etc.)
  const validChildren = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child)
  );
  const totalSteps = validChildren.length;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  // Debug logging
  console.log('[StepWizard] Total Steps:', totalSteps);
  console.log('[StepWizard] Current Step:', currentStep);
  console.log('[StepWizard] Is Last Step:', currentStep === totalSteps - 1);

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
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-colors ${index <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
                  }`}
                onClick={() => goToStep(index)}
              >
                {index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
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
        {validChildren.map((child, index) => {
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

      {/* Navigation Buttons are now rendered within each Step component */}
    </div>
  );
};

export default StepWizard;

