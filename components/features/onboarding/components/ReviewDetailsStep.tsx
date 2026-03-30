import React from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { StudentProfile } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';

interface ReviewDetailsStepProps {
  student: StudentProfile;
  readOnlyInputClass: string;
  onBack: () => void;
  onComplete: () => Promise<void>;
  isSubmitting: boolean;
}

const ReviewDetailsStep: React.FC<ReviewDetailsStepProps> = ({
  student,
  readOnlyInputClass,
  onBack,
  onComplete,
  isSubmitting,
}) => (
  <div className="space-y-8">
    <h2 className="theme-heading font-rounded flex items-center gap-2 text-2xl font-bold">
      <MapPin className="h-6 w-6 text-[color:var(--theme-primary-soft)]" />
      Review Record
    </h2>
    <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
      <FormField label="Email">
        <input
          type="text"
          className={readOnlyInputClass}
          value={student.contact.email || '---'}
          readOnly
        />
      </FormField>
      <FormField label="Phone Number">
        <input type="text" className={readOnlyInputClass} value={student.contact.phone || '---'} readOnly />
      </FormField>
      <FormField label="Host Address" className="col-span-2">
        <input
          type="text"
          className={readOnlyInputClass}
          value={student.address.currentHostAddress || '---'}
          readOnly
        />
      </FormField>
      <div className="col-span-2 pt-6 flex items-center justify-between">
        <Button
          onClick={onBack}
          disabled={isSubmitting}
          variant="secondary"
          className="rounded-2xl px-8 py-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-6">
          <Button
            onClick={() => {
              void onComplete();
            }}
            disabled={isSubmitting}
            className="rounded-2xl px-12 py-4 shadow-[0_18px_36px_rgba(37,79,34,0.16)]"
          >
            {isSubmitting ? 'Saving...' : 'Complete and Continue'}
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default ReviewDetailsStep;
