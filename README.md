# ♻️ Smart Waste Management System (SWMS)

> **Sistem Informasi Pengelolaan Sampah Cerdas Berbasis Kecerdasan Buatan (AI) & Geolokasi Realtime.**  
> Solusi *fullstack* terintegrasi yang menghubungkan partisipasi masyarakat dalam pelaporan timbunan sampah dengan efisiensi petugas dinas kebersihan melalui deteksi citra otomatis bertenaga **MobileNetV2**.

---

## 📑 Daftar Isi
1. [Ringkasan Proyek](#-ringkasan-proyek)
2. [Pemenuhan Komponen & Fitur](#-pemenuhan-komponen--fitur)
3. [Arsitektur Monorepo](#-arsitektur-monorepo)
4. [Prasyarat Sistem](#-prasyarat-sistem)
5. [Panduan Instalasi & Penggunaan](#-panduan-instalasi--penggunaan)
   - [Langkah 1: Konfigurasi Basis Data PostgreSQL & .env](#langkah-1-konfigurasi-basis-data-postgresql---env)
   - [Langkah 2: Setup & Menjalankan Backend](#langkah-2-setup--menjalankan-backend-fastapi)
   - [Langkah 3: Menjalankan Portal Web](#langkah-3-menjalankan-portal-web-react--vite)
   - [Langkah 4: Menjalankan Aplikasi Mobile](#langkah-4-menjalankan-aplikasi-mobile-expo--react-native)
   - [Langkah 5: Pelatihan Ulang Model ML (Opsional)](#langkah-5-pelatihan-ulang-model-machine-learning-opsional)
6. [Akun Demo Pengujian](#-akun-demo-pengujian)
7. [Dokumentasi API & Basis Data](#-dokumentasi-api--basis-data)
8. [Status Berkas Pengumpulan (Poin 1 - 10)](#-status-berkas-pengumpulan-poin-1---10)

---

## 📌 Ringkasan Proyek

Smart Waste Management System dibangun untuk mengatasi permasalahan pengelolaan sampah perkotaan dengan menyediakan platform terpadu:
* **Citizen Mobile App:** Memungkinkan warga memotret timbunan sampah, secara otomatis mengenali jenis sampah menggunakan model AI, mengambil titik koordinat GPS secara akurat, dan memantau status penanganan oleh petugas.
* **Administrator Web Portal:** Memfasilitasi dinas kebersihan untuk memantau sebaran titik sampah di peta geolokasi interaktif, melihat statistik sampah, mengelola status penanganan laporan (Pending, In Progress, Completed, Rejected), serta mengelola hak akses akun.
* **AI Computer Vision Service:** Mengklasifikasikan citra sampah menjadi 3 kategori (**Organic Waste**, **Paper Waste**, **Plastic Waste**) dengan akurasi pengujian mencapai **100.00%**.

---

## 🚀 Pemenuhan Komponen & Fitur

### A. Website Development (React 18 + Vite + Tailwind CSS)
* [x] **Autentikasi Berbasis Peran:** Login & Register membedakan hak akses `ADMIN` dan `USER`.
* [x] **Dashboard Statistik:** Kartu metrik realtime, grafik batang status, grafik donat proporsi kategori, dan peta sebaran geolokasi Leaflet.
* [x] **Manajemen Laporan (CRUD Lengkap):** Buat laporan baru, lihat detail laporan + peta, ubah data/status, serta hapus laporan.
* [x] **Filter & Pencarian Laporan:** Pencarian teks bebas serta filter multi-kriteria (Status, Kategori, dan tombol "Laporan Saya").
* [x] **Manajemen Pengguna (Admin Only):** Kelola daftar warga, ubah peran (Admin/User), aktifasi/nonaktifasi akun, dan reset kata sandi.
* [x] **Pembaruan Status Laporan:** Modal khusus admin untuk mengubah status (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`) disertai catatan penanganan petugas.
* [x] **Desain Responsif:** Tampilan adaptif di perangkat mobile, tablet, dan desktop dengan drawer menu hamburger.

### B. Mobile Application (React Native + Expo SDK)
* [x] **Registrasi & Login:** Layar autentikasi warga dengan penyimpanan sesi JWT di `AsyncStorage`.
* [x] **Dashboard Pengguna:** Menampilkan ringkasan jumlah laporan pribadi, pintasan cepat, dan riwayat laporan terkini.
* [x] **Pembuatan Laporan Terpadu:**
  * **Foto:** Mengambil foto langsung dari Kamera atau memilih dari Galeri (`expo-image-picker`).
  * **Lokasi GPS:** Pengambilan koordinat lintang & bujur realtime serta konversi alamat otomatis (*reverse geocoding*) via `expo-location`.
  * **Deskripsi:** Formulir judul, kategori sampah, dan deskripsi detail.
* [x] **Integrasi AI Otomatis:** Saat foto sampah dipilih, AI otomatis memprediksi kategori sampah dan mengisi pilihan form secara instan.
* [x] **Riwayat & Status Laporan:** Tab riwayat dengan filter status (*Semua, Pending, Diproses, Selesai, Ditolak*) dan modal rincian status penanganan.
* [x] **Integrasi REST API:** Pengiriman data multipart (foto + teks) dan pengambilan data via Axios.

### C. Machine Learning (Python + TensorFlow / Keras)
* [x] **Arsitektur Model:** *Transfer Learning* berbasis **MobileNetV2** (pre-trained ImageNet) yang ringan dan cepat untuk komputasi inferensi.
* [x] **3 Kategori Klasifikasi:** *Organic Waste*, *Plastic Waste*, dan *Paper Waste*.
* [x] **Dataset Nyata:** 750 citra nyata Kaggle Garbage Classification (600 data latih, 150 data uji).
* [x] **Evaluasi Kuantitatif:** Tersedia Classification Report (Precision, Recall, F1-Score) dan Heatmap Confusion Matrix.
* [x] **Target Akurasi Terpenuhi:** Mencapai akurasi pengujian **100.00%** pada 150 data uji (jauh melampaui target minimal 80.00%).
* [x] **REST API Inferensi:** Endpoint `POST /api/predict` berbasis FastAPI yang siap melayani prediksi citra secara realtime.

---

## 📂 Arsitektur Monorepo

```
smart/
├── .env                                  # Konfigurasi Environment Utama (Database, JWT, Ports)
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

---

## 💻 Prasyarat Sistem

Sebelum memulai instalasi, pastikan lingkungan komputer Anda telah terpasang perangkat lunak berikut:
1. **Python:** Versi `3.10` hingga `3.13` ([Unduh Python](https://www.python.org/downloads/))
2. **Node.js:** Versi `18.x` atau yang lebih baru ([Unduh Node.js](https://nodejs.org/))
3. **PostgreSQL:** Versi `14` atau lebih baru (bisa menggunakan PostgreSQL bawaan Laragon, pgAdmin, atau Docker)
4. **Git:** Untuk manajemen version control ([Unduh Git](https://git-scm.com/))
5. **Expo Go (Opsional untuk pengujian di HP):** Pasang aplikasi **Expo Go** melalui Google Play Store atau Apple App Store.

---

## 🛠️ Panduan Instalasi & Penggunaan

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
3. Lakukan inisialisasi tabel dan *seeding* akun demo serta data laporan awal:
   ```bash
   python backend/seed.py
   ```
4. Jalankan server backend FastAPI:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```
5. Akses dokumentasi interaktif di browser:
   * **Swagger UI:** `http://localhost:8000/docs`
   * **ReDoc:** `http://localhost:8000/redoc`

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
3. Jalankan server pengembang (*development server*):
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
   npx expo start
   ```
4. **Cara Menjalankan:**
   * **Di HP Fisik (Expo Go):** Buka aplikasi Expo Go di ponsel Android/iOS yang berada dalam **satu jaringan Wi-Fi yang sama** dengan laptop/PC, lalu pindai (*scan*) QR Code yang muncul di terminal.
   * **Pengaturan Alamat IP Backend di HP:** Di halaman login mobile, klik tombol *"Konfigurasi IP Server"* dan masukkan IP LAN komputer Anda (contoh: `192.168.1.14:8000`).
   * **Di Emulator Android / Web:** Tekan tombol `a` untuk emulator Android atau `w` untuk membuka di web browser.

---

### Langkah 5: Pelatihan Ulang Model Machine Learning (Opsional)

Model biner yang siap pakai sudah tersedia di [`backend/ml/saved_models/waste_classifier.keras`](backend/ml/saved_models/waste_classifier.keras). Jika Anda ingin melatih ulang (*re-train*) model dari awal menggunakan dataset:

```bash
python backend/ml/train.py
```
*Script ini akan memproses 600 data latih dan 150 data uji, menampilkan Classification Report, memperbarui gambar `confusion_matrix.png`, serta menyimpan model terbaru.*

---

## 🔑 Akun Demo Pengujian

Sistem telah dilengkapi dengan akun bawaan (*seeded accounts*) yang dapat langsung Anda gunakan untuk menguji hak akses:

| Peran (Role) | Alamat Email | Kata Sandi | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@smartwaste.local` | `admin123` | Akses penuh: Dashboard analytics, Ubah status laporan (`PENDING` -> `COMPLETED`), Hapus laporan apa pun, Manajemen akun pengguna (`/users`). |
| **Citizen (Warga)** | `budi@smartwaste.local` | `user123` | Akses warga: Buat laporan sampah (Kamera + GPS), deteksi AI, lihat riwayat pribadi, kelola laporan milik sendiri. |

> *Catatan: Anda juga dapat mendaftarkan akun warga baru secara bebas melalui menu **Register** di Website maupun Aplikasi Mobile.*

---

## 📚 Dokumentasi API & Basis Data

* **Dokumentasi API Swagger:** Buka browser ke `http://localhost:8000/docs` saat backend aktif.
* **Diagram Basis Data (ERD):** Diagram relasi tabel visual tersimpan di [`docs/erd_diagram.png`](docs/erd_diagram.png).
* **Dokumentasi Teknis Lengkap:** Tersedia dalam berkas PDF siap kumpul: [`Laporan_Teknis_Smart_Waste.pdf`](Laporan_Teknis_Smart_Waste.pdf) yang merangkum:
  * **Bab 1:** Skema Basis Data & ERD (Poin 5)
  * **Bab 2:** Dokumentasi 14 Endpoint REST API (Poin 4)
  * **Bab 3:** Spesifikasi & Komposisi Dataset Kaggle (Poin 7)
  * **Bab 4:** Arsitektur Model Machine Learning MobileNetV2 (Poin 6)
  * **Bab 5:** Hasil Evaluasi Akurasi 100% & Confusion Matrix (Poin 8)

---

## 📋 Status Berkas Pengumpulan (Poin 1 - 10)

| No | Syarat Pengumpulan | Status di Proyek | Keterangan & Referensi |
| :-: | :--- | :---: | :--- |
| **1** | **GitHub Repository (source code)** | **Siap** | Seluruh source code monorepo terstruktur rapi dan siap di-push ke GitHub. |
| **2** | **Link Demo Website** | **Tersedia** | Berjalan di `http://localhost:5173` (dapat di-deploy ke Vercel/Netlify). |
| **3** | **APK / Link Demo Mobile** | **Tersedia** | Berjalan via Expo Go (`npx expo start`) & siap di-build menjadi file `.apk` via EAS Build. |
| **4** | **Dokumentasi API** | **Lengkap** | Tersedia di Swagger UI `/docs`, ReDoc `/redoc`, dan Bab 2 Dokumen PDF. |
| **5** | **Database Schema / ERD** | **Lengkap** | Skema PostgreSQL, gambar visual [`docs/erd_diagram.png`](docs/erd_diagram.png), dan Bab 1 Dokumen PDF. |
| **6** | **Source Code & Model ML** | **Lengkap** | Script [`backend/ml/train.py`](backend/ml/train.py) & model [`backend/ml/saved_models/waste_classifier.keras`](backend/ml/saved_models/waste_classifier.keras). |
| **7** | **Dataset Beserta Sumbernya** | **Lengkap** | 750 Citra Kaggle Garbage Classification di [`backend/ml/dataset/`](backend/ml/dataset/) dan Bab 3 Dokumen PDF. |
| **8** | **Hasil Evaluasi Model** | **Lengkap** | Akurasi 100.00%, Confusion Matrix, metrics.json, dan Bab 5 Dokumen PDF. |
| **9** | **README Panduan Instalasi** | **Lengkap** | Berkas ini (`README.md`) serta sub-README di folder `backend/`, `web/`, dan `mobile/`. |
| **10**| **Video Demo Maksimal 10 Menit** | **Panduan Siap** | Rundown alur demonstrasi sistem telah tersedia di dalam laporan teknis. |

---

*Dikembangkan dengan dedikasi untuk kebersihan lingkungan dan efisiensi pengelolaan sampah cerdas.*

