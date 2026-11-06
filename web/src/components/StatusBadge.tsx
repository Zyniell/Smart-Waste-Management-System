import React from 'react';
import type { ReportStatus, WasteCategory } from '../types';
import { Clock, RefreshCw, CheckCircle, XCircle, Leaf, Box, FileText } from 'lucide-react';

export const StatusBadge: React.FC<{ status: ReportStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const configs: Record<ReportStatus, { label: string; bg: string; text: string; border: string; icon: any }> = {
    PENDING: {
      label: 'Menunggu (Pending)',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: Clock,
    },
    IN_PROGRESS: {
      label: 'Diproses (In Progress)',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: RefreshCw,
    },
    COMPLETED: {
      label: 'Selesai (Completed)',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: CheckCircle,
    },
    REJECTED: {
      label: 'Ditolak (Rejected)',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: XCircle,
    },
  };

  const conf = configs[status] || configs.PENDING;
  const Icon = conf.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${conf.bg} ${conf.text} ${conf.border} ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} shrink-0`} />
      {conf.label}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: WasteCategory; size?: 'sm' | 'md' }> = ({ category, size = 'md' }) => {
  const configs: Record<WasteCategory, { label: string; bg: string; text: string; icon: any }> = {
    ORGANIC: {
      label: 'Organik',
      bg: 'bg-emerald-100 text-emerald-800',
      text: 'text-emerald-800',
      icon: Leaf,
    },
    PLASTIC: {
      label: 'Plastik',
      bg: 'bg-cyan-100 text-cyan-800',
      text: 'text-cyan-800',
      icon: Box,
    },
    PAPER: {
      label: 'Kertas / Karton',
      bg: 'bg-amber-100 text-amber-800',
      text: 'text-amber-800',
      icon: FileText,
    },
  };

  const conf = configs[category] || configs.ORGANIC;
  const Icon = conf.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md ${conf.bg} ${
        isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} shrink-0`} />
      {conf.label}
    </span>
  );
};
