'use client';

import React from 'react';
import Link from 'next/link';
import {
  Lock,
  ShieldCheck,
  FileText,
  Key,
  Server,
  Users,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Mail,
  Building,
} from 'lucide-react';

export default function PrivacyNoticePage() {
  return (
    <div className="space-y-8 w-full pb-12">
      {/* Header Banner */}
      <div className="card bg-gradient-to-r from-neutral to-neutral-focus text-neutral-content shadow-xl overflow-hidden relative border border-neutral/30">
        <div className="card-body p-6 sm:p-8 relative z-[1]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm">
                <Lock className="w-3.5 h-3.5 text-secondary" />
                <span>Information Security & Privacy Governance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Vendor Partner Privacy Notice
              </h1>
              <p className="text-sm text-neutral-content/85 max-w-2xl leading-relaxed">
                Standard Privacy & Security Notice formulated in accordance with ISO/IEC 27001:2022
                (ISMS) and ISO/IEC 27701:2019 (PIMS) framework standards.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shrink-0 space-y-1 text-xs">
              <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider block">
                Security Standard
              </span>
              <p className="font-bold text-white">ISO/IEC 27001:2022</p>
              <p className="font-bold text-secondary">ISO/IEC 27701:2019</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs between Legal Docs */}
      <div className="flex flex-wrap gap-2 border-b border-base-300 pb-3">
        <Link
          href="/vendor-portal/legal/pdpa"
          className="btn btn-sm btn-ghost hover:bg-base-200 text-base-content/80"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>PDPA Notice (Act 709)</span>
        </Link>
        <Link
          href="/vendor-portal/legal/privacy-notice"
          className="btn btn-sm btn-primary text-primary-content font-bold shadow-sm"
        >
          <Lock className="w-4 h-4" />
          <span>Privacy & ISO Notice</span>
        </Link>
        <Link
          href="/vendor-portal/legal/terms"
          className="btn btn-sm btn-ghost hover:bg-base-200 text-base-content/80"
        >
          <FileText className="w-4 h-4" />
          <span>Terms & Conditions (PDF)</span>
        </Link>
      </div>

      {/* Main Notice Body */}
      <div className="space-y-6 text-sm text-base-content/80 leading-relaxed">
        {/* Section 1: Overview */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            <span>1. Policy Overview & Scope</span>
          </h2>
          <p>
            This Privacy Notice governs the collection, storage, processing, and transfer of
            operational, financial, and administrative data processed across the{' '}
            <strong>VAMOFLEX Merchant Platform</strong>, operated by{' '}
            <strong>Haus International Sdn. Bhd.</strong>
          </p>
          <p>
            As a partner vendor utilizing our multi-channel logistics, catalog distribution, and
            automated weekly settlement engine, your corporate profile and representative contact
            data are handled with stringent data governance safeguards following international
            best practices.
          </p>
        </div>

        {/* Section 2: ISO Controls */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            <span>2. Information Security Management (ISO/IEC 27001 Controls)</span>
          </h2>
          <p>
            VamoFlex adopts the ISO/IEC 27001:2022 Annex A security controls to protect the
            confidentiality, integrity, and availability of merchant data:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-base-200/60 border border-base-300/60 space-y-1.5">
              <h3 className="font-bold text-xs uppercase tracking-wide text-primary">
                A.8 Cryptographic Controls
              </h3>
              <p className="text-xs leading-relaxed text-base-content/75">
                All vendor banking details, API credentials, and authentication sessions are
                protected using industry-standard AES-256 and SHA-256 hashing at rest and TLS 1.3 in
                transit.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-base-200/60 border border-base-300/60 space-y-1.5">
              <h3 className="font-bold text-xs uppercase tracking-wide text-primary">
                A.9 Access Control & Identity
              </h3>
              <p className="text-xs leading-relaxed text-base-content/75">
                Role-Based Access Control (RBAC) and least-privilege principles ensure that only
                verified brand administrators can view financial statements and modify catalog
                pricing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-base-200/60 border border-base-300/60 space-y-1.5">
              <h3 className="font-bold text-xs uppercase tracking-wide text-primary">
                A.12 Operations Security
              </h3>
              <p className="text-xs leading-relaxed text-base-content/75">
                Automated continuous threat monitoring, weekly backup retention, and strict change
                management protocols govern all platform updates.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-base-200/60 border border-base-300/60 space-y-1.5">
              <h3 className="font-bold text-xs uppercase tracking-wide text-primary">
                A.14 Secure Development
              </h3>
              <p className="text-xs leading-relaxed text-base-content/75">
                All vendor endpoints, webhooks, and REST APIs adhere to OWASP Top 10 and secure
                coding standards with comprehensive automated linting and penetration testing.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Third Party Disclosures */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>3. Third-Party Disclosures & Processing</span>
          </h2>
          <p>
            To execute weekly disbursements and customer fulfillment, we share limited merchant
            data strictly with qualified, contractually bound partners:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs pl-2">
            <li>
              <strong>Licensed Financial Institutions:</strong> Bank Negara Malaysia regulated
              commercial banks and payment gateways for automated IBG/DuitNow weekly settlement
              transfers.
            </li>
            <li>
              <strong>Logistics & Warehousing:</strong> VAMOFLEX Central Logistics Hub for SKU
              intake, stock balance reconciliation, and delivery barcode routing.
            </li>
            <li>
              <strong>Regulatory Authorities:</strong> Inland Revenue Board of Malaysia (LHDN) and
              relevant statutory bodies where required by applicable law.
            </li>
          </ul>
        </div>

        {/* Section 4: Rights & Data Inquiries */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <span>4. Privacy Inquiries & Rights</span>
          </h2>
          <p className="text-xs">
            For questions regarding this Privacy Notice, data retention schedules, or security
            audits, reach out to our team:
          </p>
          <div className="p-4 rounded-xl bg-base-200/70 border border-base-300/70 space-y-2 text-xs">
            <p className="font-bold text-base-content">
              Security & Privacy Office — Haus International
            </p>
            <p className="text-base-content/75">
              <strong>Email:</strong>{' '}
              <a
                href="mailto:privacy@hausinternational.my"
                className="link link-primary font-semibold"
              >
                privacy@hausinternational.my
              </a>
            </p>
            <p className="text-base-content/75">
              <strong>Support Desk:</strong>{' '}
              <Link href="/vendor-portal/support" className="link link-primary font-semibold">
                Vendor Support Center →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
