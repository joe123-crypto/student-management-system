import React, { useState } from 'react';
import type { PermissionRequest } from '@/types';
import { useNotifications } from '@/components/providers/NotificationProvider';
import Skeleton from '@/components/ui/Skeleton';
import Notice from '@/components/ui/Notice';

interface PermissionRequestsSectionProps {
  requests: PermissionRequest[];
  isLoading?: boolean;
  onUpdateStatus: (
    requestId: string,
    status: Exclude<PermissionRequest['status'], 'PENDING'>,
  ) => Promise<void>;
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
  const notifications = useNotifications();
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    <section className="theme-card rounded-2xl border p-6">
      <h2 className="theme-heading text-lg font-bold">Permission Requests</h2>
      <p className="theme-text-muted mt-1 text-sm">Student requests submitted from the login page.</p>
      {errorMessage ? (
        <Notice
          tone="error"
          title="Request update failed"
          message={errorMessage}
          className="mt-4"
        />
      ) : null}

      {requests.length === 0 ? (
        <p className="theme-card-muted theme-text-muted mt-6 rounded-xl border border-dashed p-4 text-sm">
          No permission requests yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
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
                <tr key={request.id} className="border-b border-[rgba(220,205,166,0.42)] text-[color:var(--theme-text)]">
                  <td className="py-3 pr-4 font-semibold">{request.fullName || '-'}</td>
                  <td className="py-3 pr-4 font-mono">{request.passportNumber || '-'}</td>
                  <td className="py-3 pr-4 font-mono font-semibold text-[color:var(--theme-primary-soft)]">
                    {request.inscriptionNumber}
                  </td>
                  <td className="py-3 pr-4">{new Date(request.submittedAt).toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {request.status === 'PENDING' ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={activeRequestId === request.id}
                          onClick={async () => {
                            setErrorMessage(null);
                            setActiveRequestId(request.id);
                            try {
                              await onUpdateStatus(request.id, 'APPROVED');
                              notifications.notify({
                                tone: 'success',
                                title: 'Request approved',
                                message: `${request.fullName || request.inscriptionNumber} can now continue their account access flow.`,
                              });
                            } catch (error) {
                              setErrorMessage(
                                error instanceof Error
                                  ? error.message
                                  : 'Unable to approve permission request right now.',
                              );
                            } finally {
                              setActiveRequestId((current) => (current === request.id ? null : current));
                            }
                          }}
                          className="theme-success rounded-full border px-3 py-1 text-xs font-semibold transition hover:bg-[rgba(37,79,34,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={activeRequestId === request.id}
                          onClick={async () => {
                            setErrorMessage(null);
                            setActiveRequestId(request.id);
                            try {
                              await onUpdateStatus(request.id, 'REJECTED');
                              notifications.notify({
                                tone: 'warning',
                                title: 'Request rejected',
                                message: `${request.fullName || request.inscriptionNumber} has been marked as rejected.`,
                              });
                            } catch (error) {
                              setErrorMessage(
                                error instanceof Error
                                  ? error.message
                                  : 'Unable to reject permission request right now.',
                              );
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
        </div>
      )}
    </section>
  );
}
