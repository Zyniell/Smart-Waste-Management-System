import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl, 
  ActivityIndicator,
  Image 
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { mobileApi, Report, ReportStatus, getFullImageUrl } from '../../services/api';
import { StatusPill, CategoryPill } from '../../components/StatusPill';
import { ReportDetailModal } from '../../components/ReportDetailModal';
import { AuthModal } from '../../components/AuthModal';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);

  const fetchReports = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const data = await mobileApi.getReports(true);
      setReports(data);
    } catch (e) {
      console.error('Failed to fetch history', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const filteredReports = statusFilter === 'ALL'
    ? reports
    : reports.filter((r) => r.status === statusFilter);

  const filters: Array<{ label: string; value: ReportStatus | 'ALL' }> = [
    { label: 'Semua', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Diproses', value: 'IN_PROGRESS' },
    { label: 'Selesai', value: 'COMPLETED' },
    { label: 'Ditolak', value: 'REJECTED' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 6 }]}>
        <Text style={styles.title}>Riwayat Laporan</Text>
        <Text style={styles.subtitle}>
          Pantau status penanganan laporan sampah yang Anda kirimkan
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterScrollWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const active = statusFilter === item.value;
            return (
              <TouchableOpacity
                onPress={() => setStatusFilter(item.value)}
                style={[styles.filterChip, active && styles.activeFilterChip]}
              >
                <Text style={[styles.filterChipText, active && styles.activeFilterChipText]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Content List */}
      {!user ? (
        <View style={styles.emptyBox}>
          <Ionicons name="lock-closed-outline" size={44} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Masuk Akun Warga</Text>
          <Text style={styles.emptySubtitle}>
            Silakan masuk untuk melihat daftar laporan yang pernah Anda buat.
          </Text>
          <TouchableOpacity onPress={() => setAuthModalVisible(true)} style={styles.authBtn}>
            <Text style={styles.authBtnText}>Masuk / Daftar</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : filteredReports.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="documents-outline" size={44} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Tidak Ada Laporan</Text>
          <Text style={styles.emptySubtitle}>
            Belum ada laporan dengan status {statusFilter}.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
          }
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedReport(item)}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <View style={styles.pillRow}>
                  <StatusPill status={item.status} />
                  <CategoryPill category={item.category} />
                </View>
                <Text style={styles.cardDate}>
                  {new Date(item.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

              {item.ai_prediction && (
                <View style={styles.aiTag}>
                  <Ionicons name="sparkles" size={13} color="#059669" />
                  <Text style={styles.aiTagText}>
                    AI: {item.ai_prediction} ({((item.ai_confidence || 0) * 100).toFixed(0)}%)
                  </Text>
                </View>
              )}

              <View style={styles.cardFooter}>
                <Ionicons name="location-outline" size={14} color="#64748B" />
                <Text style={styles.cardAddress} numberOfLines={1}>
                  {item.address || `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <AuthModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} />
      <ReportDetailModal
        report={selectedReport}
        visible={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  filterScrollWrapper: {
    marginVertical: 10,
  },
  filterList: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeFilterChip: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  cardDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 8,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  aiTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  cardAddress: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  authBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  authBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});

