import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.hausinternational.my";
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000";
const AUTH_API_KEY =
  process.env.NEXT_PUBLIC_AUTH_API_KEY ||
  process.env.NEXT_PUBLIC_API_KEY ||
  "ak_live_FYc7jzoq7Hm-DqG0ViycMntkXxUOh_Hc4aIE1qDADBo";

const VENDOR_DEFAULT_COUNTRY =
  process.env.APP_COUNTRY ||
  process.env.NEXT_PUBLIC_APP_COUNTRY ||
  process.env.NEXT_PUBLIC_COUNTRY_ORIGIN ||
  process.env.NEXT_PUBLIC_COUNTRY ||
  process.env.NEXT_PUBLIC_DEFAULT_COUNTRY ||
  "MY";

const VENDOR_DEFAULT_LANGUAGE =
  process.env.APP_LANGUAGE ||
  process.env.NEXT_PUBLIC_APP_LANGUAGE ||
  process.env.NEXT_PUBLIC_LANGUAGE ||
  "en_MS";

const VENDOR_DEFAULT_TIMEZONE =
  process.env.TIMEZONE ||
  process.env.NEXT_PUBLIC_TIMEZONE ||
  "Asia/Kuala_Lumpur";

export const getCountryOrigin = (): string => {
  if (typeof window !== "undefined") {
    const saved =
      localStorage.getItem("vf_vendor_country") ||
      localStorage.getItem("x-country-origin");
    if (saved && saved.trim()) return saved.trim().toUpperCase();
  }
  return VENDOR_DEFAULT_COUNTRY.toUpperCase();
};

export const getAppLanguage = (): string => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("vf_vendor_language") || localStorage.getItem("x-app-language");
    if (saved && saved.trim()) return saved.trim();
  }
  return VENDOR_DEFAULT_LANGUAGE;
};

export const getAppTimezone = (): string => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("vf_vendor_timezone") || localStorage.getItem("x-timezone");
    if (saved && saved.trim()) return saved.trim();
  }
  return VENDOR_DEFAULT_TIMEZONE;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-platform": "vendor",
    "x-client-platform": "vendor",
    "x-country-origin": VENDOR_DEFAULT_COUNTRY,
    "x-api-key": AUTH_API_KEY,
  },
});

export const authClient = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-platform": "vendor",
    "x-client-platform": "vendor",
    "x-country-origin": VENDOR_DEFAULT_COUNTRY,
    "x-api-key": AUTH_API_KEY,
  },
});

apiClient.interceptors.request.use((config) => {
  const key =
    process.env.NEXT_PUBLIC_AUTH_API_KEY ||
    process.env.NEXT_PUBLIC_API_KEY ||
    AUTH_API_KEY;
  if (key) {
    config.headers["x-api-key"] = key;
  }
  const country = getCountryOrigin();
  config.headers["x-country-origin"] = country;
  config.headers["x-country"] = country;
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("vf_vendor_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const activeBrandId = localStorage.getItem("vf_vendor_active_brand_id");
    if (activeBrandId) {
      config.headers["X-Brand-Id"] = activeBrandId;
    }
  }
  return config;
});

authClient.interceptors.request.use((config) => {
  const key =
    process.env.NEXT_PUBLIC_AUTH_API_KEY ||
    process.env.NEXT_PUBLIC_API_KEY ||
    AUTH_API_KEY;
  if (key) {
    config.headers["x-api-key"] = key;
  }
  const country = getCountryOrigin();
  config.headers["x-country-origin"] = country;
  config.headers["x-country"] = country;
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("vf_vendor_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const activeBrandId = localStorage.getItem("vf_vendor_active_brand_id");
    if (activeBrandId) {
      config.headers["X-Brand-Id"] = activeBrandId;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      const isAuthUrl = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/admin/login");
      if (!isAuthUrl) {
        localStorage.removeItem("vf_vendor_token");
        localStorage.removeItem("vf_vendor_refresh_token");
        localStorage.removeItem("vf_vendor_user");
        localStorage.removeItem("vf_vendor_brand");
        window.dispatchEvent(new CustomEvent("vf:session-expired"));
      }
    }
    return Promise.reject(error);
  },
);

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      const isAuthUrl =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/admin/login") ||
        error.config?.url?.includes("/auth/google/status");
      if (!isAuthUrl) {
        localStorage.removeItem("vf_vendor_token");
        localStorage.removeItem("vf_vendor_refresh_token");
        localStorage.removeItem("vf_vendor_user");
        localStorage.removeItem("vf_vendor_brand");
        window.dispatchEvent(new CustomEvent("vf:session-expired"));
      }
    }
    return Promise.reject(error);
  },
);

