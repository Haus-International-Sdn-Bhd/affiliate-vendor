'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  MessageCircle,
  Mail,
  FileQuestion,
  Phone,
  Clock,
  Send,
  CheckCircle2,
  Receipt,
  Truck,
  ShieldCheck,
  ChevronDown,
  LayoutDashboard,
  Package,
  Boxes,
  PlusCircle,
  TrendingUp,
  Layers,
  BarChart3,
  FileSpreadsheet,
  ChevronRight,
  FileText,
  Lock,
  Scale,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface SupportChannel {
  id: string;
  title: string;
  description: string;
  card_icon?: string;
  button_text: string;
  button_icon?: string;
  link: string;
  target?: string;
}

interface FaqItem {
  q: string;
  a: string;
  category?: string;
}

const DEFAULT_CHANNELS: SupportChannel[] = [
  {
    id: 'whatsapp',
    title: 'WhatsApp Partner Desk',
    description: 'Direct chat with our merchant relations team for urgent fulfillment issues.',
    card_icon: 'MessageCircle',
    button_text: 'Chat on WhatsApp',
    button_icon: 'MessageCircle',
    link: 'https://wa.me/60123456789',
    target: '_blank',
  },
  {
    id: 'email',
    title: 'Email Support',
    description: 'Send detailed inquiries, statements, or tier upgrade applications to our desk.',
    card_icon: 'Mail',
    button_text: 'Email Support Desk',
    button_icon: 'Mail',
    link: 'mailto:partner-support@vamoflex.com',
    target: '_self',
  },
  {
    id: 'operating_hours',
    title: 'Operating Hours',
    description: 'Monday – Friday: 9:00 AM – 6:00 PM (MYT)\nLogistics Hub operates 7 days a week.',
    card_icon: 'Clock',
    button_text: 'Call Hotline Desk',
    button_icon: 'Phone',
    link: 'https://wa.me/60123456789?text=Urgent%20Logistics%20Support',
    target: '_blank',
  },
];

const DEFAULT_FAQS: FaqItem[] = [
  {
    q: 'How does the weekly settlement cycle work?',
    a: 'The settlement period runs weekly with a Sunday 11:59 PM cutoff. All completed orders within that period are calculated and disbursed directly to your registered bank account every Wednesday. You can review detailed statements and historical payout PDFs in the Accounting & Payouts section.',
    category: 'Accounting',
  },
  {
    q: 'What is the difference between Settlement Classes (Kelas A, Kelas B, Kelas C)?',
    a: 'Settlement classes define your brand payout rate based on sales volume and tier agreement: Kelas A (45% rate), Kelas B (50% standard rate), and Kelas C (55% high-volume partner rate). If your sales consistently reach higher tiers, you can request an upgrade.',
    category: 'Accounting',
  },
  {
    q: 'How does Single Hub Logistics & Fulfillment operate?',
    a: 'All customer shipments across all partner brands are consolidated and fulfilled centrally via the VAMOFLEX Central Logistics Hub. Once your stock is received and verified at the central warehouse, order dispatch, delivery tracking, and courier handling are fully managed by our logistics team.',
    category: 'Logistics',
  },
  {
    q: 'How do I submit or update product listings?',
    a: 'Navigate to Catalog > Add Product to draft new SKU items. All newly submitted products undergo a quick compliance and category check before becoming live on the storefront. You can track approval states under Manage Products.',
    category: 'Catalog',
  },
  {
    q: 'How do I update my bank payout details or brand contact?',
    a: 'For security and fraud prevention, bank account modifications require verification. Please submit an inquiry through this support portal or contact your account manager directly with supporting bank statement documentation.',
    category: 'Account',
  },
];

