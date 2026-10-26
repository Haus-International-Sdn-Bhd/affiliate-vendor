'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ShieldAlert } from 'lucide-react';

interface ProductFormProps {
  initialData?: Partial<Product>;
  isEditing?: boolean;
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const { hasPermission } = useAuth();

  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '');
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialData?.compare_at_price ? String(initialData.compare_at_price) : ''
  );
  const [costPrice, setCostPrice] = useState(
    initialData?.cost_price ? String(initialData.cost_price) : ''
  );
  const [stock, setStock] = useState(initialData?.stock ? String(initialData.stock) : '0');
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<'active' | 'draft' | 'inactive'>(initialData?.status || 'active');
  const [featuredImage, setFeaturedImage] = useState(initialData?.featured_image || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(initialData?.gallery_images || []);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Variants
  const [hasVariants, setHasVariants] = useState<boolean>(
    initialData?.has_variants || (initialData?.variants && initialData.variants.length > 0) || false
  );
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants || [
      { name: 'Standard', sku: '', price: Number(price) || 0, stock: Number(stock) || 0 }
    ]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        name: '',
        sku: sku ? `${sku}-${variants.length + 1}` : '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload: any = {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        sku,
        price: parseFloat(price) || 0,
        compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
        cost_price: costPrice ? parseFloat(costPrice) : null,
        stock: parseInt(stock, 10) || 0,
        short_description: shortDescription,
        description,
        status,
        featured_image: featuredImage,
        gallery_images: galleryImages,
        has_variants: hasVariants,
        variants: hasVariants ? variants : [],
      };

      if (isEditing && initialData?.id) {
        await vendorApi.updateProduct(initialData.id, payload);
        setSuccess('Product updated successfully!');
      } else {
        await vendorApi.createProduct(payload);
        setSuccess('Product created successfully!');
      }

      setTimeout(() => {
        router.push('/products');
      }, 1200);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/vendor-portal/catalog/manage-product" className="btn btn-circle btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-base-content">
              {isEditing ? `Edit: ${initialData?.name || 'Product'}` : 'Create New Product'}
            </h1>
            <p className="text-sm text-base-content/60">
              {isEditing
                ? 'Modify your product specifications, variants, and stock.'
                : 'Fill in the details to publish your product to the VAMOFLEX marketplace.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/vendor-portal/catalog/manage-product" className="btn btn-ghost btn-sm">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-sm text-white gap-2 shadow-sm"
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEditing ? 'Save Changes' : 'Publish Product'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="alert alert-success text-sm py-2 px-4 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error text-sm py-2 px-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) - Product General, Description, Variants */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-6 space-y-4">
              <h2 className="font-bold text-base text-base-content flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span>General Information</span>
              </h2>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs">Product Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Premium Leather Wallet"
                  className="input input-bordered w-full text-sm"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs">URL Slug</span>
                  </label>
                  <input
                    type="text"
                    placeholder="premium-leather-wallet"
                    className="input input-bordered w-full text-sm font-mono"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs">Base SKU</span>
                  </label>
                  <input
                    type="text"
                    placeholder="PLW-001"
                    className="input input-bordered w-full text-sm font-mono"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs">Short Summary</span>
                </label>
                <input
                  type="text"
                  placeholder="Brief 1-sentence product summary displayed in listings"
                  className="input input-bordered w-full text-sm"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs">Detailed Description</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Provide rich details about your product features, specifications, and benefits..."
                  className="textarea textarea-bordered w-full text-sm leading-relaxed"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Pricing & Stock Card */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-6 space-y-4">
              <h2 className="font-bold text-base text-base-content flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span>Pricing & Inventory</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs">Regular Price (MYR) *</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-base-content/50 font-bold">RM</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="99.00"
                      className="input input-bordered w-full pl-10 text-sm font-semibold"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs">Compare-At Price (MYR)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-base-content/50 font-bold">RM</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="129.00"
                      className="input input-bordered w-full pl-10 text-sm"
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs">Total Stock Qty *</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="100"
                    className="input input-bordered w-full text-sm font-semibold"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Cashback Preview Notice */}
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-base-content/80 font-medium">
                    Eligible for <strong>2.0% – 5.0% Customer Cashback</strong> into VamoWallet upon order payment.
                  </span>
                </div>
                <Link
                  href="/vendor-portal/catalog/cashback"
                  className="link link-primary font-bold hover:underline shrink-0 text-[11px]"
                >
                  Configure Rules →
                </Link>
              </div>
            </div>
          </div>

          {/* Variants Card */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-base text-base-content flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <span>Product Variants (Options)</span>
                  </h2>
                  <p className="text-xs text-base-content/60 mt-0.5">
                    Enable if product comes in multiple sizes, colors, or flavors.
                  </p>
                </div>

                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                />
              </div>

              {hasVariants && (
                <div className="space-y-3 pt-2">
                  <div className="overflow-x-auto">
                    <table className="table table-compact w-full text-xs">
                      <thead>
                        <tr className="bg-base-200 text-base-content/70">
                          <th>Variant Name / Option</th>
                          <th>SKU</th>
                          <th>Price (MYR)</th>
                          <th>Stock</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((v, idx) => (
                          <tr key={idx}>
                            <td>
                              <input
                                type="text"
                                placeholder="e.g. Size XL / Red"
                                className="input input-bordered input-xs w-full"
                                value={v.name}
                                onChange={(e) => handleUpdateVariant(idx, 'name', e.target.value)}
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="SKU-VAR"
                                className="input input-bordered input-xs w-full font-mono"
                                value={v.sku}
                                onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                className="input input-bordered input-xs w-24"
                                value={v.price}
                                onChange={(e) =>
                                  handleUpdateVariant(idx, 'price', parseFloat(e.target.value) || 0)
                                }
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                className="input input-bordered input-xs w-20"
                                value={v.stock}
                                onChange={(e) =>
                                  handleUpdateVariant(idx, 'stock', parseInt(e.target.value, 10) || 0)
                                }
                                required
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(idx)}
                                className="btn btn-ghost btn-xs btn-square text-error"
                                title="Remove Variant"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="btn btn-outline btn-xs btn-primary gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Variant Option</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) - Status, Featured Image & Gallery */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5 space-y-3">
              <h3 className="font-bold text-sm text-base-content">Publication Status</h3>
              <select
                className="select select-bordered select-sm w-full font-medium"
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
              >
                <option value="active">Active (Visible in Storefront)</option>
                <option value="draft">Draft (Unpublished)</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Media & Images Card */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5 space-y-4">
              <h3 className="font-bold text-sm text-base-content flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                <span>Featured Image</span>
              </h3>

              <div className="form-control">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="input input-bordered input-sm w-full text-xs font-mono"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                />
              </div>

              {featuredImage && (
                <div className="rounded-xl border border-base-300 overflow-hidden bg-base-200 aspect-video flex items-center justify-center relative">
                  <img
                    src={featuredImage}
                    alt="Featured preview"
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      (e.target as any).src = 'https://placehold.co/400x300?text=Invalid+Image+URL';
                    }}
                  />
                </div>
              )}

              <div className="divider my-2 text-xs text-base-content/40">Gallery Images</div>

              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="Additional image URL..."
                  className="input input-bordered input-xs flex-1 text-xs"
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="btn btn-primary btn-xs text-white"
                >
                  Add
                </button>
              </div>

              {galleryImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-base-300 aspect-square">
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute top-1 right-1 btn btn-circle btn-xs btn-error text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
