'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { vendorApi } from '@/lib/api';
import { Product } from '@/lib/types';
import ProductForm from '@/components/ProductForm';
import VendorLoader from '@/components/VendorLoader';

export default function EditProductPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const queryId = searchParams?.get('id') || searchParams?.get('productId') || '';
  const routeId = (params?.id as string) || '';

  // Determine actual target id: query param takes precedence; ignore placeholder slug names
  const id =
    queryId ||
    (routeId && routeId !== '[id]' && routeId !== 'edit' && routeId !== 'default'
      ? routeId
      : '');

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await vendorApi.getProduct(id);
        const item = res?.data || res?.product || res;
        if (item && (item.id || item.uuid)) {
          setProduct(item);
        } else {
          setError('Product not found in this brand catalog.');
        }
      } catch (err: any) {
        console.error('Failed to load product', err);
        setError(err?.response?.data?.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <VendorLoader
        fullScreen={false}
        label="Product Catalog Manager"
        sublabel="Loading product specs, media and pricing tiers..."
      />
    );
  }

  if (error || !product) {
    return (
      <div className="card bg-base-100 border border-base-300 p-8 text-center max-w-md mx-auto my-12 rounded-2xl shadow-sm">
        <p className="text-error font-semibold text-sm mb-2">{error || 'Product not found'}</p>
        <p className="text-xs text-base-content/60 mb-4">
          {!id
            ? 'No product ID was specified in the URL.'
            : 'The product may have been deleted, moved, or belongs to another brand.'}
        </p>
        <Link href="/vendor-portal/catalog/manage-product" className="btn btn-sm btn-primary text-white">
          Back to Products
        </Link>
      </div>
    );
  }

  return <ProductForm initialData={product} isEditing={true} />;
}
