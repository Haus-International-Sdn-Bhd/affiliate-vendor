'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { vendorApi } from '@/lib/api';
import {
  User,
  Building2,
  CreditCard,
  Phone,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
  Award,
  UploadCloud,
  Trash2,
  ExternalLink,
  Loader2,
  FileText,
} from 'lucide-react';
import VendorLoader from '@/components/VendorLoader';
import { SUPPORTED_BANKS, findBankByName } from '@/lib/banks';

const profileLoadingStages = [
  'Retrieving brand identity & logo assets...',
  'Loading bank disbursement coordinates...',
  'Fetching official contact points & managers...',
  'Preparing profile configuration editor...',
];

const profileLoadingTips = [
  'Changes to bank disbursement accounts take effect on the next weekly payout cycle.',
  'Your brand slug and username are unique permanent identifiers on the marketplace.',
  'High-resolution logos with square aspect ratio (1:1) look best on the storefront.',
  'Ensure contact email is monitored for real-time order and settlement notices.',
];

export default function EditVendorProfilePage() {
  const router = useRouter();
  const { user, brand, refreshBrand } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    username: '',

    brand_name: '',
    slug: '',
    description: '',
    logo_url: '',

    contact_name: '',
    contact_email: '',
    contact_phone: '',

    bank_name: '',
    bank_account_holder: '',
    bank_account_number: '',
    bank_swift_code: '',
  });

  // Halal Certification State
  const [hasHalalCert, setHasHalalCert] = useState(false);
  const [halalCategoryId, setHalalCategoryId] = useState('');
  const [halalCertNo, setHalalCertNo] = useState('');
  const [halalCertExpiry, setHalalCertExpiry] = useState('');
  const [halalDocuments, setHalalDocuments] = useState<Array<{ url: string; name: string; size?: number }>>([]);
  const [halalCategories, setHalalCategories] = useState<any[]>([]);
  const [uploadingHalalDoc, setUploadingHalalDoc] = useState(false);
  const [halalUploadError, setHalalUploadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const [data, catRes] = await Promise.all([
          vendorApi.getProfile(),
          vendorApi.getHalalCertifications().catch(() => []),
        ]);

        const categories = Array.isArray(catRes?.data) ? catRes.data : Array.isArray(catRes) ? catRes : [];
        setHalalCategories(categories);

        const b = data?.brand || brand;
        const u = data?.user || user;

        const initialBank = b?.bank_name || '';
        const initialSwift = b?.bank_swift_code || (initialBank ? findBankByName(initialBank)?.swift_code : '') || '';

        setFormData({
          first_name: u?.first_name || '',
          last_name: u?.last_name || '',
          phone_number: u?.phone_number || '',
          email: u?.email || '',
          username: u?.username || '',

          brand_name: b?.name || '',
          slug: b?.slug || '',
          description: b?.description || '',
          logo_url: b?.logo_url || '',

          contact_name: b?.contact_name || u?.name || '',
          contact_email: b?.contact_email || u?.email || '',
          contact_phone: b?.contact_phone || '',

          bank_name: initialBank,
          bank_account_holder: b?.bank_account_holder || b?.name || '',
          bank_account_number: b?.bank_account_number || '',
          bank_swift_code: initialSwift,
        });

        if (b?.has_halal_cert || b?.halal_info) {
          setHasHalalCert(Boolean(b.has_halal_cert ?? b.halal_info?.has_cert));
          if (b.halal_info?.category_id) setHalalCategoryId(b.halal_info.category_id);
          else if (categories.length > 0) setHalalCategoryId(categories[0].id);
          if (b.halal_info?.cert_no) setHalalCertNo(b.halal_info.cert_no);
          if (b.halal_info?.cert_expiry) setHalalCertExpiry(b.halal_info.cert_expiry);
          if (Array.isArray(b.halal_info?.documents)) {
            setHalalDocuments(b.halal_info.documents);
          }
        } else if (categories.length > 0) {
          setHalalCategoryId(categories[0].id);
        }
      } catch (err) {
        console.error('Failed to load profile for editing:', err);
        setErrorMsg('Failed to load existing profile information.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleHalalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setHalalUploadError(null);

    const fileList = Array.from(files);
    if (halalDocuments.length + fileList.length > 10) {
      setHalalUploadError(`Maximum 10 Halal documents allowed. (Currently: ${halalDocuments.length})`);
      e.target.value = '';
      return;
    }

    const MAX_SIZE = 2.5 * 1024 * 1024; // 2.5 MB in bytes
    for (const f of fileList) {
      if (f.size > MAX_SIZE) {
        setHalalUploadError(`File "${f.name}" exceeds the 2.5MB limit (${(f.size / (1024 * 1024)).toFixed(2)}MB).`);
        e.target.value = '';
        return;
      }
    }

    setUploadingHalalDoc(true);
    try {
      const uploaded: Array<{ url: string; name: string; size?: number }> = [];
      for (const f of fileList) {
        const res = await vendorApi.uploadVendorDocument(f);
        const url = res?.url || res?.data?.url;
        if (url) {
          uploaded.push({
            url,
            name: res?.name || f.name,
            size: f.size,
          });
        }
      }
      setHalalDocuments((prev) => [...prev, ...uploaded]);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to upload document. Please ensure file is valid and under 2.5MB.';
      setHalalUploadError(msg);
    } finally {
      setUploadingHalalDoc(false);
      e.target.value = '';
    }
  };

  const removeHalalDocument = (idx: number) => {
    setHalalDocuments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBankName = e.target.value;
    const foundBank = findBankByName(selectedBankName);
    setFormData((prev) => ({
      ...prev,
      bank_name: selectedBankName,
      bank_swift_code: foundBank ? foundBank.swift_code : prev.bank_swift_code,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await vendorApi.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        brand_name: formData.brand_name,
        description: formData.description,
        logo_url: formData.logo_url,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        bank_name: formData.bank_name,
        bank_account_holder: formData.bank_account_holder,
        bank_account_number: formData.bank_account_number,
        bank_swift_code: formData.bank_swift_code,
        has_halal_cert: hasHalalCert,
        halal_category_id: hasHalalCert ? halalCategoryId : null,
        halal_cert_no: hasHalalCert ? halalCertNo.trim() : null,
        halal_cert_expiry: hasHalalCert ? halalCertExpiry : null,
        halal_documents: hasHalalCert ? halalDocuments : [],
      });

      if (refreshBrand) {
        await refreshBrand();
      }

      setSuccessMsg('Profile and brand details updated successfully!');
      setTimeout(() => {
        router.push('/vendor-portal/profile');
      }, 1200);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMsg(
        err?.response?.data?.message ||
          'Failed to update profile. Please verify your entries.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <VendorLoader
        fullScreen={false}
        label="Vendor Profile & Brand Editor"
        sublabel="Loading your brand credentials and banking data..."
        stages={profileLoadingStages}
        tips={profileLoadingTips}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/vendor-portal/profile"
              className="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-base-content"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs font-semibold text-base-content/60">
              Profile Settings
            </span>
          </div>
          <h1 className="text-2xl font-bold text-base-content">
            Edit Profile & Brand Information
          </h1>
          <p className="text-xs text-base-content/60 mt-0.5">
            Update account representative, brand identity, and bank disbursement
            coordinates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/vendor-portal/profile"
            className="btn btn-outline btn-sm font-semibold"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="btn btn-primary btn-sm text-white font-semibold gap-2 shadow-sm"
          >
            {saving ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="alert alert-success shadow-sm text-xs py-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-error shadow-sm text-xs py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Representative */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-base-300 pb-3">
              <User className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-bold text-sm text-base-content">
                  Account Representative
                </h2>
                <p className="text-[11px] text-base-content/60">
                  Personal manager and access contact information
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    First Name
                  </span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="e.g. John"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Last Name
                  </span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="e.g. Doe"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Username (Login)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.username}
                    disabled
                    className="input input-bordered input-sm w-full bg-base-200 text-base-content/60 cursor-not-allowed pr-8"
                  />
                  <Lock className="w-3.5 h-3.5 text-base-content/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Email Address
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="input input-bordered input-sm w-full bg-base-200 text-base-content/60 cursor-not-allowed pr-8"
                  />
                  <Lock className="w-3.5 h-3.5 text-base-content/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="form-control sm:col-span-2">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Mobile / Phone Number
                  </span>
                </label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="e.g. +60 12-345 6789"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Brand Information */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-base-300 pb-3">
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-bold text-sm text-base-content">
                  Brand Identity & Presentation
                </h2>
                <p className="text-[11px] text-base-content/60">
                  Public vendor identity displayed across products and storefront
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Brand Name
                  </span>
                </label>
                <input
                  type="text"
                  name="brand_name"
                  value={formData.brand_name}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="Brand display name"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Brand Slug / Handle
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.slug}
                    disabled
                    className="input input-bordered input-sm w-full bg-base-200 text-base-content/60 cursor-not-allowed pr-8 font-mono"
                  />
                  <Lock className="w-3.5 h-3.5 text-base-content/40 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="form-control sm:col-span-2">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Logo Image URL
                  </span>
                </label>
                <input
                  type="url"
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="https://.../logo.png"
                />
              </div>

              <div className="form-control sm:col-span-2">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Brand Description
                  </span>
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="textarea textarea-bordered text-xs w-full focus:textarea-primary"
                  placeholder="Curated brand partner operating on VAMOFLEX..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Halal Certification & Regulatory Compliance */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-base-300 pb-3">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h2 className="font-bold text-sm text-base-content">
                    Halal Certification & Regulatory Compliance
                  </h2>
                  <p className="text-[11px] text-base-content/60">
                    Officially certified Halal credentials displayed on public storefront & partner directory
                  </p>
                </div>
              </div>
              <label className="label cursor-pointer gap-2 p-0">
                <span className="text-xs font-bold text-base-content/80">Has Halal Cert?</span>
                <input
                  type="checkbox"
                  checked={hasHalalCert}
                  onChange={(e) => setHasHalalCert(e.target.checked)}
                  className="toggle toggle-success toggle-sm"
                />
              </label>
            </div>

            {hasHalalCert ? (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Certifying Authority / Country */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs font-semibold text-base-content/70">
                        Certifying Authority / Country <span className="text-error">*</span>
                      </span>
                    </label>
                    <select
                      value={halalCategoryId}
                      onChange={(e) => setHalalCategoryId(e.target.value)}
                      className="select select-bordered select-sm w-full font-medium focus:select-primary"
                    >
                      {halalCategories.length === 0 && (
                        <option value="">Standard Halal Malaysia</option>
                      )}
                      {halalCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label || cat.country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cert Number */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs font-semibold text-base-content/70">
                        Certificate Registration No. <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      value={halalCertNo}
                      onChange={(e) => setHalalCertNo(e.target.value)}
                      placeholder="e.g. JAKIM/(S)/(22.00)/492/2/ 1"
                      className="input input-bordered input-sm w-full font-mono focus:input-primary"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs font-semibold text-base-content/70">
                        Certificate Expiry Date
                      </span>
                    </label>
                    <input
                      type="date"
                      value={halalCertExpiry}
                      onChange={(e) => setHalalCertExpiry(e.target.value)}
                      className="input input-bordered input-sm w-full focus:input-primary"
                    />
                  </div>
                </div>

                {/* Live Badge Preview */}
                {(() => {
                  const selectedCat = halalCategories.find((c) => c.id === halalCategoryId) || halalCategories[0];
                  if (!selectedCat) return null;
                  return (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-base-100 border border-base-300">
                      <span className="text-xs text-base-content/70 font-medium">Storefront Badge Preview:</span>
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-xs border"
                        style={{
                          backgroundColor: selectedCat.badge_color || '#FEF08A',
                          color: selectedCat.badge_text_color || '#854D0E',
                          borderColor: 'rgba(0,0,0,0.08)',
                        }}
                      >
                        <Award className="w-3.5 h-3.5 shrink-0" />
                        <span>{selectedCat.label || selectedCat.country}</span>
                      </span>
                    </div>
                  );
                })()}

                {/* Upload Documents (Max 10, Max 2.5MB) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-base-content">
                      Certificate Documents & Supporting Evidence
                    </label>
                    <span className="text-[11px] text-base-content/60">
                      Max 10 files • Max 2.5MB per file (PDF, JPG, PNG)
                    </span>
                  </div>

                  <label className="relative border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-base-100/50 hover:bg-emerald-500/5 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={handleHalalFileUpload}
                      disabled={uploadingHalalDoc || halalDocuments.length >= 10}
                      className="hidden"
                    />
                    {uploadingHalalDoc ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-primary">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Uploading document(s)...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center gap-1">
                        <UploadCloud className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-base-content">
                          Click or drop certificate files here to upload
                        </span>
                        <span className="text-[10px] text-base-content/60">
                          {halalDocuments.length}/10 uploaded
                        </span>
                      </div>
                    )}
                  </label>

                  {halalUploadError && (
                    <p className="text-xs text-error mt-1.5 font-medium">{halalUploadError}</p>
                  )}

                  {halalDocuments.length > 0 && (
                    <div className="space-y-1.5 mt-3">
                      {halalDocuments.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-base-100 border border-base-300 rounded-xl px-3 py-2 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-medium text-base-content truncate">{doc.name}</span>
                            {doc.size && (
                              <span className="text-[10px] text-base-content/50 shrink-0">
                                ({(doc.size / 1024).toFixed(0)} KB)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-ghost btn-xs text-primary"
                              title="View Document"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => removeHalalDocument(idx)}
                              className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-base-content/50 italic">
                Toggle "Has Halal Cert?" above to add verified halal certification details and supporting documents.
              </p>
            )}
          </div>
        </div>

        {/* Official Brand Contact */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-base-300 pb-3">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-bold text-sm text-base-content">
                  Official Brand Contact
                </h2>
                <p className="text-[11px] text-base-content/60">
                  Business contact points for administrative and operational
                  notices
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Contact Person Name
                  </span>
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="Official PIC"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Business Email
                  </span>
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="contact@brand.com"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Business Phone
                  </span>
                </label>
                <input
                  type="text"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="+60 12-345 6789"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Banking / Payout Details */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-base-300 pb-3">
              <CreditCard className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-bold text-sm text-base-content">
                  Payout & Banking Coordinates
                </h2>
                <p className="text-[11px] text-base-content/60">
                  Bank accounts for weekly net settlement statements and
                  disbursements
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Bank Name Dropdown */}
              <div className="form-control sm:col-span-2 lg:col-span-2">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Bank Name
                  </span>
                  <span className="label-text-alt text-[10px] text-base-content/50">
                    Select financial institution
                  </span>
                </label>
                <select
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleBankChange}
                  className="select select-bordered select-sm w-full font-medium focus:select-primary"
                >
                  <option value="">Select Bank / Financial Institution</option>

                  <optgroup label="Malaysia (Local Commercial & Islamic Banks)">
                    {SUPPORTED_BANKS.filter((b) => b.country === 'MY').map((bank) => (
                      <option key={bank.swift_code + bank.name} value={bank.name}>
                        {bank.name} ({bank.swift_code})
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="Singapore & Regional Banks">
                    {SUPPORTED_BANKS.filter((b) => b.country === 'SG').map((bank) => (
                      <option key={bank.swift_code + bank.name} value={bank.name}>
                        {bank.name} ({bank.swift_code})
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="Indonesia Banks">
                    {SUPPORTED_BANKS.filter((b) => b.country === 'ID').map((bank) => (
                      <option key={bank.swift_code + bank.name} value={bank.name}>
                        {bank.name} ({bank.swift_code})
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="Thailand Banks">
                    {SUPPORTED_BANKS.filter((b) => b.country === 'TH').map((bank) => (
                      <option key={bank.swift_code + bank.name} value={bank.name}>
                        {bank.name} ({bank.swift_code})
                      </option>
                    ))}
                  </optgroup>

                  {/* Fallback option if vendor's current bank name is not in standard list */}
                  {formData.bank_name && !SUPPORTED_BANKS.some((b) => b.name === formData.bank_name) && (
                    <optgroup label="Custom / Other Bank">
                      <option value={formData.bank_name}>{formData.bank_name}</option>
                    </optgroup>
                  )}
                </select>
              </div>

              {/* SWIFT / BIC Code Input */}
              <div className="form-control sm:col-span-2 lg:col-span-2">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    SWIFT / BIC Code
                  </span>
                  <span className="label-text-alt text-[10px] text-primary font-mono font-bold">
                    {formData.bank_swift_code ? 'Auto-synced' : 'Auto-filled on select'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="bank_swift_code"
                    value={formData.bank_swift_code}
                    onChange={handleChange}
                    className="input input-bordered input-sm w-full focus:input-primary font-mono uppercase tracking-wider pr-16"
                    placeholder="e.g. PBBEMYKL"
                  />
                  {formData.bank_swift_code && (
                    <span className="badge badge-xs badge-primary font-mono font-bold uppercase absolute right-2.5 top-1/2 -translate-y-1/2">
                      SWIFT
                    </span>
                  )}
                </div>
              </div>

              {/* Account Holder Name */}
              <div className="form-control sm:col-span-2 lg:col-span-2">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Account Holder Name
                  </span>
                </label>
                <input
                  type="text"
                  name="bank_account_holder"
                  value={formData.bank_account_holder}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary"
                  placeholder="Company / Owner Name"
                />
              </div>

              {/* Bank Account Number */}
              <div className="form-control sm:col-span-2 lg:col-span-2">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">
                    Bank Account Number
                  </span>
                </label>
                <input
                  type="text"
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={handleChange}
                  className="input input-bordered input-sm w-full focus:input-primary font-mono"
                  placeholder="e.g. 512345678901"
                />
              </div>
            </div>

            <div className="pt-2 text-xs text-base-content/60 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>
                Weekly settlement disbursements occur every Wednesday for the
                prior weekly cycle.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Save Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/vendor-portal/profile"
            className="btn btn-ghost btn-sm font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-sm text-white font-semibold gap-2 shadow-sm"
          >
            {saving ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
