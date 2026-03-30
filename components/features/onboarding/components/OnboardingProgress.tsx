import React from 'react';

interface OnboardingProgressProps {
  step: number;
  totalSteps: number;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ step, totalSteps }) => (
  <div className="mb-12">
    <div className="flex items-center justify-between mb-8">
      <h1 className="theme-heading type-section-title">Account Onboarding</h1>
      <span className="theme-text-muted type-meta font-medium">
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
              step >= id ? 'bg-[color:var(--theme-primary-soft)]' : 'bg-[color:color-mix(in_srgb,var(--theme-border)_72%,white)]'
            }`}
          />
        );
      })}
    </div>
  </div>
);

export default OnboardingProgress;
