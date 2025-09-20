"use client";
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./map-view'), { ssr: false });

export default function MapSnippet() {
  return (
    <div className="w-full h-48 rounded overflow-hidden border">
      <MapView />
    </div>
  );
}
