'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileText,
  Lock,
  Eye,
  Database,
  Building,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Download,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function PdpaNoticePage() {
  return (
    <div className="space-y-8 w-full pb-12">
      {/* Header Banner */}
      <div className="card bg-gradient-to-r from-primary to-primary/85 text-primary-content shadow-xl overflow-hidden relative border border-primary/20">
        <div className="card-body p-6 sm:p-8 relative z-[1]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                <span>Malaysian Statutory Compliance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Personal Data Protection Act (PDPA) Notice
              </h1>
              <p className="text-sm text-primary-content/85 max-w-2xl leading-relaxed">
                Notis Perlindungan Data Peribadi selaras dengan Akta Perlindungan Data Peribadi 2010
                (Akta 709) & piawaian keselamatan maklumat ISO/IEC 27001 / ISO/IEC 27701.
              </p>
            </div>

            <div className="bg-base-100/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shrink-0 space-y-2">
              <span className="text-[11px] font-semibold text-primary-content/80 uppercase tracking-wider block">
                Statutory Reference
              </span>
              <p className="text-sm font-bold text-white">Act 709 (Malaysia)</p>
              <div className="badge badge-secondary badge-sm font-bold text-xs">
                ISO/IEC 27001 & 27701
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs between Legal Docs */}
      <div className="flex flex-wrap gap-2 border-b border-base-300 pb-3">
        <Link
          href="/vendor-portal/legal/pdpa"
          className="btn btn-sm btn-primary text-primary-content font-bold shadow-sm"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>PDPA Notice (Act 709)</span>
        </Link>
        <Link
          href="/vendor-portal/legal/privacy-notice"
          className="btn btn-sm btn-ghost hover:bg-base-200 text-base-content/80"
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
        {/* Intro Card */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            <span>1. Introduction & Statutory Scope</span>
          </h2>
          <p>
            <strong>Haus International Sdn. Bhd.</strong> (“the Company”, “we”, “our”, or “us”), as
            the operator of the <strong>VAMOFLEX</strong> commerce and affiliate ecosystem, is
            committed to protecting and respecting your personal data.
          </p>
          <p>
            This Personal Data Protection Notice (“Notice”) is issued to all registered merchant
            partner vendors, brand representatives, authorized personnel, and signatories pursuant
            to the <strong>Personal Data Protection Act 2010 of Malaysia (“PDPA” / Act 709)</strong>.
            This Notice outlines how we collect, use, process, disclose, and safeguard your personal
            and corporate data in connection with the VamoFlex Vendor Portal, merchant settlement
            services, catalog management, and logistics fulfillment.
          </p>
        </div>

        {/* 7 Core PDPA Principles Card */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>2. Adherence to the 7 PDPA Principles (Act 709)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Principle 1 */}
            <div className="p-4 rounded-xl bg-base-200/60 border border-base-300/60 space-y-1.5">
              <h3 className="font-bold text-xs uppercase tracking-wide text-primary">
                1. General Principle
              </h3>
              <p className="text-xs leading-relaxed text-base-content/75">
                We will not process your personal data without your prior consent, unless authorized
                under Malaysian law. Processing is strictly limited to fulfilling vendor agreements,
                disbursing payouts, and managing marketplace catalogs.
              </p>
            </div>

            {/* Principle 2 */}
            <div className="p-4 rounded-xl bg-base-200/60 border border-base-300/60 space-y-1.5">
              <h3 className="font-bold text-xs uppercase tracking-wide text-primary">
                2. Notice and Choice Principle
              </h3>
              <p className="text-xs leading-relaxed text-base-content/75">
                You are informed by written notice of the purposes for which your data is collected,
                available in both English and Bahasa Malaysia, including your right to request access
                and correction.
              </p>
            </div>

            {/* Principle 3 */}
            <div className="p-4 rounded-xl bg-base-200/60 border border-base-300/60 space-y-1.5">
              <h3 className="font-bold text-xs uppercase tracking-wide text-primary">
                3. Disclosure Principle
              </h3>
              <p className="text-xs leading-relaxed text-base-content/75">
                Personal and financial data is only disclosed to specified authorized parties
                (e.g., Bank Negara Malaysia regulated payment gateways, logistics hubs, and tax
                authorities) for declared statutory or operational purposes.
              </p>
            </div>

            {/* Principle 4 */}
            <div className="p-4 rounded-xl bg-base-200/60 border border-base-300/60 space-y-1.5">
              <h3 className="font-bold text-xs uppercase tracking-wide text-primary">
                4. Security Principle
              </h3>
              <p className="text-xs leading-relaxed text-base-content/75">
                We implement robust technical and organizational measures aligned with{' '}
                <strong>ISO/IEC 27001</strong> standards to prevent unauthorized access, loss,
                misuse, modification, or disclosure of merchant data.
              </p>
            </div>

            {/* Principle 5 */}
            <div className="p-4 rounded-xl bg-base-200/60 border border-base-300/60 space-y-1.5">
              <h3 className="font-bold text-xs uppercase tracking-wide text-primary">
                5. Retention Principle
              </h3>
              <p className="text-xs leading-relaxed text-base-content/75">
                Personal data is retained only for as long as necessary to fulfill commercial and
                legal requirements under the Companies Act 2016 and Income Tax Act 1967 (standard 7
                years).
              </p>
            </div>

            {/* Principle 6 */}
            <div className="p-4 rounded-xl bg-base-200/60 border border-base-300/60 space-y-1.5">
              <h3 className="font-bold text-xs uppercase tracking-wide text-primary">
                6. Data Integrity Principle
              </h3>
              <p className="text-xs leading-relaxed text-base-content/75">
                We take all reasonable steps to ensure all merchant information, bank accounts, and
                contact profiles are accurate, complete, not misleading, and kept up-to-date.
              </p>
            </div>

            {/* Principle 7 */}
            <div className="p-4 rounded-xl bg-base-200/60 border border-base-300/60 space-y-1.5 md:col-span-2">
              <h3 className="font-bold text-xs uppercase tracking-wide text-primary">
                7. Access Principle
              </h3>
              <p className="text-xs leading-relaxed text-base-content/75">
                You possess the statutory right to request access to and correct your personal data
                held by us, or withdraw your consent by submitting a verified request to our Data
                Protection Officer.
              </p>
            </div>
          </div>
        </div>

        {/* Data Collected & Purpose */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <span>3. Categories of Data Collected & Purpose of Processing</span>
          </h2>
          <p>We collect and process the following categories of data from vendor partners:</p>
          <ul className="list-disc list-inside space-y-2 text-xs pl-2">
            <li>
              <strong>Corporate & Identity Data:</strong> Company name, SSM registration number,
              director/partner identification, trade brand names, and business license copies.
            </li>
            <li>
              <strong>Contact & Operational Data:</strong> Authorized representative name, email
              address, telephone/mobile number, warehouse collection addresses, and dispatch
              records.
            </li>
            <li>
              <strong>Financial & Banking Data:</strong> Payout bank name, account holder name, bank
              account number, SWIFT/BIC code, and weekly settlement disbursement audit logs.
            </li>
            <li>
              <strong>Technical & Telemetry Data:</strong> IP addresses, login timestamps, device
              identifiers, push notification registration tokens (FCM), and administrative action
              audit trails.
            </li>
          </ul>
        </div>

        {/* ISO Standards Notice */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <span>4. ISO/IEC 27001 & ISO/IEC 27701 Security Governance</span>
          </h2>
          <p>
            To ensure the highest standard of cybersecurity and data confidentiality, VamoFlex
            maintains security controls structured under international standards:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-base-200/50 rounded-xl border border-base-200 text-xs">
              <span className="font-bold text-primary block mb-1">TLS 1.3 Encryption</span>
              <p className="text-[11px] text-base-content/60">
                All data transmitted over the portal is protected using modern AES-256 in-transit
                encryption.
              </p>
            </div>
            <div className="p-3 bg-base-200/50 rounded-xl border border-base-200 text-xs">
              <span className="font-bold text-primary block mb-1">Strict RBAC & Audit</span>
              <p className="text-[11px] text-base-content/60">
                Multi-tenant database segregation ensuring zero cross-merchant data leakage.
              </p>
            </div>
            <div className="p-3 bg-base-200/50 rounded-xl border border-base-200 text-xs">
              <span className="font-bold text-primary block mb-1">PIMS 27701 Controls</span>
              <p className="text-[11px] text-base-content/60">
                Structured privacy information management protecting vendor banking and KYC assets.
              </p>
            </div>
          </div>
        </div>

        {/* Contact DPO */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <span>5. Data Protection Officer (DPO) Contact</span>
          </h2>
          <p className="text-xs">
            For inquiries, requests for data access or correction, or complaints regarding the
            processing of your personal data under the PDPA, please contact our appointed officer:
          </p>
          <div className="p-4 rounded-xl bg-base-200/70 border border-base-300/70 space-y-2 text-xs">
            <p className="font-bold text-base-content">
              Data Protection & Compliance Officer (DPO)
            </p>
            <p className="text-base-content/75">
              <strong>Entity:</strong> Haus International Sdn. Bhd. (VamoFlex Division)
            </p>
            <p className="text-base-content/75">
              <strong>Email:</strong>{' '}
              <a href="mailto:dpo@hausinternational.my" className="link link-primary font-semibold">
                dpo@hausinternational.my
              </a>
            </p>
            <p className="text-base-content/75">
              <strong>Website:</strong>{' '}
              <a
                href="https://hausinternational.my"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary font-semibold"
              >
                https://hausinternational.my
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
