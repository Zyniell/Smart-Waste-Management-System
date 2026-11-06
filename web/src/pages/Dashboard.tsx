import React, { useEffect, useState } from 'react';
import { statsApi, reportsApi, getFullImageUrl } from '../services/api';
import type { DashboardStats, Report } from '../types';
import { WasteMap } from '../components/WasteMap';
import { StatusBadge, CategoryBadge } from '../components/StatusBadge';
import { 
  FileText, 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  BarChart3,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  CartesianGrid 
} from 'recharts';
import { Link } from 'react-router-dom';

const CATEGORY_COLORS = ['#10b981', '#06b6d4', '#f59e0b'];

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, reportsData] = await Promise.all([
          statsApi.getDashboard(),
          reportsApi.getAll(),
        ]);
        setStats(statsData);
        setAllReports(reportsData);
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-slate-500">
        Gagal memuat data statistik dashboard.
      </div>
    );
  }

  // Data for charts
  const statusChartData = [
    { name: 'Pending', count: stats.status_counts.pending, fill: '#f59e0b' },
    { name: 'In Progress', count: stats.status_counts.in_progress, fill: '#3b82f6' },
    { name: 'Completed', count: stats.status_counts.completed, fill: '#10b981' },
    { name: 'Rejected', count: stats.status_counts.rejected, fill: '#f43f5e' },
  ];

  const categoryChartData = [
    { name: 'Organik', value: stats.category_counts.organic },
    { name: 'Plastik', value: stats.category_counts.plastic },
    { name: 'Kertas', value: stats.category_counts.paper },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Welcome */}
      <div className="bg-linear-to-r from-emerald-800 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-700/50 text-emerald-200 text-xs font-semibold backdrop-blur-sm mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> Smart Eco Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dashboard Statistik Pengelolaan Sampah
          </h1>
          <p className="mt-2 text-emerald-100 text-sm sm:text-base leading-relaxed">
            Pantau status laporan timbunan sampah masyarakat, sebaran peta geolokasi, dan klasifikasi jenis sampah bertenaga AI secara real-time.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Laporan</span>
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.total_reports}
          </div>
          <div className="mt-1 text-xs text-slate-500">Seluruh laporan masuk</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs bg-linear-to-b from-white to-amber-50/20">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Pending</span>
            <Clock className="w-5 h-5" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-amber-600">
            {stats.status_counts.pending}
          </div>
          <div className="mt-1 text-xs text-amber-700/70">Menunggu tindak lanjut</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-xs bg-linear-to-b from-white to-blue-50/20">
          <div className="flex items-center justify-between text-blue-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Diproses</span>
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-blue-600">
            {stats.status_counts.in_progress}
          </div>
          <div className="mt-1 text-xs text-blue-700/70">Armada sedang bekerja</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs bg-linear-to-b from-white to-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Selesai</span>
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {stats.status_counts.completed}
          </div>
          <div className="mt-1 text-xs text-emerald-700/70">Telah dibersihkan</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs bg-linear-to-b from-white to-rose-50/20">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">Ditolak</span>
            <XCircle className="w-5 h-5" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-rose-600">
            {stats.status_counts.rejected}
          </div>
          <div className="mt-1 text-xs text-rose-700/70">Data tidak valid / batal</div>
        </div>
      </div>

      {/* Interactive Map Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Peta Sebaran Titik Tumpukan Sampah
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Visualisasi interaktif lokasi laporan masyarakat menggunakan OpenStreetMap
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> In Progress</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Selesai</span>
          </div>
        </div>

        <WasteMap reports={allReports} height="420px" />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Distribusi Status Laporan
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-emerald-600" />
            Komposisi Kategori Sampah
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Area Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Tren Laporan per Bulan
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Reports Table & Quick Actions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Laporan Sampah Terbaru</h3>
            <p className="text-xs text-slate-500">Laporan masyarakat yang masuk ke dalam sistem</p>
          </div>
          <Link
            to="/reports"
            className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition"
          >
            Lihat Semua Laporan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/60">
              <tr>
                <th className="px-6 py-3.5">Laporan</th>
                <th className="px-6 py-3.5">Kategori</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Lokasi</th>
                <th className="px-6 py-3.5">Deteksi AI</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recent_reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {report.image_url ? (
                        <img
                          src={getFullImageUrl(report.image_url)}
                          alt={report.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-900 line-clamp-1">{report.title}</div>
                        <div className="text-xs text-slate-400">Oleh {report.user_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <CategoryBadge category={report.category} size="sm" />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={report.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                    {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                  </td>
                  <td className="px-6 py-4">
                    {report.ai_prediction ? (
                      <div className="text-xs">
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {report.ai_prediction}
                        </span>
                        {report.ai_confidence && (
                          <span className="text-slate-400 ml-1.5">
                            {(report.ai_confidence * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/reports?id=${report.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-semibold transition"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
