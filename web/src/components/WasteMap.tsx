import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Report, ReportStatus } from '../types';
import { getFullImageUrl } from '../services/api';
import { Eye } from 'lucide-react';

interface WasteMapProps {
  reports: Report[];
  center?: [number, number];
  zoom?: number;
  onSelectReport?: (report: Report) => void;
  height?: string;
}

// Function to generate custom color-coded map pins based on report status
function createStatusIcon(status: ReportStatus) {
  let bgColor = '#f59e0b'; // Amber for Pending
  if (status === 'IN_PROGRESS') bgColor = '#3b82f6'; // Blue
  else if (status === 'COMPLETED') bgColor = '#10b981'; // Emerald
  else if (status === 'REJECTED') bgColor = '#f43f5e'; // Rose

  const html = `
    <div style="
      background-color: ${bgColor};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    ">
      <div style="
        width: 12px;
        height: 12px;
        background-color: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: html,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export const WasteMap: React.FC<WasteMapProps> = ({
  reports,
  center = [-6.2088, 106.8456],
  zoom = 12,
  onSelectReport,
  height = '420px',
}) => {
  // If reports exist, center on the first report's coordinates
  const initialCenter: [number, number] = reports.length > 0 && reports[0].latitude && reports[0].longitude
    ? [reports[0].latitude, reports[0].longitude]
    : center;

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 z-10 relative">
      <MapContainer
        center={initialCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.map((report) => {
          if (!report.latitude || !report.longitude) return null;
          return (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={createStatusIcon(report.status)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="w-56 p-1 text-slate-800">
                  {report.image_url && (
                    <img
                      src={getFullImageUrl(report.image_url)}
                      alt={report.title}
                      className="w-full h-28 object-cover rounded-lg mb-2"
                    />
                  )}
                  <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">
                    {report.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {report.address || report.description}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {report.category}
                    </span>
                    <span className="font-bold text-slate-600">
                      {report.status}
                    </span>
                  </div>

                  {onSelectReport && (
                    <button
                      onClick={() => onSelectReport(report)}
                      className="w-full mt-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Detail Laporan
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
