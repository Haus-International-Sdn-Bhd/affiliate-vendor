'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { vendorApi } from '@/lib/api';
import { CashbackRule } from '@/lib/types';
import {
  Sparkles,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  DollarSign,
  Users,
  ShieldCheck,
  Trash2,
  Edit,
  X,
  Layers,
  Percent,
} from 'lucide-react';

export default function VendorCashbackPage() {
  const { brand } = useAuth();

  const [rules, setRules] = useState<CashbackRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPercent, setFormPercent] = useState<number>(2.5);
  const [formProductScope, setFormProductScope] = useState<'all' | 'price_range' | 'selected_products'>('all');
  const [formMinPrice, setFormMinPrice] = useState<number | ''>('');
  const [formMaxPrice, setFormMaxPrice] = useState<number | ''>('');
  const [formAudienceScope, setFormAudienceScope] = useState<'everyone' | 'selected_ranks'>('everyone');
  const [formRanks, setFormRanks] = useState<string[]>([]);
  const [formPriority, setFormPriority] = useState<number>(10);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Available ranks for selection
  const RANK_OPTIONS = [
    { key: 'silver', label: 'Silver' },
    { key: 'gold', label: 'Gold' },
    { key: 'platinum', label: 'Platinum' },
    { key: 'diamond', label: 'Diamond' },
    { key: 'star_partner', label: 'Star Partner' },
  ];

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await vendorApi.getCashbackRules();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setRules(list);
    } catch (err) {
      console.error('Failed to load brand cashback rules', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [brand?.id]);

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormName('');
    setFormDescription('');
    setFormPercent(2.5);
    setFormProductScope('all');
    setFormMinPrice('');
    setFormMaxPrice('');
    setFormAudienceScope('everyone');
    setFormRanks([]);
    setFormPriority(10);
    setFormIsActive(true);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: CashbackRule) => {
    setIsEditMode(true);
    setEditingId(rule.id);
    setFormName(rule.name);
    setFormDescription(rule.description || '');
    setFormPercent(Number(rule.cashback_percent) || 2.0);
    setFormProductScope(rule.product_scope || 'all');
    setFormMinPrice(rule.min_price !== undefined && rule.min_price !== null ? rule.min_price : '');
    setFormMaxPrice(rule.max_price !== undefined && rule.max_price !== null ? rule.max_price : '');
    setFormAudienceScope((rule.audience_scope as any) || 'everyone');
    setFormRanks(rule.selected_ranks || []);
    setFormPriority(rule.priority || 10);
    setFormIsActive(rule.is_active);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleRankToggle = (rankKey: string) => {
    if (formRanks.includes(rankKey)) {
      setFormRanks(formRanks.filter((r) => r !== rankKey));
    } else {
      setFormRanks([...formRanks, rankKey]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMessage('Rule name is required.');
      return;
    }

    if (formPercent < 0.1 || formPercent > 20.0) {
      setErrorMessage('Cashback percent must be between 0.1% and 20.0%.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: any = {
      name: formName.trim(),
      description: formDescription.trim(),
      cashback_percent: formPercent,
      product_scope: formProductScope,
      min_price: formMinPrice !== '' ? Number(formMinPrice) : null,
      max_price: formMaxPrice !== '' ? Number(formMaxPrice) : null,
      audience_scope: formAudienceScope,
      selected_ranks: formAudienceScope === 'selected_ranks' ? formRanks : null,
      priority: Number(formPriority) || 10,
      is_active: formIsActive,
    };

    try {
      if (isEditMode && editingId) {
        await vendorApi.updateCashbackRule(editingId, payload);
        setSuccessMessage('Cashback rule updated successfully.');
      } else {
        await vendorApi.createCashbackRule(payload);
        setSuccessMessage(
          formPercent <= 3.0
            ? 'Cashback rule created and automatically approved!'
            : 'Cashback rule created and submitted for review (rate > 3.0%).',
        );
      }
      setIsModalOpen(false);
      fetchRules();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Failed saving cashback rule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (rule: CashbackRule) => {
    if (!window.confirm(`Are you sure you want to delete rule "${rule.name}"?`)) {
      return;
    }
    try {
      await vendorApi.deleteCashbackRule(rule.id);
      fetchRules();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete rule.');
    }
  };

  // Filtered Rules
  const filteredRules = rules.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = r.name?.toLowerCase().includes(q);
      const matchDesc = r.description?.toLowerCase().includes(q);
      return matchName || matchDesc;
    }
    return true;
  });

  const activeCount = rules.filter((r) => r.is_active && r.status === 'approved').length;
  const pendingCount = rules.filter((r) => r.status === 'pending_approval').length;

  return (
    <div className="space-y-6 w-full max-w-7xl pb-16">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-base-content flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-500" />
              <span>Customer Cashback Rules</span>
            </h1>
            {brand && (
              <span className="badge badge-primary badge-sm font-bold uppercase tracking-wider">
                {brand.name}
              </span>
            )}
          </div>
          <p className="text-xs text-base-content/60 mt-1">
            Reward your customers with instant withdrawable cashback (2.0% – 5.0%) credited directly into their VamoWallet.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn btn-primary btn-sm gap-2 font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Cashback Rule</span>
        </button>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="alert alert-success bg-success/15 border border-success/30 text-xs font-semibold text-success flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button type="button" onClick={() => setSuccessMessage(null)} className="btn btn-ghost btn-xs btn-circle">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Stat Cards (Overlay Icon Pattern) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Rules */}
        <div className="group relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-all hover:shadow-md">
          <div className="relative z-10 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-base-content/60">Active Live Rules</p>
            {isLoading ? (
              <div className="skeleton h-8 w-20"></div>
            ) : (
              <p className="text-2xl font-black tracking-tight text-base-content">{activeCount}</p>
            )}
            <p className="text-[11px] text-base-content/50">Covering {brand?.name || 'this brand'}</p>
          </div>
          <CheckCircle2 className="pointer-events-none absolute -bottom-3 -right-3 h-20 w-20 text-emerald-500/10 transition-all duration-500 ease-out group-hover:scale-125 group-hover:-translate-y-2 group-hover:-translate-x-1 group-hover:rotate-6 group-hover:text-emerald-500/20" />
        </div>

        {/* Card 2: Pending Approval */}
        <div className="group relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-all hover:shadow-md">
          <div className="relative z-10 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-base-content/60">Pending Review</p>
            {isLoading ? (
              <div className="skeleton h-8 w-16"></div>
            ) : (
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-black tracking-tight ${pendingCount > 0 ? 'text-amber-500' : 'text-base-content'}`}>
                  {pendingCount}
                </p>
                {pendingCount > 0 && <span className="badge badge-warning badge-xs">Under Review</span>}
              </div>
            )}
            <p className="text-[11px] text-base-content/50">Rules &gt; 3.0% need review</p>
          </div>
          <Clock className="pointer-events-none absolute -bottom-3 -right-3 h-20 w-20 text-amber-500/10 transition-all duration-500 ease-out group-hover:scale-125 group-hover:-translate-y-2 group-hover:-translate-x-1 group-hover:rotate-6 group-hover:text-amber-500/20" />
        </div>

        {/* Card 3: Maximum Incentive Cap */}
        <div className="group relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-all hover:shadow-md">
          <div className="relative z-10 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-base-content/60">Allowed Rate Range</p>
            <p className="text-2xl font-black tracking-tight text-primary">2.0% – 5.0%</p>
            <p className="text-[11px] text-base-content/50">Bounded by compensation policy</p>
          </div>
          <Percent className="pointer-events-none absolute -bottom-3 -right-3 h-20 w-20 text-primary/10 transition-all duration-500 ease-out group-hover:scale-125 group-hover:-translate-y-2 group-hover:-translate-x-1 group-hover:rotate-6 group-hover:text-primary/20" />
        </div>

        {/* Card 4: Wallet Release Rule */}
        <div className="group relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-all hover:shadow-md">
          <div className="relative z-10 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-base-content/60">Credited Wallet</p>
            <p className="text-2xl font-black tracking-tight text-info">VamoWallet</p>
            <p className="text-[11px] text-base-content/50">Withdrawable cash balance</p>
          </div>
          <DollarSign className="pointer-events-none absolute -bottom-3 -right-3 h-20 w-20 text-info/10 transition-all duration-500 ease-out group-hover:scale-125 group-hover:-translate-y-2 group-hover:-translate-x-1 group-hover:rotate-6 group-hover:text-info/20" />
        </div>
      </div>

      {/* Auto-Approval Rule Notice */}
      <div className="alert alert-info bg-info/10 border border-info/20 text-xs">
        <ShieldCheck className="w-5 h-5 text-info shrink-0" />
        <div className="space-y-0.5">
          <p className="font-bold text-info">Instant Auto-Approval Safeguard</p>
          <p className="text-base-content/70">
            Rules configured at <strong>2.0% up to 3.0%</strong> are automatically approved instantly. Rules between <strong>3.1% and 5.0%</strong> are submitted to Vamoflex Merchant Operations for rapid compliance review.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card card-border bg-base-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-base-content/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-sm input-bordered w-full pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select select-sm select-bordered text-xs font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending_approval">Pending Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="card card-border bg-base-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <div className="skeleton h-8 w-40"></div>
            <div className="space-y-3">
              <div className="skeleton h-12 w-full"></div>
              <div className="skeleton h-12 w-full"></div>
              <div className="skeleton h-12 w-full"></div>
            </div>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-base-200 text-base-content/40 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-base-content">No Cashback Rules Found</h3>
            <p className="text-xs text-base-content/60 max-w-sm mx-auto">
              Boost your brand sales by setting up customer cashback incentives between 2.0% and 5.0%.
            </p>
            <button type="button" onClick={openCreateModal} className="btn btn-primary btn-xs font-semibold">
              Create First Rule
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-hover">
              <thead>
                <tr className="bg-base-200/50 text-xs text-base-content/70">
                  <th>Rule Name</th>
                  <th>Cashback %</th>
                  <th>Product Scope (WHAT)</th>
                  <th>Target Audience (WHO)</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-base-200">
                {filteredRules.map((rule) => {
                  const isApproved = rule.status === 'approved';
                  const isPending = rule.status === 'pending_approval';

                  return (
                    <tr key={rule.id} className="hover">
                      <td>
                        <div className="space-y-0.5">
                          <p className="font-bold text-base-content text-sm">{rule.name}</p>
                          {rule.description && (
                            <p className="text-[11px] text-base-content/60 line-clamp-1">{rule.description}</p>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="badge badge-primary font-bold text-xs">
                          {Number(rule.cashback_percent).toFixed(1)}%
                        </span>
                      </td>

                      <td>
                        <div className="space-y-0.5">
                          {rule.product_scope === 'all' && (
                            <span className="badge badge-ghost badge-sm font-semibold">All Brand Products</span>
                          )}
                          {rule.product_scope === 'price_range' && (
                            <div className="space-y-0.5">
                              <span className="badge badge-info badge-sm font-semibold">Unit Price Range</span>
                              <p className="text-[11px] text-base-content/60">
                                RM{rule.min_price || 0} – RM{rule.max_price || '∞'}
                              </p>
                            </div>
                          )}
                          {rule.product_scope === 'selected_products' && (
                            <span className="badge badge-secondary badge-sm font-semibold">
                              {rule.selected_product_ids?.length || 0} Selected Products
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        {rule.audience_scope === 'everyone' && (
                          <span className="badge badge-outline badge-sm">All Customers</span>
                        )}
                        {rule.audience_scope === 'selected_ranks' && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {(rule.selected_ranks || []).map((rk) => (
                              <span key={rk} className="badge badge-xs badge-accent uppercase font-bold">
                                {rk}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td>
                        <span className="font-mono text-xs">{rule.priority}</span>
                      </td>

                      <td>
                        {isApproved && (
                          <span className="badge badge-success badge-sm font-semibold gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved
                          </span>
                        )}
                        {isPending && (
                          <span className="badge badge-warning badge-sm font-semibold gap-1">
                            <Clock className="w-3 h-3" />
                            Pending Review
                          </span>
                        )}
                        {rule.status === 'rejected' && (
                          <span className="badge badge-error badge-sm font-semibold gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                      </td>

                      <td className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(rule)}
                            className="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-primary"
                            title="Edit Rule"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(rule)}
                            className="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-error"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="card bg-base-100 border border-base-300 w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-base-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-base-content flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>{isEditMode ? 'Edit Cashback Rule' : 'New Customer Cashback Rule'}</span>
                </h3>
                <p className="text-xs text-base-content/60">Configure reward rate & product scope for {brand?.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {errorMessage && (
                <div className="alert alert-error bg-error/15 border border-error/30 text-xs text-error font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Rule Name */}
              <div className="space-y-1">
                <label className="label py-0 font-bold text-base-content">Rule Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard 2% Customer Cashback"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="input input-sm input-bordered w-full text-xs font-semibold"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="label py-0 font-semibold text-base-content/70">Description / Campaign Notes</label>
                <input
                  type="text"
                  placeholder="e.g. General launch promotion on all brand products"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="input input-sm input-bordered w-full text-xs"
                />
              </div>

              {/* Cashback Percentage (Starts from 0.1% to 10%+, manual input & slider) */}
              <div className="space-y-3 rounded-xl bg-base-200/50 border border-base-300 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label className="label py-0 font-bold text-base-content text-xs">
                      Cashback Reward Rate *
                    </label>
                    <p className="text-[10px] text-base-content/60">Type exact percent or drag slider</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="20.0"
                      value={formPercent}
                      onChange={(e) => setFormPercent(parseFloat(e.target.value) || 0)}
                      className="input input-sm input-bordered font-black text-sm text-primary w-20 text-right rounded-lg"
                    />
                    <span className="text-sm font-bold text-base-content/70">%</span>
                    {formPercent <= 3.0 ? (
                      <span className="badge badge-success badge-xs font-bold">Auto (≤3%)</span>
                    ) : (
                      <span className="badge badge-warning badge-xs font-bold">Review (&gt;3%)</span>
                    )}
                  </div>
                </div>

                <input
                  type="range"
                  min="0.1"
                  max="10.0"
                  step="0.1"
                  value={formPercent}
                  onChange={(e) => setFormPercent(parseFloat(e.target.value))}
                  className="range range-primary range-xs"
                />
                <div className="flex justify-between text-[10px] text-base-content/50 font-mono">
                  <span>0.1% (Min)</span>
                  <span>3.0% (Auto-threshold)</span>
                  <span>5.0%</span>
                  <span>10.0% (Max slider)</span>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] font-semibold text-base-content/50 uppercase mr-1">Presets:</span>
                  {[0.1, 0.5, 1.0, 2.0, 3.0, 5.0, 9.0].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormPercent(preset)}
                      className={`btn btn-xs rounded-md ${formPercent === preset ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Scope (WHAT) */}
              <div className="space-y-2">
                <label className="label py-0 font-bold text-base-content">Product Scope (WHAT)</label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${formProductScope === 'all' ? 'border-primary bg-primary/5' : 'border-base-300'}`}
                  >
                    <input
                      type="radio"
                      name="productScope"
                      checked={formProductScope === 'all'}
                      onChange={() => setFormProductScope('all')}
                      className="radio radio-primary radio-xs"
                    />
                    <span className="font-semibold text-xs">All Brand Products</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${formProductScope === 'price_range' ? 'border-primary bg-primary/5' : 'border-base-300'}`}
                  >
                    <input
                      type="radio"
                      name="productScope"
                      checked={formProductScope === 'price_range'}
                      onChange={() => setFormProductScope('price_range')}
                      className="radio radio-primary radio-xs"
                    />
                    <span className="font-semibold text-xs">Unit Price Range</span>
                  </label>
                </div>

                {formProductScope === 'price_range' && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <span className="text-[10px] text-base-content/60 font-semibold">Min Unit Price (RM)</span>
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        value={formMinPrice}
                        onChange={(e) => setFormMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="input input-sm input-bordered w-full text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-base-content/60 font-semibold">Max Unit Price (RM)</span>
                      <input
                        type="number"
                        placeholder="e.g. 150"
                        value={formMaxPrice}
                        onChange={(e) => setFormMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="input input-sm input-bordered w-full text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Target Audience (WHO) */}
              <div className="space-y-2">
                <label className="label py-0 font-bold text-base-content">Target Audience (WHO)</label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${formAudienceScope === 'everyone' ? 'border-primary bg-primary/5' : 'border-base-300'}`}
                  >
                    <input
                      type="radio"
                      name="audienceScope"
                      checked={formAudienceScope === 'everyone'}
                      onChange={() => setFormAudienceScope('everyone')}
                      className="radio radio-primary radio-xs"
                    />
                    <span className="font-semibold text-xs">All Customers (Everyone)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${formAudienceScope === 'selected_ranks' ? 'border-primary bg-primary/5' : 'border-base-300'}`}
                  >
                    <input
                      type="radio"
                      name="audienceScope"
                      checked={formAudienceScope === 'selected_ranks'}
                      onChange={() => setFormAudienceScope('selected_ranks')}
                      className="radio radio-primary radio-xs"
                    />
                    <span className="font-semibold text-xs">Specific Ranks</span>
                  </label>
                </div>

                {formAudienceScope === 'selected_ranks' && (
                  <div className="pt-2 flex items-center gap-2 flex-wrap">
                    {RANK_OPTIONS.map((rk) => (
                      <label
                        key={rk.key}
                        className={`btn btn-xs ${formRanks.includes(rk.key) ? 'btn-primary' : 'btn-outline'}`}
                      >
                        <input
                          type="checkbox"
                          checked={formRanks.includes(rk.key)}
                          onChange={() => handleRankToggle(rk.key)}
                          className="hidden"
                        />
                        <span>{rk.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-[10px] text-base-content/60 font-semibold">Priority (Higher wins)</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formPriority}
                    onChange={(e) => setFormPriority(Number(e.target.value))}
                    className="input input-sm input-bordered w-full text-xs"
                  />
                </div>

                <div className="flex items-center pt-4">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="checkbox checkbox-sm checkbox-primary"
                    />
                    <span className="label-text text-xs font-semibold">Active Rule</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-base-200 flex items-center justify-end gap-2 -mx-6 -mb-6 bg-base-200/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost btn-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-sm font-bold gap-2"
                >
                  {isSubmitting ? 'Saving...' : isEditMode ? 'Update Rule' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
