"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { vendorApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Building2,
  Store,
  User,
  Mail,
  Phone,
  Lock,
  CreditCard,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Upload,
  FileText,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  MapPin,
  LogIn,
  Check,
  X,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

const COMPANY_TYPES = [
  { value: "sdn_bhd", label: "Sdn. Bhd. (Sendirian Berhad)" },
  { value: "enterprise", label: "Enterprise / Sole Proprietorship" },
  { value: "partnership", label: "Partnership (Perkongsian)" },
  { value: "llp", label: "LLP / PLT (Limited Liability Partnership)" },
  { value: "bhd", label: "Bhd. (Public Limited)" },
  { value: "individual", label: "Individual / Creator Brand" },
];

const MALAYSIAN_STATES = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Perak",
  "Perlis",
  "Pulau Pinang",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "Wilayah Persekutuan Kuala Lumpur",
  "Wilayah Persekutuan Labuan",
  "Wilayah Persekutuan Putrajaya",
];

const BANKS = [
  { name: "Malayan Banking Berhad (Maybank)", code: "Maybank", swift: "MBBEMYKL" },
  { name: "CIMB Bank Berhad", code: "CIMB Bank", swift: "CIBBMYKL" },
  { name: "Public Bank Berhad", code: "Public Bank", swift: "PBBEMYKL" },
  { name: "RHB Bank Berhad", code: "RHB Bank", swift: "RHBBMYKL" },
  { name: "Hong Leong Bank Berhad", code: "Hong Leong Bank", swift: "HLBBMYKL" },
  { name: "AmBank (M) Berhad", code: "AmBank", swift: "ARBKMYKL" },
  { name: "United Overseas Bank (UOB)", code: "UOB Malaysia", swift: "UOVBMYKL" },
  { name: "OCBC Bank (Malaysia) Berhad", code: "OCBC Bank", swift: "OCBCMYKL" },
  { name: "HSBC Bank Malaysia Berhad", code: "HSBC Malaysia", swift: "HSBCMYKL" },
  { name: "Standard Chartered Bank Malaysia", code: "Standard Chartered", swift: "SCBLMYKL" },
  { name: "Bank Islam Malaysia Berhad", code: "Bank Islam", swift: "BIMBMYKL" },
  { name: "Bank Muamalat Malaysia Berhad", code: "Bank Muamalat", swift: "BMMBMYKL" },
  { name: "Alliance Bank Malaysia Berhad", code: "Alliance Bank", swift: "MACBMYKL" },
  { name: "Affin Bank Berhad", code: "Affin Bank", swift: "PHBMMYKL" },
  { name: "Bank Simpanan Nasional (BSN)", code: "BSN", swift: "BSNAMYKL" },
  { name: "Agrobank (Bank Pertanian Malaysia)", code: "Agrobank", swift: "AGROMYKL" },
  { name: "Kuwait Finance House (Malaysia)", code: "Kuwait Finance House", swift: "KFHBMYKL" },
  { name: "Al Rajhi Banking & Investment", code: "Al Rajhi Bank", swift: "RJHIBEMY" },
];

const DEFAULT_SETTLEMENT_CLASSES = [
  { code: "kelas_a", name: "Kelas A", brandPayout: "45%", bonus: "40%", desc: "Premium Growth Tier", isDefault: false },
  { code: "kelas_b", name: "Kelas B", brandPayout: "50%", bonus: "35%", desc: "Standard Marketplace Tier (Recommended)", isDefault: true },
  { code: "kelas_c", name: "Kelas C", brandPayout: "55%", bonus: "30%", desc: "Direct Volume Tier", isDefault: false },
];

