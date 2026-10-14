"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { vendorApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Lock, Mail, User, AlertCircle, ArrowRight } from "lucide-react";
import MaintenanceModal, { MaintenanceData } from "@/components/MaintenanceModal";
import LoginPreparingModal from "@/components/LoginPreparingModal";

export default function LoginForm() {
  const [loginMethod, setLoginMethod] = useState<"email" | "username">("username");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData | null>(null);
  const [isRefreshingMaintenance, setIsRefreshingMaintenance] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [loggedInBrand, setLoggedInBrand] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [isGoogleEnabled, setIsGoogleEnabled] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [activeSettlementPlan, setActiveSettlementPlan] = useState<{
    code: string;
    name: string;
    brandPayout: string;
  }>({
    code: "kelas_b",
    name: "Kelas B",
    brandPayout: "50%",
  });
  const router = useRouter();
  const { login } = useAuth();

  const handleAuthSuccess = useCallback(
    (response: any) => {
      const token = response.access_token || response.token || response.accessToken;
      const user = response.user || {};
      const brand = response.brand || null;

      if (!token) {
        throw new Error("Authentication succeeded but no token was returned.");
      }

      localStorage.setItem("vf_vendor_remember_me", keepLoggedIn ? "true" : "false");

      const isFirstTimeLogin = Boolean(
        user?.first_time_login ||
        user?.must_change_password ||
        response?.must_change_password
      );
      setIsFirstTime(isFirstTimeLogin);

      const userPermissions =
        user?.permissions ||
        user?.modules ||
        response?.permissions ||
        response?.modules ||
        user?.platformAccess?.vendor?.modules ||
        [];
      const refreshToken = response.refresh_token || response.refreshToken;
      if (refreshToken) {
        localStorage.setItem("vf_vendor_refresh_token", refreshToken);
      }
      login(token, user, brand, userPermissions, undefined, refreshToken);
      setLoggedInBrand(brand?.name || user?.brand_name || null);
      setLoggedInUser(user?.name || user?.username || null);
      setIsPreparing(true);
    },
    [keepLoggedIn, login],
  );

  const checkGoogleStatus = useCallback(async () => {
    try {
      const status = await vendorApi.getGoogleStatus();
      if (status && status.enabled) {
        setIsGoogleEnabled(true);
        if (status.googleClientId) {
          setGoogleClientId(status.googleClientId);
        }
      } else {
        setIsGoogleEnabled(false);
      }
    } catch {
      setIsGoogleEnabled(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    vendorApi
      .getSettlementClasses()
      .then((res) => {
        const data = Array.isArray(res) ? res : res?.data;
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item: any) => {
            const brandPct = Math.round(
              Number(item.brand_share_percentage ?? item.brand_share ?? 50)
            );
            const code = (item.code || item.class_code || "kelas_b").toLowerCase();
            return {
              code,
              name:
                item.name ||
                (code === "kelas_a"
                  ? "Kelas A"
                  : code === "kelas_c"
                  ? "Kelas C"
                  : "Kelas B"),
              brandPayout: `${brandPct}%`,
              isRecommended: Boolean(item.is_recommended || item.is_default),
            };
          });

          if (mapped.length > 0) {
            const chosen = mapped.find((m) => m.isRecommended) || mapped[0];
            if (chosen) {
              setActiveSettlementPlan({
                code: chosen.code,
                name: chosen.name,
                brandPayout: chosen.brandPayout,
              });
            }
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const checkMaintenance = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshingMaintenance(true);
    try {
      const status = await vendorApi.getMaintenanceStatus("shop");
      if (status && status.active) {
        setMaintenanceData(status);
      } else {
        setMaintenanceData(null);
      }
    } catch {
      // ignore
    } finally {
      if (!isSilent) setIsRefreshingMaintenance(false);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = "VF Vendor | Sign In";
    }
    checkMaintenance(true);
    checkGoogleStatus();
    const interval = setInterval(() => {
      checkMaintenance(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [checkMaintenance, checkGoogleStatus]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const handoff = urlParams.get("handoff");
    const code = urlParams.get("code");
    const oauthError = urlParams.get("error");

    if (oauthError) {
      setError(decodeURIComponent(oauthError));
      return;
    }

    if (handoff) {
      setGoogleLoading(true);
      vendorApi
        .completeGoogleHandoff(handoff)
        .then((res) => {
          if (res?.needsRegistration) {
            setError("Google account requires registration before sign-in.");
          } else {
            handleAuthSuccess(res);
          }
        })
        .catch((err: any) => {
          setError(err.response?.data?.message || "Google sign-in session expired. Please try again.");
        })
        .finally(() => setGoogleLoading(false));
    } else if (code) {
      setGoogleLoading(true);
      vendorApi
        .exchangeGoogleCode(code)
        .then((res) => {
          if (res?.needsRegistration) {
            setError("Google account requires registration before sign-in.");
          } else {
            handleAuthSuccess(res);
          }
        })
        .catch((err: any) => {
          setError(err.response?.data?.message || "Failed to authenticate with Google.");
        })
        .finally(() => setGoogleLoading(false));
    }
  }, [handleAuthSuccess]);

  const handleGoogleLogin = async () => {
    if (isMaintenanceActive || googleLoading) return;
    setError(null);
    setGoogleLoading(true);

    try {
      if (googleClientId && typeof window !== "undefined" && (window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.prompt();
        return;
      }

      const res = await vendorApi.getGoogleAuthUrl();
      if (res?.authUrl) {
        window.location.href = res.authUrl;
      } else {
        throw new Error("Unable to initialize Google Sign-In. Please try again.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Google sign-in is currently unavailable.",
      );
      setGoogleLoading(false);
    }
  };

  const handleRefreshMaintenance = async () => {
    await checkMaintenance(false);
  };

  const isMaintenanceActive = Boolean(maintenanceData?.active);

  const handleMethodChange = (method: "email" | "username") => {
    setLoginMethod(method);
    setIdentifier("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMaintenanceActive) return;
    setError(null);

    if (!identifier.trim()) {
      setError(
        loginMethod === "email"
          ? "Please enter your email address."
          : "Please enter your username.",
      );
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const payload =
        loginMethod === "email" || identifier.includes("@")
          ? { email: identifier.trim(), password }
          : { username: identifier.trim(), password };

      const response = await vendorApi.login(payload);
      handleAuthSuccess(response);
    } catch (err: any) {
      if (err.response?.status === 503 || err.response?.data?.code === "maintenance") {
        await checkMaintenance(false);
      }
      const apiMsg = err.response?.data?.message || err.response?.data?.error;
      setError(
        apiMsg ||
          err.message ||
          "Failed to log in. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="w-full max-w-md py-4 sm:py-8"
    >
      <div
        suppressHydrationWarning
        className="card w-full bg-base-100/95 backdrop-blur-xl shadow-2xl border border-base-300/80 rounded-3xl overflow-hidden relative"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-accent" />
        <div suppressHydrationWarning className="card-body p-7 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src="/images/logo/logo.png"
              alt="VAMOFLEX"
              className="h-20 sm:h-18 w-auto object-contain mb-2"
            />
            <span className="badge badge-primary badge-outline text-[10px] font-bold uppercase tracking-wider">
              Vendor Partner Portal
            </span>
            <p className="text-xs text-base-content/60 mt-2">
              Sign in to manage your brand products, settlements & reporting
            </p>
          </div>

          {error && (
            <div className="alert alert-error text-sm py-2 px-3 mb-4 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div
              role="tablist"
              className="tabs p-0 tabs-box w-full bg-base-200/50 rounded-xl border border-base-300/25"
            >
              <button
                type="button"
                role="tab"
                disabled={isMaintenanceActive || loading}
                className={`tab flex-1 gap-2 text-xs sm:text-sm font-semibold transition-all duration-200 border border-transparent rounded-l-lg ${
                  loginMethod === "email"
                    ? "tab-active bg-primary text-primary-content shadow-sm"
                    : "text-base-content/55 hover:text-base-content hover:bg-base-100/70"
                }`}
                onClick={() => handleMethodChange("email")}
              >
                <Mail className="w-4 h-4 shrink-0" />
                Email
              </button>
              <button
                type="button"
                role="tab"
                disabled={isMaintenanceActive || loading}
                className={`tab flex-1 gap-2 text-xs sm:text-sm font-semibold transition-all duration-200 border border-transparent rounded-r-lg ${
                  loginMethod === "username"
                    ? "tab-active bg-primary text-primary-content shadow-sm"
                    : "text-base-content/55 hover:text-base-content hover:bg-base-100/70"
                }`}
                onClick={() => handleMethodChange("username")}
              >
                <User className="w-4 h-4 shrink-0" />
                Username
              </button>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-medium text-xs">
                  {loginMethod === "email" ? "Email Address" : "Username"}{" "}
                  <span className="text-error">*</span>
                </span>
              </label>
              <label className="input input-bordered w-full flex items-center gap-2 transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                {loginMethod === "email" ? (
                  <Mail className="w-4 h-4 text-base-content/40 shrink-0" />
                ) : (
                  <User className="w-4 h-4 text-base-content/40 shrink-0" />
                )}
                <input
                  type={loginMethod === "email" ? "email" : "text"}
                  disabled={isMaintenanceActive || loading}
                  placeholder={
                    loginMethod === "email"
                      ? "vendor@brand.com"
                      : "Enter your username"
                  }
                  className="grow bg-transparent min-h-0 h-auto border-0 p-0 focus:outline-none text-sm disabled:opacity-50"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete={loginMethod === "email" ? "email" : "username"}
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-medium text-xs">
                  Password <span className="text-error">*</span>
                </span>
              </label>
              <label className="input input-bordered w-full flex items-center gap-2 transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Lock className="w-4 h-4 text-base-content/40 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  disabled={isMaintenanceActive || loading}
                  placeholder="••••••••"
                  className="grow bg-transparent min-h-0 h-auto border-0 p-0 focus:outline-none text-sm disabled:opacity-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  disabled={isMaintenanceActive || loading}
                  className="btn btn-ghost btn-xs shrink-0 font-medium"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </label>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="label cursor-pointer gap-2 p-0">
                <input
                  type="checkbox"
                  disabled={isMaintenanceActive || loading}
                  className="checkbox checkbox-primary checkbox-xs"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                />
                <span className="label-text text-xs text-base-content/70">
                  Keep me logged in
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="link link-primary font-medium hover:underline text-xs"
              >
                Forgot password?
              </Link>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={loading || isMaintenanceActive}
                className="btn btn-primary w-full text-white font-medium shadow-md shadow-primary/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <span>Sign In to Vendor Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {isGoogleEnabled && (
                <div className="space-y-3 pt-1">
                  <div className="divider text-[11px] font-medium text-base-content/40 uppercase tracking-wider my-0">
                    or
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading || googleLoading || isMaintenanceActive}
                    className="btn btn-outline w-full border-base-300/80 hover:bg-base-200/80 hover:border-base-300 text-base-content font-medium flex items-center justify-center gap-3 h-11 min-h-[44px] shadow-sm transition-all"
                  >
                    {googleLoading ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Sign in with Google</span>
                  </button>
                </div>
              )}

              <div className="text-center pt-2">
                <span className="text-xs text-base-content/60">Want to sell with us? </span>
                <Link
                  href="/register"
                  className="link link-primary font-semibold text-xs hover:underline"
                >
                  Register as a Brand Partner &rarr;
                </Link>
              </div>
            </div>
          </form>

          <div className="divider my-4 text-xs text-base-content/40">
            Marketplace Settlement Policy
          </div>
          <div className="rounded-xl bg-base-200/60 p-3 text-xs text-base-content/70 space-y-1">
            <div className="flex items-center justify-between font-medium gap-2">
              <span className="shrink-0">Current Active:</span>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <span className="text-primary font-bold">
                  {activeSettlementPlan.name} ({activeSettlementPlan.brandPayout} Payout)
                </span>
                <span className="badge badge-warning badge-xs text-[10px] font-semibold">
                  Recommend only
                </span>
              </div>
            </div>
            <div className="flex justify-between text-base-content/60">
              <span>Weekly Payout Cutoff:</span>
              <span>Sunday 11:59 PM (Wed Payout)</span>
            </div>
          </div>

          <div className="divider my-4 text-xs text-base-content/30" />
          <p
            suppressHydrationWarning
            className="text-center text-[11px] text-base-content/50"
          >
            &copy; {new Date().getFullYear()} VAMOFLEX. All rights reserved.
          </p>
        </div>
      </div>

      <LoginPreparingModal
        isOpen={isPreparing}
        brandName={loggedInBrand}
        userName={loggedInUser}
        onComplete={() => {
          if (isFirstTime) {
            router.push("/first-time-setup");
          } else {
            router.push("/vendor-portal/dashboard");
          }
        }}
      />

      <MaintenanceModal
        isOpen={isMaintenanceActive}
        maintenanceData={maintenanceData}
        onRefresh={handleRefreshMaintenance}
        isRefreshing={isRefreshingMaintenance}
      />
    </div>
  );
}

