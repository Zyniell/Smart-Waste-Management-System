import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert 
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../../components/AuthModal';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, backendIp, updateBackendIp, logout } = useAuth();
  const [ipInput, setIpInput] = useState(backendIp);
  const [authModalVisible, setAuthModalVisible] = useState(false);

  const handleSaveIp = async () => {
    if (!ipInput.trim()) {
      Alert.alert('IP Kosong', 'Harap masukkan alamat IP host komputer Anda.');
      return;
    }
    await updateBackendIp(ipInput.trim());
    Alert.alert('Pengaturan Tersimpan', `Alamat server backend berhasil diatur ke: http://${ipInput.trim()}:8000`);
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login' as any);
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 6 }]}>
        <Text style={styles.title}>Akun & Pengaturan</Text>
      </View>

      {/* User Info Card */}
      {user ? (
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.rolePill}>
              <Ionicons
                name={user.role === 'ADMIN' ? 'shield-checkmark' : 'person'}
                size={12}
                color={user.role === 'ADMIN' ? '#059669' : '#2563EB'}
              />
              <Text
                style={[
                  styles.roleText,
                  { color: user.role === 'ADMIN' ? '#065F46' : '#1E40AF' },
                ]}
              >
                {user.role === 'ADMIN' ? 'Administrator' : 'Citizen (Warga)'}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.loginCard}>
          <Ionicons name="person-circle-outline" size={54} color="#94A3B8" />
          <Text style={styles.loginCardTitle}>Anda Belum Masuk</Text>
          <Text style={styles.loginCardDesc}>
            Masuk atau daftar untuk mengirim laporan sampah dan memantau status tindak lanjut.
          </Text>
          <TouchableOpacity onPress={() => setAuthModalVisible(true)} style={styles.loginActionBtn}>
            <Text style={styles.loginActionBtnText}>Masuk / Daftar Akun</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Backend Server IP Settings */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="server" size={18} color="#059669" />
          <Text style={styles.sectionTitle}>Konfigurasi Server Backend API</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Atur alamat IP komputer server tempat FastAPI berjalan (default IP Wi-Fi lokal).
        </Text>

        <View style={styles.ipRow}>
          <TextInput
            value={ipInput}
            onChangeText={setIpInput}
            placeholder="Contoh: 192.168.1.14"
            placeholderTextColor="#94A3B8"
            style={styles.ipInput}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={handleSaveIp} style={styles.saveIpBtn}>
            <Text style={styles.saveIpBtnText}>Simpan</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.currentUrlText}>
          URL Aktif: http://{backendIp}:8000/api
        </Text>
      </View>

      {/* System Information */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="information-circle" size={18} color="#059669" />
          <Text style={styles.sectionTitle}>Tentang Sistem</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Versi Aplikasi</Text>
          <Text style={styles.infoVal}>1.0.0 (Expo SDK 58)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>AI Engine</Text>
          <Text style={styles.infoVal}>MobileNetV2 (TensorFlow / Keras)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Backend Service</Text>
          <Text style={styles.infoVal}>FastAPI (Python 3.13) + PostgreSQL</Text>
        </View>
      </View>

      {/* Logout Button */}
      {user && (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out" size={18} color="#E11D48" />
          <Text style={styles.logoutBtnText}>Keluar dari Akun</Text>
        </TouchableOpacity>
      )}

      <AuthModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#059669',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 8,
  },
  loginCardDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  loginActionBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 14,
  },
  loginActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  ipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ipInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  saveIpBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  saveIpBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  currentUrlText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 4,
    marginBottom: 40,
  },
  logoutBtnText: {
    color: '#E11D48',
    fontSize: 13,
    fontWeight: '700',
  },
});

