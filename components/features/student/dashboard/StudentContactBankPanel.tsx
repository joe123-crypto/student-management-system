import React from 'react';
import { Building2, Landmark, Phone } from 'lucide-react';
import { StudentProfile } from '@/types';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';

interface StudentContactBankPanelProps {
  student?: StudentProfile;
  editData?: StudentProfile;
  isEditing?: boolean;
  inputClassName?: string;
  onToggleEdit?: () => void;
  onDiscard?: () => void;
  onSave?: () => void;
  onUpdateField?: (section: keyof StudentProfile, field: string, value: unknown) => void;
  loading?: boolean;
}

const surfaceCardClass =
  'theme-card relative overflow-hidden rounded-[2.25rem] border bg-[linear-gradient(180deg,rgba(252,248,234,0.98),rgba(247,241,221,0.9))] shadow-[0_22px_50px_rgba(37,79,34,0.08)]';
const fieldCardClass =
  'min-w-0 rounded-[1.35rem] border border-[rgba(220,205,166,0.52)] bg-[rgba(255,255,255,0.42)] px-4 py-4';
const fieldLabelClass = 'theme-text-muted text-xs font-medium leading-snug tracking-[0.04em]';
const fieldValueClass = 'theme-heading mt-2 break-words text-lg font-semibold leading-tight';

interface ProfileGroupHeaderProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function ProfileGroupHeader({ icon: Icon, title, description }: ProfileGroupHeaderProps) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(37,79,34,0.1)] text-[color:var(--theme-primary)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h5 className="theme-heading text-sm font-bold tracking-[0.04em]">{title}</h5>
        <p className="theme-text-muted text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function DisplayField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className={fieldCardClass}>
      <p className={fieldLabelClass}>{label}</p>
      <p
        className={[
          fieldValueClass,
          mono ? 'break-all font-mono text-base font-semibold text-[color:var(--theme-primary)]' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {value}
      </p>
    </div>
  );
}

const StudentContactBankPanel: React.FC<StudentContactBankPanelProps> = ({
  student,
  editData,
  isEditing,
  inputClassName,
  onToggleEdit,
  onDiscard,
  onSave,
  onUpdateField,
  loading = false,
}) => {
  if (
    loading ||
    !student ||
    !editData ||
    !inputClassName ||
    !onToggleEdit ||
    !onDiscard ||
    !onSave ||
    !onUpdateField
  ) {
    return (
      <div className={`${surfaceCardClass} p-6 md:p-7`}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-2xl bg-[rgba(220,205,166,0.32)]" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-[rgba(220,205,166,0.48)] bg-[rgba(255,255,255,0.36)] p-5">
            <div className="mb-5 flex items-start gap-3">
              <div className="h-11 w-11 rounded-2xl bg-[rgba(220,205,166,0.32)]" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-44" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-20 rounded-[1.35rem]" />
              <Skeleton className="h-20 rounded-[1.35rem]" />
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-[rgba(220,205,166,0.48)] bg-[rgba(255,255,255,0.36)] p-5">
            <div className="mb-5 flex items-start gap-3">
              <div className="h-11 w-11 rounded-2xl bg-[rgba(220,205,166,0.32)]" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-20 rounded-[1.35rem]" />
              ))}
            </div>
          </div>
        </div>
        <Skeleton className="mt-5 h-4 w-72 rounded-md" />
      </div>
    );
  }

  return (
    <div className={`${surfaceCardClass} p-6 md:p-7`}>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl">
          <ProfileGroupHeader
            icon={Building2}
            title="Contact and banking"
            description="Keep the practical details together, with editing focused only on the fields you can update."
          />
        </div>
        <Button
          onClick={onToggleEdit}
          variant={isEditing ? 'secondary' : 'primary'}
          className="rounded-full"
        >
          {isEditing ? 'Cancel' : 'Edit Bank Details'}
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-[rgba(220,205,166,0.48)] bg-[rgba(255,255,255,0.38)] p-5">
          <ProfileGroupHeader
            icon={Phone}
            title="Contact details"
            description="Reference information managed with your profile."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <DisplayField label="Phone" value={student.contact.phone || '---'} />
            <DisplayField label="Emergency contact" value={student.contact.emergencyContactName || '---'} />
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[rgba(220,205,166,0.48)] bg-[rgba(255,255,255,0.38)] p-5">
          <ProfileGroupHeader
            icon={Landmark}
            title="Banking details"
            description="These are the fields you can review and update directly."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={fieldCardClass}>
              <p className={fieldLabelClass}>Bank</p>
              {isEditing ? (
                <input
                  value={editData.bank.bankName}
                  onChange={(e) => onUpdateField('bank', 'bankName', e.target.value)}
                  className={`${inputClassName} mt-3 min-w-0`}
                />
              ) : (
                <p className={fieldValueClass}>{student.bank.bankName || '---'}</p>
              )}
            </div>

            <div className={fieldCardClass}>
              <p className={fieldLabelClass}>RIB / IBAN</p>
              {isEditing ? (
                <input
                  value={editData.bankAccount.iban}
                  onChange={(e) => onUpdateField('bankAccount', 'iban', e.target.value)}
                  className={`${inputClassName} mt-3 min-w-0`}
                />
              ) : (
                <p className="mt-2 break-all font-mono text-base font-semibold leading-tight text-[color:var(--theme-primary)]">
                  {student.bankAccount.iban || '---'}
                </p>
              )}
            </div>

            <div className={fieldCardClass}>
              <p className={fieldLabelClass}>Account number</p>
              {isEditing ? (
                <input
                  value={editData.bankAccount.accountNumber}
                  onChange={(e) => onUpdateField('bankAccount', 'accountNumber', e.target.value)}
                  className={`${inputClassName} mt-3 min-w-0`}
                />
              ) : (
                <p className={fieldValueClass}>{student.bankAccount.accountNumber || '---'}</p>
              )}
            </div>

            <div className={fieldCardClass}>
              <p className={fieldLabelClass}>Branch code</p>
              {isEditing ? (
                <input
                  value={editData.bank.branchCode || ''}
                  onChange={(e) => onUpdateField('bank', 'branchCode', e.target.value)}
                  className={`${inputClassName} mt-3 min-w-0`}
                />
              ) : (
                <p className={fieldValueClass}>{student.bank.branchCode || '---'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="theme-text-muted mt-5 text-sm font-semibold">
        Personal and academic details are managed by administration.
      </p>

      {isEditing ? (
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[rgba(220,205,166,0.55)] pt-6">
          <Button variant="ghost" onClick={onDiscard}>
            Discard
          </Button>
          <Button onClick={onSave} className="rounded-full px-10">
            Save Bank Details
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default StudentContactBankPanel;
