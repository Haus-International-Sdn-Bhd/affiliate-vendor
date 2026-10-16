'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { vendorApi } from '@/lib/api';
import {
  User,
  Building2,
  CreditCard,
  Phone,
  Mail,
  ShieldCheck,
  Award,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Lock,
  Edit,
  Store,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';

export default function VendorProfilePage() {
  const { user, brand, refreshBrand, vendorConfig } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await vendorApi.getProfile();
        if (data?.brand) {
          setProfileData(data);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const activeBrand = profileData?.brand || brand;

  const isPlanChangeAllowed = Boolean(
    (profileData?.config?.allow_plan_change ?? vendorConfig?.allow_plan_change ?? true) &&
    !(profileData?.config?.cooldown_active ?? vendorConfig?.cooldown_active)
  );
  const cooldownActive = Boolean(
    profileData?.config?.cooldown_active ?? vendorConfig?.cooldown_active
  );
  const cooldownDaysRemaining =
    profileData?.config?.cooldown_days_remaining ??
    vendorConfig?.cooldown_days_remaining ??
    0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Profile & Brand Settings</h1>
          <p className="text-xs text-base-content/60 mt-1">
            Manage your vendor account details, partner brand identity and settlement banking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/vendor-portal/profile/edit"
            className="btn btn-primary btn-sm text-white gap-2 font-semibold shadow-sm"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Brand & User Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-6 flex flex-col items-center text-center">
              <div className="avatar placeholder mb-3">
                <div className="bg-primary/10 text-primary border-2 border-primary/20 rounded-2xl w-20 h-20 flex items-center justify-center">
                  {activeBrand?.logo_url ? (
                    <img
                      src={activeBrand.logo_url}
                      alt={activeBrand.name}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <Building2 className="w-10 h-10" />
                  )}
                </div>
              </div>
              <h2 className="text-lg font-bold text-base-content">{activeBrand?.name || 'Partner Brand'}</h2>
              <p className="text-xs text-base-content/60 mt-0.5">
                {activeBrand?.slug ? `@${activeBrand.slug}` : 'Brand Partner'}
              </p>

              <div className="flex items-center gap-2 mt-4">
                <span className="badge badge-primary font-bold text-xs uppercase">
                  {activeBrand?.current_class ? activeBrand.current_class.replace('_', ' ') : 'Kelas B'}
                </span>
                <span className="badge badge-outline text-xs">
                  {activeBrand?.status === 'active' ? 'Active' : 'Pending'}
                </span>
              </div>

              <div className="divider my-4"></div>

              {/* Dedicated Storefront Quick Share */}
              {activeBrand?.slug && (
                <div className="w-full bg-base-200/70 p-3 rounded-xl border border-base-300/60 text-left space-y-2 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-base-content flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-primary" />
                      <span>Kedai Rasmi Jenama</span>
                    </span>
                    <span className="badge badge-primary badge-xs">Zero Distraction</span>
                  </div>
                  <code className="text-[10px] font-mono bg-base-100 p-1.5 rounded-lg text-primary block truncate border border-base-300/40">
                    https://vamoflex.com/portal/{activeBrand.slug}
                  </code>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        const url = `https://vamoflex.com/portal/${activeBrand.slug}`;
                        navigator.clipboard.writeText(url);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2500);
                      }}
                      className={`btn btn-xs flex-1 gap-1 font-medium ${
                        copiedLink ? 'btn-success text-white' : 'btn-primary'
                      }`}
                    >
                      {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
                    </button>
                    <a
                      href={`https://vamoflex.com/portal/${activeBrand.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-xs gap-1"
                      title="Buka Kedai"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Buka</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="w-full text-left space-y-3 text-xs">
                <div className="flex items-center justify-between text-base-content/70">
                  <span className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Account User
                  </span>
                  <span className="font-semibold text-base-content">{user?.name || user?.username || 'Vendor'}</span>
                </div>
                <div className="flex items-center justify-between text-base-content/70">
                  <span className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </span>
                  <span className="font-medium text-base-content truncate max-w-[140px]">{user?.email || 'vendor@brand.com'}</span>
                </div>
                <div className="flex items-center justify-between text-base-content/70">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Portal Role
                  </span>
                  <span className="badge badge-sm badge-ghost font-medium">Vendor Manager</span>
                </div>
              </div>

              <div className="w-full mt-4 pt-3 border-t border-base-200">
                <Link
                  href="/vendor-portal/profile/edit"
                  className="btn btn-outline btn-xs w-full gap-1.5 font-semibold text-base-content/70 hover:btn-primary"
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit Account Details</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Settlement Class Info Card */}
          <div className="card bg-base-100 border border-base-300 shadow-sm relative overflow-hidden">
            {!isPlanChangeAllowed && (
              <div className="absolute inset-0 bg-base-100/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-5 text-center border-2 border-warning/40 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center mb-2 shadow-sm">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="badge badge-warning badge-sm font-bold uppercase tracking-wider text-[10px]">
                  Restricted
                </span>
                <h4 className="text-xs font-bold text-base-content mt-1.5">
                  Tier Adjustment Locked
                </h4>
                <p className="text-[11px] text-base-content/70 mt-1 max-w-[210px] leading-snug">
                  {cooldownActive
                    ? `Cooldown active (${cooldownDaysRemaining} days remaining before next allowed adjustment).`
                    : 'Plan modifications are temporarily disabled by platform administration.'}
                </p>
                <Link
                  href="/vendor-portal/settlement-plan"
                  className="btn btn-xs btn-outline border-base-300 text-base-content/80 hover:btn-primary mt-3 gap-1 font-semibold"
                >
                  <span>View Settlement Rules</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            <div className="card-body p-6">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-base-content">Settlement Tier</h3>
              </div>
              <p className="text-xs text-base-content/70 leading-relaxed mb-4">
                Your brand operates under{' '}
                <strong className="text-base-content">
                  {activeBrand?.current_class ? activeBrand.current_class.replace('_', ' ').toUpperCase() : 'KELAS B'}
                </strong>{' '}
                settlement tier with automatic weekly payouts.
              </p>
              <Link
                href="/vendor-portal/settlement-plan"
                className="btn btn-outline btn-primary btn-sm w-full gap-2 text-xs font-semibold"
              >
                <span>Request Tier Upgrade</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brand Details Card */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-base-300 pb-3">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-sm text-base-content">Brand Information</h3>
                </div>
                <Link
                  href="/vendor-portal/profile/edit"
                  className="btn btn-ghost btn-xs text-primary gap-1 font-semibold"
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-base-content/60 font-medium block mb-1">Brand Name</label>
                  <p className="font-semibold text-sm text-base-content">{activeBrand?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-base-content/60 font-medium block mb-1">Registered Company Name</label>
                  <p className="font-semibold text-sm text-base-content">{activeBrand?.company_name || activeBrand?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-base-content/60 font-medium block mb-1">Brand Identifier / Slug</label>
                  <p className="font-mono text-base-content">{activeBrand?.slug || '-'}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-base-content/60 font-medium block mb-1">Brand Description</label>
                  <p className="text-base-content/80 leading-relaxed">
                    {activeBrand?.description || 'Curated brand partner operating on VAMOFLEX multi-brand marketplace.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Banking / Payout Information Card */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-base-300 pb-3">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-bold text-sm text-base-content">Payout & Banking Details</h3>
                    <p className="text-[11px] text-base-content/60">Weekly settlement statements are disbursed to this bank account</p>
                  </div>
                </div>
                <Link
                  href="/vendor-portal/profile/edit"
                  className="btn btn-ghost btn-xs text-primary gap-1 font-semibold"
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-base-content/60 font-medium block mb-1">Bank Name</label>
                  <p className="font-semibold text-sm text-base-content">{activeBrand?.bank_name || 'Maybank / Public Bank'}</p>
                </div>
                <div>
                  <label className="text-base-content/60 font-medium block mb-1">SWIFT / BIC Code</label>
                  <p className="font-mono text-sm font-semibold text-primary">
                    {activeBrand?.bank_swift_code || (activeBrand?.bank_name ? 'Auto (Direct Payout)' : '—')}
                  </p>
                </div>
                <div>
                  <label className="text-base-content/60 font-medium block mb-1">Account Holder Name</label>
                  <p className="font-semibold text-sm text-base-content">{activeBrand?.bank_account_holder || activeBrand?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-base-content/60 font-medium block mb-1">Bank Account Number</label>
                  <p className="font-mono text-sm font-semibold text-base-content">{activeBrand?.bank_account_number || '•••• •••• ••••'}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-base-content/60 font-medium block mb-1">Disbursement Schedule</label>
                  <div className="flex items-center gap-1.5 text-primary font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Every Wednesday (11:59PM Sun Cutoff)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Person Details Card */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-base-300 pb-3">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-sm text-base-content">Official Brand Contact</h3>
                </div>
                <Link
                  href="/vendor-portal/profile/edit"
                  className="btn btn-ghost btn-xs text-primary gap-1 font-semibold"
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-base-content/60 font-medium block mb-1">Contact Person</label>
                  <p className="font-semibold text-sm text-base-content">{activeBrand?.contact_name || user?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-base-content/60 font-medium block mb-1">Phone Number</label>
                  <p className="font-medium text-base-content">{activeBrand?.contact_phone || '+60 12-345 6789'}</p>
                </div>
                <div>
                  <label className="text-base-content/60 font-medium block mb-1">Business Email</label>
                  <p className="font-medium text-base-content">{activeBrand?.contact_email || user?.email || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
