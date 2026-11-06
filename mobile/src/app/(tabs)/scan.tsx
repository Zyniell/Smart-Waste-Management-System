import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { mobileApi, PredictionResult } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Kamera Ditolak', 'Harap berikan izin kamera untuk memindai sampah.');
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!res.canceled && res.assets[0].uri) {
      const asset = res.assets[0];
      scanImage(asset.uri, (asset as any).file);
    }
  };

  const handlePickGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Galeri Ditolak', 'Harap berikan izin galeri untuk memilih foto.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!res.canceled && res.assets[0].uri) {
      const asset = res.assets[0];
      scanImage(asset.uri, (asset as any).file);
    }
  };

  const scanImage = async (uri: string, fileObj?: any) => {
    setImageUri(uri);
    setScanning(true);
    setResult(null);

    try {
      const data = await mobileApi.predictImage(uri, fileObj);
      setResult(data);
    } catch (e: any) {
      Alert.alert('Gagal Memindai', e.response?.data?.detail || e.message || 'Periksa koneksi backend.');
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setImageUri(null);
    setResult(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 6 }]}>
        <View style={styles.badge}>
          <Ionicons name="hardware-chip" size={14} color="#059669" />
          <Text style={styles.badgeText}>MobileNetV2 AI Engine</Text>
        </View>
        <Text style={styles.title}>AI Waste Scanner</Text>
        <Text style={styles.subtitle}>
          Pindai foto sampah untuk mengidentifikasi apakah tergolong Organik, Plastik, atau Kertas.
        </Text>
      </View>

      {/* Main Scanner Box */}
      <View style={styles.card}>
        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.resetBtnText}>Ganti Foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadBox}>
            <View style={styles.iconCircle}>
              <Ionicons name="scan-circle" size={48} color="#059669" />
            </View>
            <Text style={styles.uploadTitle}>Ambil atau Pilih Foto Sampah</Text>
            <Text style={styles.uploadSubtitle}>
              AI akan menganalisis tekstur & bentuk gambar untuk klasifikasi otomatis
            </Text>

            <View style={styles.actionRow}>
              <TouchableOpacity onPress={handleTakePhoto} style={styles.selectBtn}>
                <Ionicons name="camera" size={18} color="#059669" />
                <Text style={styles.selectBtnText}>Kamera</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handlePickGallery} style={styles.selectBtn}>
                <Ionicons name="images" size={18} color="#059669" />
                <Text style={styles.selectBtnText}>Galeri</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Processing Indicator */}
        {scanning && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#059669" />
            <Text style={styles.loadingText}>Model AI sedang memprediksi kategori...</Text>
          </View>
        )}

        {/* Prediction Results */}
        {result && (
          <View style={styles.resultContainer}>
            <View style={styles.resultBanner}>
              <Text style={styles.resultLabel}>HASIL PREDIKSI AI</Text>
              <View style={styles.resultHeader}>
                <Text style={styles.resultCategory}>{result.category}</Text>
                <Text style={styles.resultConfidence}>
                  {(result.confidence * 100).toFixed(1)}%
                </Text>
              </View>
              <Text style={styles.resultTip}>{result.message}</Text>
            </View>

            {/* Probability Bars */}
            <View style={styles.probsContainer}>
              <Text style={styles.probsHeading}>DISTRIBUSI PROBABILITAS KELAS</Text>
              {Object.entries(result.probabilities).map(([catName, prob]) => {
                const percent = (prob * 100).toFixed(1);
                const isWinner = result.category === catName;
                return (
                  <View key={catName} style={styles.probItem}>
                    <View style={styles.probLabels}>
                      <Text style={[styles.probName, isWinner && styles.probWinner]}>
                        {catName}
                      </Text>
                      <Text style={[styles.probPercent, isWinner && styles.probWinner]}>
                        {percent}%
                      </Text>
                    </View>
                    <View style={styles.probBarBg}>
                      <View
                        style={[
                          styles.probBarFill,
                          {
                            width: `${Math.max(5, Number(percent))}%`,
                            backgroundColor: isWinner ? '#059669' : '#CBD5E1',
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Quick Action Button */}
            <TouchableOpacity
              onPress={() => router.push('/report' as any)}
              style={styles.makeReportBtn}
            >
              <Ionicons name="document-text" size={18} color="#FFFFFF" />
              <Text style={styles.makeReportBtnText}>Lanjutkan Jadi Laporan Resmi</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Guide Cards */}
      <View style={styles.guideSection}>
        <Text style={styles.guideHeading}>Kategori Sampah yang Didukung:</Text>
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>🌱 Organic Waste (Sampah Organik)</Text>
          <Text style={styles.guideDesc}>Sisa makanan, kulit buah, potongan sayur, dedaunan.</Text>
        </View>

        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>🥤 Plastic Waste (Sampah Plastik)</Text>
          <Text style={styles.guideDesc}>Botol plastik, kemasan sachet, kantong kresek, sedotan.</Text>
        </View>

        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>📦 Paper Waste (Sampah Kertas)</Text>
          <Text style={styles.guideDesc}>Kardus paket belanja, kertas dokumen, koran, kemasan karton.</Text>
        </View>
      </View>
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
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
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  uploadBox: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  selectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 16,
  },
  resetBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    marginTop: 14,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  resultContainer: {
    marginTop: 14,
  },
  resultBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 14,
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  resultCategory: {
    fontSize: 20,
    fontWeight: '900',
    color: '#065F46',
  },
  resultConfidence: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resultTip: {
    fontSize: 12,
    color: '#047857',
    marginTop: 8,
    lineHeight: 18,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
  },
  probsContainer: {
    marginTop: 16,
  },
  probsHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  probItem: {
    marginBottom: 10,
  },
  probLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  probName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  probPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  probWinner: {
    color: '#059669',
    fontWeight: '700',
  },
  probBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  probBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  makeReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 14,
  },
  makeReportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  guideSection: {
    marginBottom: 40,
  },
  guideHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 8,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  guideDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
