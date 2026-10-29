'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { vendorApi } from '@/lib/api';
import { Product, ProductVariant } from '@/lib/types';
import {
  Package,
  DollarSign,
  Layers,
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Sparkles,
  ShieldAlert,
  Boxes,
  Zap,
  Globe,
  Ban,
  Check,
  ExternalLink,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

type TabType = 'details' | 'gallery' | 'variants' | 'stock' | 'cashback';

const TABS: Array<{ id: TabType; label: string; stepLabel: string; icon: any }> = [
  { id: 'details', label: 'Product Details', stepLabel: 'Basics & pricing', icon: Package },
  { id: 'gallery', label: 'Gallery', stepLabel: 'Photos', icon: ImageIcon },
  { id: 'variants', label: 'Variants', stepLabel: 'Options & matrix', icon: Layers },
  { id: 'stock', label: 'Stock', stepLabel: 'Inventory overview', icon: Boxes },
  { id: 'cashback', label: 'Cashback', stepLabel: 'Rewards & rules', icon: Sparkles },
];

interface ProductFormProps {
  initialData?: Partial<Product>;
  isEditing?: boolean;
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission, brand } = useAuth();

  // Active step navigation from query param ?step= or default 'details'
  const stepParam = searchParams.get('step') as TabType | null;
  const initialTab: TabType = stepParam && TABS.some((t) => t.id === stepParam) ? stepParam : 'details';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Form Fields - Step 1: Details
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [barcode, setBarcode] = useState((initialData as any)?.barcode || '');
  const [unit, setUnit] = useState((initialData as any)?.unit || 'pcs');
  const [category, setCategory] = useState((initialData as any)?.category?.name || (initialData as any)?.category || 'General');
  const [productType, setProductType] = useState((initialData as any)?.product_type || 'physical');
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<'active' | 'draft' | 'inactive'>(initialData?.status || 'active');

  // Catalog Visibility Toggles
  const [featured, setFeatured] = useState<boolean>(Boolean((initialData as any)?.featured));
  const [bestSeller, setBestSeller] = useState<boolean>(Boolean((initialData as any)?.best_seller));
  const [promotionProduct, setPromotionProduct] = useState<boolean>(Boolean((initialData as any)?.promotion_product));
  const [showInShop, setShowInShop] = useState<boolean>((initialData as any)?.show_in_shop !== undefined ? Boolean((initialData as any)?.show_in_shop) : true);

  // Pricing
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '');
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialData?.compare_at_price ? String(initialData.compare_at_price) : ''
  );
  const [costPrice, setCostPrice] = useState(
    initialData?.cost_price ? String(initialData.cost_price) : ''
  );

  // Step 2: Gallery
  const [featuredImage, setFeaturedImage] = useState(initialData?.featured_image || (initialData as any)?.image || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialData?.gallery_images || (initialData as any)?.images?.map((img: any) => img.image_url || img) || []
  );
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Step 3: Variants
  const [hasVariants, setHasVariants] = useState<boolean>(
    initialData?.has_variants || (initialData?.variants && initialData.variants.length > 0) || false
  );
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants || [
      { name: 'Standard', sku: sku ? `${sku}-std` : 'STD-01', price: Number(price) || 0, stock: 10 }
    ]
  );

  // Step 4: Stock
  const [stock, setStock] = useState(initialData?.stock ? String(initialData.stock) : '0');
  const [trackInventory, setTrackInventory] = useState<boolean>(
    (initialData as any)?.track_inventory !== undefined ? Boolean((initialData as any)?.track_inventory) : true
  );
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(
    (initialData as any)?.low_stock_threshold || 5
  );

  // Step 5: Cashback Configuration (ON, OFF, GLOBAL)
  const [cashbackMode, setCashbackMode] = useState<'on' | 'off' | 'global'>('global');
  const [cashbackPercent, setCashbackPercent] = useState<number>(5.0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | string>('base');
  const [cashbackGlobalInherited, setCashbackGlobalInherited] = useState<{
    percent: number;
    rule_name: string;
    calculated_amount: number;
  } | null>(null);
  const [isLoadingCashback, setIsLoadingCashback] = useState(false);
  const [isSavingCashback, setIsSavingCashback] = useState(false);
  const [cashbackSaveSuccess, setCashbackSaveSuccess] = useState(false);

  // Form Global States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync activeTab with URL if stepParam changes
  useEffect(() => {
    if (stepParam && TABS.some((t) => t.id === stepParam)) {
      setActiveTab(stepParam);
    }
  }, [stepParam]);

  // Load cashback data when entering Tab 5
  useEffect(() => {
    if (activeTab === 'cashback' && isEditing && initialData?.id) {
      loadCashbackConfig();
    }
  }, [activeTab, isEditing, initialData?.id]);

  const loadCashbackConfig = async () => {
    if (!initialData?.id) return;
    try {
      setIsLoadingCashback(true);
      const res = await vendorApi.getProductCashbackConfig(initialData.id);
      if (res?.data) {
        const d = res.data;
        setCashbackMode(d.mode || 'global');
        setCashbackPercent(typeof d.percent === 'number' && d.percent > 0 ? d.percent : 5.0);
        setCashbackGlobalInherited(d.global_inherited || null);
      }
    } catch (err) {
      console.error('Failed to load product cashback config', err);
    } finally {
      setIsLoadingCashback(false);
    }
  };

  const handleSaveCashback = async () => {
    if (!initialData?.id) return;
    try {
      setIsSavingCashback(true);
      setCashbackSaveSuccess(false);
      const res = await vendorApi.saveProductCashbackConfig(initialData.id, {
        mode: cashbackMode,
        percent: cashbackMode === 'on' ? cashbackPercent : 0,
      });
      setCashbackSaveSuccess(true);
      setSuccess(res?.message || 'Cashback configuration saved successfully!');
      setTimeout(() => setCashbackSaveSuccess(false), 3000);
      loadCashbackConfig();
    } catch (err: any) {
      console.error('Failed to save cashback config', err);
      setError(err?.response?.data?.message || 'Failed to save cashback configuration.');
    } finally {
      setIsSavingCashback(false);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleAddGalleryImage = () => {
    if (!newGalleryUrl.trim()) return;
    setGalleryImages([...galleryImages, newGalleryUrl.trim()]);
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== idx));
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        name: `Option ${variants.length + 1}`,
        sku: sku ? `${sku}-${variants.length + 1}` : `SKU-${variants.length + 1}`,
        price: Number(price) || 0,
        stock: 10,
      },
    ]);
  };

  const handleUpdateVariant = (idx: number, field: keyof ProductVariant, val: any) => {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [field]: val };
    setVariants(updated);
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  // Step Navigation Helpers
  const currentStepIndex = TABS.findIndex((t) => t.id === activeTab);
  const canGoPrev = currentStepIndex > 0;
  const canGoNext = currentStepIndex < TABS.length - 1;

  const handleTabChange = (tabId: TabType) => {
    if (!isEditing && tabId !== 'details') {
      return; // Lock subsequent tabs in create mode until initial save
    }
    setActiveTab(tabId);
    router.replace(`/vendor-portal/catalog/edit?id=${initialData?.id || ''}&step=${tabId}`);
  };

  const handleNextStep = () => {
    if (canGoNext) {
      handleTabChange(TABS[currentStepIndex + 1].id);
    }
  };

  const handlePrevStep = () => {
    if (canGoPrev) {
      handleTabChange(TABS[currentStepIndex - 1].id);
    }
  };

  // Main Form Submit (Product Details, Media, Variants, Stock)
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (activeTab === 'cashback') {
      await handleSaveCashback();
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload: any = {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        sku,
        barcode,
        unit,
        category,
        product_type: productType,
        price: parseFloat(price) || 0,
        compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
        cost_price: costPrice ? parseFloat(costPrice) : null,
        stock: parseInt(stock, 10) || 0,
        track_inventory: trackInventory,
        low_stock_threshold: lowStockThreshold,
        short_description: shortDescription,
        description,
        status,
        featured,
        best_seller: bestSeller,
        promotion_product: promotionProduct,
        show_in_shop: showInShop,
        featured_image: featuredImage,
        gallery_images: galleryImages,
        has_variants: hasVariants,
        variants: hasVariants ? variants : [],
      };

      if (isEditing && initialData?.id) {
        await vendorApi.updateProduct(String(initialData.id), payload);
        setSuccess('Product updated successfully!');
      } else {
        const created = await vendorApi.createProduct(payload);
        const newId = created?.product?.id || created?.data?.id || created?.id;
        setSuccess('Product created successfully! Redirecting to studio editor...');
        if (newId) {
          setTimeout(() => {
            router.push(`/vendor-portal/catalog/edit?id=${newId}&step=gallery`);
          }, 1000);
          return;
        }
      }

      setTimeout(() => {
        setSuccess(null);
      }, 3500);
    } catch (err: any) {
      console.error('Failed to save product', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'An error occurred while saving the product.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Simulation Getters for Tab 5
  const activeSimulationPrice: number = (() => {
    if (selectedVariantId !== 'base') {
      const found = variants.find((_, idx) => String(idx) === String(selectedVariantId) || String(_.sku) === String(selectedVariantId));
      if (found && typeof found.price === 'number') return found.price;
    }
    return parseFloat(price) || 0;
  })();

  const calculatedRewardAmount: number = (() => {
    if (cashbackMode === 'off') return 0;
    if (cashbackMode === 'global') {
      const gPercent = cashbackGlobalInherited?.percent ?? 2.0;
      return Math.round(activeSimulationPrice * (gPercent / 100.0) * 100) / 100;
    }
    return Math.round(activeSimulationPrice * (cashbackPercent / 100.0) * 100) / 100;
  })();

  const calculatedNetMerchantAmount: number = Math.max(
    0,
    Math.round((activeSimulationPrice - calculatedRewardAmount) * 100) / 100
  );

  const requiredPerm = isEditing ? ['vendor.catalog.edit', 'vendor.catalog.manage'] : 'vendor.catalog.create';
  if (!hasPermission(requiredPerm)) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-sm p-8 text-center max-w-lg mx-auto my-12 rounded-2xl">
        <div className="w-14 h-14 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-base-content mb-2">Access Restricted</h2>
        <p className="text-sm text-base-content/70 mb-6 leading-relaxed">
          {isEditing
            ? 'You do not have permission to edit product details. Please contact your marketplace administrator to request catalog edit permissions.'
            : 'You do not have permission to add new products to the catalog. Please contact your marketplace administrator to request catalog creation permissions.'}
        </p>
        <div className="flex justify-center">
          <Link
            href="/vendor-portal/catalog/manage-product"
            className="btn btn-primary btn-sm text-white px-6"
          >
            Return to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/vendor-portal/catalog/manage-product" className="btn btn-circle btn-ghost btn-sm shrink-0 mt-0.5">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-base-content">
                {isEditing ? `Edit: ${name || 'Product'}` : 'Create New Product'}
              </h1>
              {brand?.name && (
                <span className="badge badge-sm badge-outline text-primary border-primary/30 bg-primary/5 font-bold">
                  {brand.name}
                </span>
              )}
            </div>
            <p className="text-sm text-base-content/60 mt-0.5">
              {isEditing
                ? 'Update specifications, media assets, inventory, and customer cashback rules.'
                : 'Fill in essentials to publish your product to the VAMOFLEX marketplace.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/vendor-portal/catalog/manage-product" className="btn btn-ghost btn-sm text-xs">
            Cancel
          </Link>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={loading || isSavingCashback}
            className="btn btn-primary btn-sm text-white text-xs gap-1.5 shadow-sm"
          >
            {loading || isSavingCashback ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{activeTab === 'cashback' ? 'Save Cashback Rules' : (isEditing ? 'Save Changes' : 'Publish Product')}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert alert-error text-xs shadow-sm py-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success text-xs shadow-sm py-2.5 text-white">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Stepper Card */}
      <div className="card border border-base-300 overflow-hidden bg-base-100 shadow-sm">
        {/* Horizontal Navigation Stepper matching Storefront */}
        <nav className="border-b border-base-300 px-4 py-4 sm:px-6 bg-base-100" aria-label="Product setup steps">
          <ol className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            {TABS.map((tab, idx) => {
              const isActive = activeTab === tab.id;
              const isLocked = !isEditing && tab.id !== 'details';
              return (
                <li key={tab.id} className="flex flex-1 items-start gap-2 sm:flex-col sm:items-center sm:text-center">
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2.5 sm:flex-col sm:items-center p-2 rounded-xl transition-all text-left sm:text-center w-full ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold ring-1 ring-primary/20'
                        : isLocked
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-base-200 text-base-content/70'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-base-200 text-base-content/60'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold leading-tight">{tab.label}</span>
                      <span className="text-[10px] text-base-content/50 block mt-0.5">
                        {isLocked ? 'Save basics first' : tab.stepLabel}
                      </span>
                    </span>
                  </button>
                  {idx < TABS.length - 1 && (
                    <div className="hidden sm:block flex-1 h-px bg-base-300 mx-2 mt-4 min-w-[1rem]" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Tab Content Area */}
        <div className="p-5 sm:p-7">
          {/* TAB 1: PRODUCT DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Core Details Fieldset */}
              <div>
                <h3 className="text-base font-bold text-base-content">Core Details</h3>
                <p className="text-xs text-base-content/60 mb-4">
                  Name, product identifiers, barcode, and classification.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-base-content">
                      Product Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full text-xs font-medium"
                      placeholder="e.g. Signature Eau De Parfum"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-base-content">
                      SKU <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full text-xs font-mono"
                      placeholder="e.g. BARIQI-EDP-50ML"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-base-content">Barcode</label>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full text-xs font-mono"
                      placeholder="e.g. 9551234567890"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-base-content">Product Unit</label>
                    <select
                      className="select select-bordered select-sm w-full text-xs"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    >
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="box">Box (box)</option>
                      <option value="set">Set (set)</option>
                      <option value="bottle">Bottle (btl)</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="g">Grams (g)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-base-content">Category</label>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full text-xs"
                      placeholder="e.g. Fragrance / Health & Beauty"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-base-content">Product Type</label>
                    <select
                      className="select select-bordered select-sm w-full text-xs"
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                    >
                      <option value="physical">Physical (Requires Delivery)</option>
                      <option value="digital">Digital (Instant Fulfillment)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="divider my-2" />

              {/* Descriptions */}
              <div>
                <h3 className="text-base font-bold text-base-content">Descriptions</h3>
                <p className="text-xs text-base-content/60 mb-4">
                  Summary for marketplace listings and detailed specs for product page.
                </p>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-base-content">Short Summary</label>
                    <textarea
                      rows={2}
                      className="textarea textarea-bordered w-full text-xs"
                      placeholder="Brief highlights shown in catalog lists and quick views..."
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-base-content">Full Product Description</label>
                    <textarea
                      rows={5}
                      className="textarea textarea-bordered w-full text-xs font-normal"
                      placeholder="Detailed breakdown of ingredients, directions, benefits, and notes..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="divider my-2" />

              {/* Pricing & Catalog Visibility */}
              <div>
                <h3 className="text-base font-bold text-base-content">Pricing & Visibility</h3>
                <p className="text-xs text-base-content/60 mb-4">
                  Retail selling price, promotional badges, and shop display toggles.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-base-content">
                      Retail Selling Price (MYR) <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-base-content/50">RM</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="input input-bordered input-sm w-full pl-10 text-xs font-bold tabular-nums"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-base-content">Compare-at Price (RRP)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-base-content/50">RM</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="input input-bordered input-sm w-full pl-10 text-xs font-medium tabular-nums"
                        placeholder="0.00"
                        value={compareAtPrice}
                        onChange={(e) => setCompareAtPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-base-content">Cost Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-base-content/50">RM</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="input input-bordered input-sm w-full pl-10 text-xs font-medium tabular-nums"
                        placeholder="0.00"
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Promotional Switches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-base-200 bg-base-100 hover:bg-base-200/50 cursor-pointer">
                    <span className="text-xs font-semibold text-base-content">Show in Shop</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-primary rounded"
                      checked={showInShop}
                      onChange={(e) => setShowInShop(e.target.checked)}
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-base-200 bg-base-100 hover:bg-base-200/50 cursor-pointer">
                    <span className="text-xs font-semibold text-base-content">Featured Item</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-primary rounded"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-base-200 bg-base-100 hover:bg-base-200/50 cursor-pointer">
                    <span className="text-xs font-semibold text-base-content">Best Seller Badge</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-primary rounded"
                      checked={bestSeller}
                      onChange={(e) => setBestSeller(e.target.checked)}
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-base-200 bg-base-100 hover:bg-base-200/50 cursor-pointer">
                    <span className="text-xs font-semibold text-base-content">Promo Campaign</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-primary rounded"
                      checked={promotionProduct}
                      onChange={(e) => setPromotionProduct(e.target.checked)}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-base-content">Product Media & Gallery</h3>
                <p className="text-xs text-base-content/60 mb-4">
                  High-resolution square photos (1:1) look best on marketplace listings.
                </p>

                <div className="space-y-4">
                  {/* Featured Cover Image */}
                  <div className="p-4 rounded-xl border border-base-200 bg-base-200/40 space-y-3">
                    <label className="text-xs font-bold text-base-content block">
                      Main Featured Cover Image URL <span className="text-error">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        className="input input-bordered input-sm flex-1 text-xs"
                        placeholder="https://images.unsplash.com/... or cloud CDN url"
                        value={featuredImage}
                        onChange={(e) => setFeaturedImage(e.target.value)}
                      />
                    </div>

                    {featuredImage && (
                      <div className="mt-2 w-28 h-28 rounded-xl border border-base-300 overflow-hidden bg-base-100">
                        <img
                          src={featuredImage}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => ((e.target as any).src = '')}
                        />
                      </div>
                    )}
                  </div>

                  {/* Additional Gallery URLs */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-base-content block">
                      Additional Gallery Images
                    </label>
                    <div className="flex gap-2 max-w-lg">
                      <input
                        type="url"
                        className="input input-bordered input-sm flex-1 text-xs"
                        placeholder="Paste image URL to append..."
                        value={newGalleryUrl}
                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddGalleryImage();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddGalleryImage}
                        className="btn btn-sm btn-primary text-white text-xs gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {galleryImages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                        {galleryImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative group rounded-xl border border-base-300 overflow-hidden h-28 bg-base-200">
                            <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                className="btn btn-error btn-xs btn-circle text-white"
                                title="Remove Image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 border border-dashed border-base-300 rounded-xl text-center text-xs text-base-content/50">
                        No secondary gallery images added yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VARIANTS */}
          {activeTab === 'variants' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-base-200">
                <div>
                  <h3 className="text-base font-bold text-base-content">Product Variants & Attributes</h3>
                  <p className="text-xs text-base-content/60">
                    Configure variations such as sizing, volume, packaging, or shades.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-base-200/60 px-3 py-1.5 rounded-xl border border-base-300">
                  <span className="text-xs font-bold text-base-content">Has Variants</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs checkbox-primary rounded"
                    checked={hasVariants}
                    onChange={(e) => setHasVariants(e.target.checked)}
                  />
                </label>
              </div>

              {hasVariants ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-base-content/70">
                      Variant Matrix ({variants.length} option{variants.length === 1 ? '' : 's'})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="btn btn-sm btn-primary text-white text-xs gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Variant</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-base-300 rounded-xl">
                    <table className="table table-sm w-full text-xs">
                      <thead className="bg-base-200/60 text-base-content/60 uppercase text-[10px]">
                        <tr>
                          <th>Variant Name</th>
                          <th>SKU</th>
                          <th className="text-right">Price (RM)</th>
                          <th className="text-right">Stock</th>
                          <th className="w-12 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((v, idx) => (
                          <tr key={idx} className="hover:bg-base-200/30">
                            <td>
                              <input
                                type="text"
                                className="input input-bordered input-xs w-full text-xs font-medium"
                                value={v.name}
                                onChange={(e) => handleUpdateVariant(idx, 'name', e.target.value)}
                                placeholder="e.g. 50ml or Midnight Black"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="input input-bordered input-xs w-full text-xs font-mono"
                                value={v.sku}
                                onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                                placeholder="SKU-VAR"
                              />
                            </td>
                            <td className="text-right">
                              <input
                                type="number"
                                step="0.01"
                                className="input input-bordered input-xs w-28 text-right text-xs font-bold tabular-nums"
                                value={v.price}
                                onChange={(e) => handleUpdateVariant(idx, 'price', parseFloat(e.target.value) || 0)}
                              />
                            </td>
                            <td className="text-right">
                              <input
                                type="number"
                                className="input input-bordered input-xs w-24 text-right text-xs font-bold tabular-nums"
                                value={v.stock}
                                onChange={(e) => handleUpdateVariant(idx, 'stock', parseInt(e.target.value, 10) || 0)}
                              />
                            </td>
                            <td className="text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(idx)}
                                disabled={variants.length <= 1}
                                className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-8 border border-dashed border-base-300 rounded-xl text-center text-xs text-base-content/60 space-y-2">
                  <p className="font-semibold text-base-content">Standard Simple Product</p>
                  <p className="max-w-md mx-auto">
                    This item has no size, color, or volume options. Pricing and inventory are managed on the primary SKU level.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: STOCK */}
          {activeTab === 'stock' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-base-content">Inventory & Allocation</h3>
                <p className="text-xs text-base-content/60 mb-4">
                  Manage inventory tracking, warehouse availability, and threshold notifications.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-base-200 bg-base-100 space-y-2">
                    <span className="text-xs font-bold text-base-content block">Total Inventory Stock</span>
                    <input
                      type="number"
                      min="0"
                      className="input input-bordered input-sm w-full text-xs font-bold tabular-nums"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                    <span className="text-[10px] text-base-content/50 block">Available units for dispatch</span>
                  </div>

                  <div className="p-4 rounded-xl border border-base-200 bg-base-100 space-y-2">
                    <span className="text-xs font-bold text-base-content block">Low Stock Alert Threshold</span>
                    <input
                      type="number"
                      min="0"
                      className="input input-bordered input-sm w-full text-xs font-bold tabular-nums"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10) || 5)}
                    />
                    <span className="text-[10px] text-base-content/50 block">Trigger low stock warning badge</span>
                  </div>

                  <div className="p-4 rounded-xl border border-base-200 bg-base-100 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-base-content block">Track Inventory</span>
                      <span className="text-[10px] text-base-content/50 block mt-1">
                        Prevent overselling when stock hits 0
                      </span>
                    </div>
                    <label className="cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        className="toggle toggle-primary toggle-sm"
                        checked={trackInventory}
                        onChange={(e) => setTrackInventory(e.target.checked)}
                      />
                    </label>
                  </div>
                </div>

                {hasVariants && variants.length > 0 && (
                  <div className="mt-5 space-y-2">
                    <span className="text-xs font-bold text-base-content/70">Variant Stock Distribution</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {variants.map((v, i) => (
                        <div key={i} className="p-3 bg-base-200/50 rounded-xl border border-base-200 text-xs flex justify-between items-center">
                          <span className="font-medium text-base-content truncate pr-2">{v.name}</span>
                          <span className="font-bold text-primary font-mono">{v.stock} units</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: CASHBACK (ENHANCED 3-STATE STUDIO) */}
          {activeTab === 'cashback' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-base-200">
                <div>
                  <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    Customer Cashback & Reward Rules
                  </h3>
                  <p className="text-xs text-base-content/60 mt-0.5">
                    Configure wallet rewards for customers when purchasing this specific product.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveCashback}
                  disabled={isSavingCashback || isLoadingCashback}
                  className="btn btn-sm btn-primary text-white text-xs gap-1.5 shadow-xs"
                >
                  {isSavingCashback ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : cashbackSaveSuccess ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{cashbackSaveSuccess ? 'Saved!' : 'Save Cashback Rules'}</span>
                </button>
              </div>

              {isLoadingCashback ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-center">
                  <span className="loading loading-spinner loading-md text-primary" />
                  <p className="text-xs text-base-content/60">Loading product cashback configuration...</p>
                </div>
              ) : (
                <>
                  {/* 3-Way Segmented Control */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                      Rule Resolution Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Global Rules Button */}
                      <button
                        type="button"
                        onClick={() => setCashbackMode('global')}
                        className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                          cashbackMode === 'global'
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-base-300 bg-base-100 hover:border-base-content/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 w-full justify-between mb-1">
                          <span className="font-bold text-sm text-base-content flex items-center gap-1.5">
                            <Globe className="w-4 h-4 text-info" />
                            Global Rules
                          </span>
                          {cashbackMode === 'global' && (
                            <span className="badge badge-primary badge-xs font-semibold">Active</span>
                          )}
                        </div>
                        <p className="text-xs text-base-content/60">
                          Follow store-wide and brand rules automatically.
                        </p>
                      </button>

                      {/* Custom Override (ON) Button */}
                      <button
                        type="button"
                        onClick={() => setCashbackMode('on')}
                        className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                          cashbackMode === 'on'
                            ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20'
                            : 'border-base-300 bg-base-100 hover:border-base-content/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 w-full justify-between mb-1">
                          <span className="font-bold text-sm text-base-content flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-emerald-500" />
                            On (Custom Override)
                          </span>
                          {cashbackMode === 'on' && (
                            <span className="badge badge-success text-white badge-xs font-semibold">Active</span>
                          )}
                        </div>
                        <p className="text-xs text-base-content/60">
                          Always bypasses global rules. Set custom rate.
                        </p>
                      </button>

                      {/* Off (Exempt) Button */}
                      <button
                        type="button"
                        onClick={() => setCashbackMode('off')}
                        className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                          cashbackMode === 'off'
                            ? 'border-error bg-error/5 ring-2 ring-error/20'
                            : 'border-base-300 bg-base-100 hover:border-base-content/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 w-full justify-between mb-1">
                          <span className="font-bold text-sm text-base-content flex items-center gap-1.5">
                            <Ban className="w-4 h-4 text-error" />
                            Off (Exempt)
                          </span>
                          {cashbackMode === 'off' && (
                            <span className="badge badge-error text-white badge-xs font-semibold">Active</span>
                          )}
                        </div>
                        <p className="text-xs text-base-content/60">
                          Completely exclude from cashback (0% awarded).
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* MODE 1: GLOBAL RULES EXPLANATION */}
                  {cashbackMode === 'global' && (
                    <div className="rounded-2xl border border-info/20 bg-info/5 p-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center shrink-0 mt-0.5">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-base-content">Inheriting Store-Wide Rules</h4>
                          <p className="text-xs text-base-content/70 mt-0.5">
                            This product inherits the default marketplace rules. When customers place orders, standard tier resolution applies.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="bg-base-100 border border-base-200 rounded-xl p-3.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/50 block">Active Global Rate</span>
                          <span className="text-xl font-black text-info tabular-nums mt-0.5 block">
                            {cashbackGlobalInherited?.percent || 2.0}%
                          </span>
                          <span className="text-[11px] text-base-content/60">Baseline standard customer reward</span>
                        </div>
                        <div className="bg-base-100 border border-base-200 rounded-xl p-3.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/50 block">
                            Customer Gets On RM {activeSimulationPrice.toFixed(2)}
                          </span>
                          <span className="text-xl font-black text-emerald-600 tabular-nums mt-0.5 block">
                            RM {calculatedRewardAmount.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-base-content/60">Credited to customer VamoWallet upon order completion</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE 2: ON (CUSTOM OVERRIDE) */}
                  {cashbackMode === 'on' && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-6">
                      <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
                        <Zap className="w-5 h-5 shrink-0" />
                        <p className="text-xs font-bold">
                          Direct Product Override Active — This rule has priority over all category, brand, and global rules.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        <div className="space-y-3">
                          <label className="label py-0">
                            <span className="label-text font-bold text-sm text-base-content">
                              Product Cashback Percentage (%) <span className="text-error">*</span>
                            </span>
                          </label>

                          <div className="relative max-w-xs">
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              max="100"
                              value={cashbackPercent}
                              onChange={(e) => setCashbackPercent(parseFloat(e.target.value) || 0)}
                              className="input input-bordered w-full font-bold text-base tabular-nums pr-10 focus:input-primary"
                              placeholder="5.0"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-base-content/50">%</span>
                          </div>

                          {/* Preset Pills */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-xs text-base-content/50 mr-1">Presets:</span>
                            {[2, 3, 5, 8, 10, 15].map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setCashbackPercent(p)}
                                className={`badge badge-sm cursor-pointer transition-colors ${
                                  cashbackPercent === p
                                    ? 'badge-primary font-bold'
                                    : 'badge-ghost hover:badge-outline'
                                }`}
                              >
                                {p}%
                              </button>
                            ))}
                          </div>

                          {cashbackPercent > 15 && (
                            <div className="alert alert-warning text-xs py-2 mt-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>High reward rate. Please ensure your profit margin sustains this rate.</span>
                            </div>
                          )}
                        </div>

                        {/* Variant SKU Simulator Selector */}
                        {hasVariants && variants.length > 0 && (
                          <div className="space-y-2 bg-base-100 p-4 rounded-xl border border-base-200">
                            <label className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                              Simulate with Specific Variant SKU:
                            </label>
                            <select
                              className="select select-bordered select-sm w-full text-xs font-medium"
                              value={selectedVariantId}
                              onChange={(e) => setSelectedVariantId(e.target.value)}
                            >
                              <option value="base">Base Product Price (RM {parseFloat(price || '0').toFixed(2)})</option>
                              {variants.map((v, i) => (
                                <option key={i} value={String(i)}>
                                  {v.name} (RM {Number(v.price || 0).toFixed(2)})
                                </option>
                              ))}
                            </select>
                            <p className="text-[11px] text-base-content/50">
                              The same {cashbackPercent}% rate applies across all variants unless sub-tiering is configured.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Live Simulation Card */}
                      <div className="rounded-xl border border-base-200 bg-base-100 p-5 space-y-4">
                        <div className="flex items-center justify-between gap-2 border-b border-base-200 pb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
                            <Package className="w-4 h-4 text-primary" />
                            Live Real-Time Payout Simulation
                          </span>
                          <span className="badge badge-outline badge-xs text-base-content/70">Per Unit Basis</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                          <div className="p-3 bg-base-200/50 rounded-xl">
                            <span className="text-[11px] font-semibold text-base-content/50 block">Product Unit Price</span>
                            <span className="text-lg font-black text-base-content tabular-nums mt-0.5 block">
                              RM {activeSimulationPrice.toFixed(2)}
                            </span>
                          </div>

                          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">Customer Gets (Wallet)</span>
                            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5 block">
                              RM {calculatedRewardAmount.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-emerald-600/70">({cashbackPercent}% credited)</span>
                          </div>

                          <div className="p-3 bg-base-200/50 rounded-xl">
                            <span className="text-[11px] font-semibold text-base-content/50 block">Merchant Net Revenue</span>
                            <span className="text-lg font-black text-base-content tabular-nums mt-0.5 block">
                              RM {calculatedNetMerchantAmount.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-base-content/50">(Price minus reward)</span>
                          </div>
                        </div>

                        {/* Storefront Badge Preview */}
                        <div className="pt-2 border-t border-base-200/60 flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs text-base-content/60">Shopper Storefront Badge Preview:</span>
                          <span className="badge badge-lg gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-bold text-xs py-3 px-3.5">
                            <span>🎁</span>
                            <span>{cashbackPercent}% Cashback</span>
                            <span className="opacity-40">•</span>
                            <span>Earn RM {calculatedRewardAmount.toFixed(2)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE 3: OFF (EXEMPT) */}
                  {cashbackMode === 'off' && (
                    <div className="rounded-2xl border border-error/20 bg-error/5 p-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center shrink-0 mt-0.5">
                          <Ban className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-error">Cashback Completely Disabled (Exempt)</h4>
                          <p className="text-xs text-base-content/70 mt-0.5">
                            Customers who purchase this product will receive <strong>RM 0.00 (0%)</strong> cashback for this line item at checkout, even if marketplace or brand campaigns are running.
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-base-100 border border-base-200 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-medium text-base-content/60">Effective Cashback Rate:</span>
                        <span className="badge badge-error badge-outline font-bold text-xs">0.00% (Exempt)</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar matching Storefront Studio */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-base-300 bg-base-100/95 backdrop-blur-md shadow-lg">
        <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-8 max-w-7xl mx-auto">
          <div className="text-xs text-base-content/60 font-medium">
            Step {currentStepIndex + 1} of 5 — {TABS[currentStepIndex].stepLabel}
          </div>

          <div className="flex items-center gap-2">
            {canGoPrev && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="btn btn-ghost btn-sm text-xs gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            <button
              type="button"
              disabled={loading || isSavingCashback}
              onClick={() => handleSubmit()}
              className="btn btn-primary btn-sm text-white text-xs gap-1.5 shadow-sm"
            >
              {loading || isSavingCashback ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{activeTab === 'cashback' ? 'Save Cashback Rules' : (isEditing ? 'Save Changes' : 'Publish Product')}</span>
            </button>

            {canGoNext && (
              <button
                type="button"
                onClick={handleNextStep}
                className="btn btn-outline btn-sm text-xs gap-1"
              >
                <span>Next: {TABS[currentStepIndex + 1].label}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
