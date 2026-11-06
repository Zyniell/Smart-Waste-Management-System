import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { reportsApi, predictApi, getFullImageUrl } from '../services/api';
import type { Report, ReportStatus, WasteCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge, CategoryBadge } from '../components/StatusBadge';
import { WasteMap } from '../components/WasteMap';
import { ConfirmModal } from '../components/ConfirmModal';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Trash2, 
  Eye, 
  X, 
  MapPin, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  FileText,
  Loader2
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id');

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<WasteCategory | ''>('');
  const [myOnly, setMyOnly] = useState(false);

  // Modals state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<ReportStatus>('PENDING');
  const [adminNotes, setAdminNotes] = useState('');

  // Delete modal state
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WasteCategory>('PLASTIC');
  const [latitude, setLatitude] = useState<number>(-6.2088);
  const [longitude, setLongitude] = useState<number>(106.8456);
  const [address, setAddress] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiScanning, setAiScanning] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reportsApi.getAll({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        search: search.trim() || undefined,
        my_only: myOnly,
      });
      setReports(data);

      // If initialId was provided in URL query, open detail modal
      if (initialId) {
        const found = data.find((r) => r.id === parseInt(initialId));
        if (found) setSelectedReport(found);
      }
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, categoryFilter, myOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  // Image select & AI Auto Scan
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));

      // Live AI auto detection
      setAiScanning(true);
      try {
        const pred = await predictApi.scanImage(file);
        setAiPrediction(pred.category);
        setAiConfidence(pred.confidence);

        // Auto pre-fill category
        if (pred.category.includes('Organic')) setCategory('ORGANIC');
        else if (pred.category.includes('Paper')) setCategory('PAPER');
        else if (pred.category.includes('Plastic')) setCategory('PLASTIC');
      } catch (err) {
        console.error('AI scan error:', err);
      } finally {
        setAiScanning(false);
      }
    }
  };

  // GPS fetch
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          if (!address) {
            setAddress(`Koordinat: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
          }
        },
        (err) => {
          toast.error('Tidak dapat mengakses lokasi perangkat: ' + err.message);
        }
      );
    } else {
      toast.warning('Geolocation tidak didukung oleh browser Anda.');
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setFormError('Harap unggah foto sampah');
      return;
    }
    setFormError(null);
    setActionLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      if (address) formData.append('address', address);
      if (aiPrediction) formData.append('ai_prediction', aiPrediction);
      if (aiConfidence) formData.append('ai_confidence', aiConfidence.toString());
      formData.append('image', imageFile);

      await reportsApi.create(formData);
      setIsCreateModalOpen(false);
      resetCreateForm();
      fetchReports();
      toast.success('Laporan sampah berhasil dibuat!');
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Gagal menyimpan laporan.');
    } finally {
      setActionLoading(false);
    }
  };

  const resetCreateForm = () => {
    setTitle('');
    setDescription('');
    setCategory('PLASTIC');
    setLatitude(-6.2088);
    setLongitude(106.8456);
    setAddress('');
    setImageFile(null);
    setImagePreview(null);
    setAiPrediction(null);
    setAiConfidence(null);
    setFormError(null);
  };

  const handleOpenStatusModal = (report: Report) => {
    setSelectedReport(report);
    setStatusToUpdate(report.status);
    setAdminNotes(report.admin_notes || '');
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      const updated = await reportsApi.updateStatus(selectedReport.id, statusToUpdate, adminNotes);
      setSelectedReport(updated);
      setIsStatusModalOpen(false);
      fetchReports();
      toast.success('Status laporan berhasil diperbarui!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Gagal mengupdate status laporan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReport = (report: Report) => {
    setReportToDelete(report);
  };

  const confirmDeleteReport = async () => {
    if (!reportToDelete) return;
    setIsDeleting(true);
    try {
      await reportsApi.delete(reportToDelete.id);
      if (selectedReport?.id === reportToDelete.id) setSelectedReport(null);
      setReportToDelete(null);
      fetchReports();
      toast.success('Laporan sampah berhasil dihapus.');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Gagal menghapus laporan.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Laporan Sampah
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola, filter, dan tindak lanjuti laporan timbunan sampah dari warga
          </p>
        </div>
        <button
          onClick={() => { resetCreateForm(); setIsCreateModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20 text-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" /> Buat Laporan Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, deskripsi, atau alamat..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | '')}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Pending (Menunggu)</option>
            <option value="IN_PROGRESS">In Progress (Diproses)</option>
            <option value="COMPLETED">Completed (Selesai)</option>
            <option value="REJECTED">Rejected (Ditolak)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as WasteCategory | '')}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            <option value="ORGANIC">Organik</option>
            <option value="PLASTIC">Plastik</option>
            <option value="PAPER">Kertas</option>
          </select>

          {/* My Only Filter toggle */}
          <button
            type="button"
            onClick={() => setMyOnly(!myOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              myOnly
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Laporan Saya
          </button>

          <button
            type="button"
            onClick={() => { setSearch(''); setStatusFilter(''); setCategoryFilter(''); setMyOnly(false); }}
            title="Reset Filter"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reports Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">Tidak ada laporan ditemukan</h3>
            <p className="text-sm text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-4">Foto & Judul</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Lokasi & Tanggal</th>
                  <th className="px-6 py-4">Deteksi AI</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={getFullImageUrl(report.image_url)}
                          alt={report.title}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{report.title}</div>
                          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{report.description}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Pelapor: {report.user?.name || 'Warga'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <CategoryBadge category={report.category} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={report.status} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-700 font-medium line-clamp-1 max-w-xs">
                        {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(report.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {report.ai_prediction ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            {report.ai_prediction}
                          </span>
                          {report.ai_confidence && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Akurasi: {(report.ai_confidence * 100).toFixed(0)}%
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReport(report)}
                          title="Lihat Detail"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => handleOpenStatusModal(report)}
                            title="Update Status"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}

                        {(isAdmin || report.user_id === user?.id) && (
                          <button
                            onClick={() => handleDeleteReport(report)}
                            title="Hapus Laporan"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <StatusBadge status={selectedReport.status} />
              <CategoryBadge category={selectedReport.category} />
            </div>

            <h2 className="text-xl font-bold text-slate-900">{selectedReport.title}</h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-4">
              <span>Pelapor: <b>{selectedReport.user?.name || 'Warga'}</b></span>
              <span>Dibuat: {new Date(selectedReport.created_at).toLocaleString('id-ID')}</span>
            </p>

            {/* Photo & AI prediction card */}
            <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200">
              <img
                src={getFullImageUrl(selectedReport.image_url)}
                alt={selectedReport.title}
                className="w-full max-h-72 object-cover"
              />
              {selectedReport.ai_prediction && (
                <div className="bg-emerald-50/70 p-3.5 border-t border-emerald-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-emerald-900">
                      Deteksi AI MobileNetV2: {selectedReport.ai_prediction}
                    </span>
                  </div>
                  {selectedReport.ai_confidence && (
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {(selectedReport.ai_confidence * 100).toFixed(1)}% Keyakinan
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Deskripsi Masalah</h4>
              <p className="mt-1 text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {selectedReport.description}
              </p>
            </div>

            {/* Admin Notes if any */}
            {selectedReport.admin_notes && (
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500">Catatan Petugas / Admin</h4>
                <p className="mt-1 text-sm text-blue-900 bg-blue-50 p-3.5 rounded-xl border border-blue-100">
                  {selectedReport.admin_notes}
                </p>
              </div>
            )}

            {/* Mini Map */}
            <div className="mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Lokasi Koordinat ({selectedReport.latitude}, {selectedReport.longitude})
              </h4>
              {selectedReport.address && (
                <p className="text-xs text-slate-600 mb-2">{selectedReport.address}</p>
              )}
              <WasteMap reports={[selectedReport]} height="200px" zoom={14} />
            </div>

            {/* Action buttons */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <div>
                {(isAdmin || selectedReport.user_id === user?.id) && (
                  <button
                    onClick={() => handleDeleteReport(selectedReport)}
                    className="flex items-center gap-1 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus Laporan
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => handleOpenStatusModal(selectedReport)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    Ubah Status Laporan
                  </button>
                )}
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL (Admin Only) */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsStatusModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">Perbarui Status Laporan</h3>
            <p className="text-xs text-slate-500 mt-1">Ubah status penyelesaian laporan sampah ini</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Pilih Status Baru
                </label>
                <select
                  value={statusToUpdate}
                  onChange={(e) => setStatusToUpdate(e.target.value as ReportStatus)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="PENDING">PENDING - Menunggu Verifikasi</option>
                  <option value="IN_PROGRESS">IN PROGRESS - Sedang Ditindaklanjuti / Diangkut</option>
                  <option value="COMPLETED">COMPLETED - Sampah Berhasil Dibersihkan</option>
                  <option value="REJECTED">REJECTED - Laporan Ditolak / Tidak Valid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Catatan Petugas (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Contoh: Petugas kebersihan dinas telah mengangkut sampah pukul 10:30 WIB."
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleUpdateStatus}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE REPORT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900">Buat Laporan Sampah Baru</h2>
            <p className="text-xs text-slate-500 mt-1">
              Laporkan tumpukan sampah lengkap dengan foto, lokasi GPS, dan deteksi otomatis AI
            </p>

            {formError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateReport} className="mt-4 space-y-4">
              {/* Photo Upload with AI Scanner */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Foto Sampah (Wajib)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center transition bg-slate-50 relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-40 object-cover rounded-xl border border-slate-200"
                      />
                      <p className="text-xs text-emerald-600 font-medium">Klik untuk mengganti foto</p>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">Pilih atau Seret Foto ke Sini</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Mendukung JPEG, PNG, atau WEBP</p>
                    </div>
                  )}
                </div>

                {/* AI Detection Banner */}
                {aiScanning && (
                  <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>AI MobileNetV2 sedang memindai jenis sampah dari gambar...</span>
                  </div>
                )}

                {aiPrediction && !aiScanning && (
                  <div className="mt-2 p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                    <div className="flex items-center gap-2 font-semibold">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Rekomendasi AI: {aiPrediction}</span>
                    </div>
                    {aiConfidence && (
                      <span className="font-bold bg-white px-2 py-0.5 rounded shadow-2xs">
                        {(aiConfidence * 100).toFixed(0)}% Akurat
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Judul Laporan
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Tumpukan Botol Plastik di Pinggir Kali"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Kategori Sampah
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as WasteCategory)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="PLASTIC">Sampah Plastik</option>
                    <option value="ORGANIC">Sampah Organik</option>
                    <option value="PAPER">Sampah Kertas / Karton</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Lokasi GPS
                  </label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 border border-emerald-300 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Ambil Lokasi Saya Otomatis
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Alamat / Patokan Lokasi
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Jl. Sudirman No. 10 dekat jembatan penyeberangan"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Deskripsi Lengkap
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan kondisi tumpukan sampah, perkiraan volume, atau urgensi pembersihan..."
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Mengirim Laporan...' : 'Kirim Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete Report */}
      <ConfirmModal
        isOpen={!!reportToDelete}
        onClose={() => !isDeleting && setReportToDelete(null)}
        onConfirm={confirmDeleteReport}
        title="Hapus Laporan Sampah?"
        message={`Apakah Anda yakin ingin menghapus laporan "${reportToDelete?.title}"? Data dan file foto terkait akan dihapus secara permanen dari server.`}
        confirmText="Ya, Hapus Laporan"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
