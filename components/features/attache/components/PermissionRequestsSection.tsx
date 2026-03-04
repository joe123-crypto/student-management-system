import React from 'react';
import type { PermissionRequest } from '@/types';

interface PermissionRequestsSectionProps {
  requests: PermissionRequest[];
}

export default function PermissionRequestsSection({ requests }: PermissionRequestsSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800">Permission Requests</h2>
      <p className="mt-1 text-sm text-slate-500">Student requests submitted from the login page.</p>

      {requests.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          No permission requests yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="py-3 pr-4">Inscription</th>
                <th className="py-3 pr-4">Submitted</th>
                <th className="py-3 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-b border-slate-100 text-slate-700">
                  <td className="py-3 pr-4 font-mono font-semibold text-indigo-600">{request.inscriptionNumber}</td>
                  <td className="py-3 pr-4">{new Date(request.submittedAt).toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      {request.status}
                    </span>
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
