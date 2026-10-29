'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  Store,
  PlusCircle,
  Building2,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  CreditCard,
  Phone,
  Mail,
  Award,
} from 'lucide-react';

export default function VendorBrandsPage() {
  const { brand, brands, activeBrandId, switchBrand, openAddBrandModal } = useAuth();

  const partnerBrands = (brands || []).filter((b) => {
    const s = (b.slug || b.name || '').toLowerCase();
    return !b.is_anchor && s !== 'haus-cosmetics' && !s.includes('haus cosmetics') && b.code !== 'BRD-HAUS';
  });

  const getKelasColor = (kelas?: string) => {
    switch (kelas?.toLowerCase()) {
      case 'kelas_a':
      case 'pilihan_a':
        return 'badge-primary';
      case 'kelas_b':
      case 'pilihan_b':
        return 'badge-info';
      case 'kelas_c':
      case 'pilihan_c':
        return 'badge-accent';
      default:
        return 'badge-ghost';
    }
  };

  const getKelasLabel = (kelas?: string) => {
    if (!kelas) return 'Kelas B';
    return kelas.replace('_', ' ').toUpperCase();
  };

  const currentBrand =
    partnerBrands.find((b) => String(b.id) === String(activeBrandId)) ||
    (!brand?.is_anchor && brand?.slug !== 'haus-cosmetics' ? brand : null) ||
    partnerBrands[0];

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary badge-outline text-[10px] font-bold uppercase tracking-wider">
              1 Vendor → N Brands
            </span>
            <span className="text-xs text-base-content/50">•</span>
            <span className="text-xs text-base-content/60 font-medium">
              {partnerBrands.length} {partnerBrands.length === 1 ? 'Brand' : 'Brands'} Registered
            </span>
          </div>
          <h1 className="text-2xl font-black text-base-content tracking-tight mt-1">
            Partner Brands
          </h1>
          <p className="text-xs text-base-content/60 mt-1">
            Manage your registered brands, settlement tiers, payout bank details, and switch active operating brand
          </p>
        </div>

        <button
          type="button"
          onClick={openAddBrandModal}
          className="btn btn-primary btn-sm rounded-xl text-white font-bold gap-2 px-4 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add New Brand</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Brands */}
        <div className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="relative z-10 space-y-1">
            <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Total Brands</p>
            <p className="text-2xl font-black text-base-content">{partnerBrands.length}</p>
            <p className="text-[11px] text-base-content/50">Under vendor account</p>
          </div>
          <Building2 className="pointer-events-none absolute -bottom-3 -right-3 w-16 h-16 text-primary/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Active Brands */}
        <div className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="relative z-10 space-y-1">
            <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Active Status</p>
            <p className="text-2xl font-black text-success">
              {partnerBrands.filter((b) => b.status === 'active' || !b.status).length}
            </p>
            <p className="text-[11px] text-base-content/50">Retailing & active</p>
          </div>
          <CheckCircle2 className="pointer-events-none absolute -bottom-3 -right-3 w-16 h-16 text-success/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Currently Active Brand */}
        <div className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="relative z-10 space-y-1">
            <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Operating Brand</p>
            <p className="text-lg font-black text-primary truncate" title={currentBrand?.name}>
              {currentBrand?.name || 'None'}
            </p>
            <span className={`badge ${getKelasColor(currentBrand?.current_class || currentBrand?.settlement_class)} badge-xs font-bold text-[9px]`}>
              {getKelasLabel(currentBrand?.current_class || currentBrand?.settlement_class)}
            </span>
          </div>
          <Store className="pointer-events-none absolute -bottom-3 -right-3 w-16 h-16 text-primary/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Multi-Brand Architecture Info */}
        <div className="card bg-gradient-to-br from-primary/10 via-base-100 to-base-100 border border-primary/20 p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-1.5 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Vendor Multi-Store</span>
            </div>
            <p className="text-xs text-base-content/70 leading-relaxed pt-1">
              Products, settlements, and performance reports are strictly isolated per active brand.
            </p>
          </div>
        </div>
      </div>

      {/* Brands Table Card */}
      <div className="card bg-base-100 border border-base-300 shadow-sm rounded-3xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-base-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-base-content flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span>Registered Brands List</span>
            </h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Switch active brand to view its dedicated catalog, sales analytics, and accounting statements
            </p>
          </div>

          <button
            type="button"
            onClick={openAddBrandModal}
            className="btn btn-outline btn-primary btn-sm rounded-xl text-xs font-bold gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Brand</span>
          </button>
        </div>

        {partnerBrands.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Store className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="font-bold text-base text-base-content">No Brands Registered Yet</h4>
              <p className="text-xs text-base-content/60 leading-relaxed">
                You have not registered any partner brands under this vendor account. Add your first brand to start retailing products on Vamoflex.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddBrandModal}
              className="btn btn-primary btn-sm rounded-xl text-white font-bold gap-2 px-4 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Your First Brand</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-xs uppercase text-base-content/50 border-b border-base-300 bg-base-200/40">
                  <th className="py-3 px-4 min-w-[220px]">Brand Identity</th>
                  <th className="py-3 px-4">Settlement Tier</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Payout Bank</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200 text-xs">
                {partnerBrands.map((b) => {
                  const isCurrent = String(b.id) === String(currentBrand?.id);
                  const tierBadge = getKelasColor(b.current_class || b.settlement_class);
                  const tierLabel = getKelasLabel(b.current_class || b.settlement_class);
                  const rates = b.brand_share_percentage ?? (b.current_class === 'kelas_a' ? 45 : b.current_class === 'kelas_c' ? 55 : 50);

                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-base-200/50 transition-colors ${
                        isCurrent ? 'bg-primary/5' : ''
                      }`}
                    >
                      {/* Identity */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-base-300 flex items-center justify-center shrink-0 overflow-hidden font-bold">
                            {b.logo_url ? (
                              <img src={b.logo_url} alt={b.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{b.name?.charAt(0)?.toUpperCase() || 'B'}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-base-content truncate block">
                                {b.name}
                              </span>
                              {isCurrent && (
                                <span className="badge badge-primary badge-xs font-bold text-[9px]">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-base-content/50 font-mono text-[11px]">
                              {b.code && <span>{b.code}</span>}
                              {b.code && b.slug && <span>•</span>}
                              {b.slug && <span className="truncate max-w-[120px]">{b.slug}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tier */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className={`badge ${tierBadge} badge-sm font-bold text-[10px]`}>
                            {tierLabel}
                          </span>
                          <p className="text-[11px] text-base-content/60 font-medium">
                            {rates}% Net Brand Share
                          </p>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 text-base-content/70">
                          {b.contact_email && (
                            <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                              <Mail className="w-3 h-3 text-base-content/40 shrink-0" />
                              <span className="truncate">{b.contact_email}</span>
                            </div>
                          )}
                          {b.contact_phone && (
                            <div className="flex items-center gap-1.5 text-base-content/50">
                              <Phone className="w-3 h-3 shrink-0" />
                              <span>{b.contact_phone}</span>
                            </div>
                          )}
                          {!b.contact_email && !b.contact_phone && (
                            <span className="text-base-content/40 italic">No contact set</span>
                          )}
                        </div>
                      </td>

                      {/* Bank Details */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {b.bank_name ? (
                            <>
                              <p className="font-semibold text-base-content truncate max-w-[160px]">
                                {b.bank_name}
                              </p>
                              <p className="text-[11px] text-base-content/50 font-mono truncate">
                                {b.bank_account_number || b.bank_account_no || '—'}
                              </p>
                            </>
                          ) : (
                            <span className="text-base-content/40 italic">No bank attached</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`badge badge-sm font-semibold capitalize ${
                          b.status === 'active' || !b.status ? 'badge-success text-white' : 'badge-ghost'
                        }`}>
                          {b.status || 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isCurrent ? (
                            <span className="btn btn-xs btn-ghost text-primary font-bold gap-1 cursor-default">
                              <Check className="w-3.5 h-3.5" />
                              <span>Current Active</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => switchBrand(String(b.id))}
                              className="btn btn-outline btn-xs btn-primary rounded-lg font-semibold gap-1"
                              title="Switch active brand"
                            >
                              <span>Switch to Brand</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
