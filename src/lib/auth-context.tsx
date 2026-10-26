'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Brand } from './types';
import { vendorApi } from './api';
import { useRouter } from 'next/navigation';

interface VendorPortalConfig {
  allow_plan_change: boolean;
  plan_change_cooldown_days?: number;
  cooldown_active?: boolean;
  cooldown_ends_at?: string;
  cooldown_days_remaining?: number;
  last_changed_at?: string;
  payout_mode?: 'manual' | 'auto';
  cutoff_day?: string;
  cutoff_time?: string;
  payout_day?: string;
  payout_time?: string;
  buffer_days?: number;
  notify_vendor?: boolean;
}

interface AuthContextType {
  token: string | null;
  user: any | null;
  brand: Brand | null;
  brands: Brand[];
  activeBrandId: string | null;
  switchBrand: (brandId: string) => Promise<void>;
  isAddBrandModalOpen: boolean;
  openAddBrandModal: () => void;
  closeAddBrandModal: () => void;
  roles: string[];
  permissions: string[];
  vendorConfig: VendorPortalConfig;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSessionExpired: boolean;
  onboardingCompleted: boolean;
  isOnboardingOpen: boolean;
  startOnboarding: () => void;
  closeOnboarding: () => void;
  completeOnboarding: () => Promise<void>;
  login: (
    token: string,
    user: any,
    brand?: Brand,
    permissions?: string[],
    config?: VendorPortalConfig,
    refreshToken?: string
  ) => void;
  logout: () => void;
  updateUser: (updatedUser: any) => void;
  refreshBrand: () => Promise<void>;
  refreshModules: () => Promise<any>;
  dismissSessionExpired: () => void;
  hasPermission: (permission: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState<boolean>(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [vendorConfig, setVendorConfig] = useState<VendorPortalConfig>({
    allow_plan_change: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const router = useRouter();

  const triggerSessionExpired = React.useCallback(() => {
    localStorage.removeItem("vf_vendor_token");
    localStorage.removeItem("vf_vendor_user");
    localStorage.removeItem("vf_vendor_brand");
    localStorage.removeItem("vf_vendor_brands");
    localStorage.removeItem("vf_vendor_active_brand_id");
    localStorage.removeItem("vf_vendor_permissions");
    localStorage.removeItem("vf_vendor_config");
    localStorage.removeItem("vf_vendor_remember_me");
    localStorage.removeItem("vf_vendor_last_activity");
    setToken(null);
    setUser(null);
    setBrand(null);
    setBrands([]);
    setActiveBrandId(null);
    setRoles([]);
    setPermissions([]);
    setIsSessionExpired(true);
  }, []);

  const dismissSessionExpired = React.useCallback(() => {
    setIsSessionExpired(false);
    router.push("/login");
  }, [router]);

  const refreshModules = React.useCallback(async () => {
    try {
      const authData = await vendorApi.getModules("vendor");
      const authPermissions = authData?.modules || authData?.permissions;
      if (Array.isArray(authPermissions) && authPermissions.length > 0) {
        setPermissions(authPermissions);
        localStorage.setItem(
          "vf_vendor_permissions",
          JSON.stringify(authPermissions)
        );
        return authPermissions;
      }
    } catch {
      try {
        const verifyData = await vendorApi.verifyToken();
        const verifyUser = verifyData?.user || verifyData;
        const verifyPerms =
          verifyUser?.permissions ||
          verifyUser?.modules ||
          verifyUser?.platformAccess?.vendor?.modules;
        if (Array.isArray(verifyPerms) && verifyPerms.length > 0) {
          setPermissions(verifyPerms);
          localStorage.setItem(
            "vf_vendor_permissions",
            JSON.stringify(verifyPerms)
          );
          return verifyPerms;
        }
      } catch {}
    }
    return null;
  }, []);

  const refreshBrand = React.useCallback(async () => {
    try {
      await refreshModules();

      const data = await vendorApi.getProfile();
      if (data.brands && Array.isArray(data.brands)) {
        setBrands(data.brands);
        localStorage.setItem("vf_vendor_brands", JSON.stringify(data.brands));
      }
      if (data.active_brand_id) {
        setActiveBrandId(String(data.active_brand_id));
        localStorage.setItem("vf_vendor_active_brand_id", String(data.active_brand_id));
      }
      if (data.brand) {
        if (!data.active_brand_id) {
          setActiveBrandId(String(data.brand.id));
          localStorage.setItem("vf_vendor_active_brand_id", String(data.brand.id));
        }
        const brandWithClasses = {
          ...data.brand,
          available_classes: data.available_classes || data.brand.available_classes || null,
        };
        setBrand(brandWithClasses);
        localStorage.setItem("vf_vendor_brand", JSON.stringify(brandWithClasses));
      }
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("vf_vendor_user", JSON.stringify(data.user));
        const isDone = data.user.onboarding_completed !== undefined
          ? Boolean(data.user.onboarding_completed)
          : true;
        setOnboardingCompleted(isDone);
        if (!isDone) {
          setIsOnboardingOpen(true);
        }
      }
      if (data.roles) {
        setRoles(data.roles);
      }
      if (data.config) {
        setVendorConfig(data.config);
        localStorage.setItem(
          "vf_vendor_config",
          JSON.stringify(data.config)
        );
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        triggerSessionExpired();
      }
    }
  }, [refreshModules, triggerSessionExpired]);

  const openAddBrandModal = () => setIsAddBrandModalOpen(true);
  const closeAddBrandModal = () => setIsAddBrandModalOpen(false);

  const switchBrand = React.useCallback(async (brandId: string) => {
    localStorage.setItem("vf_vendor_active_brand_id", String(brandId));
    setActiveBrandId(String(brandId));
    const targetBrand = brands.find((b) => String(b.id) === String(brandId));
    if (targetBrand) {
      setBrand(targetBrand);
      localStorage.setItem("vf_vendor_brand", JSON.stringify(targetBrand));
    }
    await refreshBrand();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vf:brand-switched", { detail: { brandId } }));
    }
  }, [brands, refreshBrand]);

  const startOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
  };

  const completeOnboarding = async () => {
    try {
      await vendorApi.updateProfile({ onboarding_completed: true });
      setOnboardingCompleted(true);
      setIsOnboardingOpen(false);
      if (user) {
        const updatedUser = { ...user, onboarding_completed: true };
        setUser(updatedUser);
        localStorage.setItem("vf_vendor_user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Failed to persist onboarding completion:", err);
      setOnboardingCompleted(true);
      setIsOnboardingOpen(false);
    }
  };

  useEffect(() => {
    const handleSessionExpiredEvent = () => {
      triggerSessionExpired();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "vf_vendor_token") {
        if (!e.newValue) {
          // Token removed in another tab
          setToken(null);
          setUser(null);
          setBrand(null);
          setRoles([]);
          setPermissions([]);
          setIsSessionExpired(false);
          router.push("/login");
        } else if (e.newValue && e.newValue !== token) {
          // Logged in from another tab
          setToken(e.newValue);
          try {
            const savedUser = localStorage.getItem("vf_vendor_user");
            const savedBrand = localStorage.getItem("vf_vendor_brand");
            const savedBrands = localStorage.getItem("vf_vendor_brands");
            const savedActiveBrandId = localStorage.getItem("vf_vendor_active_brand_id");
            const savedPermissions = localStorage.getItem("vf_vendor_permissions");
            const savedConfig = localStorage.getItem("vf_vendor_config");
            if (savedUser) {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
              if (parsedUser.onboarding_completed !== undefined) {
                setOnboardingCompleted(Boolean(parsedUser.onboarding_completed));
              }
            }
            if (savedBrand) setBrand(JSON.parse(savedBrand));
        if (savedBrands) {
          try { setBrands(JSON.parse(savedBrands)); } catch {}
        }
        if (savedActiveBrandId) setActiveBrandId(savedActiveBrandId);
            if (savedPermissions) setPermissions(JSON.parse(savedPermissions));
            if (savedConfig) setVendorConfig(JSON.parse(savedConfig));
          } catch {
            // ignore JSON parse errors
          }
          setIsSessionExpired(false);
        }
      }
    };

    window.addEventListener("vf:session-expired", handleSessionExpiredEvent);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener(
        "vf:session-expired",
        handleSessionExpiredEvent
      );
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [triggerSessionExpired, token, router]);

  // Periodic Token Verification Checker
  useEffect(() => {
    if (!token) return;

    const verifyAuthToken = async () => {
      try {
        const verifyRes = await vendorApi.verifyToken();
        if (verifyRes && (verifyRes.isValid === false || verifyRes.valid === false)) {
          const refreshToken = localStorage.getItem("vf_vendor_refresh_token");
          if (refreshToken) {
            try {
              const refreshRes = await vendorApi.refreshToken(refreshToken);
              const newAccessToken = refreshRes?.access_token || refreshRes?.token;
              if (newAccessToken) {
                localStorage.setItem("vf_vendor_token", newAccessToken);
                setToken(newAccessToken);
                if (refreshRes?.refresh_token || refreshRes?.refreshToken) {
                  localStorage.setItem(
                    "vf_vendor_refresh_token",
                    refreshRes.refresh_token || refreshRes.refreshToken,
                  );
                }
                await refreshBrand();
                return;
              }
            } catch {
              triggerSessionExpired();
              return;
            }
          }
          triggerSessionExpired();
          return;
        }
        await refreshBrand();
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.data?.details?.error_code === "PLATFORM_DISABLED") {
          triggerSessionExpired();
        }
      }
    };

    verifyAuthToken();
    const interval = setInterval(verifyAuthToken, 30000);
    return () => clearInterval(interval);
  }, [token, triggerSessionExpired]);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("vf_vendor_token");
      const savedUser = localStorage.getItem("vf_vendor_user");
      const savedBrand = localStorage.getItem("vf_vendor_brand");
      const savedBrands = localStorage.getItem("vf_vendor_brands");
      const savedActiveBrandId = localStorage.getItem("vf_vendor_active_brand_id");
      const savedPermissions = localStorage.getItem("vf_vendor_permissions");
      const savedConfig = localStorage.getItem("vf_vendor_config");

      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          if (parsedUser.onboarding_completed !== undefined) {
            const isDone = Boolean(parsedUser.onboarding_completed);
            setOnboardingCompleted(isDone);
            if (!isDone) {
              setIsOnboardingOpen(true);
            }
          }
        }
        if (savedBrand) setBrand(JSON.parse(savedBrand));
        if (savedBrands) {
          try { setBrands(JSON.parse(savedBrands)); } catch {}
        }
        if (savedActiveBrandId) setActiveBrandId(savedActiveBrandId);
        if (savedPermissions) setPermissions(JSON.parse(savedPermissions));
        if (savedConfig) setVendorConfig(JSON.parse(savedConfig));
        setIsLoading(false);
        refreshBrand();
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
    }
  }, []);

  const login = (
    newToken: string,
    newUser: any,
    newBrand?: Brand,
    newPermissions?: string[],
    newConfig?: VendorPortalConfig,
    newRefreshToken?: string
  ) => {
    localStorage.setItem("vf_vendor_token", newToken);
    if (newRefreshToken) {
      localStorage.setItem("vf_vendor_refresh_token", newRefreshToken);
    }
    localStorage.setItem("vf_vendor_user", JSON.stringify(newUser));
    if (newBrand) {
      localStorage.setItem("vf_vendor_brand", JSON.stringify(newBrand));
      setBrand(newBrand);
    }
    if (newPermissions) {
      localStorage.setItem(
        "vf_vendor_permissions",
        JSON.stringify(newPermissions)
      );
      setPermissions(newPermissions);
    }
    if (newConfig) {
      localStorage.setItem("vf_vendor_config", JSON.stringify(newConfig));
      setVendorConfig(newConfig);
    }
    setToken(newToken);
    setUser(newUser);
    const isDone = newUser?.onboarding_completed !== undefined
      ? Boolean(newUser.onboarding_completed)
      : true;
    setOnboardingCompleted(isDone);
    if (!isDone) {
      setIsOnboardingOpen(true);
    }
    setIsSessionExpired(false);
    refreshBrand();
  };

  const logout = () => {
    vendorApi.logout();
    localStorage.removeItem("vf_vendor_token");
    localStorage.removeItem("vf_vendor_refresh_token");
    localStorage.removeItem("vf_vendor_user");
    localStorage.removeItem("vf_vendor_brand");
    localStorage.removeItem("vf_vendor_brands");
    localStorage.removeItem("vf_vendor_active_brand_id");
    localStorage.removeItem("vf_vendor_permissions");
    localStorage.removeItem("vf_vendor_config");
    localStorage.removeItem("vf_vendor_remember_me");
    localStorage.removeItem("vf_vendor_last_activity");
    setToken(null);
    setUser(null);
    setBrand(null);
    setBrands([]);
    setActiveBrandId(null);
    setRoles([]);
    setPermissions([]);
    setIsSessionExpired(false);
    setIsOnboardingOpen(false);
    router.push("/login");
  };

  const updateUser = (updatedUser: any) => {
    setUser((prev: any) => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem("vf_vendor_user", JSON.stringify(merged));
      return merged;
    });
  };

  const hasPermission = React.useCallback(
    (permission: string | string[]): boolean => {
      // Admin / Superadmin override
      if (
        roles.includes("superadmin") ||
        roles.includes("admin") ||
        roles.includes("system")
      ) {
        return true;
      }

      // No permissions array loaded yet or empty
      if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
        return false;
      }

      // Wildcard check
      if (permissions.includes("*")) {
        return true;
      }

      if (Array.isArray(permission)) {
        return permission.some((p) => permissions.includes(p));
      }

      return permissions.includes(permission);
    },
    [permissions, roles]
  );

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        brand,
        brands,
        activeBrandId,
        switchBrand,
        isAddBrandModalOpen,
        openAddBrandModal,
        closeAddBrandModal,
        roles,
        permissions,
        vendorConfig,
        isLoading,
        isAuthenticated: !!token,
        isSessionExpired,
        onboardingCompleted,
        isOnboardingOpen,
        startOnboarding,
        closeOnboarding,
        completeOnboarding,
        login,
        logout,
        updateUser,
        refreshBrand,
        refreshModules,
        dismissSessionExpired,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
