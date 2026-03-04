import React from 'react';

interface OnboardingProgressProps {
  step: number;
  totalSteps: number;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ step, totalSteps }) => (
  <div className="mb-12">
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-black text-slate-900">Account Onboarding</h1>
      <span className="text-slate-500 font-medium">
        Step {step} of {totalSteps}
      </span>
    </div>

    <div className="flex gap-2 h-2">
      {Array.from({ length: totalSteps }, (_, index) => {
        const id = index + 1;
        return (
          <div
            key={id}
            className={`flex-1 rounded-full transition-all duration-500 ${
              step >= id ? 'bg-indigo-600' : 'bg-slate-200'
            }`}
          />
        );
      })}
    </div>
  </div>
);

export default OnboardingProgress;
