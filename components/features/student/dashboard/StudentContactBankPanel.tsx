import React from 'react';
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

const tinyLabelClass = 'mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400';

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
  if (loading || !student || !editData || !inputClassName || !onToggleEdit || !onDiscard || !onSave || !onUpdateField) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-8 w-2 rounded-full bg-amber-200" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-5 h-4 w-72 rounded-md" />
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-8 w-2 rounded-full bg-amber-500" />
          <h5 className="text-base font-black uppercase tracking-[0.16em] text-slate-500">Contact & Banking</h5>
        </div>
        <Button
          onClick={onToggleEdit}
          variant={isEditing ? 'secondary' : 'primary'}
          className={isEditing ? 'bg-slate-200 text-slate-700' : 'rounded-full'}
        >
          {isEditing ? 'Cancel' : 'Edit Bank Details'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className={tinyLabelClass}>Phone</p>
          <p className="text-xl font-black text-slate-900">{student.contact.phone || '---'}</p>
        </div>
        <div>
          <p className={tinyLabelClass}>Emergency Contact</p>
          <p className="text-xl font-black text-slate-900">{student.contact.emergencyContactName || '---'}</p>
        </div>
        <div>
          <p className={tinyLabelClass}>Bank</p>
          {isEditing ? (
            <input
              value={editData.bank.bankName}
              onChange={(e) => onUpdateField('bank', 'bankName', e.target.value)}
              className={inputClassName}
            />
          ) : (
            <p className="text-xl font-black text-slate-900">{student.bank.bankName || '---'}</p>
          )}
        </div>
        <div>
          <p className={tinyLabelClass}>RIB / IBAN</p>
          {isEditing ? (
            <input
              value={editData.bankAccount.iban}
              onChange={(e) => onUpdateField('bankAccount', 'iban', e.target.value)}
              className={inputClassName}
            />
          ) : (
            <p className="text-xl font-black text-indigo-600">{student.bankAccount.iban || '---'}</p>
          )}
        </div>
        <div>
          <p className={tinyLabelClass}>Account Number</p>
          {isEditing ? (
            <input
              value={editData.bankAccount.accountNumber}
              onChange={(e) => onUpdateField('bankAccount', 'accountNumber', e.target.value)}
              className={inputClassName}
            />
          ) : (
            <p className="text-xl font-black text-slate-900">{student.bankAccount.accountNumber || '---'}</p>
          )}
        </div>
        <div>
          <p className={tinyLabelClass}>Branch Code</p>
          {isEditing ? (
            <input
              value={editData.bank.branchCode || ''}
              onChange={(e) => onUpdateField('bank', 'branchCode', e.target.value)}
              className={inputClassName}
            />
          ) : (
            <p className="text-xl font-black text-slate-900">{student.bank.branchCode || '---'}</p>
          )}
        </div>
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-500">
        Personal and academic details are managed by administration.
      </p>

      {isEditing ? (
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
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
