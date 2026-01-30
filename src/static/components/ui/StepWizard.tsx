/**
 * Step Wizard Component
 * Multi-step form wizard with navigation
 */

import React, { useState, ReactNode, useEffect, useRef } from 'react';

interface Step {
  title: string;
  component: ReactNode;
  isValid?: boolean;
}

interface StepWizardProps {
  steps: Step[];
  onComplete: (data: any) => void;
  onCancel?: () => void;
  onDataChange?: (data: any) => void; // New callback for data changes
  initialData?: any; // Initial form data (for loading drafts)
}

const StepWizard: React.FC<StepWizardProps> = ({ steps, onComplete, onCancel, onDataChange, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>(initialData || {});
  const isUpdatingFromInitial = useRef(false);

  // Update formData when initialData changes (e.g., when loading draft)
  useEffect(() => {
    console.log('🔄 StepWizard initialData changed:', initialData);
    if (initialData && Object.keys(initialData).length > 0) {
      console.log('✅ StepWizard updating formData with initialData');
      isUpdatingFromInitial.current = true;
      setFormData(initialData);
      // Reset flag after state update
      setTimeout(() => {
        isUpdatingFromInitial.current = false;
      }, 0);
    }
  }, [initialData]);

  // Notify parent whenever formData changes (but not when updating from initialData)
  useEffect(() => {
    if (onDataChange && !isUpdatingFromInitial.current) {
      console.log('📤 StepWizard notifying parent of formData change');
      onDataChange(formData);
    }
  }, [formData, onDataChange]);

  const handleNext = (stepData?: any) => {
    if (stepData) {
      setFormData({ ...formData, ...stepData });
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step - complete
      onComplete({ ...formData, ...stepData });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    // Allow clicking on previous steps only
    if (index < currentStep) {
      setCurrentStep(index);
    }
  };

  return (
    <div className="step-wizard">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex-1 flex items-center"
              onClick={() => handleStepClick(index)}
            >
              {/* Step Circle */}
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 
                  ${index < currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : index === currentStep
                      ? 'bg-white border-blue-600 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-400'
                  }
                  ${index < currentStep ? 'cursor-pointer' : ''}
                  transition-all duration-200
                `}
              >
                {index < currentStep ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="font-semibold">{index + 1}</span>
                )}
              </div>

              {/* Step Title */}
              <div className="ml-3 flex-1">
                <p
                  className={`
                    text-sm font-medium
                    ${index <= currentStep
                      ? 'text-gray-900'
                      : 'text-gray-400'
                    }
                  `}
                >
                  {step.title}
                </p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    h-0.5 flex-1 mx-4
                    ${index < currentStep
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                    }
                  `}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {React.cloneElement(steps[currentStep].component as React.ReactElement, {
          onNext: handleNext,
          onBack: handleBack,
          formData,
          isFirstStep: currentStep === 0,
          isLastStep: currentStep === steps.length - 1,
        })}
      </div>


    </div>
  );
};

export default StepWizard;
export type { Step };
