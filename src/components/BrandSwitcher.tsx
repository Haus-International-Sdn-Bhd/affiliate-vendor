'use client';

import React from 'react';
import Link from 'next/link';
import {
  Store,
  ChevronDown,
  Check,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface BrandSwitcherProps {
  compact?: boolean;
}

export default function BrandSwitcher({ compact = false }: BrandSwitcherProps) {
  const {
    brand,
    brands,
    user,
    activeBrandId,
    switchBrand,
  } = useAuth();

  // Filter out any anchor / Haus Cosmetics brands
  const partnerBrands = (brands || []).filter((b) => {
    return !b.is_anchor;
  });

  const totalBrandsCount = partnerBrands.length;

  // Resolve vendor name
  // Prioritize vendor_name, company_name, user name, or active brand's vendor name
  const vendorName = (
    user?.vendor_name ||
    user?.company_name ||
    user?.name ||
    brand?.vendor_name ||
    brand?.company_name ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '') ||
    user?.username ||
    brand?.name ||
    'Vendor Partner'
  ).trim();

  // Active brand identifier
  const currentBrand =
    partnerBrands.find((b) => String(b.id) === String(activeBrandId)) ||
    (!brand?.is_anchor ? brand : null) ||
    partnerBrands[0];

  // If vendor has 0 brands yet
  if (!partnerBrands || partnerBrands.length === 0) {
    if (compact) {
      return (
        <div
          className="w-9 h-9 rounded-xl bg-base-200 text-base-content/60 flex items-center justify-center shrink-0 border border-base-300"
          title={vendorName}
        >
          <Building2 className="w-4 h-4" />
        </div>
      );
    }

    return (
      <div
        className="w-full py-2 px-3 bg-base-200/60 border border-base-300 rounded-2xl flex items-center gap-2.5"
        title={vendorName}
      >
        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <span className="font-bold text-xs text-base-content truncate block leading-tight">
            {vendorName}
          </span>
          <span className="text-[11px] text-base-content/60 leading-none truncate block mt-0.5">
            0 Brands
          </span>
        </div>
      </div>
    );
  }

  // Compact Mode (for collapsed sidebar)
  if (compact) {
    return (
      <div className="dropdown dropdown-right">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-circle btn-sm w-9 h-9 rounded-xl bg-base-200/80 hover:bg-base-200 border border-base-300 flex items-center justify-center text-primary cursor-pointer transition-all"
          title={`${vendorName} (${totalBrandsCount} ${totalBrandsCount === 1 ? 'Brand' : 'Brands'})`}
        >
          <Building2 className="w-4 h-4" />
        </div>

        {/* Dropdown Content */}
        <ul
          tabIndex={0}
          className="dropdown-content z-50 menu p-2 shadow-2xl bg-base-100 rounded-2xl w-64 border border-base-300 mt-1 space-y-1 animate-in fade-in zoom-in-95 duration-150"
        >
          <li className="menu-title px-3 py-1.5 text-[11px] font-bold text-base-content border-b border-base-200">
            <div className="flex flex-col">
              <span className="text-xs font-black truncate">{vendorName}</span>
              <span className="text-[10px] text-base-content/60 font-normal mt-0.5">
                {totalBrandsCount} {totalBrandsCount === 1 ? 'Brand' : 'Brands'} under vendor
              </span>
            </div>
          </li>

          <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
            {partnerBrands.map((b) => {
              const isActive = String(b.id) === String(currentBrand?.id);

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
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Store className="w-3.5 h-3.5 shrink-0 text-base-content/60" />
                      <span className="truncate">{b.name}</span>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-primary shrink-0 ml-1" />}
                  </button>
                </li>
              );
            })}
          </div>

          <div className="pt-1 border-t border-base-200">
            <li>
              <Link
                href="/vendor-portal/brands"
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-base-content/80 hover:bg-base-200 rounded-xl"
              >
                <Store className="w-4 h-4 text-base-content/60" />
                <span>View All Brands</span>
              </Link>
            </li>
          </div>
        </ul>
      </div>
    );
  }

  // Expanded Sidebar / Standard View
  return (
    <div className="dropdown dropdown-bottom dropdown-end w-full">
      <div
        tabIndex={0}
        role="button"
        className="w-full py-2 px-3 bg-base-200/70 hover:bg-base-200 border border-base-300/80 rounded-2xl flex items-center justify-between gap-2.5 cursor-pointer transition-all duration-150 shadow-2xs"
        title={`${vendorName} - ${totalBrandsCount} ${totalBrandsCount === 1 ? 'Brand' : 'Brands'}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="font-extrabold text-xs text-base-content truncate block leading-tight">
              {vendorName}
            </span>
            <span className="text-[11px] text-base-content/60 font-medium leading-none truncate block mt-1">
              {totalBrandsCount} {totalBrandsCount === 1 ? 'Brand' : 'Brands'}
            </span>
          </div>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-base-content/50 shrink-0" />
      </div>

      {/* Dropdown Content */}
      <ul
        tabIndex={0}
        className="dropdown-content z-50 menu p-2 shadow-2xl bg-base-100 rounded-2xl w-full min-w-[240px] border border-base-300 mt-2 space-y-1 animate-in fade-in zoom-in-95 duration-150"
      >
        <li className="menu-title px-3 py-2 border-b border-base-200">
          <div className="flex flex-col">
            <span className="text-xs font-black text-base-content truncate">{vendorName}</span>
            <span className="text-[10px] text-base-content/60 font-normal mt-0.5">
              {totalBrandsCount} {totalBrandsCount === 1 ? 'Brand' : 'Brands'} under vendor
            </span>
          </div>
        </li>

        <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
          {partnerBrands.map((b) => {
            const isActive = String(b.id) === String(currentBrand?.id);

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
                    <Store className="w-3.5 h-3.5 shrink-0 text-base-content/60" />
                    <span className="truncate">{b.name}</span>
                  </div>

                  {isActive && <Check className="w-4 h-4 text-primary shrink-0 ml-1" />}
                </button>
              </li>
            );
          })}
        </div>

        {/* Divider and Manage Brands action */}
        <div className="pt-1 border-t border-base-200">
          <li>
            <Link
              href="/vendor-portal/brands"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-base-content/80 hover:bg-base-200 rounded-xl"
            >
              <Store className="w-4 h-4 text-base-content/60" />
              <span>Manage All Brands</span>
            </Link>
          </li>
        </div>
      </ul>
    </div>
  );
}
