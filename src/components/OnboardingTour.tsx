'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Zap,
  X,
  LayoutDashboard,
  Package,
  Layers,
  Receipt,
  BarChart3,
  Calendar,
  Bell,
  User,
  Store,
} from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  parentGroup?: string;
  position?: 'right' | 'bottom' | 'left' | 'top';
  permission?: string | string[];
}

const ALL_TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="nav-dashboard"]',
    title: 'Vendor Dashboard Overview',
    description:
      'Your central command center for monitoring live sales revenue, active orders, weekly settlement estimates, and recent transactions.',
    category: 'Navigation',
    icon: LayoutDashboard,
    position: 'right',
    permission: 'vendor.dashboard.view',
  },
  {
    target: '[data-tour="brand-badge"]',
    title: 'Partner Brand & Settlement Tier',
    description:
      'Displays your verified brand partner identity and currently active settlement class tier (e.g. Kelas B - 50% Net Share).',
    category: 'Brand Identity',
    icon: Sparkles,
    position: 'right',
  },
  {
    target: '[data-tour="nav-brands"]',
    title: 'Partner Brands & Multi-Store',
    description:
      'Manage multiple brands under your vendor account, switch active operating brands, review settlement tiers, and register new partner brands.',
    category: 'Brand Management',
    icon: Store,
    position: 'right',
  },
  {
    target: '[data-tour="nav-catalog"]',
    title: 'Product Catalog Menu',
    description:
      'The gateway to managing all your product listings, stock balances, SKU creation, and performance metrics.',
    category: 'Catalog',
    icon: Package,
    parentGroup: 'catalog',
    position: 'right',
    permission: ['vendor.catalog.view', 'vendor.catalog.create', 'vendor.catalog.performance', 'vendor.catalog.breakdown'],
  },
  {
    target: '[data-tour="nav-manage-product"]',
    title: 'Manage Active Products',
    description:
      'View, search, filter, and edit all your active product catalog items, prices, and warehouse channel stock balances.',
    category: 'Catalog Dropdown',
    icon: Package,
    parentGroup: 'catalog',
    position: 'right',
    permission: 'vendor.catalog.view',
  },
  {
    target: '[data-tour="nav-add-product"]',
    title: 'Add New Product Listing',
    description:
      'List a new product item with rich multi-attribute variants, images, pricing, and automated commission calculations.',
    category: 'Catalog Dropdown',
    icon: Package,
    parentGroup: 'catalog',
    position: 'right',
    permission: 'vendor.catalog.create',
  },
  {
    target: '[data-tour="nav-performance"]',
    title: 'Product Sales Performance',
    description:
      'Analyze individual product sales velocity, volume, and revenue contributions over weekly settlement cycles.',
    category: 'Catalog Dropdown',
    icon: BarChart3,
    parentGroup: 'catalog',
    position: 'right',
    permission: 'vendor.catalog.performance',
  },
  {
    target: '[data-tour="nav-breakdown"]',
    title: 'Granular SKU Breakdown',
    description:
      'Detailed item-by-item breakdown of variant sales, inventory distribution, and net brand profit margins.',
    category: 'Catalog Dropdown',
    icon: Package,
    parentGroup: 'catalog',
    position: 'right',
    permission: 'vendor.catalog.breakdown',
  },
  {
    target: '[data-tour="nav-settlement-plan"]',
    title: 'Settlement Plans & Tier Upgrades',
    description:
      'Inspect your net payout percentage (45%-55%), compare Kelas A/B/C benefits, and submit settlement plan tier adjustments.',
    category: 'Commerce Hub',
    icon: Layers,
    position: 'right',
    permission: 'vendor.settlement_plan.view',
  },
  {
    target: '[data-tour="nav-accounting"]',
    title: 'Accounting & Weekly Statements',
    description:
      'Access all weekly net settlement disbursements, invoice statements, Sunday cutoff cycles, and historical bank remittances.',
    category: 'Accounting',
    icon: Receipt,
    position: 'right',
    permission: 'vendor.accounting.view',
  },
  {
    target: '[data-tour="nav-insights"]',
    title: 'Insights & Sales Reports',
    description:
      'Comprehensive performance analytics, gross revenue trends, and top affiliate promoter engagement charts.',
    category: 'Insights',
    icon: BarChart3,
    position: 'right',
    permission: ['vendor.insights.sales', 'vendor.insights.sales_report'],
  },
  {
    target: '[data-tour="payout-cycle"]',
    title: 'Dynamic Weekly Payout Cycle',
    description:
      'Live tracker displaying days remaining until the upcoming Sunday 11:59PM cutoff and next Wednesday settlement disbursement.',
    category: 'Top Navbar',
    icon: Calendar,
    position: 'bottom',
  },
  {
    target: '[data-tour="notifications"]',
    title: 'Real-Time Notification Hub',
    description:
      'Receive instant notifications regarding approved settlement tier changes, payout disbursements, and platform updates.',
    category: 'Top Navbar',
    icon: Bell,
    position: 'bottom',
  },
  {
    target: '[data-tour="quick-fab"]',
    title: 'Floating Quick Action Menu',
    description:
      'Quickly trigger essential actions from anywhere — add a new product, review settlement rates, or edit banking details.',
    category: 'Quick Access',
    icon: Zap,
    position: 'left',
  },
  {
    target: '[data-tour="user-menu"]',
    title: 'Account Settings & Replay Guide',
    description:
      'Manage profile info, bank accounts, security, and replay this interactive onboarding walkthrough anytime.',
    category: 'Account',
    icon: User,
    position: 'bottom',
  },
];

