'use client';

import React from 'react';
import Link from 'next/link';
import {
  Store,
  ChevronDown,
  Check,
  PlusCircle,
  Sparkles,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Brand } from '@/lib/types';

interface BrandSwitcherProps {
  compact?: boolean;
}

export default function BrandSwitcher({ compact = false }: BrandSwitcherProps) {
  const {
    brand,
    brands,
    activeBrandId,
    switchBrand,
    openAddBrandModal,
  } = useAuth();

  const getKelasColor = (kelas?: string) => {
    switch (kelas?.toLowerCase()) {
      case 'kelas_a':
        return 'badge-primary';
      case 'kelas_b':
        return 'badge-info';
      case 'kelas_c':
        return 'badge-accent';
      case 'kelas_d':
        return 'badge-warning';
      case 'kelas_e':
      case 'kelas_f':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  const getKelasLabel = (kelas?: string) => {
    if (!kelas) return 'Kelas B';
    return kelas.replace('_', ' ').toUpperCase();
  };

  // Filter out any anchor / Haus Cosmetics brands
  const partnerBrands = (brands || []).filter((b) => {
    const s = (b.slug || b.name || '').toLowerCase();
    return !b.is_anchor && s !== 'haus-cosmetics' && !s.includes('haus cosmetics') && b.code !== 'BRD-HAUS';
  });

  // If vendor has 0 brands yet
  if (!partnerBrands || partnerBrands.length === 0) {
    if (compact) {
      return (
        <button
          type="button"
          onClick={openAddBrandModal}
          className="btn btn-ghost btn-circle btn-sm text-primary"
          title="Add Brand"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={openAddBrandModal}
        className="btn btn-sm btn-outline btn-primary rounded-xl text-xs font-bold gap-1.5"
      >
        <PlusCircle className="w-4 h-4" />
        <span>+ Add Brand</span>
      </button>
    );
  }

  // Active brand identifier
  const currentBrand =
    partnerBrands.find((b) => String(b.id) === String(activeBrandId)) ||
    (!brand?.is_anchor && brand?.slug !== 'haus-cosmetics' ? brand : null) ||
    partnerBrands[0];

  return (
    <div className="dropdown dropdown-bottom dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className={`btn btn-ghost ${
          compact
            ? 'btn-circle btn-sm'
            : 'h-auto py-1.5 px-2.5 sm:px-3 bg-base-200/80 hover:bg-base-200 border border-base-300 rounded-xl'
        } flex items-center gap-2 cursor-pointer transition-all`}
        title={`Active Brand: ${currentBrand?.name || 'Partner Brand'}`}
      >
        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Store className="w-4 h-4" />
        </div>

        {!compact && (
          <div className="flex items-center gap-2 min-w-0 text-left">
            <div className="min-w-0 max-w-[130px] sm:max-w-[180px]">
              <span className="font-extrabold text-xs text-base-content truncate block leading-tight">
                {currentBrand?.name || 'Partner Brand'}
              </span>
              <span className="text-[10px] text-base-content/60 leading-none truncate block">
                {getKelasLabel(currentBrand?.current_class || currentBrand?.settlement_class)}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-base-content/60 shrink-0" />
          </div>
        )}
      </div>

      {/* Dropdown Content */}
      <ul
        tabIndex={0}
        className="dropdown-content z-50 menu p-2 shadow-2xl bg-base-100 rounded-2xl w-64 sm:w-72 border border-base-300 mt-2 space-y-1 animate-in fade-in zoom-in-95 duration-150"
      >
        <li className="menu-title px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-base-content/50 border-b border-base-200 flex justify-between items-center">
          <span>Switch Brand ({partnerBrands.length})</span>
          <span className="text-[10px] font-normal lowercase">1 vendor → n brands</span>
        </li>

        <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
          {partnerBrands.map((b) => {
            const isActive = String(b.id) === String(currentBrand?.id);
            const tierBadge = getKelasColor(b.current_class || b.settlement_class);
            const tierLabel = getKelasLabel(b.current_class || b.settlement_class);

            return (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => switchBrand(String(b.id))}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'hover:bg-base-200 text-base-content'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'bg-base-200 text-base-content/70'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="truncate text-xs">{b.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`badge ${tierBadge} badge-xs text-[9px] font-bold`}
                        >
                          {tierLabel}
                        </span>
                        {b.code && (
                          <span className="text-[10px] font-mono text-base-content/50">
                            {b.code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isActive && <Check className="w-4 h-4 text-primary shrink-0 ml-1" />}
                </button>
              </li>
            );
          })}
        </div>

        {/* Divider and Add Brand action */}
        <div className="pt-1 border-t border-base-200 space-y-0.5">
          <li>
            <Link
              href="/vendor-portal/brands"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-base-content/80 hover:bg-base-200 rounded-xl"
            >
              <Store className="w-4 h-4 text-base-content/60" />
              <span>Manage All Brands</span>
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={openAddBrandModal}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-xl"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add New Brand</span>
            </button>
          </li>
        </div>
      </ul>
    </div>
  );
}
