"use client";
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin-layout';
import RequireAdmin from '@/components/require-admin';

const MapView = dynamic(() => import('@/components/map-view'), { ssr: false });

export default function MapPage() {
  return (
    <RequireAdmin>
      <AdminLayout>
        <div className="p-6 h-[80vh] flex flex-col">
          <h1 className="text-2xl font-bold mb-4">Issue Heatmap</h1>
          <div className="flex-1 min-h-[400px]">
            <MapView />
          </div>
        </div>
      </AdminLayout>
    </RequireAdmin>
  );
}
