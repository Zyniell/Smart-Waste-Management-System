# ♻️ Smart Waste Management System (SWMS)

> **Sistem Informasi Pengelolaan Sampah Cerdas Berbasis Kecerdasan Buatan (AI) & Geolokasi Realtime.**  
> Solusi _fullstack_ terintegrasi yang menghubungkan partisipasi masyarakat dalam pelaporan timbunan sampah dengan efisiensi petugas dinas kebersihan melalui deteksi citra otomatis bertenaga **MobileNetV2**.

---

## 📑 Daftar Isi

1. [Ringkasan Proyek](#-ringkasan-proyek)
2. [Prasyarat Sistem & Panduan Instalasi](#-prasyarat-sistem--panduan-instalasi)
   - [Prasyarat Sistem](#-prasyarat-sistem)
   - [Langkah 1: Konfigurasi Basis Data PostgreSQL & .env](#langkah-1-konfigurasi-basis-data-postgresql---env)
   - [Langkah 2: Setup & Menjalankan Backend (FastAPI)](#langkah-2-setup--menjalankan-backend-fastapi)
   - [Langkah 3: Menjalankan Portal Web (React + Vite)](#langkah-3-menjalankan-portal-web-react--vite)
   - [Langkah 4: Menjalankan Aplikasi Mobile (Expo / React Native)](#langkah-4-menjalankan-aplikasi-mobile-expo--react-native)
   - [Langkah 5: Pelatihan Ulang Model ML (Opsional)](#langkah-5-pelatihan-ulang-model-machine-learning-opsional)
   - [Akun Demo Pengujian](#-akun-demo-pengujian)
3. [Arsitektur Monorepo](#-arsitektur-monorepo)

---

## 📌 Ringkasan Proyek

Smart Waste Management System dibangun untuk mengatasi permasalahan pengelolaan sampah perkotaan dengan menyediakan platform terpadu:

- **Citizen Mobile App:** Memungkinkan warga memotret timbunan sampah, secara otomatis mengenali jenis sampah menggunakan model AI, mengambil titik koordinat GPS secara akurat, dan memantau status penanganan oleh petugas.
- **Administrator Web Portal:** Memfasilitasi dinas kebersihan untuk memantau sebaran titik sampah di peta geolokasi interaktif, melihat statistik sampah, mengelola status penanganan laporan (Pending, In Progress, Completed, Rejected), serta mengelola hak akses akun.
- **AI Computer Vision Service:** Mengklasifikasikan citra sampah menjadi 3 kategori (**Organic Waste**, **Paper Waste**, **Plastic Waste**) dengan akurasi pengujian mencapai **100.00%**.

---

## 🛠️ Prasyarat Sistem & Panduan Instalasi

### 💻 Prasyarat Sistem

Sebelum memulai instalasi, pastikan lingkungan komputer Anda telah terpasang perangkat lunak berikut:

1. **Python:** Versi `3.10` hingga `3.13` ([Unduh Python](https://www.python.org/downloads/))
2. **Node.js:** Versi `18.x` atau yang lebih baru ([Unduh Node.js](https://nodejs.org/))
3. **PostgreSQL:** Versi `14` atau lebih baru (bisa menggunakan PostgreSQL bawaan Laragon, pgAdmin, atau Docker)
4. **Git:** Untuk manajemen version control ([Unduh Git](https://git-scm.com/))
5. **Expo Go (Opsional untuk pengujian di HP fisik):** Pasang aplikasi **Expo Go** melalui Google Play Store atau Apple App Store.

---

### Langkah 1: Konfigurasi Basis Data PostgreSQL & `.env`

1. Buat database baru di PostgreSQL dengan nama `smart_waste_db`:
   ```sql
   CREATE DATABASE smart_waste_db;
   ```
2. Pastikan file `.env` di direktori root proyek sudah sesuai dengan kredensial PostgreSQL lokal Anda:
   ```env
   DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/smart_waste_db
   SECRET_KEY=smartwaste_super_secret_jwt_key_2026_secure
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   UPLOAD_DIR=uploads
   ```

---

### Langkah 2: Setup & Menjalankan Backend (FastAPI)

1. Buka terminal di folder root `smart/`:
2. Pasang seluruh dependensi Python:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Lakukan inisialisasi tabel dan _seeding_ akun demo serta data laporan awal:
   ```bash
   python backend/seed.py
   ```
4. Jalankan server backend FastAPI:
   ```bash
   python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```
5. Akses dokumentasi interaktif di browser:
   - **Swagger UI:** `http://localhost:8000/docs`
   - **ReDoc:** `http://localhost:8000/redoc`

---

### Langkah 3: Menjalankan Portal Web (React + Vite)

1. Buka terminal baru dan masuk ke folder `web/`:
   ```bash
   cd web
   ```
2. Pasang dependensi JavaScript:
   ```bash
   npm install
   ```
3. Jalankan server pengembang (_development server_):
   ```bash
   npm run dev
   ```
4. Buka browser pada alamat: **`http://localhost:5173`**

---

### Langkah 4: Menjalankan Aplikasi Mobile (Expo / React Native)

1. Buka terminal baru dan masuk ke folder `mobile/`:
   ```bash
   cd mobile
   ```
2. Pasang dependensi seluler:
   ```bash
   npm install
   ```
3. Jalankan Expo bundler:
   ```bash
   npx expo start --tunnel
   ```

> [!IMPORTANT]
> **Wajib Dilakukan Agar HP Fisik Terhubung Lancar ke Laptop/PC (Tidak Terblokir):**
> 1. **Ubah Wi-Fi Laptop/PC ke "Private Network" (Bukan Public):**
>    * Buka **Settings (Pengaturan Windows)** > **Network & internet** > **Wi-Fi** > Klik nama Wi-Fi yang sedang aktif.
>    * Pada bagian *Network profile type*, pilih **Private network**.
> 2. **Matikan Sementara Windows Firewall:**
>    * Buka **Windows Security** > **Firewall & network protection** > Klik **Private network**.
>    * Ubah opsi **Microsoft Defender Firewall** menjadi **Off (Nonaktif)** selama pengujian, agar sistem Windows tidak memblokir akses port `8000` (FastAPI) dan port `8081` (Expo) dari HP Anda.

4. **Cara Menjalankan:**
   - **Di HP Fisik (Expo Go):** Buka aplikasi Expo Go di ponsel Android/iOS yang berada dalam **satu jaringan Wi-Fi yang sama** dengan laptop/PC, lalu pindai (_scan_) QR Code yang muncul di terminal.
   - **Pengaturan Alamat IP Backend di HP:** Di halaman login mobile, klik tombol _"Konfigurasi IP Server"_ dan masukkan IP LAN komputer Anda (contoh: `192.168.1.14:8000`).
   - **Di Emulator Android / Web:** Tekan tombol `a` untuk emulator Android atau `w` untuk membuka di web browser.

---

### Langkah 5: Pelatihan Ulang Model Machine Learning (Opsional)

Model biner yang siap pakai sudah tersedia di [`backend/ml/saved_models/waste_classifier.keras`](backend/ml/saved_models/waste_classifier.keras). Jika Anda ingin melatih ulang (_re-train_) model dari awal menggunakan dataset:

```bash
python backend/ml/train.py
```

_Script ini akan memproses 600 data latih dan 150 data uji, menampilkan Classification Report, memperbarui gambar `confusion_matrix.png`, serta menyimpan model terbaru._

---

### 🔑 Akun Demo Pengujian

Sistem telah dilengkapi dengan akun bawaan (_seeded accounts_) yang dapat langsung Anda gunakan untuk menguji hak akses:

| Peran (Role)        | Alamat Email             | Kata Sandi | Hak Akses Utama                                                                                                                              |
| :------------------ | :----------------------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| **Administrator**   | `admin@smartwaste.local` | `admin123` | Akses penuh: Dashboard analytics, Ubah status laporan (`PENDING` -> `COMPLETED`), Hapus laporan apa pun, Manajemen akun pengguna (`/users`). |
| **Citizen (Warga)** | `budi@smartwaste.local`  | `user123`  | Akses warga: Buat laporan sampah (Kamera + GPS), deteksi AI, lihat riwayat pribadi, kelola laporan milik sendiri.                            |

> _Catatan: Anda juga dapat mendaftarkan akun warga baru secara bebas melalui menu **Register** di Website maupun Aplikasi Mobile._

---

## 📂 Arsitektur Monorepo

```
smart/
├── .env                                  # Konfigurasi Environment Utama (Database, JWT, Ports)
├── .env.example                          # Template konfigurasi environment publik
├── .gitignore                            # Filter pengecualian file raksasa & rahasia
├── README.md                             # Dokumentasi Utama Sistem (Berkas Ini)
├── Laporan_Teknis_Smart_Waste.pdf        # Dokumen PDF Resmi Pengumpulan (Poin 4 - 8)
│
├── backend/                              # [Service Backend & Machine Learning]
│   ├── main.py                           # Entrypoint aplikasi FastAPI
│   ├── seed.py                           # Database seeder (akun default & laporan sampel)
│   ├── requirements.txt                  # Dependensi Python
│   ├── core/                             # Konfigurasi database & JWT security
│   ├── models/                           # Model tabel SQLAlchemy (User, Report)
│   ├── routers/                          # Endpoint REST API (auth, users, reports, stats, predict)
│   ├── schemas/                          # Skema validasi Pydantic v2
│   └── ml/                               # Modul Machine Learning
│       ├── train.py                      # Script pelatihan model & evaluasi
│       ├── predict_service.py            # Service inferensi citra
│       ├── saved_models/                 # File bobot model terlatih (.keras)
│       ├── reports/                      # metrics.json & confusion_matrix.png
│       └── dataset/                      # 750 citra dataset (train & test)
│
├── web/                                  # [Portal Web Admin & Citizen - React Vite]
│   ├── src/                              # Source code React TypeScript
│   │   ├── pages/                        # Dashboard, Reports CRUD, Users, Login, Scanner
│   │   ├── components/                   # Navbar, ProtectedRoute, WasteMap, StatusBadge
│   │   ├── context/                      # AuthContext, ToastContext
│   │   └── services/api.ts               # Integrasi Axios client
│   └── package.json                      # Dependensi frontend web
│
├── mobile/                               # [Aplikasi Mobile Warga - Expo React Native]
│   ├── src/app/                          # File-based routing Expo Router
│   │   ├── (tabs)/                       # Layar Dashboard, Laporan (Kamera/GPS), Riwayat, Scan
│   │   └── login.tsx                     # Layar Login & Registrasi warga
│   ├── src/services/api.ts               # Integrasi API seluler
│   └── package.json                      # Dependensi Expo
│
├── docs/                                 # [Dokumentasi & Aset Pendukung]
│   ├── erd_diagram.png                   # Diagram relasi tabel database visual (300 DPI)
│   └── Laporan_Teknis_Smart_Waste.pdf    # Salinan berkas PDF teknis
│
└── uploads/                              # Direktori penyimpanan berkas foto laporan di server
```
