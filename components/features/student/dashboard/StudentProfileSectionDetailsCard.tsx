import React from 'react';
import {
  ChevronLeft,
  GraduationCap,
  IdCard,
  Landmark,
  MapPin,
  Phone,
  UserRound,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { StudentProfile } from '@/types';

export type ProfileSectionId =
  | 'identity'
  | 'university'
  | 'contact'
  | 'address'
  | 'passport'
  | 'banking';

type ProfileSectionDefinition = {
  id: ProfileSectionId;
  title: string;
  description: string;
  icon: React.ElementType;
};

const surfaceCardClass =
  'theme-card relative overflow-hidden rounded-[2.25rem] border bg-[linear-gradient(180deg,rgba(252,248,234,0.98),rgba(247,241,221,0.9))] shadow-[0_22px_50px_rgba(37,79,34,0.08)]';
const fieldCardClass =
  'min-w-0 rounded-[1.35rem] border border-[rgba(220,205,166,0.52)] bg-[rgba(255,255,255,0.42)] px-4 py-4';
const sectionCardClass =
  'rounded-[1.6rem] border border-[rgba(220,205,166,0.48)] bg-[rgba(255,255,255,0.46)] p-5';
const fieldLabelClass = 'theme-text-muted type-label';
const fieldValueClass = 'theme-heading mt-2 break-words text-base font-semibold leading-tight';

export const profileSections: ProfileSectionDefinition[] = [
  {
    id: 'identity',
    title: 'Personal identity',
    description: 'Name, registration details, and nationality.',
    icon: UserRound,
  },
  {
    id: 'university',
    title: 'University and program',
    description: 'School, program, level, and study timeline.',
    icon: GraduationCap,
  },
  {
    id: 'contact',
    title: 'Contact details',
    description: 'Email, phone, and emergency contacts.',
    icon: Phone,
  },
  {
    id: 'address',
    title: 'Address information',
    description: 'Home and host-country residence details.',
    icon: MapPin,
  },
  {
    id: 'passport',
    title: 'Passport record',
    description: 'Travel document and issuing country details.',
    icon: IdCard,
  },
  {
    id: 'banking',
    title: 'Banking details',
    description: 'Payment account and branch information.',
    icon: Landmark,
  },
];

const profileSectionIds = new Set<ProfileSectionId>(profileSections.map((section) => section.id));

export function isProfileSectionId(value: string): value is ProfileSectionId {
  return profileSectionIds.has(value as ProfileSectionId);
}

export function getProfileSection(sectionId: ProfileSectionId) {
  return profileSections.find((section) => section.id === sectionId) ?? profileSections[0];
}

function formatValue(value?: string | null) {
  return value && value.trim() ? value : '---';
}

function DetailField({
  label,
  value,
  mono = false,
  emphasis = 'default',
  className = '',
}: {
  label: string;
  value: string;
  mono?: boolean;
  emphasis?: 'default' | 'strong';
  className?: string;
}) {
  return (
    <div className={[fieldCardClass, className].filter(Boolean).join(' ')}>
      <p className={fieldLabelClass}>{label}</p>
      <p
        className={[
          emphasis === 'strong' ? 'theme-heading type-card-title mt-2 break-words' : fieldValueClass,
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

function DetailInputField({
  label,
  value,
  onChange,
  inputClassName,
  disabled,
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputClassName: string;
  disabled?: boolean;
  mono?: boolean;
}) {
  return (
    <div className={fieldCardClass}>
      <p className={fieldLabelClass}>{label}</p>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={[
          inputClassName,
          'mt-3 min-w-0',
          mono ? 'font-mono text-[color:var(--theme-primary)]' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
      />
    </div>
  );
}

interface StudentProfileSectionDetailsCardProps {
  student: StudentProfile;
  sectionId: ProfileSectionId;
  editData?: StudentProfile | null;
  isEditing?: boolean;
  isSaving?: boolean;
  inputClassName?: string;
  onBack?: () => void;
  onToggleEdit?: () => void;
  onDiscard?: () => void;
  onSave?: () => void;
  onUpdateField?: (section: keyof StudentProfile, field: string, value: unknown) => void;
}

export function StudentProfileSectionDetailsCard({
  student,
  sectionId,
  editData,
  isEditing = false,
  isSaving = false,
  inputClassName,
  onBack,
  onToggleEdit,
  onDiscard,
  onSave,
  onUpdateField,
}: StudentProfileSectionDetailsCardProps) {
  const selectedSection = getProfileSection(sectionId);
  const SelectedSectionIcon = selectedSection.icon;
  const canEditBanking =
    Boolean(editData) &&
    Boolean(inputClassName) &&
    Boolean(onToggleEdit) &&
    Boolean(onDiscard) &&
    Boolean(onSave) &&
    Boolean(onUpdateField);

  const renderBankingSection = () => {
    if (!canEditBanking || !editData || !inputClassName || !onUpdateField) {
      return (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className={sectionCardClass}>
            <h6 className="theme-heading type-card-title">Account details</h6>
            <p className="theme-text-muted type-body-sm mt-1">
              Payment information linked to your student profile.
            </p>
            <div className="mt-5 grid gap-4">
              <DetailField label="Bank" value={formatValue(student.bank.bankName)} />
              <DetailField label="Account holder" value={formatValue(student.bankAccount.accountHolderName)} />
              <DetailField label="RIB / IBAN" value={formatValue(student.bankAccount.iban)} mono />
              <DetailField label="Account number" value={formatValue(student.bankAccount.accountNumber)} />
              <DetailField label="SWIFT code" value={formatValue(student.bankAccount.swiftCode)} mono />
            </div>
          </div>

          <div className={sectionCardClass}>
            <h6 className="theme-heading type-card-title">Branch details</h6>
            <p className="theme-text-muted type-body-sm mt-1">
              Banking branch information used by administration.
            </p>
            <div className="mt-5 grid gap-4">
              <DetailField label="Branch name" value={formatValue(student.bank.branchName)} />
              <DetailField label="Branch code" value={formatValue(student.bank.branchCode)} />
              <DetailField label="Branch address" value={formatValue(student.bank.branchAddress)} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className={sectionCardClass}>
            <h6 className="theme-heading type-card-title">Account details</h6>
            <p className="theme-text-muted type-body-sm mt-1">
              These fields support stipends and other student payments.
            </p>
            <div className="mt-5 grid gap-4">
              {isEditing ? (
                <>
                  <DetailInputField
                    label="Bank"
                    value={editData.bank.bankName || ''}
                    onChange={(value) => onUpdateField('bank', 'bankName', value)}
                    inputClassName={inputClassName}
                    disabled={isSaving}
                  />
                  <DetailInputField
                    label="Account holder"
                    value={editData.bankAccount.accountHolderName || ''}
                    onChange={(value) => onUpdateField('bankAccount', 'accountHolderName', value)}
                    inputClassName={inputClassName}
                    disabled={isSaving}
                  />
                  <DetailInputField
                    label="RIB / IBAN"
                    value={editData.bankAccount.iban || ''}
                    onChange={(value) => onUpdateField('bankAccount', 'iban', value)}
                    inputClassName={inputClassName}
                    disabled={isSaving}
                    mono
                  />
                  <DetailInputField
                    label="Account number"
                    value={editData.bankAccount.accountNumber || ''}
                    onChange={(value) => onUpdateField('bankAccount', 'accountNumber', value)}
                    inputClassName={inputClassName}
                    disabled={isSaving}
                  />
                  <DetailInputField
                    label="SWIFT code"
                    value={editData.bankAccount.swiftCode || ''}
                    onChange={(value) => onUpdateField('bankAccount', 'swiftCode', value)}
                    inputClassName={inputClassName}
                    disabled={isSaving}
                    mono
                  />
                </>
              ) : (
                <>
                  <DetailField label="Bank" value={formatValue(student.bank.bankName)} />
                  <DetailField
                    label="Account holder"
                    value={formatValue(student.bankAccount.accountHolderName)}
                  />
                  <DetailField label="RIB / IBAN" value={formatValue(student.bankAccount.iban)} mono />
                  <DetailField
                    label="Account number"
                    value={formatValue(student.bankAccount.accountNumber)}
                  />
                  <DetailField
                    label="SWIFT code"
                    value={formatValue(student.bankAccount.swiftCode)}
                    mono
                  />
                </>
              )}
            </div>
          </div>

          <div className={sectionCardClass}>
            <h6 className="theme-heading type-card-title">Branch details</h6>
            <p className="theme-text-muted type-body-sm mt-1">
              Update the institution and branch fields if administration asks for corrections.
            </p>
            <div className="mt-5 grid gap-4">
              {isEditing ? (
                <>
                  <DetailInputField
                    label="Branch name"
                    value={editData.bank.branchName || ''}
                    onChange={(value) => onUpdateField('bank', 'branchName', value)}
                    inputClassName={inputClassName}
                    disabled={isSaving}
                  />
                  <DetailInputField
                    label="Branch code"
                    value={editData.bank.branchCode || ''}
                    onChange={(value) => onUpdateField('bank', 'branchCode', value)}
                    inputClassName={inputClassName}
                    disabled={isSaving}
                  />
                  <DetailInputField
                    label="Branch address"
                    value={editData.bank.branchAddress || ''}
                    onChange={(value) => onUpdateField('bank', 'branchAddress', value)}
                    inputClassName={inputClassName}
                    disabled={isSaving}
                  />
                </>
              ) : (
                <>
                  <DetailField label="Branch name" value={formatValue(student.bank.branchName)} />
                  <DetailField label="Branch code" value={formatValue(student.bank.branchCode)} />
                  <DetailField label="Branch address" value={formatValue(student.bank.branchAddress)} />
                </>
              )}
            </div>
          </div>
        </div>

        <p className="theme-text-muted text-sm font-semibold">
          Personal identity and academic record details remain managed by administration.
        </p>
      </div>
    );
  };

  const renderSectionContent = () => {
    switch (sectionId) {
      case 'identity':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <DetailField label="Full name" value={formatValue(student.student.fullName)} emphasis="strong" />
            <DetailField label="Inscription number" value={formatValue(student.student.inscriptionNumber)} mono />
            <DetailField label="Given name" value={formatValue(student.student.givenName)} />
            <DetailField label="Family name" value={formatValue(student.student.familyName)} />
            <DetailField label="Date of birth" value={formatValue(student.student.dateOfBirth)} />
            <DetailField label="Gender" value={formatValue(student.student.gender)} />
            <DetailField label="Nationality" value={formatValue(student.student.nationality)} emphasis="strong" />
            <DetailField label="Registration number" value={formatValue(student.student.registrationNumber)} />
          </div>
        );
      case 'university':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <DetailField
              label="University"
              value={formatValue(student.university.universityName)}
              emphasis="strong"
              className="md:col-span-2"
            />
            <DetailField label="Program" value={formatValue(student.program.major)} emphasis="strong" />
            <DetailField label="Degree level" value={formatValue(student.program.degreeLevel)} />
            <DetailField label="Campus" value={formatValue(student.university.campus)} />
            <DetailField label="Department" value={formatValue(student.university.department)} />
            <DetailField label="Acronym" value={formatValue(student.university.acronym)} />
            <DetailField label="City" value={formatValue(student.university.city)} />
            <DetailField label="Program type" value={formatValue(student.program.programType)} />
            <DetailField label="Start date" value={formatValue(student.program.startDate)} />
            <DetailField label="Expected end date" value={formatValue(student.program.expectedEndDate)} />
          </div>
        );
      case 'contact':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <DetailField label="Email address" value={formatValue(student.contact.email)} className="md:col-span-2" />
            <DetailField label="Phone" value={formatValue(student.contact.phone)} />
            <DetailField label="Emergency contact" value={formatValue(student.contact.emergencyContactName)} />
            <DetailField label="Emergency phone" value={formatValue(student.contact.emergencyContactPhone)} />
          </div>
        );
      case 'address':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <DetailField
              label="Home country address"
              value={formatValue(student.address.homeCountryAddress)}
              className="md:col-span-2"
            />
            <DetailField
              label="Current host address"
              value={formatValue(student.address.currentHostAddress)}
              className="md:col-span-2"
            />
            <DetailField label="Street" value={formatValue(student.address.street)} />
            <DetailField label="City" value={formatValue(student.address.city)} />
            <DetailField label="State" value={formatValue(student.address.state)} />
            <DetailField label="Wilaya" value={formatValue(student.address.wilaya)} />
            <DetailField label="Country code" value={formatValue(student.address.countryCode)} />
          </div>
        );
      case 'passport':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <DetailField
              label="Passport number"
              value={formatValue(student.passport.passportNumber)}
              mono
              emphasis="strong"
            />
            <DetailField label="Issuing country" value={formatValue(student.passport.issuingCountry)} />
            <DetailField label="Issue date" value={formatValue(student.passport.issueDate)} />
            <DetailField label="Expiry date" value={formatValue(student.passport.expiryDate)} />
          </div>
        );
      case 'banking':
        return renderBankingSection();
      default:
        return null;
    }
  };

  return (
    <div className={`${surfaceCardClass} p-6 md:p-8`}>
      <div className="mb-6 flex flex-col gap-4 border-b border-[rgba(220,205,166,0.48)] pb-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(37,79,34,0.1)] text-[color:var(--theme-primary)]">
            <SelectedSectionIcon className="h-5 w-5" />
          </div>
          <p className="theme-text-muted type-label">Selected section</p>
          <h5 className="theme-heading type-page-title mt-1 text-3xl">{selectedSection.title}</h5>
          <p className="theme-text-muted type-body mt-2">{selectedSection.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onBack ? (
            <Button variant="secondary" onClick={onBack} className="inline-flex items-center gap-2 rounded-full">
              <ChevronLeft className="h-4 w-4" />
              Back to overview
            </Button>
          ) : null}

          {sectionId === 'banking' && canEditBanking && onToggleEdit ? (
            <>
              <Button
                onClick={onToggleEdit}
                variant={isEditing ? 'secondary' : 'primary'}
                className="rounded-full"
                disabled={isSaving}
              >
                {isEditing ? 'Stop Editing' : 'Edit Banking Details'}
              </Button>
              {isEditing && onDiscard && onSave ? (
                <>
                  <Button variant="ghost" onClick={onDiscard} disabled={isSaving}>
                    Discard
                  </Button>
                  <Button onClick={onSave} className="rounded-full px-8" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      {renderSectionContent()}
    </div>
  );
}
