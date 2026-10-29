'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Sparkles,
  CreditCard,
  User,
  Phone,
  Mail,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  Award,
  UploadCloud,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { vendorApi } from '@/lib/api';
import { SUPPORTED_BANKS } from '@/lib/banks';

interface AddBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBrandModal({ isOpen, onClose }: AddBrandModalProps) {
  const { switchBrand, refreshBrand } = useAuth();

  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [ssmRegistrationNo, setSsmRegistrationNo] = useState('');
  const [currentClass, setCurrentClass] = useState('kelas_b');
  const [bankName, setBankName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankSwiftCode, setBankSwiftCode] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Halal Certification State
  const [hasHalalCert, setHasHalalCert] = useState(false);
  const [halalCategoryId, setHalalCategoryId] = useState('');
  const [halalCertNo, setHalalCertNo] = useState('');
  const [halalCertExpiry, setHalalCertExpiry] = useState('');
  const [halalDocuments, setHalalDocuments] = useState<Array<{ url: string; name: string; size?: number }>>([]);
  const [halalCategories, setHalalCategories] = useState<any[]>([]);
  const [uploadingHalalDoc, setUploadingHalalDoc] = useState(false);
  const [halalUploadError, setHalalUploadError] = useState<string | null>(null);

  // Settlement classes list
  const settlementClasses = [
    { code: 'kelas_a', label: 'Kelas A — 60% Payout (40% Platform)' },
    { code: 'kelas_b', label: 'Kelas B — 50% Payout (50% Platform) [Default]' },
    { code: 'kelas_c', label: 'Kelas C — 40% Payout (60% Platform)' },
    { code: 'kelas_d', label: 'Kelas D — 30% Payout (70% Platform)' },
    { code: 'kelas_e', label: 'Kelas E — 20% Payout (80% Platform)' },
    { code: 'kelas_f', label: 'Kelas F — 10% Payout (90% Platform)' },
  ];

  // Fetch pre-fill template when modal opens
  useEffect(() => {
    if (!isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      return;
    }

    const loadTemplate = async () => {
      setLoadingTemplate(true);
      setErrorMsg(null);
      try {
        const [res, catRes] = await Promise.all([
          vendorApi.getBrandTemplate().catch(() => null),
          vendorApi.getHalalCertifications().catch(() => []),
        ]);

        const categories = Array.isArray(catRes?.data) ? catRes.data : Array.isArray(catRes) ? catRes : [];
        setHalalCategories(categories);
        if (categories.length > 0) {
          setHalalCategoryId(categories[0].id);
        }

        const tpl = res?.data || res?.template || res;

        if (tpl) {
          setCompanyName(tpl.company_name || '');
          setSsmRegistrationNo(tpl.ssm_registration_no || tpl.registration_no || '');
          setCurrentClass(tpl.current_class || tpl.vendor_tier || 'kelas_b');
          setBankName(tpl.bank_name || '');
          setBankAccountNo(tpl.bank_account_no || '');
          setBankAccountName(tpl.bank_account_name || '');
          setBankSwiftCode(tpl.bank_swift_code || '');
          setContactPerson(tpl.contact_person || tpl.contact_name || '');
          setContactPhone(tpl.contact_phone || '');
          setContactEmail(tpl.contact_email || '');

          if (tpl.has_halal_cert || tpl.halal_info) {
            setHasHalalCert(Boolean(tpl.has_halal_cert ?? tpl.halal_info?.has_cert));
            if (tpl.halal_info?.category_id) setHalalCategoryId(tpl.halal_info.category_id);
            if (tpl.halal_info?.cert_no) setHalalCertNo(tpl.halal_info.cert_no);
            if (tpl.halal_info?.cert_expiry) setHalalCertExpiry(tpl.halal_info.cert_expiry);
            if (Array.isArray(tpl.halal_info?.documents)) {
              setHalalDocuments(tpl.halal_info.documents);
            }
          }
        }
      } catch (err: any) {
        console.warn('Could not load brand template, starting blank:', err);
      } finally {
        setLoadingTemplate(false);
      }
    };

    loadTemplate();
  }, [isOpen]);

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

