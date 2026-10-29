"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Receipt,
  Store,
  LogOut,
  Calendar,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  PanelLeft,
  Boxes,
  PlusCircle,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  User,
  HelpCircle,
  History,
  Percent,
  Edit,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import SessionExpiredModal from "@/components/SessionExpiredModal";
import IdleChecker from "@/components/IdleChecker";
import VendorLoader from "@/components/VendorLoader";
import NotificationBell from "@/components/NotificationBell";
import PayoutCyclePill from "@/components/PayoutCyclePill";
import HeaderClockAnnouncement from "@/components/HeaderClockAnnouncement";
import QuickActionFab from "@/components/QuickActionFab";
import OnboardingTour from "@/components/OnboardingTour";
import BrandSwitcher from "@/components/BrandSwitcher";
import AddBrandModal from "@/components/AddBrandModal";
import { firebaseMessaging } from "@/lib/firebase-messaging";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    brand,
    brands,
    user,
    isAuthenticated,
    isLoading,
    isSessionExpired,
    hasPermission,
    startOnboarding,
    isAddBrandModalOpen,
    openAddBrandModal,
    closeAddBrandModal,
    logout,
    dismissSessionExpired,
  } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (key: string) => {
    setOpenSubmenu((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isSessionExpired) {
      router.push("/login");
    } else if (!isLoading && isAuthenticated && (user?.first_time_login || user?.must_change_password)) {
      router.push("/first-time-setup");
    }
  }, [isLoading, isAuthenticated, isSessionExpired, user, router]);

  useEffect(() => {
    if (isAuthenticated) {
      firebaseMessaging.reRegisterIfEnabled();
      firebaseMessaging.listenForForegroundMessages();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (pathname.includes("/catalog") || pathname.includes("/products")) {
      setOpenSubmenu("catalog");
    } else if (
      pathname.includes("/insights") ||
      pathname.includes("/reporting")
    ) {
      setOpenSubmenu("insights");
    } else if (
      pathname.includes("/commerce-hub") ||
      pathname.includes("/settlement-plan")
    ) {
      setOpenSubmenu("commerce-hub");
    } else {
      setOpenSubmenu(null);
    }

    const getPageTitle = (path: string): string => {
      if (
        path === "/vendor-portal/dashboard" ||
        path === "/vendor-portal" ||
        path === "/dashboard" ||
        path === "/"
      ) {
        return "Dashboard";
      }
      if (
        path.includes("/catalog/manage-product") ||
        path === "/vendor-portal/products" ||
        path === "/products"
      ) {
        return "Manage Products";
      }
      if (
        path.includes("/catalog/add-product") ||
        path === "/vendor-portal/products/new" ||
        path === "/products/new"
      ) {
        return "Add Product";
      }
      if (
        path.includes("/catalog/cashback")
      ) {
        return "Customer Cashback";
      }
      if (
        path.includes("/catalog/performance") ||
        path === "/vendor-portal/products/performance" ||
        path === "/products/performance"
      ) {
        return "NCS Leaderboard";
      }
      if (
        path.includes("/catalog/breakdown") ||
        path === "/vendor-portal/products/breakdown" ||
        path === "/products/breakdown"
      ) {
        return "Catalog Breakdown";
      }
      if (path.includes("/edit")) {
        return "Edit Product";
      }
      if (
        path.includes("/insights/sales-report") ||
        path === "/vendor-portal/reporting" ||
        path === "/reporting"
      ) {
        return "Sales Report";
      }
      if (
        path.includes("/insights/performance-report") ||
        path === "/vendor-portal/reporting/products" ||
        path === "/reporting/products"
      ) {
        return "Performance Report";
      }
      if (
        path.includes("/brands")
      ) {
        return "Partner Brands";
      }
      if (
        path.includes("/accounting")
      ) {
        return "Accounting & Payouts";
      }
      if (
        path.includes("/history")
      ) {
        return "Class Change History";
      }
      if (
        path.includes("/settlement-plan") ||
        path.includes("/commerce-hub")
      ) {
        return "Settlement Plan";
      }
      if (path.includes("/profile/edit")) {
        return "Edit Profile";
      }
      if (path.includes("/profile")) {
        return "Vendor Profile";
      }
      if (path.includes("/support")) {
        return "Support & Help Desk";
      }
      if (path.includes("/pdpa")) {
        return "PDPA Notice (Act 709)";
      }
      if (path.includes("/privacy-notice")) {
        return "Privacy & ISO Notice";
      }
      if (path.includes("/terms")) {
        return "Terms & Conditions";
      }
      return "Portal";
    };

    if (typeof document !== "undefined") {
      document.title = `VF Vendor | ${getPageTitle(pathname)}`;
    }
  }, [pathname]);

  if (isLoading) {
    return <VendorLoader label="VAMOFLEX Vendor Hub" />;
  }

  if (!isAuthenticated && !isSessionExpired) {
    return null;
  }

  const isItemActive = (href: string, aliases?: string[]) => {
    if (pathname === href) return true;
    if (aliases && aliases.some((a) => pathname === a)) return true;
    if (
      (href === "/vendor-portal/dashboard" || href === "/dashboard") &&
      (pathname === "/vendor-portal" ||
        pathname === "/vendor-portal/dashboard" ||
        pathname === "/" ||
        pathname === "/dashboard")
    ) {
      return true;
    }
    if (
      href === "/vendor-portal/catalog/manage-product" &&
      (pathname === "/vendor-portal/products" ||
        (pathname.startsWith("/vendor-portal/products/") &&
          !pathname.includes("/performance") &&
          !pathname.includes("/breakdown") &&
          !pathname.includes("/new")))
    ) {
      return true;
    }
    return false;
  };

  const navSections = [
    {
      type: "link" as const,
      name: "Dashboard",
      href: "/vendor-portal/dashboard",
      aliases: [
        "/vendor-portal",
        "/vendor-portal/dashboard",
        "/",
        "/dashboard",
      ],
      icon: LayoutDashboard,
      permission: "vendor.dashboard.view",
      dataTour: "nav-dashboard",
    },
    {
      type: "link" as const,
      name: "Partner Brands",
      href: "/vendor-portal/brands",
      aliases: [
        "/vendor-portal/brands",
        "/brands",
      ],
      icon: Store,
      dataTour: "nav-brands",
    },
    {
      type: "group" as const,
      name: "Catalog",
      key: "catalog",
      icon: Package,
      dataTour: "nav-catalog",
      items: [
        {
          name: "Manage Product",
          href: "/vendor-portal/catalog/manage-product",
          aliases: ["/vendor-portal/products", "/products"],
          icon: Boxes,
          permission: "vendor.catalog.view",
          dataTour: "nav-manage-product",
        },
        {
          name: "Add Product",
          href: "/vendor-portal/catalog/add-product",
          aliases: ["/vendor-portal/products/new", "/products/new"],
          icon: PlusCircle,
          permission: "vendor.catalog.create",
          dataTour: "nav-add-product",
        },
        {
          name: "Customer Cashback",
          href: "/vendor-portal/catalog/cashback",
          aliases: ["/vendor-portal/catalog/cashback"],
          icon: Sparkles,
          permission: "vendor.catalog.view",
          dataTour: "nav-cashback",
        },
        {
          name: "NCS Leaderboard",
          href: "/vendor-portal/catalog/performance",
          aliases: [
            "/vendor-portal/products/performance",
            "/products/performance",
          ],
          icon: TrendingUp,
          permission: "vendor.catalog.performance",
          dataTour: "nav-performance",
        },
        {
          name: "Catalog Breakdown",
          href: "/vendor-portal/catalog/breakdown",
          aliases: ["/vendor-portal/products/breakdown", "/products/breakdown"],
          icon: Layers,
          permission: "vendor.catalog.breakdown",
          dataTour: "nav-breakdown",
        },
      ],
    },
    {
      type: "group" as const,
      name: "Insights",
      key: "insights",
      icon: BarChart3,
      dataTour: "nav-insights",
      items: [
        {
          name: "Sales Report",
          href: "/vendor-portal/insights/sales-report",
          aliases: ["/vendor-portal/reporting", "/reporting"],
          icon: BarChart3,
          permission: "vendor.insights.sales_report",
          dataTour: "nav-insights",
        },
        {
          name: "Performance Report",
          href: "/vendor-portal/insights/performance-report",
          aliases: ["/vendor-portal/reporting/products", "/reporting/products"],
          icon: FileSpreadsheet,
          permission: "vendor.insights.performance_report",
          dataTour: "nav-performance-report",
        },
      ],
    },
    {
      type: "link" as const,
      name: "Accounting & Payouts",
      href: "/vendor-portal/accounting",
      aliases: ["/accounting"],
      icon: Receipt,
      permission: "vendor.accounting.view",
      dataTour: "nav-accounting",
    },
    {
      type: "group" as const,
      name: "Commerce Hub",
      key: "commerce-hub",
      icon: Layers,
      dataTour: "nav-commerce-hub",
      items: [
        {
          name: "Settlement Plan",
          href: "/vendor-portal/commerce-hub/settlement-plan",
          aliases: ["/vendor-portal/settlement-plan", "/settlement-plan"],
          icon: Percent,
          permission: "vendor.settlement_plan.view",
          dataTour: "nav-settlement-plan",
        },
        {
          name: "Class Change History",
          href: "/vendor-portal/commerce-hub/history",
          aliases: [
            "/vendor-portal/commerce-hub/history",
            "/vendor-portal/settlement-plan/history",
            "/commerce-hub/history",
          ],
          icon: History,
          permission: "vendor.settlement_plan.history",
          dataTour: "nav-history",
        },
      ],
    },
  ];

  const filteredNavSections = navSections
    .map((section) => {
      if (section.type === "link") {
        if (section.permission && !hasPermission(section.permission)) {
          return null;
        }
        return section;
      }
      if (section.type === "group") {
        const visibleItems = section.items.filter(
          (item) => !item.permission || hasPermission(item.permission)
        );
        if (visibleItems.length === 0) {
          return null;
        }
        return {
          ...section,
          items: visibleItems,
        };
      }
      return section;
    })
    .filter(Boolean) as typeof navSections;

  const getKelasBadge = (cls?: string) => {
    switch (cls) {
      case "kelas_a":
        return {
          name: "Kelas A",
          share: "45% Net Share",
          label: "Kelas A (45%)",
          color: "badge-info",
        };
      case "kelas_c":
        return {
          name: "Kelas C",
          share: "55% Net Share",
          label: "Kelas C (55%)",
          color: "badge-accent",
        };
      case "kelas_b":
      default:
        return {
          name: "Kelas B",
          share: "50% Net Share",
          label: "Kelas B (50% - Standard)",
          color: "badge-primary",
        };
    }
  };

  const kelasInfo = getKelasBadge(brand?.current_class || brand?.settlement_class);

  // Custom Breadcrumbs Generator
  const renderBreadcrumbs = () => {
    if (
      pathname === "/" ||
      pathname === "/dashboard" ||
      pathname === "/vendor-portal" ||
      pathname === "/vendor-portal/dashboard"
    )
      return null;

    let items: { label: string; href?: string }[] = [
      { label: "Dashboard", href: "/vendor-portal/dashboard" },
    ];

    if (pathname.includes("/catalog") || pathname.includes("/products")) {
      items.push({
        label: "Catalog",
        href: "/vendor-portal/catalog/manage-product",
      });
      if (
        pathname.includes("/manage-product") ||
        pathname.endsWith("/products")
      ) {
        items.push({ label: "Manage Product" });
      } else if (
        pathname.includes("/add-product") ||
        pathname.includes("/new")
      ) {
        items.push({ label: "Add Product" });
      } else if (pathname.includes("/performance")) {
        items.push({ label: "NCS Leaderboard" });
      } else if (pathname.includes("/cashback")) {
        items.push({ label: "Customer Cashback" });
      } else if (pathname.includes("/breakdown")) {
        items.push({ label: "Catalog Breakdown" });
      } else if (pathname.includes("/edit")) {
        items.push({ label: "Edit Product" });
      }
    } else if (
      pathname.includes("/insights") ||
      pathname.includes("/reporting")
    ) {
      items.push({
        label: "Insights",
        href: "/vendor-portal/insights/sales-report",
      });
      if (
        pathname.includes("/sales-report") ||
        pathname.endsWith("/reporting")
      ) {
        items.push({ label: "Sales Report" });
      } else if (
        pathname.includes("/performance-report") ||
        pathname.includes("/reporting/products")
      ) {
        items.push({ label: "Performance Report" });
      }
    } else if (
      pathname === "/vendor-portal/brands" ||
      pathname === "/brands"
    ) {
      items.push({ label: "Partner Brands" });
    } else if (
      pathname === "/vendor-portal/accounting" ||
      pathname === "/accounting"
    ) {
      items.push({ label: "Accounting & Payouts" });
    } else if (
      pathname.includes("/commerce-hub") ||
      pathname.includes("/settlement-plan")
    ) {
      items.push({
        label: "Commerce Hub",
        href: "/vendor-portal/commerce-hub/settlement-plan",
      });
      if (pathname.includes("/history")) {
        items.push({ label: "Class Change History" });
      } else {
        items.push({ label: "Settlement Plan" });
      }
    } else {
      const segments = pathname
        .replace(/^\/vendor-portal/, "")
        .split("/")
        .filter(Boolean);
      segments.forEach((seg, idx) => {
        const href = "/vendor-portal/" + segments.slice(0, idx + 1).join("/");
        const isLast = idx === segments.length - 1;
        const label = seg
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        items.push({ label, href: isLast ? undefined : href });
      });
    }

    return (
      <div className="text-xs breadcrumbs mb-6 text-base-content/60">
        <ul>
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li
                key={idx}
                className={isLast ? "font-semibold text-base-content" : ""}
              >
                {item.href ? (
                  <Link href={item.href} className="hover:text-primary">
                    {item.label}
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div suppressHydrationWarning className="min-h-screen bg-base-200 flex">
      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? "w-20 overflow-visible" : "w-64"
        } bg-base-100 border-r border-base-300 flex flex-col shrink-0 fixed inset-y-0 z-30 transition-all duration-200`}
      >
        {/* Top Logo Container - Exact h-16 to match navbar border */}
        <div className="h-16 px-4 border-b border-base-300 flex items-center justify-center shrink-0">
          <Link
            href="/vendor-portal/dashboard"
            className="flex items-center justify-center w-full h-full px-2"
          >
            {isCollapsed ? (
              <img
                src="/images/logo/preloader_icon.png"
                alt="VAMOFLEX"
                className="h-9 w-9 object-contain"
              />
            ) : (
              <img
                src="/images/logo/logo.png"
                alt="VAMOFLEX"
                className="h-20 sm:h-18 w-auto max-h-20 object-contain"
              />
            )}
          </Link>
        </div>

        {/* Partner Brand Section (Below Border) with Brand Switcher */}
        {!isCollapsed ? (
          <div data-tour="brand-badge" className="p-4 border-b border-base-300 bg-base-100">
            <BrandSwitcher />
          </div>
        ) : (
          <div data-tour="brand-badge" className="p-3 border-b border-base-300 flex justify-center bg-base-100">
            <BrandSwitcher compact />
          </div>
        )}

        {/* Navigation - Full Width Edge-to-Edge with Submenus */}
        <nav
          className={`flex-1 py-3 px-0 space-y-1 ${
            isCollapsed ? "overflow-visible" : "overflow-y-auto"
          }`}
        >
          {filteredNavSections.map((section) => {
            if (section.type === "link") {
              const isActive =
                section.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(section.href);
              const Icon = section.icon;

              if (isCollapsed) {
                return (
                  <div
                    key={section.href}
                    data-tour={section.dataTour}
                    className="relative group w-full flex justify-center py-1"
                  >
                    <Link
                      href={section.href}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-150 ${
                        isActive
                          ? "bg-primary text-primary-content font-bold shadow-md shadow-primary/20"
                          : "text-base-content/70 hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                    {/* Dropout tooltip on right */}
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:flex items-center z-[100] pointer-events-none">
                      <div className="bg-base-100 text-base-content text-xs font-semibold px-3 py-2 rounded-xl shadow-2xl border border-base-300 whitespace-nowrap">
                        {section.name}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={section.href}
                  href={section.href}
                  data-tour={section.dataTour}
                  className={`group relative flex items-center justify-between px-6 py-3 rounded-none text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-content font-bold"
                      : "text-base-content/75 hover:bg-primary/5 hover:text-primary font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      className={`w-5 h-5 transition-colors duration-200 ${
                        isActive
                          ? "text-primary-content"
                          : "text-base-content/60 group-hover:text-primary"
                      }`}
                    />
                    <span>{section.name}</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-all duration-200 ${
                      isActive
                        ? "opacity-90 translate-x-0 text-primary-content"
                        : "opacity-0 -translate-x-2 text-primary group-hover:opacity-100 group-hover:translate-x-0"
                    }`}
                  />
                </Link>
              );
            }

            // Submenu Group (Catalog or Insights)
            const Icon = section.icon;
            const isGroupActive = section.items.some((item) =>
              isItemActive(item.href, item.aliases),
            );
            const isOpen = openSubmenu === section.key;

            if (isCollapsed) {
              return (
                <div
                  key={section.key}
                  className="dropdown dropdown-right dropdown-hover w-full flex justify-center py-1"
                >
                  <div
                    tabIndex={0}
                    role="button"
                    className={`w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150 ${
                      isGroupActive
                        ? "bg-primary text-primary-content font-bold shadow-md shadow-primary/20"
                        : "text-base-content/70 hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div
                    tabIndex={0}
                    className="dropdown-content z-[100] menu p-2.5 shadow-2xl bg-base-100 rounded-2xl w-56 border border-base-300 ml-2 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-1.5 mb-1 border-b border-base-200">
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                        {section.name}
                      </span>
                    </div>
                    <ul className="space-y-1 p-0">
                      {section.items.map((subItem) => {
                        const isSubActive = isItemActive(
                          subItem.href,
                          subItem.aliases,
                        );
                        const SubIcon = subItem.icon;
                        return (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                isSubActive
                                  ? "bg-primary text-primary-content font-bold shadow-sm"
                                  : "text-base-content/80 hover:bg-primary/10 hover:text-primary"
                              }`}
                            >
                              <SubIcon className="w-4 h-4 shrink-0" />
                              <span className="truncate">{subItem.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            }

            return (
              <div key={section.key} className="space-y-0.5">
                {/* Group Header Trigger */}
                <button
                  type="button"
                  data-tour={section.dataTour}
                  onClick={() => toggleSubmenu(section.key)}
                  className={`w-full flex items-center justify-between px-6 py-3 text-sm font-semibold transition-colors duration-150 ${
                    isGroupActive
                      ? "text-primary bg-primary/5"
                      : "text-base-content/80 hover:bg-base-200/60 hover:text-base-content"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      className={`w-5 h-5 ${isGroupActive ? "text-primary" : "text-base-content/60"}`}
                    />
                    <span>{section.name}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-base-content/40 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {/* Submenu Items List */}
                {isOpen && (
                  <div className="bg-base-200/40 py-1 border-y border-base-300/30 space-y-0.5">
                    {section.items.map((subItem) => {
                      const isSubActive = isItemActive(
                        subItem.href,
                        subItem.aliases,
                      );
                      const SubIcon = subItem.icon;

                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          data-tour={subItem.dataTour}
                          className={`group flex items-center justify-between pl-12 pr-6 py-2.5 text-xs transition-all duration-150 ${
                            isSubActive
                              ? "bg-primary text-primary-content font-bold shadow-sm"
                              : "text-base-content/70 hover:text-primary hover:bg-primary/5 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <SubIcon
                              className={`w-4 h-4 ${
                                isSubActive
                                  ? "text-primary-content"
                                  : "text-base-content/50 group-hover:text-primary"
                              }`}
                            />
                            <span>{subItem.name}</span>
                          </div>
                          {isSubActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Single Hub Fulfillment Notice (expanded only) */}
        {!isCollapsed && (
          <div className="p-4 mx-3 mb-3 bg-base-200/90 rounded-xl border border-base-300 text-xs text-base-content/80 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-primary">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Single Hub Fulfillment</span>
            </div>
            <p className="text-[11px] text-base-content/60 leading-relaxed">
              All customer shipments are fulfilled seamlessly via VAMOFLEX
              Central Logistics Hub.
            </p>
          </div>
        )}

        {/* Fixed Bottom Build & Version Info */}
        <div className="h-[72px] border-t border-base-300 bg-base-100/60 shrink-0 flex items-center justify-start px-5">
          {!isCollapsed ? (
            <div className="text-left space-y-0.5 w-full">
              <p className="text-xs font-bold text-base-content/85 tracking-wide">
                VF Vendor <span className="font-mono text-primary font-bold">v0.1.0</span>
              </p>
              <p className="text-[11px] text-base-content/50 font-mono">
                Build 2026.09.01
              </p>
            </div>
          ) : (
            <div className="flex justify-center w-full relative group">
              <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                v0.1.0
              </span>
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:flex items-center z-[100] pointer-events-none">
                <div className="bg-base-100 text-base-content text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xl border border-base-300 whitespace-nowrap">
                  VF Vendor v0.1.0 (Build 2026.09.01)
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col ${
          isCollapsed ? "ml-20" : "ml-64"
        } min-w-0 transition-all duration-200`}
      >
        {/* Top Navbar */}
        <header className="h-16 bg-base-100 border-b border-base-300 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="btn btn-ghost btn-sm btn-square text-base-content/70 hover:text-base-content shrink-0"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            {/* Live Clock, Hijri Calendar & Announcement Bar */}
            <HeaderClockAnnouncement />
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Topbar Multi-Brand Switcher */}
            <div className="hidden md:block">
              <BrandSwitcher />
            </div>

            {/* Dynamic Weekly Payout Cycle Pill */}
            <div data-tour="payout-cycle">
              <PayoutCyclePill />
            </div>

            {/* Notification Bell */}
            <div data-tour="notifications">
              <NotificationBell />
            </div>

            {/* User Profile & Account Dropdown */}
            <div className="dropdown dropdown-end" data-tour="user-menu">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
                title={brand?.name || user?.name || "Account"}
              >
                <div className="w-9 h-9 rounded-full ring-1 ring-base-300 bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {brand?.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name || "Brand"}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>
                      {brand?.name
                        ? brand.name.charAt(0).toUpperCase()
                        : user?.name
                        ? user.name.charAt(0).toUpperCase()
                        : user?.username
                        ? user.username.charAt(0).toUpperCase()
                        : "V"}
                    </span>
                  )}
                </div>
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-50 menu p-2 shadow-xl bg-base-100 rounded-2xl w-60 border border-base-300 mt-2 space-y-1"
              >
                <li className="menu-title p-0">
                  <div className="flex items-center gap-3 px-3 py-2.5 text-left w-full hover:bg-transparent cursor-default">
                    <div className="w-10 h-10 rounded-full ring-1 ring-base-300 bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                      {brand?.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={brand.name || "Brand"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>
                          {brand?.name
                            ? brand.name.charAt(0).toUpperCase()
                            : user?.name
                            ? user.name.charAt(0).toUpperCase()
                            : user?.username
                            ? user.username.charAt(0).toUpperCase()
                            : "V"}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1 text-left items-start justify-start">
                      <span className="text-sm font-bold text-base-content leading-tight truncate text-left w-full block">
                        {user?.name || user?.username || "Vendor"}
                      </span>
                      <span className="text-xs text-base-content/60 leading-tight truncate mt-0.5 text-left w-full block">
                        {brand?.name || "Partner Brand"}
                      </span>
                    </div>
                  </div>
                </li>

                <div className="divider my-0.5"></div>
                <li>
                  <Link
                    href="/vendor-portal/brands"
                    className="flex items-center gap-2.5 py-2 text-xs font-medium"
                  >
                    <Store className="w-4 h-4 text-base-content/70" />
                    Partner Brands
                  </Link>
                </li>
                {hasPermission('vendor.profile.view') && (
                  <li>
                    <Link
                      href="/vendor-portal/profile"
                      className="flex items-center gap-2.5 py-2 text-xs font-medium"
                    >
                      <User className="w-4 h-4 text-base-content/70" />
                      Profile
                    </Link>
                  </li>
                )}
                {hasPermission('vendor.profile.edit') && (
                  <li>
                    <Link
                      href="/vendor-portal/profile/edit"
                      className="flex items-center gap-2.5 py-2 text-xs font-medium"
                    >
                      <Edit className="w-4 h-4 text-base-content/70" />
                      Edit Profile
                    </Link>
                  </li>
                )}
                {hasPermission('vendor.support.view') && (
                  <li>
                    <Link
                      href="/vendor-portal/support"
                      className="flex items-center gap-2.5 py-2 text-xs font-medium"
                    >
                      <HelpCircle className="w-4 h-4 text-base-content/70" />
                      Help & Support
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    onClick={() => startOnboarding()}
                    className="flex items-center gap-2.5 py-2 text-xs font-semibold text-primary hover:bg-primary/10 w-full text-left"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Interactive Portal Tour</span>
                  </button>
                </li>
                <div className="divider my-0.5"></div>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="flex items-center gap-2.5 py-2 text-xs font-medium text-error hover:bg-error/10 hover:text-error"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-none transition-all duration-200">
          {renderBreadcrumbs()}
          {!isLoading && brands && brands.length === 0 && (
            <div className="mb-8 p-6 sm:p-8 bg-base-100 border border-primary/20 rounded-3xl shadow-sm text-center space-y-4 max-w-xl mx-auto animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Store className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-black text-base-content">Welcome to Vamoflex Vendor Portal!</h2>
                <p className="text-xs text-base-content/60 leading-relaxed max-w-md mx-auto">
                  You have not registered any brands under your vendor account yet. Click below to add your first brand and start retailing on Vamoflex.
                </p>
              </div>
              <button
                type="button"
                onClick={openAddBrandModal}
                className="btn btn-primary btn-sm rounded-xl text-xs font-bold gap-2 px-4 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add Your First Brand</span>
              </button>
            </div>
          )}
          {children}
        </main>

        {/* Footer (Scrolls with page content) */}
        <footer
          suppressHydrationWarning
          className="mt-auto min-h-[72px] sm:h-[72px] border-t border-base-300 bg-base-100/60 px-6 py-2.5 sm:px-8 text-xs text-base-content/60 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <div suppressHydrationWarning className="text-center sm:text-left space-y-1">
            <div suppressHydrationWarning>
              <span suppressHydrationWarning>&copy; {new Date().getFullYear()} </span>
              <span className="font-semibold text-base-content">VamoFlex</span> by{" "}
              <a
                href="https://hausinternational.my"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors underline-offset-2 hover:underline"
              >
                HausInternational.my
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-[11px] text-base-content/50">
              <Link
                href="/vendor-portal/legal/pdpa"
                className="hover:text-primary hover:underline transition-colors"
              >
                PDPA
              </Link>
              <span>•</span>
              <Link
                href="/vendor-portal/legal/terms"
                className="hover:text-primary hover:underline transition-colors"
              >
                Terms & Conditions
              </Link>
              <span>•</span>
              <Link
                href="/vendor-portal/legal/privacy-notice"
                className="hover:text-primary hover:underline transition-colors"
              >
                Privacy Notice
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-center sm:text-right">
            <span>Powered By</span>
            <span className="font-semibold text-primary">BaqisAI</span>
          </div>
        </footer>
      </div>

      {/* Session Inactivity / Idle Checker */}
      <IdleChecker />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
        title="Sign Out of Vendor Portal"
        description="Are you sure you want to sign out? You will need to enter your brand credentials again to access the portal."
        confirmText="Yes, Sign Out"
        cancelText="Cancel"
        variant="primary"
        icon="logout"
      />

      {/* Floating Quick Menu (Bottom Right) */}
      <div data-tour="quick-fab">
        <QuickActionFab />
      </div>

      {/* Interactive Onboarding Walkthrough Tour */}
      <OnboardingTour
        onExpandGroup={(groupKey) => setOpenSubmenu(groupKey)}
      />

      {/* Session Expired / Token Invalid Modal */}
      <SessionExpiredModal
        isOpen={isSessionExpired}
        onRedirectNow={dismissSessionExpired}
        redirectSeconds={15}
      />

      {/* Add Brand Modal (1 Vendor -> N Brands) */}
      <AddBrandModal
        isOpen={isAddBrandModalOpen}
        onClose={closeAddBrandModal}
      />
    </div>
  );
}

