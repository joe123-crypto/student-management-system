import type { StudentProfile } from '@/types';
import FormField from '@/components/ui/FormField';

interface StudentFormProps {
  profile: Partial<StudentProfile>;
  onChange: (next: Partial<StudentProfile>) => void;
}

export default function StudentForm({ profile, onChange }: StudentFormProps) {
  return (
    <FormField label="Full Name" className="space-y-3">
      <input
        className="w-full rounded-lg border border-slate-200 px-3 py-2"
        value={profile.student?.fullName ?? ''}
        onChange={(e) =>
          onChange({
            ...profile,
            student: { ...((profile.student as any) ?? {}), fullName: e.target.value } as any,
          })
        }
      />
    </FormField>
  );
}
