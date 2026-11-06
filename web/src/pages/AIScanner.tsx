import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictApi } from '../services/api';
import type { PredictionResult } from '../types';
import { 
  Upload, 
  Sparkles, 
  Info, 
  ArrowRight, 
  RotateCcw, 
  Loader2, 
  BrainCircuit, 
  BarChart2, 
  Leaf, 
  Box, 
  FileText 
} from 'lucide-react';

export const AIScanner: React.FC = () => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleScan = async () => {
    if (!imageFile) return;
    setScanning(true);
    setError(null);

    try {
      const data = await predictApi.scanImage(imageFile);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal melakukan klasifikasi gambar. Pastikan server backend berjalan.');
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
          <BrainCircuit className="w-4 h-4 text-emerald-600" />
          MobileNetV2 Transfer Learning AI
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Waste Image Scanner
        </h1>
        <p className="mt-2 text-slate-500 text-sm sm:text-base leading-relaxed">
          Unggah foto sampah Anda untuk mengidentifikasi apakah tergolong <b>Sampah Organik</b>, <b>Sampah Plastik</b>, atau <b>Sampah Kertas</b> secara otomatis dan akurat.
        </p>
      </div>

      {/* Main Scanner Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Upload Area */}
          <div>
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-6 text-center transition bg-slate-50/50 relative cursor-pointer min-h-[300px] flex flex-col items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-60 rounded-2xl object-cover mx-auto shadow-md border border-slate-200"
                  />
                  <p className="text-xs text-emerald-600 font-semibold">Klik atau seret untuk mengganti gambar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Unggah Foto Sampah</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Format JPEG, PNG, atau WEBP hingga 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                disabled={!imageFile || scanning}
                onClick={handleScan}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-md shadow-emerald-600/20 text-sm transition disabled:opacity-50 cursor-pointer"
              >
                {scanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses Analisis AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Pindai Sampah Sekarang
                  </>
                )}
              </button>

              {imageFile && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-3 border border-slate-200 hover:bg-slate-100 rounded-2xl text-slate-600 transition cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs">
                {error}
              </div>
            )}
          </div>

          {/* Results Area */}
          <div>
            {result ? (
              <div className="space-y-5 animate-fade-in">
                <div className="p-5 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                    Hasil Klasifikasi AI
                  </span>
                  <div className="text-2xl font-black text-emerald-950 flex items-center justify-between">
                    <span>{result.category}</span>
                    <span className="text-lg font-extrabold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-xl">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-2.5 leading-relaxed bg-white/70 p-3 rounded-xl border border-emerald-100">
                    {result.message}
                  </p>
                </div>

                {/* Probabilities Breakdown */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-emerald-600" />
                    Distribusi Probabilitas Kelas Model
                  </h4>
                  <div className="space-y-2.5">
                    {Object.entries(result.probabilities).map(([catName, prob]) => {
                      const percent = (prob * 100).toFixed(1);
                      const isWinner = result.category === catName;
                      return (
                        <div key={catName} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>{catName}</span>
                            <span className={isWinner ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                              {percent}%
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isWinner ? 'bg-emerald-600' : 'bg-slate-300'
                              }`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Link to create report */}
                <button
                  type="button"
                  onClick={() => navigate('/reports')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl text-xs shadow-md transition cursor-pointer"
                >
                  Buat Laporan Sampah Resmi dengan Data Ini <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-8 border border-slate-100 bg-slate-50/70 rounded-2xl text-center space-y-3">
                <Info className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">Belum Ada Hasil Pindaian</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Pilih foto sampah di sebelah kiri dan klik tombol <b>Pindai Sampah Sekarang</b> untuk menjalankan model MobileNetV2.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model Information Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-emerald-600" />
          Tentang Model & Evaluasi Klasifikasi Sampah
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Model dilatih menggunakan arsitektur transfer learning <b>MobileNetV2</b> pada 3 kategori utama dengan metrik evaluasi Scikit-learn.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <Leaf className="w-4 h-4 text-emerald-600" /> Organic Waste
            </div>
            <p className="text-xs text-emerald-700/80 mt-1">
              Sisa makanan, daun, sayuran, dan bahan organik yang dapat terurai secara alami.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-100">
            <div className="flex items-center gap-2 text-cyan-800 font-bold text-sm">
              <Box className="w-4 h-4 text-cyan-600" /> Plastic Waste
            </div>
            <p className="text-xs text-cyan-700/80 mt-1">
              Botol plastik, kantong kresek, kemasan sachet, sedotan, dan wadah polimer.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <FileText className="w-4 h-4 text-amber-600" /> Paper Waste
            </div>
            <p className="text-xs text-amber-700/80 mt-1">
              Kardus, kertas dokumen, koran, majalah, dan kemasan karton kering daur ulang.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
