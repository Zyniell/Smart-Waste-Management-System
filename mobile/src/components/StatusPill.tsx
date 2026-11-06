import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ReportStatus, WasteCategory } from '../services/api';

export const StatusPill: React.FC<{ status: ReportStatus }> = ({ status }) => {
  const configs: Record<ReportStatus, { label: string; bg: string; text: string; border: string }> = {
    PENDING: { label: 'Pending', bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
    IN_PROGRESS: { label: 'Diproses', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
    COMPLETED: { label: 'Selesai', bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
    REJECTED: { label: 'Ditolak', bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
  };

  const conf = configs[status] || configs.PENDING;

  return (
    <View style={[styles.pill, { backgroundColor: conf.bg, borderColor: conf.border }]}>
      <Text style={[styles.pillText, { color: conf.text }]}>{conf.label}</Text>
    </View>
  );
};

export const CategoryPill: React.FC<{ category: WasteCategory }> = ({ category }) => {
  const configs: Record<WasteCategory, { label: string; bg: string; text: string }> = {
    ORGANIC: { label: 'Organik', bg: '#DCFCE7', text: '#15803D' },
    PLASTIC: { label: 'Plastik', bg: '#CFFAFE', text: '#0E7490' },
    PAPER: { label: 'Kertas', bg: '#FEF3C7', text: '#B45309' },
  };

  const conf = configs[category] || configs.ORGANIC;

  return (
    <View style={[styles.pill, { backgroundColor: conf.bg, borderColor: 'transparent' }]}>
      <Text style={[styles.pillText, { color: conf.text }]}>{conf.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

