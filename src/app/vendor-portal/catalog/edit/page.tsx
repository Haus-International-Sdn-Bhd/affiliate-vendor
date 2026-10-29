'use client';

import React, { Suspense } from 'react';
import EditProductPage from '@/components/EditProductPage';
import VendorLoader from '@/components/VendorLoader';

export default function Page() {
  return (
    <Suspense
      fallback={
        <VendorLoader
          fullScreen={false}
          label="Product Catalog Manager"
          sublabel="Loading product editor..."
        />
      }
    >
      <EditProductPage />
    </Suspense>
  );
}