  const handleBankChange = (selectedBankName: string) => {
    setBankName(selectedBankName);
    const match = SUPPORTED_BANKS.find(
      (b) => b.name.toLowerCase() === selectedBankName.toLowerCase()
    );
    if (match && (!bankSwiftCode || bankSwiftCode.trim() === '')) {
      setBankSwiftCode(match.swift_code);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Brand Name is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      name: name.trim(),
      code: code.trim() || undefined,
      description: description.trim() || undefined,
      company_name: companyName.trim() || undefined,
      ssm_registration_no: ssmRegistrationNo.trim() || undefined,
      current_class: currentClass,
      bank_name: bankName.trim() || undefined,
      bank_account_no: bankAccountNo.trim() || undefined,
      bank_account_name: bankAccountName.trim() || undefined,
      bank_swift_code: bankSwiftCode.trim() || undefined,
      contact_person: contactPerson.trim() || undefined,
      contact_phone: contactPhone.trim() || undefined,
      contact_email: contactEmail.trim() || undefined,
      has_halal_cert: hasHalalCert,
      halal_category_id: hasHalalCert ? halalCategoryId : null,
      halal_cert_no: hasHalalCert ? halalCertNo.trim() : null,
      halal_cert_expiry: hasHalalCert ? halalCertExpiry : null,
      halal_documents: hasHalalCert ? halalDocuments : [],
    };

    try {
      const res = await vendorApi.createBrand(payload);
      const newBrand = res?.data || res?.brand || res;
      setSuccessMsg(`Brand "${name}" registered successfully!`);

      await refreshBrand();

      if (newBrand && (newBrand.id || newBrand.uuid)) {
        await switchBrand(String(newBrand.id || newBrand.uuid));
      }

      setTimeout(() => {
        // Reset form
        setName('');
        setCode('');
        setDescription('');
        onClose();
      }, 1200);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to create brand. Please check the information provided and try again.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-base-100 rounded-3xl shadow-2xl border border-base-300 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-base-300 flex items-center justify-between bg-base-100 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-base-content leading-tight">
                Add New Brand
              </h2>
              <p className="text-xs text-base-content/60 mt-0.5">
                Register a sub-brand under your vendor account with editable pre-filled details.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Alerts */}
          {errorMsg && (
            <div className="alert alert-error text-xs rounded-2xl shadow-xs py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success text-xs rounded-2xl shadow-xs py-3 text-white">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Skeleton Loader while template is being fetched */}
          {loadingTemplate ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-base-200 rounded w-1/3" />
              <div className="h-10 bg-base-200 rounded-xl w-full" />
              <div className="h-4 bg-base-200 rounded w-1/4 mt-4" />
              <div className="h-20 bg-base-200 rounded-xl w-full" />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="h-10 bg-base-200 rounded-xl" />
                <div className="h-10 bg-base-200 rounded-xl" />
              </div>
            </div>
          ) : (
            <form id="add-brand-form" onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: Brand Identity */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span>1. Brand Identity</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label py-1 text-xs font-bold text-base-content">
                      Brand Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Mimikura Glow"
                      className="input input-sm sm:input-md input-bordered w-full rounded-xl text-xs sm:text-sm font-semibold bg-base-100 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content">
                      Brand Code <span className="text-xs text-base-content/50 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Auto-generated if empty"
                      className="input input-sm sm:input-md input-bordered w-full rounded-xl text-xs sm:text-sm font-mono uppercase bg-base-100 focus:border-primary"
                    />
                    <span className="text-[11px] text-base-content/50 mt-1 block">
                      Leave blank to auto-generate (e.g. BRD-MIMIKURA)
                    </span>
                  </div>

                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content">
                      Settlement Tier <span className="text-xs text-base-content/50 font-normal">(Inherited from Vendor)</span>
                    </label>
                    <select
                      value={currentClass}
                      onChange={(e) => setCurrentClass(e.target.value)}
                      className="select select-sm sm:select-md select-bordered w-full rounded-xl text-xs sm:text-sm font-semibold bg-base-100 focus:border-primary"
                    >
                      {settlementClasses.map((sc) => (
                        <option key={sc.code} value={sc.code}>
                          {sc.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="label py-1 text-xs font-bold text-base-content">
                      Brand Description <span className="text-xs text-base-content/50 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief overview of this brand's product lineup..."
                      className="textarea textarea-bordered w-full rounded-xl text-xs sm:text-sm bg-base-100 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Halal Certification & Regulatory Compliance */}
              <div className="space-y-4 pt-4 border-t border-base-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <Award className="w-4 h-4" />
                    <span>Halal Certification & Compliance</span>
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

                {hasHalalCert && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Authority / Country */}
                      <div>
                        <label className="label py-1 text-xs font-bold text-base-content">
                          Certifying Authority / Country <span className="text-error">*</span>
                        </label>
                        <select
                          value={halalCategoryId}
                          onChange={(e) => setHalalCategoryId(e.target.value)}
                          className="select select-sm select-bordered w-full rounded-xl text-xs font-semibold bg-base-100 focus:border-primary"
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

                      {/* Cert Registration Number */}
                      <div>
                        <label className="label py-1 text-xs font-bold text-base-content">
                          Certificate No. <span className="text-error">*</span>
                        </label>
                        <input
                          type="text"
                          value={halalCertNo}
                          onChange={(e) => setHalalCertNo(e.target.value)}
                          placeholder="e.g. JAKIM/(S)/(22.00)/492/2/ 1"
                          className="input input-sm input-bordered w-full rounded-xl text-xs font-mono bg-base-100 focus:border-primary"
                        />
                      </div>

                      {/* Expiry Date */}
                      <div>
                        <label className="label py-1 text-xs font-bold text-base-content">
                          Certificate Expiry Date
                        </label>
                        <input
                          type="date"
                          value={halalCertExpiry}
                          onChange={(e) => setHalalCertExpiry(e.target.value)}
                          className="input input-sm input-bordered w-full rounded-xl text-xs bg-base-100 focus:border-primary"
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

                    {/* Upload Cert Documents (Max 10, Max 2.5MB) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-base-content">
                          Certificate Documents & Supporting Evidence
                        </label>
                        <span className="text-[11px] text-base-content/60">
                          Max 10 files • Max 2.5MB per file (PDF, JPG, PNG)
                        </span>
                      </div>

                      {/* Dropzone / Upload button */}
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

                      {/* Uploaded Documents List */}
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
                )}
              </div>

              {/* SECTION 2: Company & SSM Details (Auto-populated from Main Brand, Editable) */}
              <div className="space-y-4 pt-2 border-t border-base-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
                    <FileText className="w-4 h-4" />
                    <span>2. Business SSM Entity</span>
                  </div>
                  <span className="badge badge-sm badge-ghost text-[10px] text-base-content/60">
                    Auto-populated • Editable
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content">
                      Company / SSM Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Synergy Beauty Sdn Bhd"
                      className="input input-sm sm:input-md input-bordered w-full rounded-xl text-xs sm:text-sm bg-base-100 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content">
                      SSM Registration No
                    </label>
                    <input
                      type="text"
                      value={ssmRegistrationNo}
                      onChange={(e) => setSsmRegistrationNo(e.target.value)}
                      placeholder="e.g. 202301012345 (1234567-X)"
                      className="input input-sm sm:input-md input-bordered w-full rounded-xl text-xs sm:text-sm font-mono bg-base-100 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Settlement Bank Account (Auto-populated from Main Brand, Editable) */}
              <div className="space-y-4 pt-2 border-t border-base-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
                    <CreditCard className="w-4 h-4" />
                    <span>3. Settlement Banking Details</span>
                  </div>
                  <span className="badge badge-sm badge-ghost text-[10px] text-base-content/60">
                    Auto-populated • Editable
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content">
                      Bank Name
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => handleBankChange(e.target.value)}
                      className="select select-sm sm:select-md select-bordered w-full rounded-xl text-xs sm:text-sm bg-base-100 focus:border-primary"
                    >
                      <option value="">Select Bank...</option>
                      {SUPPORTED_BANKS.map((b) => (
                        <option key={b.code} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={bankAccountNo}
                      onChange={(e) => setBankAccountNo(e.target.value)}
                      placeholder="e.g. 514012345678"
                      className="input input-sm sm:input-md input-bordered w-full rounded-xl text-xs sm:text-sm font-mono bg-base-100 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      placeholder="e.g. Synergy Beauty Sdn Bhd"
                      className="input input-sm sm:input-md input-bordered w-full rounded-xl text-xs sm:text-sm bg-base-100 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content">
                      SWIFT / BIC Code
                    </label>
                    <input
                      type="text"
                      value={bankSwiftCode}
                      onChange={(e) => setBankSwiftCode(e.target.value.toUpperCase())}
                      placeholder="e.g. MBBEMYKL"
                      className="input input-sm sm:input-md input-bordered w-full rounded-xl text-xs sm:text-sm font-mono uppercase bg-base-100 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Contact Information */}
              <div className="space-y-4 pt-2 border-t border-base-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
                    <User className="w-4 h-4" />
                    <span>4. Brand Operations Contact</span>
                  </div>
                  <span className="badge badge-sm badge-ghost text-[10px] text-base-content/60">
                    Auto-populated • Editable
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="PIC Full Name"
                      className="input input-sm sm:input-md input-bordered w-full rounded-xl text-xs sm:text-sm bg-base-100 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+60123456789"
                      className="input input-sm sm:input-md input-bordered w-full rounded-xl text-xs sm:text-sm bg-base-100 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="label py-1 text-xs font-bold text-base-content">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="vendor@company.com"
                      className="input input-sm sm:input-md input-bordered w-full rounded-xl text-xs sm:text-sm bg-base-100 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-base-300 bg-base-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn btn-sm sm:btn-md btn-ghost rounded-xl text-xs font-bold"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="add-brand-form"
            disabled={submitting || loadingTemplate || !name.trim()}
            className="btn btn-sm sm:btn-md btn-primary rounded-xl text-xs font-extrabold gap-2 min-w-[130px]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Brand...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Create Brand</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
