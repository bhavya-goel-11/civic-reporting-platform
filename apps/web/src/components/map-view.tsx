"use client";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon for Leaflet (React/Next.js)
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
import { reportsApi } from '@/lib/supabase';

export default function MapView() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      const data = await reportsApi.getReports();
      setReports(data || []);
      setLoading(false);
    }
    fetchReports();
  }, []);

  // Debug: log reports data on every render
  useEffect(() => {
    console.log('MapView reports:', JSON.stringify(reports, null, 2));
  }, [reports]);

  // Only show markers for now

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {/* Markers for each report */}
        {reports.length === 0 && !loading && (
          <Popup position={[28.6139, 77.2090]}>
            <span>No reports found</span>
          </Popup>
        )}
        {reports.map((r, idx) => {
          // Debug: log each report's location
          console.log('Report location:', r.location);
          let position = null;
          if (r.location) {
            // Support {lat, lng} object
            if (typeof r.location.lat === 'number' && typeof r.location.lng === 'number') {
              position = [r.location.lat, r.location.lng];
            } else if (Array.isArray(r.location.coordinates) && r.location.coordinates.length === 2) {
              // If coordinates array exists, use [lat, lng]
              position = [r.location.coordinates[1], r.location.coordinates[0]];
            }
          }
          if (position) {
            return (
              <Marker key={idx} position={position}>
                <Popup>
                  <strong>{r.description}</strong><br />
                  Status: {r.status}
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
      {loading && <div className="mt-2 text-gray-500">Loading map data...</div>}
    </div>
  );
}