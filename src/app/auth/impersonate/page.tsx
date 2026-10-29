"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { vendorApi } from "@/lib/api";
import { Sparkles, ShieldCheck, AlertCircle } from "lucide-react";

function ImpersonateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("Authenticating vendor session...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("No authentication token provided.");
      return;
    }

    const authenticateImpersonation = async () => {
      try {
        setStatusText("Verifying session permissions...");
        // Temporarily store token so vendorApi uses it for profile lookup
        localStorage.setItem("vf_vendor_token", token);
        const brandId = searchParams.get("brand_id");
        if (brandId) {
          localStorage.setItem("vf_vendor_active_brand_id", brandId);
        }

        const res = await vendorApi.getProfile();
        const brand = res.brand || null;
        const user = res.user || { username: brand?.code || "vendor" };
        const permissions = res.permissions || [];
        const config = res.config || { allow_plan_change: true };

        login(token, user, brand, permissions, config);
        setStatusText("Session authenticated. Redirecting to Vendor Hub...");

        setTimeout(() => {
          router.replace("/vendor-portal/dashboard");
        }, 400);
      } catch (err: any) {
        console.error("Impersonation error:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to authenticate vendor session. Token may be invalid or expired."
        );
      }
    };

    authenticateImpersonation();
  }, [searchParams, login, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-300 flex items-center justify-center p-4">
        <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300 p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-base-content">Impersonation Failed</h2>
          <p className="text-xs text-base-content/70 leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="btn btn-primary btn-sm w-full text-white font-bold mt-2"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-300 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300 p-8 text-center space-y-5">
        <div className="relative mx-auto flex items-center justify-center w-16 h-16">
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 relative z-10">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div>
          <span className="badge badge-primary badge-outline text-[10px] font-bold uppercase tracking-wider mb-2">
            Admin Impersonation
          </span>
          <h2 className="text-xl font-black text-base-content tracking-tight">
            VAMOFLEX Vendor Portal
          </h2>
          <p className="text-xs text-base-content/60 mt-1">{statusText}</p>
        </div>

        <div className="w-full bg-base-200 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent preloader-bar-indeterminate rounded-full w-1/3" />
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-base-content/50 pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>Secure Impersonation Handshake Active</span>
        </div>
      </div>
    </div>
  );
}

export default function ImpersonatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-base-200 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      }
    >
      <ImpersonateContent />
    </Suspense>
  );
}
