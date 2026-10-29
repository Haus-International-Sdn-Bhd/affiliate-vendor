'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { vendorApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Product, ProductVariant } from '@/lib/types';
import { exportToXls, ExcelColumn } from '@/lib/export-xls';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Download,
  TrendingUp,
  Boxes,
  Eye,
  Layers,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileSpreadsheet,
  Upload,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

export default function ProductsListPage() {
  const { brand, activeBrandId, hasPermission } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters matching storefront
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('all'); // all, in-stock, out-of-stock
  const [filterHasVariants, setFilterHasVariants] = useState('all'); // all, true, false

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [viewProduct, setViewProduct] = useState<any | null>(null);
  const [stockProduct, setStockProduct] = useState<any | null>(null);
  const [variantsProduct, setVariantsProduct] = useState<any | null>(null);
  const [deleteProductItem, setDeleteProductItem] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Notifications
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await vendorApi.getProducts({
        search: searchTerm || undefined,
        brand_id: activeBrandId || brand?.id || undefined,
      });
      const items = res.data || res.products || res || [];
      const list = Array.isArray(items) ? items : [];

      // Map to storefront-compatible structure
      // Filter out any anchor / Haus Cosmetics products that are not part of vendor catalog
      const vendorItems = list.filter((p: any) => {
        const bName = String(
          p.brand_name ||
          (typeof p.brand === 'object' ? p.brand?.name : p.brand) ||
          ''
        ).toLowerCase();
        if (
          bName.includes('haus cosmetics') ||
          bName === 'haus-cosmetics' ||
          Number(p.brand_id) === 1
        ) {
          return false;
        }
        return true;
      });

      const normalized = vendorItems.map((p: any) => {
        const priceVal = typeof p.price === 'number'
          ? p.price
          : (Number(p.pricings?.[0]?.base_price) || Number(p.pricings?.[0]?.price) || Number(p.price) || 0);

        const isActive = p.is_active !== undefined
          ? Boolean(p.is_active)
          : (typeof p.status === 'boolean' ? p.status : p.status === 'active');

        const rawImg = p.featured_image || p.image || p.thumbnail || p.images?.[0]?.image_url || p.images?.[0]?.image_path || '';
        const isPlaceholder = !rawImg || rawImg.includes('placeholder') || rawImg.includes('placehold.co') || rawImg.includes('defaults/product-placeholder.jpg');

        return {
          id: p.id || p.uuid,
          uuid: String(p.id || p.uuid),
          name: p.name || 'Untitled Product',
          brand_name: p.brand_name || (typeof p.brand === 'object' ? p.brand?.name : p.brand) || brand?.name || 'Vendor Brand',
          sku: p.sku || '—',
          category: p.category?.name || p.category || 'General',
          type: p.type || (p.variants && p.variants.length > 0 ? 'Variable' : 'Standard'),
          price: priceVal,
          compare_at_price: p.compare_at_price || 0,
          stockQuantity: p.stock ?? p.stock_quantity ?? (p.variants ? p.variants.reduce((a: number, v: any) => a + (v.stock || 0), 0) : 0),
          is_active: isActive,
          featured: Boolean(p.featured || p.is_featured),
          best_seller: Boolean(p.best_seller),
          promotion_product: Boolean(p.promotion_product || p.compare_at_price > priceVal),
          show_in_shop: p.show_in_shop !== undefined ? Boolean(p.show_in_shop) : isActive,
          hide_from_shop: p.show_in_shop !== undefined ? !p.show_in_shop : !isActive,
          has_variants: Boolean(p.has_variants || (p.variants && p.variants.length > 0)),
          variants: p.variants || [],
          image: isPlaceholder ? '' : rawImg,
          updatedAt: p.updated_at ? new Date(p.updated_at).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently',
          updatedAtRaw: p.updated_at || new Date().toISOString(),
          description: p.description || p.short_description || '',
        };
      });

      setProducts(normalized);
    } catch (err: any) {
      console.error('Failed to fetch products', err);
      setActionError('Could not load products catalog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const handleBrandSwitched = () => {
      fetchProducts();
    };
    window.addEventListener('vf:brand-switched', handleBrandSwitched);
    return () => {
      window.removeEventListener('vf:brand-switched', handleBrandSwitched);
    };
  }, [brand?.id, activeBrandId]);

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  // Unique categories list for dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category && typeof p.category === 'string') {
        const trimmed = p.category.trim();
        if (trimmed) set.add(trimmed);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku && p.sku.toLowerCase().includes(q);
        if (!matchName && !matchSku) return false;
      }

      if (filterCategory) {
        if (!p.category || p.category.toLowerCase() !== filterCategory.toLowerCase()) {
          return false;
        }
      }

      if (filterStock === 'in-stock' && p.stockQuantity <= 0) return false;
      if (filterStock === 'out-of-stock' && p.stockQuantity > 0) return false;

      if (filterHasVariants === 'true' && !p.has_variants) return false;
      if (filterHasVariants === 'false' && p.has_variants) return false;

      return true;
    });
  }, [products, searchTerm, filterCategory, filterStock, filterHasVariants]);

  // Active filter chips
  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (searchTerm) chips.push({ key: 'search', label: `Search: "${searchTerm}"` });
    if (filterCategory) chips.push({ key: 'category', label: `Category: ${filterCategory}` });
    if (filterStock !== 'all') chips.push({ key: 'stock', label: `Stock: ${filterStock}` });
    if (filterHasVariants !== 'all') chips.push({ key: 'variants', label: `Variants: ${filterHasVariants === 'true' ? 'Has variants' : 'Simple'}` });
    return chips;
  }, [searchTerm, filterCategory, filterStock, filterHasVariants]);

  const removeFilterChip = (key: string) => {
    if (key === 'search') setSearchTerm('');
    if (key === 'category') setFilterCategory('');
    if (key === 'stock') setFilterStock('all');
    if (key === 'variants') setFilterHasVariants('all');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterStock('all');
    setFilterHasVariants('all');
    setCurrentPage(1);
  };

  // Pagination Slicing
  const totalCount = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Bulk Selection
  const allOnPageSelected = paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.has(p.uuid));
  const selectionCount = selectedIds.size;

  const toggleSelectAll = (checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      paginatedProducts.forEach((p) => next.add(p.uuid));
    } else {
      paginatedProducts.forEach((p) => next.delete(p.uuid));
    }
    setSelectedIds(next);
  };

  const toggleSelect = (uuid: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(uuid);
    else next.delete(uuid);
    setSelectedIds(next);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDeactivate = () => {
    if (!confirm(`Are you sure you want to deactivate ${selectionCount} selected products?`)) return;
    setProducts((prev) =>
      prev.map((p) => (selectedIds.has(p.uuid) ? { ...p, is_active: false, show_in_shop: false, hide_from_shop: true } : p))
    );
    setSelectedIds(new Set());
    setActionSuccess(`Successfully deactivated ${selectionCount} products.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const toggleShowInShop = (uuid: string, show: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.uuid === uuid ? { ...p, show_in_shop: show, hide_from_shop: !show } : p))
    );
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteProductItem) return;
    try {
      setDeleting(true);
      await vendorApi.deleteProduct(deleteProductItem.id);
      setProducts((prev) => prev.filter((p) => p.uuid !== deleteProductItem.id && p.id !== deleteProductItem.id));
      setActionSuccess(`Product "${deleteProductItem.name}" deleted successfully.`);
      setDeleteProductItem(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to delete product.');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setDeleting(false);
    }
  };

  // Excel Export
  const handleExportXls = () => {
    const columns: ExcelColumn[] = [
      { header: 'Product Name', key: 'name', width: 240, type: 'string' },
      { header: 'SKU', key: 'sku', width: 120, type: 'string' },
      { header: 'Category', key: 'category', width: 140, type: 'string' },
      { header: 'Price (MYR)', key: 'price', width: 120, type: 'currency' },
      { header: 'Stock Available', key: 'stockQuantity', width: 110, type: 'number' },
      { header: 'Status', key: 'is_active', width: 100, type: 'string' },
      { header: 'Variants Count', key: 'variants_count', width: 110, type: 'number' },
    ];

    const exportData = filteredProducts.map((p) => ({
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: p.price,
      stockQuantity: p.stockQuantity,
      is_active: p.is_active ? 'Active' : 'Inactive',
      variants_count: p.variants?.length || 0,
    }));

    exportToXls(`Product_Catalog_${new Date().toISOString().slice(0, 10)}`, exportData, columns, 'Products');
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Page Header matching Storefront */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">Products</h1>
          <p className="text-sm text-base-content/60 mt-0.5">
            Manage your product catalog
            {!loading && totalCount > 0 && (
              <span className="text-base-content/40"> · {totalCount.toLocaleString()} products</span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Download template */}
          {hasPermission('vendor.catalog.download_template') && (
            <button
              type="button"
              onClick={handleExportXls}
              className="btn btn-outline btn-sm gap-2 text-xs font-semibold"
            >
              <Download className="h-4 w-4" />
              <span>Download template</span>
            </button>
          )}

          {/* Export Excel */}
          {hasPermission('vendor.catalog.export') && (
            <button
              type="button"
              onClick={handleExportXls}
              disabled={loading || products.length === 0}
              className="btn btn-outline btn-sm gap-2 border-success/40 text-success hover:bg-success/10 hover:border-success text-xs font-semibold"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
          )}

          {/* Performance Analytics shortcut */}
          {hasPermission('vendor.catalog.leaderboard') && (
            <Link
              href="/vendor-portal/catalog/performance"
              className="btn btn-outline btn-primary btn-sm gap-2 text-xs font-semibold"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Performance</span>
            </Link>
          )}

          {/* Add Product Button (Commented out - feature not ready yet) */}
          {/* {hasPermission('vendor.catalog.create') && (
            <Link
              href="/vendor-portal/catalog/add-product"
              className="btn btn-primary btn-sm gap-2 text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Link>
          )} */}
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="alert alert-success text-sm py-2 px-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-white">
            <CheckCircle className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="btn btn-ghost btn-xs btn-circle text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="alert alert-error text-sm py-2 px-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-white">
            <AlertCircle className="w-4 h-4" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="btn btn-ghost btn-xs btn-circle text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="card border border-base-300 overflow-hidden bg-base-100 shadow-sm">
        {/* Filter Bar */}
        <div className="border-b border-base-300 p-5 bg-base-100 space-y-3">
          <div>
            <h2 className="text-base font-bold text-base-content">Find products</h2>
            <p className="text-xs text-base-content/60">
              Search by name or SKU, filter by category, stock, and variants
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-base-content/60 z-10" />
              <input
                type="text"
                className="input input-bordered input-sm h-10 w-full pl-10 text-xs"
                placeholder="Search name or SKU"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Category Dropdown Filter */}
            <select
              className="select select-bordered select-sm h-10 w-36 sm:w-44 text-xs"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Stock Filter */}
            <select
              className="select select-bordered select-sm h-10 w-32 sm:w-36 text-xs"
              value={filterStock}
              onChange={(e) => {
                setFilterStock(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All stock</option>
              <option value="in-stock">In stock</option>
              <option value="out-of-stock">Out of stock</option>
            </select>

            {/* Variants Filter */}
            <select
              className="select select-bordered select-sm h-10 w-32 sm:w-36 text-xs"
              value={filterHasVariants}
              onChange={(e) => {
                setFilterHasVariants(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All variants</option>
              <option value="true">Has variants</option>
              <option value="false">Simple (no variants)</option>
            </select>

            {activeFilterChips.length > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm text-xs text-primary font-semibold h-10"
                onClick={clearFilters}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Filter Chips */}
          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-base-content/50">Active:</span>
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => removeFilterChip(chip.key)}
                  className="badge badge-outline badge-sm gap-1.5 pr-1 hover:badge-primary text-xs"
                >
                  <span>{chip.label}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Selection Bar */}
        {selectionCount > 0 && (
          <div className="border-b border-base-300 bg-base-200/50 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-base-content/80">
                {selectionCount} product{selectionCount === 1 ? '' : 's'} selected
              </span>
              <button
                type="button"
                onClick={handleBulkDeactivate}
                className="btn btn-outline btn-error btn-xs font-semibold"
              >
                Deactivate products
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="btn btn-ghost btn-xs text-base-content/60"
              >
                Clear selection
              </button>
            </div>
          </div>
        )}

        {/* Desktop Table View */}
        <div className="overflow-x-auto">
          <table className="table table-sm w-full text-xs">
            <thead>
              <tr className="text-xs uppercase text-base-content/50 bg-base-200/40 border-b border-base-300">
                <th className="w-10 text-center">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs rounded"
                    checked={allOnPageSelected}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    aria-label="Select all on page"
                  />
                </th>
                <th className="min-w-[260px]">Product</th>
                <th>SKU</th>
                <th className="text-right">Price &amp; Stock</th>
                <th>Status</th>
                <th>Variants</th>
                <th>Updated</th>
                <th className="text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="loading loading-spinner loading-md text-primary"></span>
                      <p className="text-xs text-base-content/60">Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Package className="w-12 h-12 text-base-content/20 mx-auto mb-2" />
                    <p className="font-bold text-sm text-base-content">No products found</p>
                    <p className="text-xs text-base-content/60 mt-1">
                      {activeFilterChips.length > 0
                        ? 'Try clearing some filters to see your inventory.'
                        : 'Start by adding your first product to the catalog.'}
                    </p>
                    {activeFilterChips.length > 0 && (
                      <button onClick={clearFilters} className="btn btn-sm btn-ghost text-primary mt-3">
                        Clear all filters
                      </button>
                    )}
                    {/* Add Product button commented out as feature is not ready yet */}
                    {/* {activeFilterChips.length === 0 && (
                      <Link
                        href="/vendor-portal/catalog/add-product"
                        className="btn btn-sm btn-primary text-white mt-4"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Product
                      </Link>
                    )} */}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const isSelected = selectedIds.has(product.uuid);
                  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;
                  const isOutOfStock = product.stockQuantity <= 0;

                  return (
                    <tr key={product.uuid} className={`hover:bg-base-200/50 ${isSelected ? 'bg-primary/5' : ''}`}>
                      {/* Checkbox */}
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-xs rounded"
                          checked={isSelected}
                          onChange={(e) => toggleSelect(product.uuid, e.target.checked)}
                          aria-label={`Select ${product.name}`}
                        />
                      </td>

                      {/* Product details */}
                      <td>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="avatar shrink-0">
                            <div className="w-11 h-11 rounded-lg ring-1 ring-base-300 bg-base-200 !flex items-center justify-center overflow-hidden">
                              {product.image && !failedImages.has(product.uuid) ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="object-cover w-full h-full"
                                  onError={() => setFailedImages((prev) => new Set(prev).add(product.uuid))}
                                />
                              ) : (
                                <Package className="w-5 h-5 text-base-content/40 m-auto" />
                              )}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <span className="badge badge-sm badge-outline text-[10px] font-bold border-primary/30 text-primary bg-primary/5 mb-1 truncate max-w-[220px]">
                              {product.brand_name}
                            </span>
                            <button
                              type="button"
                              onClick={() => setViewProduct(product)}
                              className="text-left text-xs font-bold text-base-content hover:text-primary hover:underline truncate block max-w-[220px]"
                            >
                              {product.name}
                            </button>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              {product.category && (
                                <span className="badge badge-ghost badge-xs text-[10px]">
                                  {product.category}
                                </span>
                              )}
                              <span className="text-[10px] text-base-content/50">
                                {product.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td>
                        <span className="badge badge-ghost badge-sm font-mono text-[11px]">
                          {product.sku || '—'}
                        </span>
                      </td>

                      {/* Price & Stock */}
                      <td className="text-right">
                        <div className="inline-flex flex-col items-end gap-0.5">
                          <span className="text-xs font-bold tabular-nums text-base-content">
                            {formatCurrency(product.price)}
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-[11px] font-semibold tabular-nums ${
                                isOutOfStock
                                  ? 'text-error'
                                  : isLowStock
                                  ? 'text-warning'
                                  : 'text-success'
                              }`}
                            >
                              {product.stockQuantity.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-base-content/50">units</span>
                            {isOutOfStock ? (
                              <span className="badge badge-error badge-xs text-[9px] text-white">Out</span>
                            ) : isLowStock ? (
                              <span className="badge badge-warning badge-xs text-[9px]">Low</span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Status Badges */}
                      <td>
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {product.is_active ? (
                            <span className="badge badge-success badge-xs font-semibold text-white">Active</span>
                          ) : (
                            <span className="badge badge-warning badge-xs font-semibold">Inactive</span>
                          )}
                          {product.featured && (
                            <span className="badge badge-primary badge-xs font-semibold text-white">Featured</span>
                          )}
                          {product.promotion_product && (
                            <span className="badge badge-accent badge-xs font-semibold">Promo</span>
                          )}
                        </div>
                      </td>

                      {/* Variants */}
                      <td>
                        {product.has_variants ? (
                          <button
                            type="button"
                            onClick={() => setVariantsProduct(product)}
                            className="text-xs text-primary font-bold hover:underline"
                          >
                            {product.variants.length > 0 ? `${product.variants.length} variants` : 'Multi-Variant'}
                          </button>
                        ) : (
                          <span className="text-xs text-base-content/60">Simple</span>
                        )}
                      </td>

                      {/* Updated Date */}
                      <td>
                        <span className="text-xs text-base-content/70 whitespace-nowrap">
                          {product.updatedAt}
                        </span>
                      </td>

                      {/* Action Icons matching Storefront */}
                      <td className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Show in shop quick toggle */}
                          <div
                            className="tooltip tooltip-left inline-flex items-center justify-center"
                            data-tip={product.show_in_shop ? 'Visible in Shop' : 'Hidden from Shop'}
                          >
                            <label className="cursor-pointer">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-xs checkbox-primary rounded"
                                checked={product.show_in_shop}
                                onChange={(e) => toggleShowInShop(product.uuid, e.target.checked)}
                              />
                            </label>
                          </div>

                          {/* View details modal */}
                          <button
                            type="button"
                            onClick={() => setViewProduct(product)}
                            className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-primary"
                            title="View Product"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit product */}
                          {hasPermission('vendor.catalog.edit') && (
                            <Link
                              href={`/vendor-portal/catalog/edit?id=${product.id}`}
                              className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-primary"
                              title="Edit Product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          {/* Stock modal */}
                          <button
                            type="button"
                            onClick={() => setStockProduct(product)}
                            className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-primary"
                            title="View Stocks"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete product */}
                          {hasPermission('vendor.catalog.manage') && (
                            <button
                              type="button"
                              onClick={() => setDeleteProductItem({ id: product.uuid, name: product.name })}
                              className="btn btn-ghost btn-xs btn-square text-error"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer matching Storefront */}
        <div className="border-t border-base-300 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-base-100">
          <div className="flex items-center gap-2 text-base-content/70">
            <span>
              Showing {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount} products
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-base-content/70">
              <span>Per page:</span>
              <select
                className="select select-bordered select-xs text-xs"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="join">
              <button
                className="join-item btn btn-xs"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button className="join-item btn btn-xs btn-active pointer-events-none">
                {currentPage} / {totalPages}
              </button>
              <button
                className="join-item btn btn-xs"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Product Details Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="card w-full max-w-lg bg-base-100 shadow-2xl border border-base-300 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-base-content">{viewProduct.name}</h3>
                  <p className="text-xs text-base-content/60 font-mono">SKU: {viewProduct.sku}</p>
                </div>
              </div>
              <button onClick={() => setViewProduct(null)} className="btn btn-ghost btn-xs btn-circle">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-base-200/60 p-3.5 rounded-xl border border-base-300/40">
              <div>
                <span className="text-base-content/50 block">Price:</span>
                <span className="font-bold text-sm text-base-content">{formatCurrency(viewProduct.price)}</span>
              </div>
              <div>
                <span className="text-base-content/50 block">Stock Available:</span>
                <span className="font-bold text-sm text-base-content">{viewProduct.stockQuantity} units</span>
              </div>
              <div>
                <span className="text-base-content/50 block">Status:</span>
                <span className="font-bold text-base-content capitalize">{viewProduct.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              <div>
                <span className="text-base-content/50 block">Shop Visibility:</span>
                <span className="font-bold text-base-content">{viewProduct.show_in_shop ? 'Visible in Shop' : 'Hidden'}</span>
              </div>
            </div>

            {viewProduct.description && (
              <div className="text-xs text-base-content/80 max-h-32 overflow-y-auto">
                <p className="font-bold text-base-content mb-1">Description:</p>
                <p className="leading-relaxed">{viewProduct.description}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-base-200">
              <button onClick={() => setViewProduct(null)} className="btn btn-sm btn-ghost text-xs">
                Close
              </button>
              <Link
                href={`/vendor-portal/catalog/edit?id=${viewProduct.id}`}
                className="btn btn-sm btn-primary text-white text-xs gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Product</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stock Modal */}
      {stockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-base-content">{stockProduct.name}</h3>
                  <p className="text-xs text-base-content/60">Inventory & Stock Allocation</p>
                </div>
              </div>
              <button onClick={() => setStockProduct(null)} className="btn btn-ghost btn-xs btn-circle">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-base-200/70 rounded-xl space-y-2 text-xs border border-base-300/40">
              <div className="flex items-center justify-between">
                <span className="text-base-content/60">Central Hub Stock:</span>
                <strong className="text-base-content font-bold">{stockProduct.stockQuantity} units</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base-content/60">Stock Status:</span>
                <span
                  className={`badge badge-xs font-bold ${
                    stockProduct.stockQuantity > 5 ? 'badge-success text-white' : stockProduct.stockQuantity > 0 ? 'badge-warning' : 'badge-error text-white'
                  }`}
                >
                  {stockProduct.stockQuantity > 5 ? 'In Stock' : stockProduct.stockQuantity > 0 ? 'Low Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {stockProduct.variants && stockProduct.variants.length > 0 && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                <p className="text-xs font-bold text-base-content">Variant Stock Levels:</p>
                <div className="divide-y divide-base-200">
                  {stockProduct.variants.map((v: any, i: number) => (
                    <div key={i} className="py-1.5 flex items-center justify-between text-xs">
                      <span className="text-base-content/80 font-medium">{v.name || `Variant #${i + 1}`}</span>
                      <span className="font-mono font-bold text-base-content">{v.stock || 0} units</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button onClick={() => setStockProduct(null)} className="btn btn-sm btn-primary text-white text-xs">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Variants Modal */}
      {variantsProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="card w-full max-w-lg bg-base-100 shadow-2xl border border-base-300 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-base-content">{variantsProduct.name}</h3>
                  <p className="text-xs text-base-content/60">Product Variants & SKU Mapping</p>
                </div>
              </div>
              <button onClick={() => setVariantsProduct(null)} className="btn btn-ghost btn-xs btn-circle">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto max-h-56">
              <table className="table table-zebra table-xs w-full text-xs">
                <thead>
                  <tr className="bg-base-200/60">
                    <th>Variant Name</th>
                    <th>SKU</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {variantsProduct.variants && variantsProduct.variants.length > 0 ? (
                    variantsProduct.variants.map((v: any, idx: number) => (
                      <tr key={idx}>
                        <td className="font-medium text-base-content">{v.name || `Option ${idx + 1}`}</td>
                        <td className="font-mono text-base-content/70">{v.sku || '—'}</td>
                        <td className="text-right font-bold">{formatCurrency(v.price || variantsProduct.price)}</td>
                        <td className="text-right font-bold text-success">{v.stock || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-base-content/50">
                        No sub-variants configured for this product.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-base-200">
              <button onClick={() => setVariantsProduct(null)} className="btn btn-sm btn-ghost text-xs">
                Close
              </button>
              <Link
                href={`/vendor-portal/catalog/edit?id=${variantsProduct.id}`}
                className="btn btn-sm btn-primary text-white text-xs"
              >
                Edit Variants in Catalog
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteProductItem)}
        onClose={() => setDeleteProductItem(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteProductItem?.name}"? This action cannot be undone and will remove the item from the central store.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        icon="danger"
        loading={deleting}
      />
    </div>
  );
}
