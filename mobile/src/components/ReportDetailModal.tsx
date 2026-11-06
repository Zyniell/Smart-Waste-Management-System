import React, { useEffect, useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { Report, getFullImageUrl } from '../services/api';
import { StatusPill, CategoryPill } from './StatusPill';
import { Ionicons } from '@expo/vector-icons';

interface ReportDetailModalProps {
  report: Report | null;
  visible: boolean;
  onClose: () => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ report, visible, onClose }) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (report?.image_url) {
      getFullImageUrl(report.image_url).then(setImageUrl);
    }
  }, [report]);

  if (!report) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badges}>
              <StatusPill status={report.status} />
              <CategoryPill category={report.category} />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Image */}
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color="#94A3B8" />
              </View>
            )}

            {/* AI Banner if detected */}
            {report.ai_prediction && (
              <View style={styles.aiCard}>
                <View style={styles.aiLeft}>
                  <Ionicons name="sparkles" size={16} color="#059669" />
                  <Text style={styles.aiTitle}>AI MobileNetV2: {report.ai_prediction}</Text>
                </View>
                {report.ai_confidence && (
                  <Text style={styles.aiConfidence}>
                    {(report.ai_confidence * 100).toFixed(0)}% Akurat
                  </Text>
                )}
              </View>
            )}

            {/* Title & Date */}
            <Text style={styles.title}>{report.title}</Text>
            <Text style={styles.date}>
              Dilaporkan pada {new Date(report.created_at).toLocaleString('id-ID')}
            </Text>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DESKRIPSI KONDISI</Text>
              <Text style={styles.descriptionText}>{report.description}</Text>
            </View>

            {/* Admin notes if any */}
            {report.admin_notes && (
              <View style={[styles.section, styles.adminSection]}>
                <Text style={[styles.sectionTitle, { color: '#1D4ED8' }]}>CATATAN PETUGAS DINAS</Text>
                <Text style={styles.adminNotesText}>{report.admin_notes}</Text>
              </View>
            )}

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>LOKASI GEOLOKASI (GPS)</Text>
              <View style={styles.locationBox}>
                <Ionicons name="location" size={18} color="#059669" />
                <View style={{ flex: 1 }}>
                  {report.address && (
                    <Text style={styles.addressText}>{report.address}</Text>
                  )}
                  <Text style={styles.coordsText}>
                    Koordinat: {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={styles.closeActionBtn}>
            <Text style={styles.closeActionBtnText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  aiCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  aiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  aiConfidence: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
  },
  adminSection: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  adminNotesText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  locationBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
  },
  addressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  coordsText: {
    fontSize: 11,
    color: '#64748B',
  },
  closeActionBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  closeActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
});

