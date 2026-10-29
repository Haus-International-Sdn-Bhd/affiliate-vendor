'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { vendorApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { SettlementClass } from '@/lib/types';
import {
  History,
  Layers,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';

export default function ClassChangeHistoryPage() {
  const { brand } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [pendingChange, setPendingChange] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await vendorApi.getClassChangeStatus();
      const historyList = res.history || res.data || [];
      const historyArr = Array.isArray(historyList) ? historyList : [];
      setHistory(historyArr);

      const pending = historyArr.find((h: any) => h.status === 'pending');
      setPendingChange(pending || res.pending_request || res.request || null);
    } catch (err) {
      console.error('Failed to load class change history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const currentBrandClass = (brand?.current_class ||
    brand?.settlement_class ||
    'kelas_b') as SettlementClass;

  const getClassName = (cls?: string) => {
    switch (cls) {
      case 'kelas_a':
        return 'Kelas A (45%)';
      case 'kelas_c':
        return 'Kelas C (55%)';
      case 'kelas_b':
      default:
        return 'Kelas B (50%)';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-base-content flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            <span>Class Change Request History</span>
          </h1>
          <p className="text-xs text-base-content/60 mt-1">
            Complete audit trail and status records of your brand's settlement tier applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/vendor-portal/commerce-hub/settlement-plan"
            className="btn btn-primary btn-sm text-white gap-2 font-semibold shadow-sm"
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Settlement Plans & Apply</span>
          </Link>
        </div>
      </div>

      {/* Active & Pending Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-base-content/60">Active Plan Tier</span>
            <span className="badge badge-primary badge-sm font-bold uppercase">
              {currentBrandClass.replace('_', ' ')}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-base-content">
              {brand?.brand_share_percentage ||
                (currentBrandClass === 'kelas_a' ? 45 : currentBrandClass === 'kelas_c' ? 55 : 50)}
              %
            </span>
            <span className="text-xs text-base-content/60 ml-1.5 font-medium">Brand Net Share</span>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-base-content/60">Pending Applications</span>
            {pendingChange ? (
              <span className="badge badge-warning badge-sm font-bold">1 Under Review</span>
            ) : (
              <span className="badge badge-ghost badge-sm font-semibold">None</span>
            )}
          </div>
          <div className="mt-3">
            <span className="text-lg font-bold text-base-content">
              {pendingChange ? getClassName(pendingChange.requested_class) : 'All Caught Up'}
            </span>
            <p className="text-[11px] text-base-content/50 truncate">
              {pendingChange ? `Target: ${formatDate(pendingChange.effective_date)}` : 'No pending requests'}
            </p>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-base-content/60">Total Lifetime Requests</span>
            <span className="badge badge-neutral badge-sm font-bold">{history.length}</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-primary">
              {history.filter((h) => h.status === 'approved').length}
            </span>
            <span className="text-xs text-base-content/60 ml-1.5 font-medium">Approved Adjustments</span>
          </div>
        </div>
      </div>

      {/* Main Records Table Card */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-base-content flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>Application Records & Audit Log</span>
              </h3>
              <p className="text-xs text-base-content/60 mt-0.5">
                Detailed history of all requested tier changes, review dates, and admin feedback.
              </p>
            </div>
            {history.length > 0 && (
              <span className="badge badge-neutral badge-sm font-semibold">
                {history.length} Record{history.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-base-content/50">
              <span className="loading loading-spinner loading-md text-primary"></span>
              <p className="mt-2 font-medium">Loading application records...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center bg-base-200/40 rounded-2xl border border-dashed border-base-300 text-xs text-base-content/60 space-y-3">
              <History className="w-10 h-10 mx-auto text-base-content/30" />
              <div>
                <p className="font-bold text-sm text-base-content">No application records found</p>
                <p className="text-xs text-base-content/50 mt-1 max-w-sm mx-auto">
                  Your brand has not submitted any settlement plan tier change applications yet.
                </p>
              </div>
              <Link
                href="/vendor-portal/commerce-hub/settlement-plan"
                className="btn btn-primary btn-sm text-white gap-2 font-semibold shadow-sm"
              >
                <span>View Available Settlement Plans</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full text-xs">
                <thead>
                  <tr className="border-b border-base-300 text-base-content/70">
                    <th>Submitted At</th>
                    <th>From Tier</th>
                    <th>Requested Tier</th>
                    <th>Rationale</th>
                    <th>Effective Cycle</th>
                    <th>Status</th>
                    <th>Reviewer & Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id || item.uuid} className="hover:bg-base-200/50">
                      <td className="font-medium whitespace-nowrap">
                        {formatDateTime(item.created_at)}
                      </td>
                      <td>
                        <span className="badge badge-ghost badge-sm font-semibold">
                          {getClassName(item.current_class)}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-primary badge-sm text-white font-bold">
                          {getClassName(item.requested_class)}
                        </span>
                      </td>
                      <td className="max-w-[200px] truncate" title={item.reason}>
                        {item.reason || '—'}
                      </td>
                      <td className="whitespace-nowrap font-medium">
                        {item.effective_date ? formatDate(item.effective_date) : 'Next Cycle'}
                      </td>
                      <td>
                        {item.status === 'approved' ? (
                          <span className="badge badge-success text-white badge-sm font-bold gap-1 shadow-sm">
                            <CheckCircle className="w-3 h-3" />
                            Approved
                          </span>
                        ) : item.status === 'rejected' ? (
                          <span className="badge badge-error text-white badge-sm font-bold gap-1 shadow-sm">
                            <AlertCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        ) : (
                          <span className="badge badge-warning badge-sm font-bold gap-1 shadow-sm">
                            <Clock className="w-3 h-3" />
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td className="max-w-[180px]">
                        {item.admin_notes ? (
                          <div className="text-[11px] text-base-content/80">
                            <span className="font-semibold block truncate" title={item.admin_notes}>
                              {item.admin_notes}
                            </span>
                            {item.reviewed_by?.name && (
                              <span className="text-[10px] text-base-content/50">
                                by {item.reviewed_by.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-base-content/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/vendor-portal/commerce-hub/settlement-plan"
          className="btn btn-ghost btn-sm gap-2 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Settlement Plans</span>
        </Link>
        <Link
          href="/vendor-portal/accounting"
          className="btn btn-outline btn-primary btn-sm gap-2 text-xs font-semibold"
        >
          <span>View Accounting & Payouts</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