const renderIcon = (name?: string, className = 'w-5 h-5') => {
  switch (name?.toLowerCase()) {
    case 'messagecircle':
    case 'message-circle':
    case 'whatsapp':
      return <MessageCircle className={className} />;
    case 'mail':
    case 'email':
      return <Mail className={className} />;
    case 'clock':
    case 'time':
    case 'operating_hours':
      return <Clock className={className} />;
    case 'phone':
    case 'call':
      return <Phone className={className} />;
    case 'send':
      return <Send className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};

export default function VendorSupportPage() {
  const { hasPermission, user, brand } = useAuth();
  const [channels, setChannels] = useState<SupportChannel[]>(DEFAULT_CHANNELS);
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [whatsappInquiryNumber, setWhatsappInquiryNumber] = useState('60123456789');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('settlement');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchSupportData = async () => {
      try {
        const res = await fetch(`/data/support-channels.json?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.whatsapp_inquiry_number) {
              setWhatsappInquiryNumber(data.whatsapp_inquiry_number);
            }
            if (Array.isArray(data.channels) && data.channels.length > 0) {
              setChannels(data.channels);
            }
            if (Array.isArray(data.faqs) && data.faqs.length > 0) {
              setFaqs(data.faqs);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load support-channels.json', err);
      }
    };

    fetchSupportData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!hasPermission('vendor.support.view')) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-sm p-8 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-base-content">Access Restricted</h2>
        <p className="text-xs text-base-content/60 leading-relaxed">
          You do not have permission to access the Vendor Support & Help Desk. If you need assistance, please contact your administrator or brand owner.
        </p>
        <div>
          <Link
            href="/vendor-portal/dashboard"
            className="btn btn-primary btn-sm text-white font-semibold"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    settlement: 'Settlement & Payouts',
    catalog: 'Product Catalog & Listing',
    logistics: 'Central Hub Logistics & Stock',
    account: 'Account & Banking Details',
    other: 'General Inquiry',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const brandName = brand?.name || user?.name || 'Vendor Partner';
    const categoryName = categoryLabels[category] || category;

    const textLines = [
      `*New Vendor Inquiry*`,
      `• *Brand/Partner:* ${brandName}`,
      `• *Category:* ${categoryName}`,
      `• *Subject:* ${subject.trim() || 'No Subject'}`,
      ``,
      `*Message Details:*`,
      message.trim(),
    ];

    const encodedText = encodeURIComponent(textLines.join('\n'));
    const phone = (whatsappInquiryNumber || '60123456789').replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${phone}?text=${encodedText}`;

    window.open(waUrl, '_blank');
    setTicketSubmitted(true);
  };

  return (
    <div className="space-y-8 w-full pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-base-content tracking-tight flex items-center gap-2.5">
          <HelpCircle className="w-6 h-6 text-primary" />
          <span>Help & Support</span>
        </h1>
        <p className="text-xs text-base-content/60 mt-1">
          Find answers to common partner questions, review operational policies, or contact vendor support.
        </p>
      </div>

      {/* Quick Action Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="card bg-base-100 border border-base-300 shadow-sm hover:border-primary/40 transition-colors"
          >
            <div className="card-body p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  {renderIcon(channel.card_icon || channel.id, 'w-5 h-5')}
                </div>
                <h3 className="font-bold text-sm text-base-content">{channel.title}</h3>
                <p className="text-xs text-base-content/60 mt-1 whitespace-pre-line">
                  {channel.description}
                </p>
              </div>
              <div className="card-actions mt-4">
                <a
                  href={channel.link}
                  target={channel.target || '_self'}
                  rel={channel.target === '_blank' ? 'noreferrer' : undefined}
                  className="btn btn-outline btn-primary btn-sm w-full font-semibold gap-2"
                >
                  {renderIcon(channel.button_icon || channel.card_icon || channel.id, 'w-3.5 h-3.5')}
                  <span>{channel.button_text}</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQs and Support Ticket Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left 3 cols: FAQs */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-base-content">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="collapse collapse-plus bg-base-100 border border-base-300 rounded-xl shadow-xs"
              >
                <input type="checkbox" name="faq-accordion" />
                <div className="collapse-title text-sm font-semibold text-base-content flex items-center gap-2 pr-8">
                  <span>{faq.q}</span>
                </div>
                <div className="collapse-content text-xs text-base-content/75 leading-relaxed pt-1 border-t border-base-200">
                  <p className="pt-2">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>

          {hasPermission('vendor.accounting.view') && (
            <div className="p-4 bg-base-100 rounded-xl border border-base-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                <span className="text-base-content/80">Need to view recent invoices or statements?</span>
              </div>
              <Link
                href="/vendor-portal/accounting"
                className="text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span>Go to Accounting</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Right 2 cols: Ticket / Message Form */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 border border-base-300 shadow-sm sticky top-24">
            <div className="card-body p-6">
              <h2 className="text-base font-bold text-base-content flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span>Submit an Inquiry</span>
              </h2>
              <p className="text-xs text-base-content/60 mb-4">
                Have a specific question? Send your message directly to vendor operations via WhatsApp.
              </p>

              {ticketSubmitted ? (
                <div className="p-6 bg-success/10 border border-success/20 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-base-content">WhatsApp Chat Opened</h3>
                  <p className="text-xs text-base-content/70">
                    Your inquiry has been formatted and opened in WhatsApp. If WhatsApp did not open automatically, you can click below to try again.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTicketSubmitted(false);
                      setMessage('');
                      setSubject('');
                    }}
                    className="btn btn-outline btn-xs font-semibold mt-2"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label py-1">
                      <span className="label-text text-xs font-medium">Category</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="select select-bordered select-sm w-full text-xs"
                    >
                      <option value="settlement">Settlement & Payouts</option>
                      <option value="catalog">Product Catalog & Listing</option>
                      <option value="logistics">Central Hub Logistics & Stock</option>
                      <option value="account">Account & Banking Details</option>
                      <option value="other">General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="label py-1">
                      <span className="label-text text-xs font-medium">Subject</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Query regarding Statement #STMT-2026-W37"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="input input-bordered input-sm w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="label py-1">
                      <span className="label-text text-xs font-medium">Message Details</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please provide order IDs, statement codes, or details to help us assist you faster..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="textarea textarea-bordered w-full text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm w-full gap-2 text-xs font-semibold"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Send Inquiry via WhatsApp</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legal, Terms & Privacy Policies */}
      <div className="space-y-4 pt-4 border-t border-base-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h2 className="text-base font-bold text-base-content flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            <span>Merchant Compliance & Legal Policies</span>
          </h2>
          <span className="text-xs text-base-content/60">
            Statutory notices and partner agreements
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/vendor-portal/legal/pdpa"
            className="group card bg-base-100 border border-base-300 hover:border-primary/50 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="badge badge-sm badge-ghost text-[10px] font-semibold">Act 709</span>
              </div>
              <h3 className="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
                PDPA Notice
              </h3>
              <p className="text-xs text-base-content/60 mt-1 leading-relaxed">
                Personal Data Protection Act compliance policy and data processing consent notice.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-primary pt-3 mt-3 border-t border-base-200">
              <span>Read PDPA Notice</span>
              <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/vendor-portal/legal/terms"
            className="group card bg-base-100 border border-base-300 hover:border-primary/50 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="badge badge-sm badge-ghost text-[10px] font-semibold">Merchant T&amp;C</span>
              </div>
              <h3 className="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
                Terms &amp; Conditions
              </h3>
              <p className="text-xs text-base-content/60 mt-1 leading-relaxed">
                Vendor platform agreement, settlement obligations, and service level terms.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-primary pt-3 mt-3 border-t border-base-200">
              <span>Read Terms &amp; Conditions</span>
              <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/vendor-portal/legal/privacy-notice"
            className="group card bg-base-100 border border-base-300 hover:border-primary/50 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="badge badge-sm badge-ghost text-[10px] font-semibold">ISO 27001</span>
              </div>
              <h3 className="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
                Privacy Notice
              </h3>
              <p className="text-xs text-base-content/60 mt-1 leading-relaxed">
                Information security, merchant data handling practices, and privacy statement.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-primary pt-3 mt-3 border-t border-base-200">
              <span>Read Privacy Notice</span>
              <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Footer Shortcut Cards - Follows Vendor ACL */}
      {(() => {
        const shortcutGroups = [
          {
            title: 'Catalog',
            desc: 'Manage inventory listings, create new products, and track product level velocity.',
            icon: Package,
            items: [
              {
                label: 'Manage Products',
                href: '/vendor-portal/catalog/manage-product',
                icon: Boxes,
                permission: ['vendor.catalog.view', 'vendor.catalog.manage'],
              },
              {
                label: 'Add New Product',
                href: '/vendor-portal/catalog/add-product',
                icon: PlusCircle,
                permission: 'vendor.catalog.create',
              },
              {
                label: 'NCS Leaderboard',
                href: '/vendor-portal/catalog/performance',
                icon: TrendingUp,
                permission: ['vendor.catalog.performance', 'vendor.catalog.leaderboard'],
              },
              {
                label: 'Catalog Breakdown',
                href: '/vendor-portal/catalog/breakdown',
                icon: Layers,
                permission: 'vendor.catalog.breakdown',
              },
            ],
          },
          {
            title: 'Insights & Analytics',
            desc: 'Detailed sales reports, NCS contribution breakdown, and XLS export for accounting.',
            icon: BarChart3,
            items: [
              {
                label: 'Sales Report & Breakdown',
                href: '/vendor-portal/insights/sales-report',
                icon: BarChart3,
                permission: ['vendor.insights.sales', 'vendor.insights.sales_report'],
              },
              {
                label: 'Performance Report (XLS)',
                href: '/vendor-portal/insights/performance-report',
                icon: FileSpreadsheet,
                permission: ['vendor.insights.performance', 'vendor.insights.performance_report'],
              },
            ],
          },
          {
            title: 'Accounting & Settlements',
            desc: 'Inspect weekly statements, verify bank details, or apply for a higher settlement class.',
            icon: Receipt,
            items: [
              {
                label: 'Payout Statements',
                href: '/vendor-portal/accounting',
                icon: Receipt,
                permission: 'vendor.accounting.view',
              },
              {
                label: 'Settlement Plan & Tiers',
                href: '/vendor-portal/settlement-plan',
                icon: Layers,
                permission: 'vendor.settlement_plan.view',
              },
            ],
          },
        ];

        const visibleGroups = shortcutGroups
          .map((group) => ({
            ...group,
            items: group.items.filter((item) =>
              item.permission ? hasPermission(item.permission) : true
            ),
          }))
          .filter((group) => group.items.length > 0);

        if (visibleGroups.length === 0) return null;

        const gridColsClass =
          visibleGroups.length === 3
            ? 'md:grid-cols-3'
            : visibleGroups.length === 2
            ? 'md:grid-cols-2'
            : 'md:grid-cols-1';

        return (
          <div className="space-y-4 pt-4 border-t border-base-300">
            <h2 className="text-base font-bold text-base-content flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-primary" />
              <span>Vendor Hub Shortcuts</span>
            </h2>

            <div className={`grid grid-cols-1 ${gridColsClass} gap-5`}>
              {visibleGroups.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div
                    key={group.title}
                    className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="card-body p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                          <GroupIcon className="w-4 h-4" />
                          <span>{group.title}</span>
                        </div>
                        <p className="text-xs text-base-content/60">{group.desc}</p>
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-base-200">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="group flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-primary transition-all duration-200 font-medium"
                            >
                              <span className="flex items-center gap-2">
                                <ItemIcon className="w-3.5 h-3.5" />
                                <span>{item.label}</span>
                              </span>
                              <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
