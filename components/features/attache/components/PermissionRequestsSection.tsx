import React, { useState } from 'react';
import type { PermissionRequest } from '@/types';
import Skeleton from '@/components/ui/Skeleton';

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
    return 'bg-emerald-100 text-emerald-700';
  }

  if (status === 'REJECTED') {
    return 'bg-rose-100 text-rose-700';
  }

  return 'bg-amber-100 text-amber-700';
}

export default function PermissionRequestsSection({
  requests,
  isLoading = false,
  onUpdateStatus,
}: PermissionRequestsSectionProps) {
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="mt-2 h-4 w-72 rounded-md" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="grid gap-4 rounded-xl border border-slate-100 p-4 md:grid-cols-6">
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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800">Permission Requests</h2>
      <p className="mt-1 text-sm text-slate-500">Student requests submitted from the login page.</p>
      {errorMessage ? <p className="mt-4 text-sm text-rose-600">{errorMessage}</p> : null}

      {requests.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          No permission requests yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
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
                <tr key={request.id} className="border-b border-slate-100 text-slate-700">
                  <td className="py-3 pr-4 font-semibold">{request.fullName || '-'}</td>
                  <td className="py-3 pr-4 font-mono">{request.passportNumber || '-'}</td>
                  <td className="py-3 pr-4 font-mono font-semibold text-indigo-600">{request.inscriptionNumber}</td>
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
                          className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                          className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No action needed</span>
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
