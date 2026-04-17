import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type {
  PermissionRequest,
  PermissionRequestStatusUpdateOptions,
  PermissionRequestStatusUpdateResult,
} from '@/types';
import { useNotifications } from '@/components/providers/NotificationProvider';
import Skeleton from '@/components/ui/Skeleton';
import { getErrorMessage } from '@/lib/errors';
import { AnimatedCount, dashboardHoverLift, dashboardHoverTransition, dashboardStaggerContainer, dashboardStaggerItem } from '@/components/ui/motion';
import ApprovePermissionRequestModal from '@/components/features/attache/components/ApprovePermissionRequestModal';

interface PermissionRequestsSectionProps {
  requests: PermissionRequest[];
  isLoading?: boolean;
  onUpdateStatus: (
    requestId: string,
    status: Exclude<PermissionRequest['status'], 'PENDING'>,
    options?: PermissionRequestStatusUpdateOptions,
  ) => Promise<PermissionRequestStatusUpdateResult>;
}

function statusTone(status: PermissionRequest['status']): string {
  if (status === 'APPROVED') {
    return 'theme-success border';
  }

  if (status === 'REJECTED') {
    return 'theme-danger border';
  }

  return 'theme-warning border';
}

export default function PermissionRequestsSection({
  requests,
  isLoading = false,
  onUpdateStatus,
}: PermissionRequestsSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const notifications = useNotifications();
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [approvalRequest, setApprovalRequest] = useState<PermissionRequest | null>(null);
  const pendingCount = requests.filter((request) => request.status === 'PENDING').length;
  const approvedCount = requests.filter((request) => request.status === 'APPROVED').length;
  const rejectedCount = requests.filter((request) => request.status === 'REJECTED').length;

  if (isLoading) {
    return (
      <section className="theme-card rounded-2xl border p-6">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="mt-2 h-4 w-72 rounded-md" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="theme-card-muted grid gap-4 rounded-xl border p-4 md:grid-cols-6">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-40 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className="theme-card rounded-2xl border p-6"
      variants={dashboardStaggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={dashboardStaggerItem} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="theme-heading text-lg font-bold">Permission Requests</h2>
          <p className="theme-text-muted mt-1 text-sm">
            Review new access requests and clear pending approvals quickly.
          </p>
        </div>
      </motion.div>

      <motion.div variants={dashboardStaggerItem} className="mt-6 grid gap-3 md:grid-cols-3">
        <motion.div
          whileHover={shouldReduceMotion ? undefined : dashboardHoverLift}
          transition={dashboardHoverTransition}
          className="theme-card-muted rounded-2xl border p-4"
        >
          <p className="theme-text-muted type-label">Pending</p>
          <p className="theme-heading mt-2 text-2xl font-bold"><AnimatedCount value={pendingCount} /></p>
        </motion.div>
        <motion.div
          whileHover={shouldReduceMotion ? undefined : dashboardHoverLift}
          transition={dashboardHoverTransition}
          className="theme-success rounded-2xl border p-4"
        >
          <p className="type-label">Approved</p>
          <p className="mt-2 text-2xl font-bold"><AnimatedCount value={approvedCount} /></p>
        </motion.div>
        <motion.div
          whileHover={shouldReduceMotion ? undefined : dashboardHoverLift}
          transition={dashboardHoverTransition}
          className="theme-danger rounded-2xl border p-4"
        >
          <p className="type-label">Rejected</p>
          <p className="mt-2 text-2xl font-bold"><AnimatedCount value={rejectedCount} /></p>
        </motion.div>
      </motion.div>

      {requests.length === 0 ? (
        <p className="theme-card-muted theme-text-muted mt-6 rounded-xl border border-dashed p-4 text-sm">
          No requests yet.
        </p>
      ) : (
        <motion.div variants={dashboardStaggerItem} className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="theme-text-muted border-b border-[rgba(220,205,166,0.55)] text-xs uppercase tracking-wider">
                <th className="py-3 pr-4">Full Name</th>
                <th className="py-3 pr-4">Passport</th>
                <th className="py-3 pr-4">Inscription</th>
                <th className="py-3 pr-4">Submitted</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-b border-[rgba(220,205,166,0.42)] text-[color:var(--theme-text)] transition-colors hover:bg-[rgba(255,255,255,0.34)]">
                  <td className="py-3 pr-4 font-semibold">{request.fullName || '-'}</td>
                  <td className="py-3 pr-4 font-mono">{request.passportNumber || '-'}</td>
                  <td className="py-3 pr-4 font-mono font-semibold text-[color:var(--theme-primary-soft)]">
                    {request.inscriptionNumber}
                  </td>
                  <td className="py-3 pr-4">{new Date(request.submittedAt).toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        statusTone(request.status)
                      } ${request.status === 'PENDING' ? 'theme-attention-pulse' : ''}`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {request.status === 'PENDING' ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={activeRequestId === request.id}
                          onClick={() => {
                            setApprovalRequest(request);
                          }}
                          className="theme-success rounded-full border px-3 py-1 text-xs font-semibold transition hover:bg-[rgba(37,79,34,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={activeRequestId === request.id}
                          onClick={async () => {
                            setActiveRequestId(request.id);
                            try {
                              await onUpdateStatus(request.id, 'REJECTED');
                              notifications.notify({
                                tone: 'warning',
                                title: 'Request rejected',
                                message: `${request.fullName || request.inscriptionNumber} has been marked as rejected.`,
                              });
                            } catch (error) {
                              notifications.notify({
                                tone: 'error',
                                title: 'Could not reject request',
                                message: getErrorMessage(
                                  error,
                                  'Unable to reject permission request right now.',
                                ),
                              });
                            } finally {
                              setActiveRequestId((current) => (current === request.id ? null : current));
                            }
                          }}
                          className="theme-danger rounded-full border px-3 py-1 text-xs font-semibold transition hover:bg-[rgba(183,76,45,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="theme-text-muted text-xs">No action needed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      <ApprovePermissionRequestModal
        open={Boolean(approvalRequest)}
        request={approvalRequest}
        isSubmitting={Boolean(
          approvalRequest &&
            activeRequestId === approvalRequest.id,
        )}
        onClose={() => {
          if (!activeRequestId) {
            setApprovalRequest(null);
          }
        }}
        onSubmit={async ({ password }) => {
          if (!approvalRequest) {
            return;
          }

          setActiveRequestId(approvalRequest.id);

          try {
            const result = await onUpdateStatus(approvalRequest.id, 'APPROVED', { password });
            notifications.notify({
              tone: 'success',
              title: 'Request approved',
              message: `${approvalRequest.fullName || approvalRequest.inscriptionNumber} can now sign in with ${
                result.authUserLoginId || approvalRequest.inscriptionNumber
              } and temporary password ${password}.`,
              durationMs: 10000,
            });
            setApprovalRequest(null);
          } finally {
            setActiveRequestId((current) =>
              current === approvalRequest.id ? null : current,
            );
          }
        }}
      />
    </motion.section>
  );
}
