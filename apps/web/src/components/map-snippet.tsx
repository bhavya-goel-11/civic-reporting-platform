"use client";
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./map-view'), { ssr: false });


export default function MapSnippet() {
  // Remove extra div, let parent control size
  return <MapView />;
}
