import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, register, backendIp, updateBackendIp } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Server IP config toggle
  const [showIpConfig, setShowIpConfig] = useState(false);
  const [tempIp, setTempIp] = useState(backendIp);

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password) {
      setError('Harap masukkan email dan kata sandi.');
      return;
    }
    if (isRegister && !name.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Gagal masuk. Periksa koneksi ke server backend.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal masuk akun demo. Periksa status server backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIp = async () => {
    if (!tempIp.trim()) {
      Alert.alert('Perhatian', 'Alamat IP tidak boleh kosong.');
      return;
    }
    await updateBackendIp(tempIp.trim());
    setShowIpConfig(false);
    Alert.alert('Sukses', `IP Server backend diatur ke: http://${tempIp.trim()}:8000`);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: Math.max(insets.top, 20) + 16,
            paddingBottom: Math.max(insets.bottom, 20) + 16
          }
        ]}
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf" size={32} color="#059669" />
          </View>
          <Text style={styles.appName}>SmartWaste</Text>
          <Text style={styles.appSubtitle}>Mobile Management System</Text>
          <Text style={styles.pageTitle}>
            {isRegister ? 'Daftar Akun Warga Baru' : 'Masuk ke Aplikasi'}
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => { setIsRegister(false); setError(null); }}
            style={[styles.tab, !isRegister && styles.activeTab]}
          >
            <Text style={[styles.tabText, !isRegister && styles.activeTabText]}>Masuk</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setIsRegister(true); setError(null); }}
            style={[styles.tab, isRegister && styles.activeTab]}
          >
            <Text style={[styles.tabText, isRegister && styles.activeTabText]}>Daftar Akun</Text>
          </TouchableOpacity>
        </View>

        {/* Error Alert Box */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color="#E11D48" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Form Fields Card */}
        <View style={styles.formCard}>
          {isRegister && (
            <View style={styles.field}>
              <Text style={styles.label}>NAMA LENGKAP</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Contoh: Budi Santoso"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>ALAMAT EMAIL</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="nama@email.com"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>KATA SANDI</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitBtn}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isRegister ? 'Daftar Sekarang' : 'Masuk ke Aplikasi'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Shortcuts (Only on Login Tab) */}
          {!isRegister && (
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Pintasan Akun Demo (1-Klik):</Text>
              <View style={styles.demoRow}>
                <TouchableOpacity
                  onPress={() => handleQuickLogin('budi@smartwaste.local', 'user123')}
                  style={[styles.demoBtn, styles.citizenDemoBtn]}
                >
                  <Ionicons name="person" size={15} color="#2563EB" />
                  <Text style={styles.citizenDemoText}>Citizen (Warga)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleQuickLogin('admin@smartwaste.local', 'admin123')}
                  style={[styles.demoBtn, styles.adminDemoBtn]}
                >
                  <Ionicons name="shield-checkmark" size={15} color="#059669" />
                  <Text style={styles.adminDemoText}>Admin Demo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Server IP Configuration Pill */}
        <View style={styles.serverSection}>
          <TouchableOpacity 
            onPress={() => setShowIpConfig(!showIpConfig)} 
            style={styles.serverPill}
          >
            <Ionicons name="server-outline" size={14} color="#059669" />
            <Text style={styles.serverPillText}>
              API: http://{backendIp}:8000
            </Text>
            <Ionicons 
              name={showIpConfig ? 'chevron-up' : 'create-outline'} 
              size={14} 
              color="#059669" 
            />
          </TouchableOpacity>

          {showIpConfig && (
            <View style={styles.ipConfigBox}>
              <Text style={styles.ipLabel}>Ubah Alamat IP Server Komputer:</Text>
              <View style={styles.ipInputRow}>
                <TextInput
                  value={tempIp}
                  onChangeText={setTempIp}
                  placeholder="Contoh: 192.168.1.14"
                  placeholderTextColor="#94A3B8"
                  style={styles.ipInput}
                />
                <TouchableOpacity onPress={handleSaveIp} style={styles.ipSaveBtn}>
                  <Text style={styles.ipSaveBtnText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    shadowColor: '#059669',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
    marginTop: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTabText: {
    color: '#059669',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: '#BE123C',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#059669',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  demoSection: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
    textAlign: 'center',
  },
  demoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  citizenDemoBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  citizenDemoText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '700',
  },
  adminDemoBtn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  adminDemoText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
  },
  serverSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  serverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  serverPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  ipConfigBox: {
    marginTop: 10,
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ipLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  ipInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ipInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  ipSaveBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 10,
  },
  ipSaveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});

