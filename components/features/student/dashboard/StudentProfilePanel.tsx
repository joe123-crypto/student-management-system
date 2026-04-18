import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, IdCard, Mail } from 'lucide-react';
import { StudentProfile } from '@/types';
import ProfilePictureUpload from '@/components/ui/ProfilePictureUpload';
import Skeleton from '@/components/ui/Skeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import { dashboardHoverLift, dashboardHoverTransition, dashboardStaggerContainer, dashboardStaggerItem } from '@/components/ui/motion';

interface StudentProfilePanelProps {
  student: StudentProfile | null;
  currentPicture?: string;
  loading?: boolean;
  onProfilePictureChange: (file: File) => void | Promise<void>;
  onProfilePictureRemove: () => void;
  isUploadingProfilePicture?: boolean;
}

const surfaceCardClass =
  'theme-card relative overflow-hidden rounded-[2.25rem] border bg-[linear-gradient(180deg,rgba(252,248,234,0.98),rgba(247,241,221,0.9))] shadow-[0_22px_50px_rgba(37,79,34,0.08)]';
const fieldCardClass =
  'min-w-0 rounded-[1.35rem] border border-[rgba(220,205,166,0.52)] bg-[rgba(255,255,255,0.42)] px-4 py-4';
const fieldLabelClass = 'theme-text-muted type-label';
const fieldValueClass = 'theme-heading mt-2 break-words text-base font-semibold leading-tight';
const heroSummaryGridClass = 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3';

function hasValue(value?: string | null) {
  return Boolean(value && value.trim());
}

function FieldValue({
  value,
  className,
  placeholderClassName = 'h-5 w-20 rounded-full',
}: {
  value?: string | null;
  className: string;
  placeholderClassName?: string;
}) {
  if (hasValue(value)) {
    return <p className={className}>{value}</p>;
  }

  return (
    <div className="mt-3">
      <Skeleton className={placeholderClassName} />
      <span className="sr-only">Not available yet</span>
    </div>
  );
}

const StudentProfilePanel: React.FC<StudentProfilePanelProps> = ({
  student,
  currentPicture,
  loading = false,
  onProfilePictureChange,
  onProfilePictureRemove,
  isUploadingProfilePicture = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (loading || !student) {
    return (
      <div>
        <div className={`${surfaceCardClass} px-6 py-7 md:px-8 md:py-8`}>
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-8">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-6 md:flex-row md:flex-wrap md:items-start">
              <Skeleton className="h-32 w-32 rounded-[2.5rem]" />
              <div className="w-full flex-1 space-y-3 md:min-w-[18rem]">
                <Skeleton className="h-4 w-28 rounded-full" />
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-5 w-80 rounded-full" />
                <div className={heroSummaryGridClass}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-20 rounded-[1.35rem]" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const programLine = [student.program.major, student.university.universityName]
    .filter(Boolean)
    .join(' at ');

  return (
    <motion.div
      className={`${surfaceCardClass} px-6 py-7 md:px-8 md:py-8`}
      variants={dashboardStaggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-[rgba(37,79,34,0.08)] blur-3xl" />
      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-8">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-6 md:flex-row md:items-start">
          <motion.div variants={dashboardStaggerItem}>
            <ProfilePictureUpload
              imageSrc={currentPicture}
              onChange={onProfilePictureChange}
              onRemove={onProfilePictureRemove}
              isUploading={isUploadingProfilePicture}
              className="shrink-0 self-start md:max-w-[15rem]"
            />
          </motion.div>
          <motion.div variants={dashboardStaggerItem} className="w-full flex-1 space-y-4 md:min-w-[22rem]">
            <div className="min-w-0 space-y-2">
              <p className="theme-text-muted type-label">My profile</p>
              <h4 className="theme-heading type-page-title break-words">
                {student.student.fullName}
              </h4>
              <p className="theme-text-muted type-body max-w-3xl break-words">
                {programLine || 'Your academic and identity records will appear here once available.'}
              </p>
            </div>

            <motion.div className={heroSummaryGridClass} variants={dashboardStaggerContainer}>
              <motion.div
                variants={dashboardStaggerItem}
                whileHover={shouldReduceMotion ? undefined : dashboardHoverLift}
                transition={dashboardHoverTransition}
                className={fieldCardClass}
              >
                <div className="flex items-center gap-2 text-[color:var(--theme-primary)]">
                  <Mail className="h-4 w-4 shrink-0" />
                  <p className={fieldLabelClass}>Email address</p>
                </div>
                <FieldValue
                  value={student.contact.email}
                  className="mt-2 break-all text-base font-semibold leading-tight text-[color:var(--theme-text)]"
                  placeholderClassName="h-5 w-32 rounded-full"
                />
              </motion.div>

              <motion.div
                variants={dashboardStaggerItem}
                whileHover={shouldReduceMotion ? undefined : dashboardHoverLift}
                transition={dashboardHoverTransition}
                className={fieldCardClass}
              >
                <div className="flex items-center gap-2 text-[color:var(--theme-primary)]">
                  <IdCard className="h-4 w-4 shrink-0" />
                  <p className={fieldLabelClass}>Inscription number</p>
                </div>
                <FieldValue
                  value={student.student.inscriptionNumber}
                  className="mt-2 break-all font-mono text-base font-semibold text-[color:var(--theme-primary)]"
                  placeholderClassName="h-5 w-28 rounded-full"
                />
              </motion.div>

              <motion.div
                variants={dashboardStaggerItem}
                whileHover={shouldReduceMotion ? undefined : dashboardHoverLift}
                transition={dashboardHoverTransition}
                className={fieldCardClass}
              >
                <div className="flex items-center gap-2 text-[color:var(--theme-primary)]">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  <p className={fieldLabelClass}>Expected completion</p>
                </div>
                <FieldValue
                  value={student.program.expectedEndDate}
                  className={fieldValueClass}
                  placeholderClassName="h-5 w-24 rounded-full"
                />
              </motion.div>

              <motion.div
                variants={dashboardStaggerItem}
                whileHover={shouldReduceMotion ? undefined : dashboardHoverLift}
                transition={dashboardHoverTransition}
                className={fieldCardClass}
              >
                <p className={fieldLabelClass}>Status</p>
                <div className="mt-3">
                  <StatusBadge status={student.status} className="px-3 py-1.5 text-[11px] font-semibold" />
                </div>
              </motion.div>

              <motion.div
                variants={dashboardStaggerItem}
                whileHover={shouldReduceMotion ? undefined : dashboardHoverLift}
                transition={dashboardHoverTransition}
                className={fieldCardClass}
              >
                <p className={fieldLabelClass}>Level</p>
                <FieldValue
                  value={student.program.degreeLevel}
                  className={fieldValueClass}
                  placeholderClassName="h-5 w-20 rounded-full"
                />
              </motion.div>

              <motion.div
                variants={dashboardStaggerItem}
                whileHover={shouldReduceMotion ? undefined : dashboardHoverLift}
                transition={dashboardHoverTransition}
                className={fieldCardClass}
              >
                <p className={fieldLabelClass}>System type</p>
                <FieldValue
                  value={student.program.systemType}
                  className={fieldValueClass}
                  placeholderClassName="h-5 w-24 rounded-full"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentProfilePanel;
