'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  ShieldCheck,
  Lock,
  Download,
  ExternalLink,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

export default function TermsConditionsPage() {
  return (
    <div className="space-y-8 w-full pb-12">
      {/* Header Banner */}
      <div className="card bg-gradient-to-r from-primary to-primary/85 text-primary-content shadow-xl overflow-hidden relative border border-primary/20">
        <div className="card-body p-6 sm:p-8 relative z-[1]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm">
                <FileCheck className="w-3.5 h-3.5 text-secondary" />
                <span>Master Merchant Agreement</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Terms & Conditions
              </h1>
              <p className="text-sm text-primary-content/85 max-w-2xl leading-relaxed">
                Official terms of service, merchant settlement policies, catalog curation guidelines,
                and fulfillment agreements for VAMOFLEX partner brands.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href="/HAUSFLEX-TC.pdf"
                download="HAUSFLEX-TC.pdf"
                className="btn btn-secondary btn-sm gap-2 font-bold shadow-md w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </a>
              <a
                href="/HAUSFLEX-TC.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm text-white hover:bg-white/20 gap-1.5 w-full sm:w-auto"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
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
          className="btn btn-sm btn-ghost hover:bg-base-200 text-base-content/80"
        >
          <Lock className="w-4 h-4" />
          <span>Privacy & ISO Notice</span>
        </Link>
        <Link
          href="/vendor-portal/legal/terms"
          className="btn btn-sm btn-primary text-primary-content font-bold shadow-sm"
        >
          <FileText className="w-4 h-4" />
          <span>Terms & Conditions (PDF)</span>
        </Link>
      </div>

      {/* Embedded Document Card */}
      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 border-b border-base-200 flex items-center justify-between gap-3 bg-base-200/40">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-bold text-sm text-base-content">
                HAUSFLEX Merchant Partner Terms & Conditions
              </h2>
              <p className="text-xs text-base-content/60">
                Document Reference: HAUSFLEX-TC.pdf (Official Agreement)
              </p>
            </div>
          </div>

          <a
            href="/HAUSFLEX-TC.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-xs text-primary gap-1 font-semibold"
          >
            <span>Fullscreen</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* PDF Viewer Embed */}
        <div className="h-[650px] w-full bg-base-200/30">
          <iframe
            src="/HAUSFLEX-TC.pdf"
            className="w-full h-full border-0"
            title="HAUSFLEX Terms and Conditions"
          />
        </div>
      </div>
    </div>
  );
}