export const vendorApi = {
  // Auth
  login: async (credentials: {
    email?: string;
    username?: string;
    password: string;
    platform?: string;
  }) => {
    const response = await authClient.post("/v1/auth/login", {
      ...credentials,
      platform: "vendor",
    });
    return response.data?.data || response.data;
  },

  logout: async () => {
    try {
      await authClient.post("/v1/auth/logout");
    } catch {
      // ignore network errors on logout
    }
  },

  getGoogleStatus: async () => {
    try {
      const response = await authClient.get("/v1/auth/google/status", {
        params: { platform: "vendor" },
      });
      return response.data?.data || response.data;
    } catch {
      return { enabled: false, globallyEnabled: false };
    }
  },

  getGoogleAuthUrl: async (oauthTrace?: string) => {
    const response = await authClient.get("/v1/auth/google/url", {
      params: oauthTrace ? { oauth_trace: oauthTrace } : undefined,
    });
    return response.data?.data || response.data;
  },

  googleSignIn: async (token: string) => {
    const response = await authClient.post("/v1/auth/google", { token });
    return response.data?.data || response.data;
  },

  exchangeGoogleCode: async (code: string) => {
    const response = await authClient.post("/v1/auth/google/exchange", { code });
    return response.data?.data || response.data;
  },

  completeGoogleHandoff: async (handoff: string) => {
    const response = await authClient.post("/v1/auth/google/complete", { handoff });
    return response.data?.data || response.data;
  },

  registerVendor: async (payload: any) => {
    const response = await apiClient.post("/v1/public/vendor/register", payload);
    return response.data;
  },

  getSettlementClasses: async () => {
    try {
      const response = await apiClient.get("/v1/public/vendor/classes");
      return response.data?.data || response.data;
    } catch {
      return null;
    }
  },

  checkUsername: async (username: string) => {
    const response = await apiClient.post("/v1/auth/check-username", { username });
    return response.data;
  },

  checkPhone: async (phone: string) => {
    const response = await apiClient.post("/v1/auth/check-phone", { phone });
    return response.data;
  },

  checkEmail: async (email: string) => {
    const response = await apiClient.post("/v1/auth/check-email", { email });
    return response.data;
  },

  uploadVendorMedia: async (file: File, folder: string = "vendor_documents") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const response = await apiClient.post("/v1/public/vendor/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  sendFirstTimeOtp: async () => {
    const response = await apiClient.post("/v1/vendor/portal/first-time-setup/send-otp");
    return response.data;
  },

  updateFirstTimePassword: async (data: {
    otp: string;
    password: string;
    password_confirmation: string;
  }) => {
    const response = await apiClient.post("/v1/vendor/portal/first-time-setup/update-password", data);
    return response.data;
  },

  forgotPassword: async (data: {
    identifier: string;
    login_type: "email" | "username";
  }) => {
    const response = await apiClient.post("/v1/auth/admin/forgot-password", data);
    return response.data;
  },

  verifyToken: async () => {
    const response = await authClient.get("/v1/auth/verify");
    return response.data?.data || response.data;
  },

  getAuthUser: async () => {
    const response = await authClient.get("/v1/auth/verify");
    return response.data?.data || response.data;
  },

  getModules: async (platform: string = "vendor") => {
    const response = await authClient.get("/v1/auth/modules", {
      params: { platform },
    });
    return response.data?.data || response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await authClient.post("/v1/auth/refresh", {
      refreshToken,
      refresh_token: refreshToken,
    });
    return response.data?.data || response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get("/v1/vendor/portal/profile");
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.put("/v1/vendor/portal/profile", data);
    return response.data;
  },

  // Dashboard
  getDashboard: async () => {
    const response = await apiClient.get("/v1/vendor/portal/dashboard");
    return response.data;
  },

  // Brands
  getBrands: async () => {
    const response = await apiClient.get("/v1/vendor/portal/brands");
    return response.data;
  },

  getBrandTemplate: async () => {
    const response = await apiClient.get("/v1/vendor/portal/brands/template");
    return response.data;
  },

  createBrand: async (data: any) => {
    const response = await apiClient.post("/v1/vendor/portal/brands", data);
    return response.data;
  },

  // Products
  getProducts: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
  }) => {
    const response = await apiClient.get("/v1/vendor/portal/products", {
      params,
    });
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await apiClient.get(`/v1/vendor/portal/products/${id}`);
    return response.data;
  },

  createProduct: async (data: any) => {
    const response = await apiClient.post("/v1/vendor/portal/products", data);
    return response.data;
  },

  updateProduct: async (id: string, data: any) => {
    const response = await apiClient.put(
      `/v1/vendor/portal/products/${id}`,
      data,
    );
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/v1/vendor/portal/products/${id}`);
    return response.data;
  },

  // Reporting
  getReporting: async (params?: { start_date?: string; end_date?: string }) => {
    const response = await apiClient.get("/v1/vendor/portal/reporting", {
      params,
    });
    return response.data;
  },

  // Accounting & Statements
  getStatements: async (params?: { page?: number; per_page?: number }) => {
    const response = await apiClient.get("/v1/vendor/portal/statements", {
      params,
    });
    return response.data;
  },

  getStatement: async (id: string) => {
    const response = await apiClient.get(`/v1/vendor/portal/statements/${id}`);
    return response.data;
  },

  // Class Change
  getClassChangeStatus: async () => {
    const response = await apiClient.get(
      "/v1/vendor/portal/class-change-requests/history",
    );
    return response.data;
  },

  submitClassChange: async (data: {
    requested_class: string;
    reason?: string;
  }) => {
    const response = await apiClient.post(
      "/v1/vendor/portal/class-change-requests",
      data,
    );
    return response.data;
  },

  // Notifications
  getNotifications: async (params?: { page?: number; per_page?: number }) => {
    const response = await apiClient.get("/v1/notifications", { params });
    const payload = response.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.notifications)) return payload.notifications;
    return [];
  },

  getUnreadNotificationsCount: async () => {
    const response = await apiClient.get("/v1/notifications/unread-count");
    return response.data?.count ?? 0;
  },

  markNotificationAsRead: async (id: string) => {
    const response = await apiClient.post(`/v1/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsAsRead: async () => {
    const response = await apiClient.post("/v1/notifications/read-all");
    return response.data;
  },

  // Push Devices (FCM)
  registerPushDevice: async (data: {
    platform: string;
    fcm_token: string;
    device_id: string;
    device_label?: string;
    app_version?: string;
  }) => {
    const response = await apiClient.post("/v1/devices/register", data);
    return response.data;
  },

  revokePushDevice: async (deviceId: string) => {
    const response = await apiClient.delete(`/v1/devices/${deviceId}`);
    return response.data;
  },

  // Maintenance Status
  getMaintenanceStatus: async (app = "shop") => {
    try {
      const response = await apiClient.get("/v1/public/maintenance/status", {
        params: { app },
      });
      return response.data?.data || response.data || null;
    } catch (error: any) {
      if (error.response?.data?.data) {
        return error.response.data.data;
      }
      return null;
    }
  },

  // Announcements
  getAnnouncements: async (categories: string[] = ["global", "vf-vendor"]) => {
    try {
      const response = await apiClient.get("/v1/public/announcements", {
        params: { categories: categories.join(",") },
      });
      const resData = response.data?.data || response.data;
      return Array.isArray(resData) ? resData : [];
    } catch {
      return [];
    }
  },

  // Customer Cashback Rules (Brand-scoped)
  getCashbackRules: async (params?: any) => {
    const response = await apiClient.get("/v1/vendor/portal/cashback-rules", { params });
    return response.data;
  },

  createCashbackRule: async (data: any) => {
    const response = await apiClient.post("/v1/vendor/portal/cashback-rules", data);
    return response.data;
  },

  updateCashbackRule: async (id: string | number, data: any) => {
    const response = await apiClient.put(`/v1/vendor/portal/cashback-rules/${id}`, data);
    return response.data;
  },

  deleteCashbackRule: async (id: string | number) => {
    const response = await apiClient.delete(`/v1/vendor/portal/cashback-rules/${id}`);
    return response.data;
  },
};

