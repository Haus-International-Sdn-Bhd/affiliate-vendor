import React, { Suspense } from 'react';
import EditProductPage from '@/components/EditProductPage';
import VendorLoader from '@/components/VendorLoader';

export function generateStaticParams() {
  return [
    { id: '[id]' },
    { id: 'edit' },
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: 'default' },
  ];
}

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
