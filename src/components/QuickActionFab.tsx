'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  PlusCircle,
  Percent,
  Receipt,
  TrendingUp,
  Edit,
  HelpCircle,
  Zap,
  X,
  Store,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function QuickActionFab() {
  const [isOpen, setIsOpen] = useState(false);
  const { brand, user, vendorConfig, hasPermission } = useAuth();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const currentClass = brand?.current_class || 'kelas_b';
  const classLabel = currentClass.replace('_', ' ').toUpperCase();
  const brandShare =
    brand?.brand_share_percentage ||
    (currentClass === 'kelas_a' ? 45 : currentClass === 'kelas_c' ? 55 : 50);

  const quickLinks = [
    {
      label: 'Add New Product',
      desc: 'Create and list product item',
      href: '/vendor-portal/catalog/add-product',
      icon: PlusCircle,
      color: 'text-primary bg-primary/10',
      badge: 'Catalog',
      permission: 'vendor.catalog.create',
    },
    {
      label: 'Partner Brands',
      desc: 'Switch & register new brands',
      href: '/vendor-portal/brands',
      icon: Store,
      color: 'text-accent bg-accent/10',
      badge: 'Multi-Brand',
    },
    {
      label: 'Settlement Plans',
      desc: 'Review rates and adjust tier',
      href: '/vendor-portal/commerce-hub/settlement-plan',
      icon: Percent,
      color: 'text-success bg-success/10',
      badge: `${brandShare}% Net`,
      permission: 'vendor.settlement_plan.view',
    },
    {
      label: 'Weekly Statements',
      desc: 'Accounting & payout history',
      href: '/vendor-portal/accounting',
      icon: Receipt,
      color: 'text-info bg-info/10',
      badge: 'Disbursements',
      permission: 'vendor.accounting.view',
    },
    {
      label: 'Sales & Performance',
      desc: 'Analytics & revenue tracking',
      href: '/vendor-portal/insights/sales-report',
      icon: TrendingUp,
      color: 'text-warning bg-warning/10',
      badge: 'Insights',
      permission: ['vendor.insights.sales', 'vendor.insights.sales_report'],
    },
    {
      label: 'Edit Brand Profile',
      desc: 'Update bank & representative',
      href: '/vendor-portal/profile/edit',
      icon: Edit,
      color: 'text-secondary bg-secondary/10',
      badge: 'Settings',
      permission: 'vendor.profile.edit',
    },
    {
      label: 'Support & Help Desk',
      desc: 'Contact VAMOFLEX admin',
      href: '/vendor-portal/support',
      icon: HelpCircle,
      color: 'text-base-content/70 bg-base-200',
      badge: 'Help',
      permission: 'vendor.support.view',
    },
  ];

  const filteredLinks = quickLinks.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  if (filteredLinks.length === 0) {
    return null;
  }

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-40">
      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 w-80 sm:w-96 bg-base-100/95 backdrop-blur-md rounded-2xl border border-base-300 shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-4">
          {/* Menu Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 border-b border-base-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-base-content flex items-center gap-1.5">
                  <span>Quick Actions</span>
                  <span className="badge badge-primary badge-xs font-bold uppercase">
                    {classLabel}
                  </span>
                </h3>
                <p className="text-[10px] text-base-content/60 truncate max-w-[180px]">
                  {brand?.name || 'Partner Brand Portal'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Links List */}
          <div className="p-2 space-y-1 max-h-[380px] overflow-y-auto">
            {filteredLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-base-200/80 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${item.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="text-xs font-bold text-base-content group-hover:text-primary transition-colors truncate">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-base-content/50 truncate">
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-sm badge-ghost text-[10px] font-semibold shrink-0 ml-2">
                    {item.badge}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Quick Footer Info */}
          <div className="px-4 py-2 bg-base-200/50 border-t border-base-300 text-[11px] text-base-content/60 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Store className="w-3 h-3 text-primary" />
              <span>{brand?.name || 'VF Vendor'}</span>
            </span>
            <span className="font-mono text-[10px] font-semibold text-primary">
              v0.1.0
            </span>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle quick menu"
        className={`btn btn-circle shadow-xl border border-primary/20 transition-all duration-300 flex items-center justify-center ${
          isOpen
            ? 'btn-neutral text-white rotate-90 scale-95 shadow-primary/20'
            : 'btn-primary text-white hover:scale-105 shadow-primary/40 shadow-lg'
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Zap className="w-5 h-5 animate-pulse" />
        )}
      </button>
    </div>
  );
}
