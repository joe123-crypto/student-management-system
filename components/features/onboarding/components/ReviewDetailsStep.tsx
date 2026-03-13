import React from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { StudentProfile, User } from '@/types';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';

interface ReviewDetailsStepProps {
  user: User;
  student: StudentProfile;
  readOnlyInputClass: string;
  onBack: () => void;
  onComplete: () => Promise<void>;
  isSubmitting: boolean;
}

const ReviewDetailsStep: React.FC<ReviewDetailsStepProps> = ({
  user,
  student,
  readOnlyInputClass,
  onBack,
  onComplete,
  isSubmitting,
}) => (
  <div className="space-y-8">
    <h2 className="text-2xl font-bold text-slate-900 font-rounded flex items-center gap-2">
      <MapPin className="w-6 h-6 text-indigo-600" />
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
          className="px-8 py-3 rounded-2xl border-2 border-slate-200 text-slate-600"
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
            variant="success"
            className="px-12 py-4 rounded-2xl"
          >
            {isSubmitting ? 'Saving...' : 'Complete and Continue'}
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default ReviewDetailsStep;
