import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { mobileApi, appendImageToFormData, WasteCategory } from '../../services/api';
import { AuthModal } from '../../components/AuthModal';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [authModalVisible, setAuthModalVisible] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WasteCategory>('PLASTIC');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFileObj, setImageFileObj] = useState<any>(null);

  // GPS State
  const [latitude, setLatitude] = useState<number>(-6.2088);
  const [longitude, setLongitude] = useState<number>(106.8456);
  const [address, setAddress] = useState<string>('');
  const [gpsLoading, setGpsLoading] = useState(false);

  // AI Scanner State
  const [aiScanning, setAiScanning] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // Camera capture
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Kamera Ditolak', 'Harap berikan izin kamera untuk memotret sampah.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      const asset = result.assets[0];
      processImage(asset.uri, (asset as any).file);
    }
  };

  // Gallery select
  const handlePickGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Galeri Ditolak', 'Harap berikan izin galeri untuk memilih foto sampah.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      const asset = result.assets[0];
      processImage(asset.uri, (asset as any).file);
    }
  };

  // Process selected image & run live AI prediction
  const processImage = async (uri: string, fileObj?: any) => {
    setImageUri(uri);
    setImageFileObj(fileObj || null);
    setAiScanning(true);
    try {
      const pred = await mobileApi.predictImage(uri, fileObj);
      setAiPrediction(pred.category);
      setAiConfidence(pred.confidence);

      // Auto prefill category
      if (pred.category.includes('Organic')) setCategory('ORGANIC');
      else if (pred.category.includes('Paper')) setCategory('PAPER');
      else if (pred.category.includes('Plastic')) setCategory('PLASTIC');
    } catch (e: any) {
      console.error('AI scan failed', e);
      Alert.alert('Peringatan AI', 'AI tidak dapat memindai gambar ini. Anda tetap dapat memilih kategori secara manual.');
    } finally {
      setAiScanning(false);
    }
  };

  // Fetch GPS location
  const handleGetLocation = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Lokasi Ditolak', 'Izin GPS dibutuhkan untuk menandai titik lokasi sampah.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);

      // Reverse geocoding
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        if (geocode.length > 0) {
          const item = geocode[0];
          const fullAddr = [item.street, item.subregion, item.city].filter(Boolean).join(', ');
          setAddress(fullAddr || `Koordinat: ${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`);
        }
      } catch {
        setAddress(`Koordinat: ${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`);
      }
    } catch (e: any) {
      Alert.alert('Gagal Mendapatkan GPS', e.message || 'Periksa koneksi GPS ponsel Anda.');
    } finally {
      setGpsLoading(false);
    }
  };

  // Submit report
  const handleSubmit = async () => {
    if (!user) {
      setAuthModalVisible(true);
      return;
    }
    if (!imageUri) {
      Alert.alert('Foto Diperlukan', 'Harap ambil atau pilih foto sampah terlebih dahulu.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Judul Diperlukan', 'Harap isi judul laporan sampah.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Deskripsi Diperlukan', 'Harap isi deskripsi laporan kondisi sampah.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      if (address) formData.append('address', address);
      if (aiPrediction) formData.append('ai_prediction', aiPrediction);
      if (aiConfidence) formData.append('ai_confidence', aiConfidence.toString());

      await appendImageToFormData(formData, 'image', imageUri, imageFileObj);

      await mobileApi.createReport(formData);

      Alert.alert(
        'Laporan Berhasil Terkirim!',
        'Laporan sampah Anda telah masuk ke sistem dan akan ditindaklanjuti oleh dinas kebersihan.',
        [
          {
            text: 'Lihat Riwayat',
            onPress: () => {
              resetForm();
              router.push('/history' as any);
            },
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Gagal Mengirim Laporan', e.response?.data?.detail || e.message || 'Periksa koneksi jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageUri(null);
    setImageFileObj(null);
    setAiPrediction(null);
    setAiConfidence(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Title Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 6 }]}>
        <Text style={styles.screenTitle}>Buat Laporan Sampah</Text>
        <Text style={styles.screenSubtitle}>
          Foto tumpukan sampah, dapatkan deteksi AI otomatis, dan bagikan lokasi GPS.
        </Text>
      </View>

      {/* Photo Picker Box */}
      <View style={styles.photoContainer}>
        {imageUri ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            <View style={styles.imageActions}>
              <TouchableOpacity onPress={handleTakePhoto} style={styles.miniBtn}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePickGallery} style={styles.miniBtn}>
                <Ionicons name="images" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyPhotoBox}>
            <Ionicons name="image-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyPhotoText}>Belum Ada Foto Sampah</Text>
            <View style={styles.photoButtonsRow}>
              <TouchableOpacity onPress={handleTakePhoto} style={styles.photoSelectBtn}>
                <Ionicons name="camera" size={18} color="#059669" />
                <Text style={styles.photoSelectBtnText}>Ambil Kamera</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handlePickGallery} style={styles.photoSelectBtn}>
                <Ionicons name="images" size={18} color="#059669" />
                <Text style={styles.photoSelectBtnText}>Buka Galeri</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Live AI Detection Feedback */}
        {aiScanning && (
          <View style={styles.aiLoadingBox}>
            <ActivityIndicator size="small" color="#059669" />
            <Text style={styles.aiLoadingText}>AI MobileNetV2 sedang memindai foto...</Text>
          </View>
        )}

        {aiPrediction && !aiScanning && (
          <View style={styles.aiResultBox}>
            <View style={styles.aiResultLeft}>
              <Ionicons name="sparkles" size={18} color="#059669" />
              <View>
                <Text style={styles.aiResultCategory}>{aiPrediction}</Text>
                <Text style={styles.aiResultSub}>Kategori form disesuaikan otomatis</Text>
              </View>
            </View>
            {aiConfidence && (
              <Text style={styles.aiConfidenceBadge}>
                {(aiConfidence * 100).toFixed(0)}% Akurat
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Form Fields */}
      <View style={styles.formCard}>
        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>JUDUL LAPORAN</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Contoh: Tumpukan Botol Plastik di Pinggir Jalan"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
        </View>

        {/* Category Selector */}
        <View style={styles.field}>
          <Text style={styles.label}>KATEGORI SAMPAH</Text>
          <View style={styles.categoryRow}>
            {(['PLASTIC', 'ORGANIC', 'PAPER'] as WasteCategory[]).map((c) => {
              const active = category === c;
              const labels: Record<WasteCategory, string> = {
                PLASTIC: 'Plastik',
                ORGANIC: 'Organik',
                PAPER: 'Kertas',
              };
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[styles.categoryBtn, active && styles.activeCategoryBtn]}
                >
                  <Text style={[styles.categoryBtnText, active && styles.activeCategoryBtnText]}>
                    {labels[c]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* GPS Location Button */}
        <View style={styles.field}>
          <Text style={styles.label}>LOKASI GPS</Text>
          <TouchableOpacity
            onPress={handleGetLocation}
            disabled={gpsLoading}
            style={styles.gpsBtn}
          >
            {gpsLoading ? (
              <ActivityIndicator color="#059669" />
            ) : (
              <>
                <Ionicons name="location" size={18} color="#059669" />
                <Text style={styles.gpsBtnText}>Perbarui Koordinat GPS Otomatis</Text>
              </>
            )}
          </TouchableOpacity>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Alamat patokan lokasi (contoh: Depan Ruko Blok C)"
            placeholderTextColor="#94A3B8"
            style={[styles.input, { marginTop: 8 }]}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>DESKRIPSI KONDISI</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Jelaskan volume timbunan sampah, bau, atau kondisi penumpukan..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={[styles.input, { height: 90 }]}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={styles.submitBtn}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Kirim Laporan Sampah</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

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
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  photoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 16,
  },
  emptyPhotoBox: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyPhotoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  photoSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  photoSelectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
  },
  imageActions: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  miniBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    padding: 10,
    borderRadius: 20,
  },
  aiLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  aiLoadingText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  aiResultBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  aiResultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiResultCategory: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  aiResultSub: {
    fontSize: 11,
    color: '#059669',
  },
  aiConfidenceBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 40,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.5,
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
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  activeCategoryBtn: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  categoryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  activeCategoryBtnText: {
    color: '#FFFFFF',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 12,
    borderRadius: 12,
  },
  gpsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 6,
    shadowColor: '#059669',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
