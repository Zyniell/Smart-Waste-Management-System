# 🌐 Smart Waste Web Management Portal

> **Portal Web Modern Berbasis React 18, TypeScript, Vite, dan Tailwind CSS.**  
> Berfungsi sebagai pusat kontrol bagi **Administrator** untuk mengelola laporan timbunan sampah, memantau sebaran titik sampah pada peta interaktif, dan mengatur akun pengguna, serta portal pelaporan bagi **Warga (Citizen)**.

---

## 📑 Daftar Isi
1. [Fitur Utama Portal Web](#-fitur-utama-portal-web)
2. [Struktur Direktori `web/src/`](#-struktur-direktori-websrc)
3. [Panduan Instalasi & Eksekusi](#-panduan-instalasi--eksekusi)
4. [Sistem Hak Akses & Autentikasi (RBAC)](#-sistem-hak-akses--autentikasi-rbac)
5. [Integrasi API Backend](#-integrasi-api-backend)
6. [Membangun Versi Produksi (Build)](#-membangun-versi-produksi-build)

---

## 🚀 Fitur Utama Portal Web

* **📊 Dashboard Statistik Interaktif:**
  * Kartu metrik total laporan dan jumlah per status (*Pending, In Progress, Selesai, Ditolak*).
  * Visualisasi grafik batang status dan grafik donat proporsi kategori sampah menggunakan pustaka **Recharts**.
  * Peta geolokasi interaktif berbasis **Leaflet** ([`WasteMap.tsx`](src/components/WasteMap.tsx)) yang menampilkan pin lokasi sampah dengan popup detail dan foto.
* **📝 Manajemen Laporan Sampah (CRUD Lengkap):**
  * **Create:** Modal formulir pembuatan laporan baru lengkap dengan unggah foto, preview citra, auto-scan AI, dan penanda lokasi GPS otomatis.
  * **Read:** Tabel laporan responsif dengan rincian foto, pelapor, kategori, status, dan modal detail laporan lengkap.
  * **Update Status (Khusus Admin):** Modal perubahan status penanganan laporan (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`) disertai kolom catatan petugas.
  * **Delete:** Penghapusan laporan dengan modal konfirmasi aman (*ConfirmModal*).
* **🔍 Filter & Pencarian Multikriteria:**
  * Pencarian langsung berdasarkan judul, deskripsi, atau alamat lokasi.
  * Dropdown filter status penanganan dan kategori sampah.
  * Tombol toggle filter *"Laporan Saya"* untuk membatasi tampilan hanya pada laporan milik akun sendiri.
* **👥 Manajemen Pengguna (Khusus Administrator):**
  * Halaman terproteksi di `/users` untuk melihat seluruh akun terdaftar.
  * Pencarian pengguna berdasarkan nama atau email serta filter peran (Admin/User).
  * Modal edit pengguna: mengubah nama, peran (`ADMIN`/`USER`), status aktifasi (aktif/nonaktif), atau mereset password.
  * Penghapusan akun pengguna dari sistem.
* **🤖 Pemindai AI Sampah Mandiri (AI Scanner):**
  * Halaman `/scan` untuk menguji klasifikasi citra sampah secara langsung via drag-and-drop atau upload file.
  * Menampilkan kategori terdeteksi, persentase tingkat keyakinan (*confidence score*), dan tips penanganan daur ulang.

---

## 📂 Struktur Direktori `web/src/`

```
web/src/
├── main.tsx                    # Entrypoint React DOM
├── App.tsx                     # Definisi rute aplikasi & ProtectedRoute
├── App.css / index.css         # Styling global & konfigurasi Tailwind CSS
│
├── pages/                      # Halaman Tampilan Aplikasi
│   ├── Login.tsx               # Layar login & registrasi warga baru
│   ├── Dashboard.tsx           # Dashboard analitik statistik & peta sebaran sampah
│   ├── Reports.tsx             # Manajemen laporan sampah (CRUD, Filter, Update Status)
│   ├── Users.tsx               # Manajemen pengguna khusus Admin (/users)
│   └── AIScanner.tsx           # Halaman pemindai gambar AI mandiri
│
├── components/                 # Komponen UI Modular
│   ├── Navbar.tsx              # Navigasi sticky desktop & mobile drawer menu
│   ├── ProtectedRoute.tsx      # Guard autentikasi & pembatasan hak akses role Admin
│   ├── WasteMap.tsx            # Komponen peta interaktif Leaflet
│   ├── StatusBadge.tsx         # Badge status laporan & kategori dengan warna tematik
│   └── ConfirmModal.tsx        # Modal dialog konfirmasi tindakan penting (misal: hapus)
│
├── context/                    # State Management Global (React Context)
│   ├── AuthContext.tsx         # Manajemen sesi pengguna, token JWT di localStorage, & role
│   └── ToastContext.tsx        # Notifikasi toast popup (sukses, error, warning)
│
├── services/                   # Lapisan Komunikasi Jaringan
│   └── api.ts                  # Axios client terkonfigurasi Bearer Token & endpoint API
│
└── types/                      # Definisi Antarmuka TypeScript
    └── index.ts                # Tipe data Report, User, WasteCategory, ReportStatus, dll.
```

---

## 🛠️ Panduan Instalasi & Eksekusi

### 1. Masuk ke Direktori Web
```bash
cd web
```

### 2. Pasang Dependensi
Pastikan Node.js 18+ sudah terpasang di komputer Anda:
```bash
npm install
```

### 3. Jalankan Development Server
```bash
npm run dev
```
Aplikasi web akan aktif dan dapat diakses di browser melalui alamat:  
👉 **`http://localhost:5173`**

---

## 🔐 Sistem Hak Akses & Autentikasi (RBAC)

Portal web menggunakan sistem keamanan **Role-Based Access Control (RBAC)**:

| Halaman / Fitur | Role `ADMIN` | Role `USER` (Warga) | Tamu (Belum Login) |
| :--- | :---: | :---: | :---: |
| Halaman Login & Register (`/login`) | Tersedia | Tersedia | Tersedia |
| Dashboard Statistik (`/dashboard`) | Akses Penuh | Akses Penuh | Diredirek ke `/login` |
| Buat Laporan Sampah Baru | Bisa | Bisa | Diredirek ke `/login` |
| Ubah Status Laporan (*Pending/Done*) | **Bisa** | Tidak Diizinkan | Tidak Diizinkan |
| Hapus Laporan | Semua Laporan | Laporan Sendiri Saja | Tidak Diizinkan |
| Manajemen Pengguna (`/users`) | **Akses Penuh** | Diredirek ke Dashboard | Diredirek ke `/login` |

### Akun Demo Cepat:
* **Admin:** `admin@smartwaste.local` / `admin123`
* **Warga:** `budi@smartwaste.local` / `user123`

---

## 🔗 Integrasi API Backend

Frontend berkomunikasi dengan backend FastAPI melalui Axios client pada [`src/services/api.ts`](src/services/api.ts):
* **Default Base URL:** `http://localhost:8000/api`
* Token akses JWT disimpan di `localStorage` dengan kunci `smartwaste_token`.
* Setiap permintaan jaringan otomatis menyertakan header:
  ```http
  Authorization: Bearer <TOKEN_JWT>
  ```

---

## 📦 Membangun Versi Produksi (Build)

Untuk mengompilasi kode sumber menjadi berkas statis (*HTML, CSS, JS teroptimasi*) yang siap di-deploy ke Vercel, Netlify, atau web server Nginx:

```bash
npm run build
```
Hasil kompilasi akan tersimpan di direktori `web/dist/`. Untuk menguji hasil build secara lokal:
```bash
npm run preview
```
