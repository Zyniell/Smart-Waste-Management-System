import React, { useEffect, useState } from 'react';
import { usersApi } from '../services/api';
import type { User, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { 
  Users as UsersIcon, 
  Search, 
  ShieldCheck, 
  User as UserIcon, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  RefreshCw, 
  Loader2,
  Edit3,
  X,
  AlertCircle
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('USER');
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editPassword, setEditPassword] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Modal State
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll({
        search: search.trim() || undefined,
        role: roleFilter || undefined,
      });
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenEdit = (targetUser: User) => {
    setEditingUser(targetUser);
    setEditName(targetUser.name);
    setEditRole(targetUser.role);
    setEditIsActive(targetUser.is_active);
    setEditPassword('');
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim()) {
      setEditError('Nama lengkap tidak boleh kosong');
      return;
    }

    setEditLoading(true);
    setEditError(null);
    try {
      await usersApi.update(editingUser.id, {
        name: editName.trim(),
        role: editRole,
        is_active: editIsActive,
        password: editPassword.trim() || undefined,
      });
      setEditingUser(null);
      fetchUsers();
      toast.success(`Data pengguna ${editName} berhasil diperbarui!`);
    } catch (err: any) {
      setEditError(err.response?.data?.detail || 'Gagal menyimpan perubahan pengguna.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      toast.warning('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    setUserToDelete(targetUser);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setActionLoadingId(userToDelete.id);
    try {
      await usersApi.delete(userToDelete.id);
      toast.success(`Pengguna ${userToDelete.name} berhasil dihapus.`);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Gagal menghapus pengguna.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Manajemen Pengguna
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola data pengguna terdaftar, hak akses peran (Admin / Citizen), dan status aktifasi akun
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama atau email pengguna..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="">Semua Peran (Role)</option>
            <option value="ADMIN">Administrator</option>
            <option value="USER">Citizen / User</option>
          </select>

          <button
            type="button"
            onClick={() => { setSearch(''); setRoleFilter(''); }}
            title="Reset Filter"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 px-4">
            <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">Tidak ada pengguna ditemukan</h3>
            <p className="text-sm text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-4">Pengguna</th>
                  <th className="px-6 py-4">Peran (Role)</th>
                  <th className="px-6 py-4">Status Akun</th>
                  <th className="px-6 py-4">Tanggal Registrasi</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((targetUser) => {
                  const isSelf = targetUser.id === currentUser?.id;
                  const isBusy = actionLoadingId === targetUser.id;
                  return (
                    <tr key={targetUser.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                            {targetUser.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {targetUser.name}
                              {isSelf && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-normal">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">{targetUser.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {targetUser.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                            <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                            Citizen (User)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {targetUser.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                            <XCircle className="w-3.5 h-3.5" /> Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(targetUser.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* 1. Tombol Edit */}
                          <button
                            onClick={() => handleOpenEdit(targetUser)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-xs font-semibold text-slate-700 transition cursor-pointer"
                            title="Edit Data Pengguna"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                            Edit
                          </button>

                          {/* 2. Tombol Delete */}
                          {!isSelf && (
                            <button
                              disabled={isBusy}
                              onClick={() => handleDeleteUser(targetUser)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                              title="Hapus Pengguna"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Edit3 className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Edit Data Pengguna</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Ubah informasi profil, peran akses, dan status akun pengguna
            </p>

            {editError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Masukkan nama lengkap..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Email (Read Only) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Alamat Email (ID Akun)
                </label>
                <input
                  type="email"
                  disabled
                  value={editingUser.email}
                  className="w-full px-3 py-2.5 border border-slate-200 bg-slate-100 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Role & Status Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Peran (Role) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Peran (Role)
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
                  >
                    <option value="USER">Citizen (User)</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                {/* Status Akun */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Status Akun
                  </label>
                  <select
                    value={editIsActive ? 'true' : 'false'}
                    disabled={editingUser.id === currentUser?.id}
                    onChange={(e) => setEditIsActive(e.target.value === 'true')}
                    className={`w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 bg-white ${
                      editingUser.id === currentUser?.id ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'cursor-pointer'
                    }`}
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Password Baru (Opsional) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Reset Password Baru (Opsional)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {editLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete User */}
      <ConfirmModal
        isOpen={!!userToDelete}
        onClose={() => !actionLoadingId && setUserToDelete(null)}
        onConfirm={confirmDeleteUser}
        title="Hapus Akun Pengguna?"
        message={`Apakah Anda yakin ingin menghapus permanen akun "${userToDelete?.name}" (${userToDelete?.email})? Semua laporan yang pernah dibuat oleh pengguna ini juga akan ikut terhapus.`}
        confirmText="Ya, Hapus Pengguna"
        cancelText="Batal"
        variant="danger"
        isLoading={!!actionLoadingId}
      />
    </div>
  );
};
