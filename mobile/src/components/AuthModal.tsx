import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Modal, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface AuthModalProps {
  visible: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const { login, register, backendIp } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      onClose?.();
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Gagal masuk. Periksa koneksi ke server.';
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
      onClose?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal masuk akun demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Ionicons name="leaf" size={28} color="#059669" />
              </View>
              <Text style={styles.title}>SmartWaste Mobile</Text>
              <Text style={styles.subtitle}>
                {isRegister ? 'Daftar Akun Warga Baru' : 'Masuk untuk Melaporkan Sampah'}
              </Text>
              <Text style={styles.ipBadge}>API: http://{backendIp}:8000</Text>
            </View>

            {/* Tabs */}
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

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#E11D48" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Form Fields */}
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
              style={styles.primaryBtn}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {isRegister ? 'Daftar Sekarang' : 'Masuk ke Aplikasi'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Demo Buttons */}
            {!isRegister && (
              <View style={styles.demoSection}>
                <Text style={styles.demoTitle}>Pintasan Akun Demo:</Text>
                <View style={styles.demoRow}>
                  <TouchableOpacity
                    onPress={() => handleQuickLogin('budi@smartwaste.local', 'user123')}
                    style={[styles.demoBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
                  >
                    <Ionicons name="person" size={14} color="#2563EB" />
                    <Text style={[styles.demoBtnText, { color: '#1E40AF' }]}>Citizen (Warga)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleQuickLogin('admin@smartwaste.local', 'admin123')}
                    style={[styles.demoBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
                  >
                    <Ionicons name="shield-checkmark" size={14} color="#059669" />
                    <Text style={[styles.demoBtnText, { color: '#065F46' }]}>Admin Demo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  ipBadge: {
    fontSize: 10,
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 6,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#059669',
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorText: {
    color: '#E11D48',
    fontSize: 12,
    flex: 1,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  primaryBtn: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#059669',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
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
    borderRadius: 10,
    borderWidth: 1,
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

