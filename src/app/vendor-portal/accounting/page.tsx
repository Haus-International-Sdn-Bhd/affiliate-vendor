'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { vendorApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { SettlementStatement } from '@/lib/types';
import {
  Receipt,
  Download,
  Calendar,
  Layers,
  FileText,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function AccountingPage() {
  const { brand, vendorConfig } = useAuth();

  const [statements, setStatements] = useState<SettlementStatement[]>([]);
  const [loadingStatements, setLoadingStatements] = useState(true);
  const [selectedStatement, setSelectedStatement] = useState<SettlementStatement | null>(null);

  const payoutDay = vendorConfig?.payout_day || 'Wednesday';
  const cutoffDay = vendorConfig?.cutoff_day || 'Sunday';
  const cutoffTime = vendorConfig?.cutoff_time || '11:59 PM';

  const fetchStatements = async () => {
    try {
      setLoadingStatements(true);
      const res = await vendorApi.getStatements();
      const list = res.data || res.statements || res || [];
      setStatements(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load statements', err);
    } finally {
      setLoadingStatements(false);
    }
  };

  useEffect(() => {
    fetchStatements();
  }, []);

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-base-content flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary" />
            <span>Accounting, Statements & Payouts</span>
          </h1>
          <p className="text-xs text-base-content/60 mt-1">
            Access your finalized weekly settlement tax invoices and payout disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/vendor-portal/settlement-plan"
            className="btn btn-outline btn-primary btn-sm gap-2 text-xs font-semibold"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Settlement Plan</span>
          </Link>
        </div>
      </div>

      {/* Weekly Statements List */}
      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="card-body p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="font-bold text-base text-base-content flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>Weekly Settlement Statements</span>
              </h2>
              <p className="text-xs text-base-content/60">
                Generated every {payoutDay} covering {cutoffDay} {cutoffTime} weekly cutoffs.
              </p>
            </div>
            <button
              onClick={fetchStatements}
              className="btn btn-outline btn-xs gap-1"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-xs">
              <thead>
                <tr className="bg-base-200/60 text-base-content/70">
                  <th>Statement #</th>
                  <th>Cycle Period</th>
                  <th>Payout Date</th>
                  <th>Plan Tier</th>
                  <th className="text-right">Settled NCS</th>
                  <th className="text-right">Brand Net Payout</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loadingStatements ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <span className="loading loading-spinner loading-md text-primary"></span>
                      <p className="text-xs text-base-content/60 mt-2">Loading statements...</p>
                    </td>
                  </tr>
                ) : statements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-base-content/50">
                      <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="font-semibold text-sm text-base-content">No settlement statements yet</p>
                      <p className="text-xs text-base-content/60 mt-0.5">
                        Statements will appear here automatically on {payoutDay} after your first sales cycle cutoff.
                      </p>
                    </td>
                  </tr>
                ) : (
                  statements.map((st) => (
                    <tr key={st.id} className="hover">
                      <td className="font-mono font-bold text-primary">
                        {st.statement_number}
                      </td>
                      <td>
                        <div className="font-medium text-base-content">
                          {st.cycle_name || 'Weekly Cycle'}
                        </div>
                        <span className="text-[10px] text-base-content/50">
                          {st.cycle_start_date} to {st.cycle_end_date}
                        </span>
                      </td>
                      <td className="font-medium">{st.payout_date}</td>
                      <td>
                        <span className="badge badge-sm badge-ghost font-semibold uppercase">
                          {st.settlement_class?.replace('_', ' ')} ({st.brand_share_percentage}%)
                        </span>
                      </td>
                      <td className="text-right font-semibold">
                        {formatCurrency(st.settled_ncs)}
                      </td>
                      <td className="text-right font-black text-success">
                        {formatCurrency(st.brand_net_payout)}
                      </td>
                      <td>
                        <span
                          className={`badge badge-sm font-semibold capitalize ${
                            st.status === 'paid'
                              ? 'badge-success text-white'
                              : st.status === 'approved'
                              ? 'badge-info text-white'
                              : 'badge-warning'
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => setSelectedStatement(st)}
                          className="btn btn-primary btn-xs text-white gap-1"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Settlement Plan Promotion Card */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base text-base-content">Settlement Plan & Tier Rates</h3>
            </div>
            <p className="text-xs text-base-content/60">
              Currently operating under <strong className="text-base-content">{brand?.settlement_class?.replace('_', ' ').toUpperCase() || 'KELAS B'}</strong> ({brand?.brand_share_percentage || 50}% brand net share). Compare plans or apply for a tier change.
            </p>
          </div>
          <Link
            href="/vendor-portal/settlement-plan"
            className="btn btn-primary btn-sm text-white gap-2 font-semibold shrink-0"
          >
            <span>View Plans & Apply</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Statement / Tax Invoice Detail Modal */}
      {selectedStatement && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedStatement(null)}
        >
          <div
            className="card w-full max-w-2xl bg-base-100 border border-base-300 p-6 space-y-5 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-base-300 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary">VAMOFLEX Marketplace Tax Invoice</span>
                <h3 className="text-xl font-black text-base-content">{selectedStatement.statement_number}</h3>
              </div>
              <button
                onClick={() => setSelectedStatement(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-base-content/50 font-medium">Brand Partner:</span>
                <p className="font-bold text-sm text-base-content">{brand?.name || 'Partner Brand'}</p>
                <p className="text-base-content/70 font-mono mt-0.5">Bank: {brand?.bank_name || 'Maybank'} - {brand?.bank_account_no || '***'}</p>
              </div>
              <div className="text-right">
                <span className="text-base-content/50 font-medium">Cycle Period:</span>
                <p className="font-bold text-base-content">{selectedStatement.cycle_start_date} to {selectedStatement.cycle_end_date}</p>
                <p className="text-primary font-bold mt-0.5">Payout Date: {selectedStatement.payout_date}</p>
              </div>
            </div>

            <div className="rounded-xl bg-base-200 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Gross Merchandise Value (GMV):</span>
                <span className="font-semibold">{formatCurrency(selectedStatement.gross_merchandise_value)}</span>
              </div>
              <div className="flex justify-between text-error">
                <span>Member Discounts:</span>
                <span>-{formatCurrency(selectedStatement.total_discounts)}</span>
              </div>
              <div className="flex justify-between text-warning-content">
                <span>Eligible Vouchers (pro-rata, max 40%):</span>
                <span>-{formatCurrency(selectedStatement.eligible_vouchers)}</span>
              </div>
              <div className="flex justify-between text-base-content/70">
                <span>Refunds / Returns:</span>
                <span>-{formatCurrency(selectedStatement.refunds_deductions)}</span>
              </div>
              <div className="divider my-1"></div>
              <div className="flex justify-between font-bold text-sm text-primary">
                <span>Settled NCS:</span>
                <span>{formatCurrency(selectedStatement.settled_ncs)}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-success/10 border border-success/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-success uppercase tracking-wider">
                  Final Net Brand Payout ({selectedStatement.brand_share_percentage}%)
                </span>
                <p className="text-2xl font-black text-success mt-0.5">
                  {formatCurrency(selectedStatement.brand_net_payout)}
                </p>
              </div>
              <span className="badge badge-success text-white font-bold capitalize">
                {selectedStatement.status}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-base-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-outline btn-sm gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatement(null)}
                className="btn btn-primary btn-sm text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
