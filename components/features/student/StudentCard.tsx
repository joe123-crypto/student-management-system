import type { StudentProfile } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';

interface StudentCardProps {
  student: StudentProfile;
}

export default function StudentCard({ student }: StudentCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{student.student.fullName}</p>
          <p className="text-xs text-slate-500">{student.contact.email}</p>
        </div>
        <StatusBadge status={student.status} />
      </div>
    </div>
  );
}