export default function OnboardingTour({
  onExpandGroup,
}: {
  onExpandGroup?: (groupKey: string) => void;
}) {
  const { isOnboardingOpen, completeOnboarding, closeOnboarding, hasPermission } =
    useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const activeTourSteps = ALL_TOUR_STEPS.filter((s) => {
    if (!s.permission) return true;
    return hasPermission(s.permission);
  });

  const step = activeTourSteps[currentStepIndex];
  const isLastStep = currentStepIndex === activeTourSteps.length - 1;

  // Reset to step 0 when onboarding opens
  useEffect(() => {
    if (isOnboardingOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOnboardingOpen]);

  // Update target rect when step changes or window resizes
  useEffect(() => {
    if (!isOnboardingOpen || !step) return;

    // If step requires expanding a parent group, expand it
    if (step.parentGroup && onExpandGroup) {
      onExpandGroup(step.parentGroup);
    }

    const updateRect = () => {
      const element = document.querySelector(step.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };

    // Small delay to allow dropdown expansion animation
    const timeout = setTimeout(updateRect, 150);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [isOnboardingOpen, currentStepIndex, step, onExpandGroup]);

  if (!isOnboardingOpen || !step) {
    return null;
  }

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await completeOnboarding();
    } catch (err) {
      console.error('Error completing onboarding:', err);
      closeOnboarding();
    } finally {
      setIsFinishing(false);
    }
  };

  const StepIcon = step.icon;
  const progressPercent = Math.round(
    ((currentStepIndex + 1) / activeTourSteps.length) * 100
  );

  // Tooltip positioning
  let tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
  };

  if (targetRect) {
    const margin = 16;
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    if (step.position === 'right' && targetRect.right + 380 < windowWidth) {
      tooltipStyle.left = `${targetRect.right + margin}px`;
      tooltipStyle.top = `${Math.max(
        margin,
        Math.min(targetRect.top, windowHeight - 320)
      )}px`;
    } else if (step.position === 'left' && targetRect.left - 380 > margin) {
      tooltipStyle.left = `${targetRect.left - 380 - margin}px`;
      tooltipStyle.top = `${Math.max(
        margin,
        Math.min(targetRect.top, windowHeight - 320)
      )}px`;
    } else if (step.position === 'bottom' && targetRect.bottom + 260 < windowHeight) {
      tooltipStyle.top = `${targetRect.bottom + margin}px`;
      tooltipStyle.left = `${Math.max(
        margin,
        Math.min(targetRect.left, windowWidth - 400)
      )}px`;
    } else {
      // Default / Top / Fallback center-ish
      tooltipStyle.left = `${Math.max(
        margin,
        Math.min(targetRect.left, windowWidth - 400)
      )}px`;
      tooltipStyle.top = `${Math.max(
        margin,
        targetRect.top - 280 - margin
      )}px`;
    }
  } else {
    // Center of screen fallback
    tooltipStyle.top = '50%';
    tooltipStyle.left = '50%';
    tooltipStyle.transform = 'translate(-50%, -50%)';
  }

  return (
    <div className="fixed inset-0 z-[9990] pointer-events-none overflow-hidden">
      {/* Target Element Spotlight Ring */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            zIndex: 9995,
          }}
          className="rounded-2xl ring-4 ring-primary shadow-[0_0_35px_rgba(59,130,246,0.5)] pointer-events-none transition-all duration-300 animate-pulse bg-transparent"
        />
      )}

      {/* Interactive Tooltip Card */}
      <div
        style={tooltipStyle}
        className="pointer-events-auto w-[360px] sm:w-[400px] bg-base-100 rounded-3xl border-2 border-primary/40 shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95"
      >
        {/* Header Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-primary/15 via-base-100 to-base-100 border-b border-base-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/30">
              <StepIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="badge badge-primary badge-xs font-bold uppercase tracking-wider text-[9px]">
                  {step.category}
                </span>
                <span className="text-[11px] font-bold text-base-content/60">
                  {currentStepIndex + 1} of {activeTourSteps.length}
                </span>
              </div>
              <h3 className="text-sm font-black text-base-content leading-tight mt-0.5">
                {step.title}
              </h3>
            </div>
          </div>

          {/* Close button to dismiss tour */}
          <button
            type="button"
            onClick={closeOnboarding}
            className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content"
            title="Exit Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-base-200 h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out rounded-r-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-base-content/80 leading-relaxed font-normal">
            {step.description}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-base-200/50 border-t border-base-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="btn btn-ghost btn-xs font-semibold gap-1 text-base-content/70 disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={handleFinish}
              disabled={isFinishing}
              className="btn btn-ghost btn-xs font-medium text-base-content/60 hover:text-base-content"
              title="Skip remaining steps and finish"
            >
              Skip
            </button>
          </div>

          <div className="flex items-center gap-1">
            {activeTourSteps.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentStepIndex
                    ? 'w-4 bg-primary'
                    : i < currentStepIndex
                    ? 'bg-primary/50'
                    : 'bg-base-300'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={isFinishing}
            className="btn btn-primary btn-xs text-white font-bold gap-1 px-3 shadow-sm"
          >
            {isFinishing ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : isLastStep ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Finish Tour</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