export default function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    // Brand & SSM Info
    brand_name: "",
    company_type: "sdn_bhd",
    business_registration_number: "",
    ssm_document_url: "",
    tax_id: "",
    description: "",
    logo_url: "",
    banner_url: "",
    settlement_class: "kelas_b",

    // Contact & Credentials
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    username: "",
    password: "",
    confirm_password: "",

    // Online & Social Presence
    website_url: "",
    instagram_url: "",
    tiktok_url: "",
    facebook_url: "",

    // Registered Address
    address_line1: "",
    address_line2: "",
    city: "",
    state: "Selangor",
    postcode: "",
    country: "Malaysia",

    // Bank Details
    bank_name: "Maybank",
    bank_swift_code: "MBBEMYKL",
    bank_account_number: "",
    bank_account_holder: "",
  });

  const [settlementClasses, setSettlementClasses] = useState(DEFAULT_SETTLEMENT_CLASSES);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    vendorApi.getSettlementClasses().then((res) => {
      const data = Array.isArray(res) ? res : res?.data;
      if (isMounted && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((item: any) => {
          const brandPct = Math.round(Number(item.brand_share_percentage ?? item.brand_share ?? 50));
          const bonusPct = Math.round(Number(item.bonus_fund_percentage ?? item.bonus_fund ?? 35));
          const code = (item.code || item.class_code || "kelas_b").toLowerCase();
          const isDef = Boolean(item.is_default || item.is_recommended);
          return {
            code,
            name: item.name || (code === "kelas_a" ? "Kelas A" : code === "kelas_c" ? "Kelas C" : "Kelas B"),
            brandPayout: `${brandPct}%`,
            bonus: `${bonusPct}%`,
            desc: item.description || (isDef ? "Standard Marketplace Tier (Recommended)" : "Tier"),
            isDefault: isDef,
          };
        });
        if (mapped.length > 0) {
          setSettlementClasses(mapped);
          if (mapped.length === 1) {
            setFormData((prev) => ({ ...prev, settlement_class: mapped[0].code }));
          } else {
            setFormData((prev) => {
              const currentValid = mapped.some((m: any) => m.code === prev.settlement_class);
              if (!currentValid) {
                const def = mapped.find((m: any) => m.isDefault) || mapped[0];
                return { ...prev, settlement_class: def.code };
              }
              return prev;
            });
          }
        }
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Ensure formData always preselects the single plan whenever there is only 1 record
  useEffect(() => {
    if (settlementClasses.length === 1 && formData.settlement_class !== settlementClasses[0].code) {
      setFormData((prev) => ({ ...prev, settlement_class: settlementClasses[0].code }));
    }
  }, [settlementClasses, formData.settlement_class]);

  // Upload States
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSsm, setUploadingSsm] = useState(false);
  const [ssmFileName, setSsmFileName] = useState<string | null>(null);

  // Live Validation States
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    valid?: boolean;
    message?: string;
  }>({ checking: false });

  const [phoneStatus, setPhoneStatus] = useState<{
    checking: boolean;
    valid?: boolean;
    message?: string;
  }>({ checking: false });

  const [emailStatus, setEmailStatus] = useState<{
    checking: boolean;
    valid?: boolean;
    message?: string;
  }>({ checking: false });

  // Existing User Login Modal
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<any | null>(null);
  const [alreadyVendorWarning, setAlreadyVendorWarning] = useState<{
    brandName: string;
    username: string;
    brandSlug?: string;
  } | null>(null);

  // Terms & Conditions Agreement States
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = "VF Vendor | Partner Registration";
    }
  }, []);

  // Password Strength Calculation
  const passwordCriteria = useMemo(() => {
    const pwd = formData.password || "";
    return {
      minLength: pwd.length >= 8,
      hasUpperLower: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[^A-Za-z0-9]/.test(pwd),
    };
  }, [formData.password]);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.minLength) score += 1;
    if (passwordCriteria.hasUpperLower) score += 1;
    if (passwordCriteria.hasNumber) score += 1;
    if (passwordCriteria.hasSpecial) score += 1;
    return score;
  }, [passwordCriteria]);

  const passwordStrengthLabel = useMemo(() => {
    if (!formData.password) return { label: "", color: "bg-base-300", text: "" };
    if (passwordScore <= 1) return { label: "Weak", color: "bg-error", text: "text-error" };
    if (passwordScore === 2) return { label: "Fair", color: "bg-warning", text: "text-warning" };
    if (passwordScore === 3) return { label: "Good", color: "bg-info", text: "text-info" };
    return { label: "Strong", color: "bg-success", text: "text-success" };
  }, [formData.password, passwordScore]);

  // Debounced Live Username Check
  useEffect(() => {
    if (authenticatedUser || !formData.username || formData.username.trim().length < 3) {
      setUsernameStatus({ checking: false });
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus({ checking: true });
      try {
        const res = await vendorApi.checkUsername(formData.username.trim());
        setUsernameStatus({
          checking: false,
          valid: res.valid,
          message: res.message,
        });
      } catch {
        setUsernameStatus({ checking: false });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.username, authenticatedUser]);

  // Debounced Live Phone Check
  useEffect(() => {
    if (authenticatedUser || !formData.contact_phone || formData.contact_phone.trim().length < 7) {
      setPhoneStatus({ checking: false });
      return;
    }

    const timer = setTimeout(async () => {
      setPhoneStatus({ checking: true });
      try {
        const res = await vendorApi.checkPhone(formData.contact_phone.trim());
        setPhoneStatus({
          checking: false,
          valid: res.valid,
          message: res.message,
        });
      } catch {
        setPhoneStatus({ checking: false });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.contact_phone, authenticatedUser]);

  // Debounced Live Email Check
  useEffect(() => {
    if (authenticatedUser || !formData.contact_email || !formData.contact_email.includes("@")) {
      setEmailStatus({ checking: false });
      return;
    }

    const timer = setTimeout(async () => {
      setEmailStatus({ checking: true });
      try {
        const res = await vendorApi.checkEmail(formData.contact_email.trim());
        setEmailStatus({
          checking: false,
          valid: res.valid,
          message: res.message,
        });
      } catch {
        setEmailStatus({ checking: false });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.contact_email, authenticatedUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "bank_name") {
        const found = BANKS.find((b) => b.name === value || b.code === value);
        if (found) {
          updated.bank_swift_code = found.swift;
        }
      }
      return updated;
    });
    setError(null);
  };

  // Logo Upload Handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file for the brand logo (PNG, JPG, WebP, SVG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Logo image file size must be less than 5MB.");
      return;
    }

    setUploadingLogo(true);
    setError(null);
    try {
      const res = await vendorApi.uploadVendorMedia(file, "brand_logos");
      if (res.url) {
        setFormData((prev) => ({ ...prev, logo_url: res.url }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload logo image.");
    } finally {
      setUploadingLogo(false);
    }
  };

  // SSM Document Upload Handler
  const handleSsmUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("SSM document file size must be less than 10MB.");
      return;
    }

    setUploadingSsm(true);
    setError(null);
    try {
      const res = await vendorApi.uploadVendorMedia(file, "ssm_certificates");
      if (res.url) {
        setFormData((prev) => ({ ...prev, ssm_document_url: res.url }));
        setSsmFileName(file.name);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload SSM document.");
    } finally {
      setUploadingSsm(false);
    }
  };

  // Existing User Login in Modal
  const handleExistingLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim() || !loginPassword) {
      setLoginError("Please enter your email/username and password.");
      return;
    }

    setLoginLoading(true);
    try {
      const payload = loginIdentifier.includes("@")
        ? { email: loginIdentifier.trim(), password: loginPassword }
        : { username: loginIdentifier.trim(), password: loginPassword };

      const response = await vendorApi.login(payload);
      const user = response.user;

      if (user) {
        // Check if user is already a vendor or already manages a brand
        const roles = user.roles || [];
        const isVendor = roles.includes("vendor") || user.is_vendor === true;
        const existingBrand = user.brand || response.brand;

        if (isVendor || existingBrand) {
          const brandTitle = existingBrand?.name ? `"${existingBrand.name}"` : "an existing vendor store";
          setLoginError(
            `This account is already registered as a vendor partner managing ${brandTitle}. Multiple brand registrations per user account are not permitted. Please sign in directly to the Vendor Portal.`
          );
          setAlreadyVendorWarning({
            brandName: existingBrand?.name || "Active Vendor Brand",
            username: user.username || user.email,
            brandSlug: existingBrand?.slug,
          });
          return;
        }

        setAlreadyVendorWarning(null);
        setAuthenticatedUser(user);
        const name = user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim();
        setFormData((prev) => ({
          ...prev,
          contact_name: name || prev.contact_name,
          contact_email: user.email || prev.contact_email,
          contact_phone: user.phone_number || prev.contact_phone,
          username: user.username || prev.username,
          bank_account_holder: name || prev.bank_account_holder,
          password: "",
          confirm_password: "",
        }));
        setIsLoginModalOpen(false);
      }
    } catch (err: any) {
      setLoginError(
        err.response?.data?.message || "Invalid credentials. Please check your email and password."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleUnlinkUser = () => {
    setAuthenticatedUser(null);
    setAlreadyVendorWarning(null);
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (alreadyVendorWarning) {
      setError(
        `This affiliate account is already associated with ${alreadyVendorWarning.brandName}. Multiple brand registrations are not permitted.`
      );
      return;
    }

    if (!formData.brand_name.trim()) {
      setError("Please enter your brand name.");
      return;
    }
    if (!formData.contact_name.trim()) {
      setError("Please enter the contact person name.");
      return;
    }
    if (!formData.contact_email.trim()) {
      setError("Please enter a valid contact email.");
      return;
    }

    // If new user (not authenticated via existing login)
    if (!authenticatedUser) {
      if (!formData.password) {
        setError("Please enter a password for your account.");
        return;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      if (formData.password !== formData.confirm_password) {
        setError("Password confirmation does not match.");
        return;
      }
      if (usernameStatus.valid === false) {
        setError("The chosen username is already taken. Please choose another username.");
        return;
      }
    }

    if (!agreedToTerms) {
      setError("Please review and agree to the Terms & Conditions and Merchant Partner Agreement to submit your vendor application.");
      return;
    }

    setLoading(true);

    try {
      const response = await vendorApi.registerVendor(formData);

      setSuccessMessage(
        response.message || "Vendor application and brand registration completed successfully!"
      );

      const token = response.access_token || response.token;
      const user = response.user;
      const brand = response.brand;

      if (token && user) {
        const permissions = user?.permissions || [];
        login(token, user, brand, permissions);
        setTimeout(() => {
          router.push("/vendor-portal/dashboard");
        }, 1200);
      } else {
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err: any) {
      const respData = err.response?.data;
      if (
        respData?.already_vendor ||
        respData?.message?.includes("already registered as a vendor") ||
        respData?.message?.includes("already manages an active brand")
      ) {
        setAlreadyVendorWarning({
          brandName: respData?.brand?.name || "Existing Brand",
          username: formData.username || formData.contact_email,
          brandSlug: respData?.brand?.slug,
        });
      }
      const apiMsg = respData?.message || respData?.error;
      setError(
        apiMsg || err.message || "Failed to submit registration. Please verify the information provided."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="w-full max-w-4xl py-4 sm:py-8"
    >
      <div
        suppressHydrationWarning
        className="card w-full bg-base-100/95 backdrop-blur-xl shadow-2xl border border-base-300/80 rounded-3xl overflow-hidden relative"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-accent" />
        <div suppressHydrationWarning className="card-body p-6 sm:p-10">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-base-200">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo/logo.png"
                alt="Vamoflex Logo"
                className="h-10 w-auto object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-base-content tracking-tight">
                  Vendor Partner Registration
                </h1>
                <p className="text-xs text-base-content/60">
                  Join the Vamoflex Merchant Network &bull; Expand Your Direct &amp; Affiliate Reach
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="btn btn-ghost btn-sm text-xs gap-1.5 text-base-content/70 hover:text-base-content"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>

          {/* Existing Affiliate Login CTA Banner */}
          <div className="mt-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-base-200 border border-primary/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-primary/20 text-primary shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-base-content flex items-center gap-2">
                  Already an Affiliate or Member?
                  {authenticatedUser && (
                    <span className="badge badge-success badge-sm text-white font-medium">
                      Account Linked
                    </span>
                  )}
                </h2>
                <p className="text-xs text-base-content/70 mt-0.5 max-w-xl">
                  {authenticatedUser
                    ? `Linked as @${authenticatedUser.username || authenticatedUser.email}. Profile details have been auto-filled!`
                    : "Sign in with your existing account to auto-fill your profile and seamlessly link your new Brand Store without entering a new password."}
                </p>
              </div>
            </div>

            {authenticatedUser ? (
              <button
                type="button"
                onClick={handleUnlinkUser}
                className="btn btn-outline btn-error btn-xs sm:btn-sm shrink-0 gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Switch / Unlink</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="btn btn-primary btn-sm shrink-0 text-white font-medium shadow-md shadow-primary/20 gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Auto-Fill</span>
              </button>
            )}
          </div>

          {/* Already Vendor Warning Alert */}
          {alreadyVendorWarning && (
            <div className="mt-4 rounded-2xl border border-warning/40 bg-warning/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-warning/20 text-warning shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-base-content">
                    Account Already Linked as a Vendor Partner
                  </h3>
                  <p className="text-xs text-base-content/70 mt-0.5 max-w-xl">
                    Account <strong>@{alreadyVendorWarning.username}</strong> is already registered as a vendor managing <strong>{alreadyVendorWarning.brandName}</strong>. Multiple vendor brand profiles per affiliate account are not permitted.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setAlreadyVendorWarning(null)}
                  className="btn btn-ghost btn-xs text-base-content/60"
                >
                  Dismiss
                </button>
                <Link
                  href="/login"
                  className="btn btn-warning btn-sm text-warning-content font-bold shadow-sm"
                >
                  Sign In to Vendor Portal
                </Link>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="alert alert-error text-xs shadow-md mt-4 flex items-center gap-2 text-white"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div
              role="alert"
              className="alert alert-success text-xs shadow-md mt-4 flex items-center gap-2 text-white"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage} Redirecting to your dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 mt-6">
            {/* Section 1: Brand & SSM Business Details */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-base-200">
                <Store className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/80">
                  1. Brand &amp; SSM Business Profile
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Brand Name */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">
                      Brand / Store Name <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="brand_name"
                    required
                    placeholder="e.g. Aura Botanicals"
                    value={formData.brand_name}
                    onChange={handleChange}
                    className="input input-bordered input-sm w-full"
                  />
                </div>

                {/* Company Entity Type */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">
                      Company Entity Type <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    name="company_type"
                    value={formData.company_type}
                    onChange={handleChange}
                    className="select select-bordered select-sm w-full text-xs"
                  >
                    {COMPANY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SSM Registration Number */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">
                      SSM Business Registration No. <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="business_registration_number"
                    required
                    placeholder="e.g. 202301012345 (1234567-X)"
                    value={formData.business_registration_number}
                    onChange={handleChange}
                    className="input input-bordered input-sm w-full font-mono text-xs"
                  />
                </div>

                {/* Tax / SST ID */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">
                      Tax / SST ID (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="tax_id"
                    placeholder="e.g. W10-1808-32000018"
                    value={formData.tax_id}
                    onChange={handleChange}
                    className="input input-bordered input-sm w-full font-mono text-xs"
                  />
                </div>

                {/* Brand Logo Upload */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">
                      Brand Logo (Optional)
                    </span>
                    <span className="label-text-alt text-[10px] text-base-content/50">
                      PNG/JPG max 5MB
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    {formData.logo_url && (
                      <div className="w-10 h-10 rounded-xl ring-1 ring-base-300 overflow-hidden bg-base-200 shrink-0">
                        <img
                          src={formData.logo_url}
                          alt="Logo Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <label className="btn btn-outline btn-sm gap-1.5 flex-1 cursor-pointer">
                      {uploadingLogo ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-primary" />
                      )}
                      <span className="text-xs truncate">
                        {formData.logo_url ? "Change Logo" : "Upload Brand Logo"}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                      />
                    </label>
                    {formData.logo_url && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, logo_url: "" }))}
                        className="btn btn-ghost btn-square btn-sm text-error"
                        title="Remove Logo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* SSM Certificate File Upload */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">
                      SSM Certificate Document (Optional)
                    </span>
                    <span className="label-text-alt text-[10px] text-base-content/50">
                      PDF/PNG/JPG max 10MB
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <label className="btn btn-outline btn-sm w-full gap-1.5 cursor-pointer justify-start">
                        {uploadingSsm ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-primary" />
                        )}
                        <span className="text-xs truncate">
                          {ssmFileName || (formData.ssm_document_url ? "Certificate Attached" : "Upload SSM Certificate")}
                        </span>
                        <input
                          type="file"
                          accept="application/pdf,image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleSsmUpload}
                          disabled={uploadingSsm}
                        />
                      </label>
                    </div>
                    {formData.ssm_document_url && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, ssm_document_url: "" }));
                          setSsmFileName(null);
                        }}
                        className="btn btn-ghost btn-square btn-sm text-error"
                        title="Remove SSM File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="form-control md:col-span-2">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">
                      Brand Story &amp; Description
                    </span>
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Briefly describe your brand specialty, products, and mission..."
                    value={formData.description}
                    onChange={handleChange}
                    className="textarea textarea-bordered textarea-sm w-full text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Settlement Class Tier */}
            <div>
              <div className="flex items-center justify-between pb-2 mb-4 border-b border-base-200">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/80">
                    2. Preferred Settlement Plan Tier
                  </h2>
                </div>
                <span className="text-[11px] text-base-content/50">
                  Fixed 15% Platform Fee Included
                </span>
              </div>

              <div className={settlementClasses.length === 1 ? "w-full" : "grid grid-cols-1 md:grid-cols-3 gap-3.5"}>
                {settlementClasses.map((cls) => {
                  const isSinglePlan = settlementClasses.length === 1;
                  const isChecked = isSinglePlan || formData.settlement_class === cls.code;

                  return (
                    <label
                      key={cls.code}
                      onClick={(e) => {
                        if (isSinglePlan) {
                          e.preventDefault();
                        }
                      }}
                      className={`flex flex-col p-3.5 rounded-xl border transition-all ${
                        isSinglePlan
                          ? "w-full border-primary/50 bg-primary/5 text-primary shadow-sm cursor-default select-none"
                          : isChecked
                          ? "border-primary bg-primary/10 text-primary shadow-sm cursor-pointer"
                          : "border-base-300 hover:border-base-content/20 bg-base-200/30 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-base-content">{cls.name}</span>
                          {cls.isDefault && (
                            <span className="badge badge-primary badge-xs text-[9px] text-white">
                              Standard
                            </span>
                          )}
                          {isSinglePlan && (
                            <span className="badge badge-ghost badge-xs text-[9px] text-base-content/60 font-medium">
                              Readonly
                            </span>
                          )}
                        </div>
                        <input
                          type="radio"
                          name="settlement_class"
                          value={cls.code}
                          checked={isChecked}
                          disabled={isSinglePlan}
                          readOnly={isSinglePlan}
                          onChange={isSinglePlan ? undefined : handleChange}
                          className={`radio radio-primary radio-xs ${
                            isSinglePlan ? "disabled:!opacity-100 disabled:!border-primary cursor-default" : ""
                          }`}
                        />
                      </div>
                      <span className="text-[11px] mt-1.5 font-semibold text-primary">
                        {cls.brandPayout} Brand Payout &bull; {cls.bonus} Bonus Fund
                      </span>
                      <span className="text-[10px] text-base-content/60 mt-0.5">
                        {cls.desc}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Contact Details & Login Credentials */}
            <div>
              <div className="flex items-center justify-between pb-2 mb-4 border-b border-base-200">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/80">
                    3. Contact Person &amp; Account Credentials
                  </h2>
                </div>
                {authenticatedUser && (
                  <span className="text-xs text-success font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated as @{authenticatedUser.username}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Person Name */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">
                      Contact Person Name <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="contact_name"
                    required
                    readOnly={Boolean(authenticatedUser)}
                    placeholder="e.g. Sarah Ahmad"
                    value={formData.contact_name}
                    onChange={handleChange}
                    className={`input input-bordered input-sm w-full ${
                      authenticatedUser ? "bg-base-200/70 cursor-not-allowed text-base-content/80 font-medium" : ""
                    }`}
                  />
                </div>

                {/* Contact Email */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">
                      Contact Email <span className="text-error">*</span>
                    </span>
                    {!authenticatedUser && emailStatus.checking ? (
                      <span className="label-text-alt text-[10px] text-base-content/50 flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Checking...
                      </span>
                    ) : !authenticatedUser && emailStatus.valid === true ? (
                      <span className="label-text-alt text-[10px] text-success flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3" /> Available
                      </span>
                    ) : !authenticatedUser && emailStatus.valid === false ? (
                      <span className="label-text-alt text-[10px] text-info flex items-center gap-1 font-medium">
                        <Sparkles className="w-3 h-3" /> Existing Account Found
                      </span>
                    ) : null}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="contact_email"
                      required
                      readOnly={Boolean(authenticatedUser)}
                      placeholder="partner@yourbrand.com"
                      value={formData.contact_email}
                      onChange={handleChange}
                      className={`input input-bordered input-sm w-full ${
                        authenticatedUser
                          ? "bg-base-200/70 cursor-not-allowed text-base-content/80 font-medium"
                          : "pr-8"
                      }`}
                    />
                    {!authenticatedUser && (
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        {emailStatus.checking ? (
                          <span className="loading loading-spinner loading-xs text-base-content/40" />
                        ) : emailStatus.valid === true ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : emailStatus.valid === false ? (
                          <Sparkles className="w-4 h-4 text-primary" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone Number */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">
                      Phone Number
                    </span>
                    {!authenticatedUser && phoneStatus.checking ? (
                      <span className="label-text-alt text-[10px] text-base-content/50 flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Checking...
                      </span>
                    ) : !authenticatedUser && phoneStatus.valid === true ? (
                      <span className="label-text-alt text-[10px] text-success flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3" /> Valid
                      </span>
                    ) : !authenticatedUser && phoneStatus.valid === false ? (
                      <span className="label-text-alt text-[10px] text-info flex items-center gap-1 font-medium">
                        <Sparkles className="w-3 h-3" /> Registered
                      </span>
                    ) : null}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="contact_phone"
                      readOnly={Boolean(authenticatedUser)}
                      placeholder="e.g. +60123456789"
                      value={formData.contact_phone}
                      onChange={handleChange}
                      className={`input input-bordered input-sm w-full ${
                        authenticatedUser
                          ? "bg-base-200/70 cursor-not-allowed text-base-content/80 font-medium"
                          : "pr-8"
                      }`}
                    />
                    {!authenticatedUser && (
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        {phoneStatus.checking ? (
                          <span className="loading loading-spinner loading-xs text-base-content/40" />
                        ) : phoneStatus.valid === true ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : phoneStatus.valid === false ? (
                          <Sparkles className="w-4 h-4 text-primary" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">
                      Username {authenticatedUser ? "" : "(Optional)"}
                    </span>
                    {!authenticatedUser && usernameStatus.checking ? (
                      <span className="label-text-alt text-[10px] text-base-content/50 flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Checking...
                      </span>
                    ) : !authenticatedUser && usernameStatus.valid === true ? (
                      <span className="label-text-alt text-[10px] text-success flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3" /> Available
                      </span>
                    ) : !authenticatedUser && usernameStatus.valid === false ? (
                      <span className="label-text-alt text-[10px] text-error flex items-center gap-1 font-medium">
                        <X className="w-3 h-3" /> Username taken
                      </span>
                    ) : null}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      readOnly={Boolean(authenticatedUser)}
                      placeholder="e.g. haus_partner"
                      value={formData.username}
                      onChange={handleChange}
                      className={`input input-bordered input-sm w-full ${
                        authenticatedUser
                          ? "bg-base-200/70 cursor-not-allowed text-base-content/80 font-medium font-mono"
                          : `pr-8 ${usernameStatus.valid === false ? "input-error" : ""}`
                      }`}
                    />
                    {!authenticatedUser && (
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        {usernameStatus.checking ? (
                          <span className="loading loading-spinner loading-xs text-base-content/40" />
                        ) : usernameStatus.valid === true ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : usernameStatus.valid === false ? (
                          <XCircle className="w-4 h-4 text-error" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                {/* Password & Confirm Password (only shown if not authenticated) */}
                {!authenticatedUser && (
                  <>
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-xs font-semibold">
                          Password <span className="text-error">*</span>
                        </span>
                        {formData.password && (
                          <span className={`label-text-alt text-[10px] font-bold ${passwordStrengthLabel.text}`}>
                            {passwordStrengthLabel.label}
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          required
                          placeholder="Min. 8 characters"
                          value={formData.password}
                          onChange={handleChange}
                          className="input input-bordered input-sm w-full pr-14"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:underline select-none"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>

                      {/* Password Strength Meter */}
                      {formData.password && (
                        <div className="mt-1.5 space-y-1">
                          <div className="grid grid-cols-4 gap-1 h-1">
                            <div className={`rounded-full ${passwordScore >= 1 ? passwordStrengthLabel.color : "bg-base-300"}`} />
                            <div className={`rounded-full ${passwordScore >= 2 ? passwordStrengthLabel.color : "bg-base-300"}`} />
                            <div className={`rounded-full ${passwordScore >= 3 ? passwordStrengthLabel.color : "bg-base-300"}`} />
                            <div className={`rounded-full ${passwordScore >= 4 ? passwordStrengthLabel.color : "bg-base-300"}`} />
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-base-content/60 pt-0.5">
                            <span className={passwordCriteria.minLength ? "text-success font-medium" : ""}>
                              &bull; 8+ chars
                            </span>
                            <span className={passwordCriteria.hasUpperLower ? "text-success font-medium" : ""}>
                              &bull; Upper/Lower
                            </span>
                            <span className={passwordCriteria.hasNumber ? "text-success font-medium" : ""}>
                              &bull; Number
                            </span>
                            <span className={passwordCriteria.hasSpecial ? "text-success font-medium" : ""}>
                              &bull; Special symbol
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-xs font-semibold">
                          Confirm Password <span className="text-error">*</span>
                        </span>
                        {formData.confirm_password && (
                          <span
                            className={`label-text-alt text-[10px] font-medium ${
                              formData.password === formData.confirm_password
                                ? "text-success"
                                : "text-error"
                            }`}
                          >
                            {formData.password === formData.confirm_password
                              ? "Passwords Match"
                              : "Does Not Match"}
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirm_password"
                          required
                          placeholder="Re-enter password"
                          value={formData.confirm_password}
                          onChange={handleChange}
                          className={`input input-bordered input-sm w-full pr-14 ${
                            formData.confirm_password && formData.password !== formData.confirm_password
                              ? "input-error"
                              : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:underline select-none"
                        >
                          {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Section 4: Registered Office Address */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-base-200">
                <MapPin className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/80">
                  4. Registered Business Address
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="form-control sm:col-span-2 lg:col-span-3">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">Address Line 1</span>
                  </label>
                  <input
                    type="text"
                    name="address_line1"
                    placeholder="Unit / Suite / Street Address"
                    value={formData.address_line1}
                    onChange={handleChange}
                    className="input input-bordered input-sm w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">City</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Shah Alam"
                    value={formData.city}
                    onChange={handleChange}
                    className="input input-bordered input-sm w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">State</span>
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="select select-bordered select-sm w-full text-xs"
                  >
                    {MALAYSIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">Postcode</span>
                  </label>
                  <input
                    type="text"
                    name="postcode"
                    placeholder="e.g. 40150"
                    value={formData.postcode}
                    onChange={handleChange}
                    className="input input-bordered input-sm w-full"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Banking & Payout Details */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-base-200">
                <CreditCard className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/80">
                  5. Payout Bank Account Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bank Name */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">
                      Bank Name
                    </span>
                  </label>
                  <select
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    className="select select-bordered select-sm w-full text-xs"
                  >
                    {BANKS.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bank SWIFT / BIC Code - READONLY */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold flex items-center gap-1">
                      Bank SWIFT / BIC Code
                      <span className="badge badge-ghost badge-xs text-[9px]">Readonly</span>
                    </span>
                    <span className="label-text-alt text-[10px] text-base-content/50">
                      Auto-populated from selected bank
                    </span>
                  </label>
                  <input
                    type="text"
                    name="bank_swift_code"
                    value={formData.bank_swift_code}
                    readOnly
                    className="input input-bordered input-sm w-full bg-base-200/70 font-mono text-base-content/80 cursor-not-allowed"
                  />
                </div>

                {/* Bank Account Number */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">
                      Bank Account Number
                    </span>
                  </label>
                  <input
                    type="text"
                    name="bank_account_number"
                    placeholder="e.g. 514012345678"
                    value={formData.bank_account_number}
                    onChange={handleChange}
                    className="input input-bordered input-sm w-full font-mono"
                  />
                </div>

                {/* Bank Account Holder Name */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-semibold">
                      Account Holder Name
                    </span>
                  </label>
                  <input
                    type="text"
                    name="bank_account_holder"
                    placeholder="e.g. Haus International Sdn Bhd"
                    value={formData.bank_account_holder}
                    onChange={handleChange}
                    className="input input-bordered input-sm w-full"
                  />
                </div>
              </div>
            </div>

            {/* Terms & Conditions Agreement Section */}
            <div className="rounded-2xl border border-base-300 bg-base-200/40 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agree_terms"
                  checked={agreedToTerms}
                  disabled={!hasReadTerms}
                  onChange={(e) => {
                    if (!hasReadTerms) {
                      setIsTermsModalOpen(true);
                    } else {
                      setAgreedToTerms(e.target.checked);
                    }
                  }}
                  className="checkbox checkbox-primary checkbox-sm mt-0.5"
                />
                <div className="text-xs text-base-content/80 leading-relaxed">
                  <label
                    htmlFor="agree_terms"
                    className="cursor-pointer font-medium select-none"
                    onClick={(e) => {
                      if (!hasReadTerms) {
                        e.preventDefault();
                        setIsTermsModalOpen(true);
                      }
                    }}
                  >
                    I have opened, reviewed, and agree to the{" "}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsTermsModalOpen(true)}
                    className="link link-primary font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Terms &amp; Conditions and Merchant Partner Agreement</span>
                    <ExternalLink className="w-3 h-3 inline" />
                  </button>
                  <span className="text-error font-bold"> *</span>

                  {!hasReadTerms ? (
                    <span className="block text-[11px] text-warning mt-1 font-medium">
                      ⚠️ Please click the hyperlink above to open and review the Terms &amp; Conditions before checking this box.
                    </span>
                  ) : (
                    <span className="block text-[11px] text-success mt-1 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success inline" />
                      Terms &amp; Conditions reviewed and verified.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-base-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-base-content/60 text-center sm:text-left">
                By submitting, your vendor application will be verified and your store registered on the Vamoflex Merchant Network.
              </p>
              <button
                type="submit"
                disabled={loading || !agreedToTerms}
                className="btn btn-primary w-full sm:w-auto px-8 text-white font-medium shadow-md shadow-primary/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    <span>Submit &amp; Launch Vendor Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {isTermsModalOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-3xl bg-base-100 p-0 border border-base-300 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-base-200 bg-base-200/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-base-content">
                    Merchant Partner Terms &amp; Conditions
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Official Master Agreement &bull; VAMOFLEX Ecosystem
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Terms Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-base-content/80 leading-relaxed flex-1">
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-primary text-xs">
                    Official Agreement Document
                  </p>
                  <p className="text-[11px] text-base-content/60">
                    Document Ref: HAUSFLEX-TC.pdf (Merchant Master Services Agreement)
                  </p>
                </div>
                <a
                  href="/HAUSFLEX-TC.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-xs gap-1.5 shrink-0"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open PDF</span>
                </a>
              </div>

              <div className="space-y-4 pr-1">
                <section className="space-y-1.5">
                  <h4 className="font-bold text-sm text-base-content">1. Introduction &amp; Merchant Scope</h4>
                  <p>
                    By registering as a Vendor Partner on the VAMOFLEX platform, the Merchant agrees to list, market, and fulfill authentic products through the platform's multi-tier commerce ecosystem.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="font-bold text-sm text-base-content">2. Settlement Structure &amp; Weekly Payout</h4>
                  <p>
                    Settlements are calculated weekly with a cut-off time of Sunday at 11:59 PM (UTC+8). Verified merchant payouts are disbursed on the following Wednesday. The Merchant’s payout percentage is governed by their active Settlement Class (Kelas A to Kelas F), which reserves a 15% platform management fee and designated affiliate network bonus funds.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="font-bold text-sm text-base-content">3. Product Compliance &amp; Regulatory Standards</h4>
                  <p>
                    The Merchant represents and warrants that all products supplied comply with applicable Malaysian laws, regulations, and industry standards (including SSM registration, Ministry of Health / KKM / NPRA notifications where applicable, and Halal / SIRIM certifications if claimed).
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="font-bold text-sm text-base-content">4. Order Processing &amp; Fulfillment SLA</h4>
                  <p>
                    The Merchant agrees to prepare, package, and dispatch orders within the standard service level agreement of 24 to 48 business hours from order placement. Tracking details must be provided promptly to ensure consumer transparency.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="font-bold text-sm text-base-content">5. Privacy &amp; Data Protection (PDPA Act 709)</h4>
                  <p>
                    All customer and partner data obtained in connection with the platform shall be processed strictly in accordance with the Malaysian Personal Data Protection Act 2010 (PDPA) and used solely for fulfilling orders.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h4 className="font-bold text-sm text-base-content">6. Termination &amp; Suspension</h4>
                  <p>
                    Either party may terminate the partnership with written notice pursuant to the terms of the Master Merchant Agreement. Breach of quality standards or counterfeit items will result in immediate suspension.
                  </p>
                </section>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-base-200 bg-base-200/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-base-content/60">
                Please confirm that you have read and understood all clauses.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(false)}
                  className="btn btn-ghost btn-sm text-xs flex-1 sm:flex-none"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasReadTerms(true);
                    setAgreedToTerms(true);
                    setIsTermsModalOpen(false);
                  }}
                  className="btn btn-primary btn-sm text-white font-semibold flex-1 sm:flex-none gap-1.5 shadow-md shadow-primary/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Have Read &amp; Agree</span>
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/* Existing User Login Modal */}
      {isLoginModalOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md bg-base-100 p-6 border border-base-300 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-base-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-base-content">
                    Sign In to Existing Account
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Use your Affiliate or Hausflex credentials
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>

            {loginError && (
              <div className="alert alert-error text-xs mt-4 flex items-center gap-2 text-white">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleExistingLogin} className="space-y-4 mt-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold">
                    Email or Username
                  </span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter email or username"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="input input-bordered input-sm w-full"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold">
                    Password
                  </span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter your account password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="input input-bordered input-sm w-full"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="btn btn-ghost btn-sm text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="btn btn-primary btn-sm text-white font-medium shadow-md shadow-primary/20"
                >
                  {loginLoading ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    "Verify & Auto-Fill"
                  )}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}
