import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl, 
  ActivityIndicator, 
  Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { mobileApi, Report, getFullImageUrl } from '../../services/api';
import { StatusPill, CategoryPill } from '../../components/StatusPill';
import { AuthModal } from '../../components/AuthModal';
import { ReportDetailModal } from '../../components/ReportDetailModal';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const myReports = await mobileApi.getReports(true);
      setReports(myReports);
    } catch (e) {
      console.error('Failed to load user reports', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const pendingCount = reports.filter((r) => r.status === 'PENDING').length;
  const inProgressCount = reports.filter((r) => r.status === 'IN_PROGRESS').length;
  const completedCount = reports.filter((r) => r.status === 'COMPLETED').length;

  if (authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />}
    >
      {/* Top Bar Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 6 }]}>
        <View>
          <Text style={styles.greeting}>
            Halo, {user ? user.name.split(' ')[0] : 'Warga'} 👋
          </Text>
          <Text style={styles.tagline}>Smart Waste Management System</Text>
        </View>

        {user ? (
          <TouchableOpacity onPress={() => router.push('/profile' as any)} style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => router.push('/login' as any)} style={styles.loginBtn}>
            <Text style={styles.loginBtnText}>Masuk</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Hero Banner */}
      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={12} color="#A7F3D0" />
            <Text style={styles.heroBadgeText}>AI Powered Scanner</Text>
          </View>
          <Text style={styles.heroTitle}>Laporkan Tumpukan Sampah di Lingkungan Anda</Text>
          <Text style={styles.heroDesc}>
            Ambil foto, biarkan AI MobileNetV2 mengidentifikasi jenis sampah, dan kirim lokasi GPS ke dinas kebersihan.
          </Text>
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={() => (user ? router.push('/report' as any) : router.push('/login' as any))}
          style={[styles.actionBtn, styles.primaryAction]}
        >
          <Ionicons name="camera" size={18} color="#FFFFFF" />
          <Text style={styles.actionBtnText} numberOfLines={1}>Buat Laporan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/scan' as any)}
          style={[styles.actionBtn, styles.secondaryAction]}
        >
          <Ionicons name="scan" size={18} color="#059669" />
          <Text style={[styles.actionBtnText, { color: '#065F46' }]} numberOfLines={1}>Scan Sampah (AI)</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionHeading}>Statistik Laporan Saya</Text>
        <View style={styles.statGrid}>
          <View style={[styles.statCard, { borderLeftColor: '#059669' }]}>
            <Text style={styles.statNum}>{reports.length}</Text>
            <Text style={styles.statLabel}>Total Laporan</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
            <Text style={[styles.statNum, { color: '#D97706' }]}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}>
            <Text style={[styles.statNum, { color: '#2563EB' }]}>{inProgressCount}</Text>
            <Text style={styles.statLabel}>Diproses</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
            <Text style={[styles.statNum, { color: '#059669' }]}>{completedCount}</Text>
            <Text style={styles.statLabel}>Selesai</Text>
          </View>
        </View>
      </View>

      {/* Recent Reports List */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Laporan Terkini Anda</Text>
          <TouchableOpacity onPress={() => router.push('/history' as any)}>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {!user ? (
          <View style={styles.emptyCard}>
            <Ionicons name="lock-closed-outline" size={36} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Masuk untuk Melihat Riwayat</Text>
            <TouchableOpacity onPress={() => router.push('/login' as any)} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Masuk Akun Warga</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <ActivityIndicator color="#059669" style={{ marginVertical: 20 }} />
        ) : reports.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={36} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Belum Ada Laporan</Text>
            <Text style={styles.emptySubtitle}>
              Mulai laporkan tumpukan sampah di sekitar Anda untuk menjaga kebersihan kota.
            </Text>
          </View>
        ) : (
          reports.slice(0, 4).map((report) => (
            <TouchableOpacity
              key={report.id}
              onPress={() => setSelectedReport(report)}
              style={styles.reportItem}
            >
              <View style={styles.reportRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.reportPillRow}>
                    <StatusPill status={report.status} />
                    <CategoryPill category={report.category} />
                  </View>
                  <Text style={styles.reportTitle} numberOfLines={1}>{report.title}</Text>
                  <Text style={styles.reportAddress} numberOfLines={1}>
                    {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Modals */}
      <AuthModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} />
      <ReportDetailModal
        report={selectedReport}
        visible={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  tagline: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  loginBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  heroCard: {
    backgroundColor: '#065F46',
    borderRadius: 24,
    padding: 20,
    marginTop: 8,
    shadowColor: '#059669',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  heroContent: {
    gap: 6,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(5, 150, 105, 0.4)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  heroBadgeText: {
    color: '#D1FAE5',
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
  },
  heroDesc: {
    color: '#A7F3D0',
    fontSize: 12,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryAction: {
    backgroundColor: '#059669',
  },
  secondaryAction: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  statsSection: {
    marginTop: 22,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 4,
  },
  recentSection: {
    marginTop: 24,
    marginBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  reportItem: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 8,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportPillRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  reportAddress: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  emptyBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
