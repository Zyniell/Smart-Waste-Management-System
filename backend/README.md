# ⚙️ Smart Waste Backend & Machine Learning Service

> **Layanan Backend Berperforma Tinggi Berbasis FastAPI, PostgreSQL, SQLAlchemy, dan TensorFlow Keras.**  
> Berfungsi sebagai pusat logika bisnis, otentikasi JWT, manajemen basis data, penyedia endpoint RESTful API, dan service inferensi citra Machine Learning (*AI Waste Classifier*).

---

## 📑 Daftar Isi
1. [Struktur Direktori Backend](#-struktur-direktori-backend)
2. [Prasyarat & Konfigurasi Lingkungan (.env)](#-prasyarat--konfigurasi-lingkungan-env)
3. [Panduan Instalasi & Eksekusi](#-panduan-instalasi--eksekusi)
4. [Inisialisasi & Seeding Database](#-inisialisasi--seeding-database)
5. [Daftar Endpoint REST API](#-daftar-endpoint-rest-api)
6. [Layanan Machine Learning (MobileNetV2)](#-layanan-machine-learning-mobilenetv2)

---

## 📂 Struktur Direktori Backend

```
backend/
├── main.py                     # Entrypoint aplikasi FastAPI & pendaftaran router
├── seed.py                     # Skrip pembuat tabel & pengisian data demo awal
├── requirements.txt            # Daftar pustaka & dependensi Python
│
├── core/                       # Modul Inti Sistem
│   ├── config.py               # Pengaturan sistem Pydantic & pembacaan file .env
│   ├── database.py             # Inisialisasi engine PostgreSQL & sesi SQLAlchemy
│   └── security.py             # Fungsi hashing password (Bcrypt) & pembuatan JWT
│
├── models/                     # Entitas Model Relasional SQLAlchemy
│   ├── user.py                 # Definisi tabel 'users' (Role: ADMIN, USER)
│   └── report.py               # Definisi tabel 'reports' (Status & Kategori)
│
├── routers/                    # Controller / Endpoint API FastAPI
│   ├── auth.py                 # Registrasi, login, dan verifikasi akun (/api/auth)
│   ├── users.py                # Manajemen pengguna khusus Admin (/api/users)
│   ├── reports.py              # CRUD laporan sampah & pembaruan status (/api/reports)
│   ├── stats.py                # Statistik agregasi untuk dashboard (/api/stats)
│   ├── predict.py              # Endpoint inferensi citra AI (/api/predict)
│   └── deps.py                 # Dependency injection untuk validasi token & role
│
├── schemas/                    # Skema Validasi Request & Response (Pydantic v2)
│   ├── user.py                 # Schema payload User (Create, Update, Response)
│   ├── report.py               # Schema payload Report (Create, StatusUpdate)
│   ├── stats.py                # Schema statistik dashboard
│   └── predict.py              # Schema respons prediksi AI
│
└── ml/                         # Sub-sistem Machine Learning
    ├── train.py                # Pipeline pelatihan model & evaluasi testing
    ├── predict_service.py      # Modul pra-pemrosesan citra & inferensi prediksi
    ├── download_real_dataset.py# Skrip pengunduh dataset dari Kaggle
    ├── saved_models/           # Penyimpanan bobot model terlatih (.keras)
    │   └── waste_classifier.keras
    ├── reports/                # Hasil evaluasi model
    │   ├── metrics.json        # Skor akurasi 100%, precision, recall, F1
    │   └── confusion_matrix.png# Gambar visualisasi Confusion Matrix
    └── dataset/                # Kumpulan citra sampah nyata
        ├── train/              # 600 citra latih (200 organic, 200 paper, 200 plastic)
        └── test/               # 150 citra uji (50 organic, 50 paper, 50 plastic)
```

---

## ⚙️ Prasyarat & Konfigurasi Lingkungan (`.env`)

Backend membaca konfigurasi dari berkas `.env` yang berada di root proyek (`../.env` atau `./.env`):

```env
# Koneksi Database PostgreSQL
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/smart_waste_db

# Konfigurasi Keamanan JWT
SECRET_KEY=smartwaste_super_secret_jwt_key_2026_secure
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Direktori Penyimpanan Berkas Foto
UPLOAD_DIR=uploads
```

---

## 🚀 Panduan Instalasi & Eksekusi

### 1. Pasang Dependensi Python
Pastikan Python 3.10+ sudah terpasang, lalu jalankan:
```bash
pip install -r backend/requirements.txt
```

### 2. Inisialisasi Database & Seeding
Jalankan skrip seed untuk membuat tabel basis data secara otomatis sekaligus membuat akun demo dan laporan awal:
```bash
python backend/seed.py
```
*Output yang berhasil akan menampilkan:*
```
[Seed] Creating database tables if not exist...
[Seed] Creating Admin account: admin@smartwaste.local ...
[Seed] Creating Citizen user: budi@smartwaste.local ...
[Seed] Seeding sample reports...
[Seed] Database seeding completed successfully!
```

### 3. Menjalankan Server Backend (FastAPI)
Jalankan server menggunakan server ASGI **Uvicorn**:
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
* Backend berjalan di: `http://localhost:8000`
* Dokumentasi Swagger UI: `http://localhost:8000/docs`
* Dokumentasi ReDoc: `http://localhost:8000/redoc`

---

## 📡 Daftar Endpoint REST API

| Metode | Endpoint URI | Hak Akses | Deskripsi |
| :---: | :--- | :---: | :--- |
| **POST** | `/api/auth/register` | Publik | Registrasi akun warga baru |
| **POST** | `/api/auth/login` | Publik | Autentikasi email & password, mengembalikan token JWT |
| **GET** | `/api/auth/me` | Authenticated | Mengambil data profil pengguna yang sedang login |
| **POST** | `/api/reports` | Authenticated | Membuat laporan sampah baru (upload file foto + lokasi GPS) |
| **GET** | `/api/reports` | Authenticated | Mengambil daftar laporan (filter: `status`, `category`, `search`, `my_only`) |
| **GET** | `/api/reports/{id}` | Authenticated | Mengambil rincian lengkap satu laporan |
| **PATCH**| `/api/reports/{id}/status`| **ADMIN** | Memperbarui status laporan (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`) & catatan petugas |
| **PUT** | `/api/reports/{id}` | Pemilik / Admin | Memperbarui isi informasi laporan |
| **DELETE**| `/api/reports/{id}` | Pemilik / Admin | Menghapus laporan beserta file gambar fisik dari server |
| **GET** | `/api/users` | **ADMIN** | Mengambil seluruh daftar pengguna terdaftar |
| **PUT** | `/api/users/{id}` | **ADMIN** | Mengubah nama, peran (`ADMIN`/`USER`), status aktifasi, atau password |
| **DELETE**| `/api/users/{id}` | **ADMIN** | Menghapus akun pengguna dari database |
| **GET** | `/api/stats/dashboard` | Authenticated | Rekapitulasi jumlah total laporan, sebaran status, dan sebaran kategori |
| **POST** | `/api/predict` | Publik / User | Mengunggah gambar sampah untuk diklasifikasikan oleh model AI MobileNetV2 |

---

## 🧠 Layanan Machine Learning (MobileNetV2)

### 1. Spesifikasi Model
* **Arsitektur:** *Transfer Learning* berbasis **MobileNetV2** (pre-trained ImageNet)
* **Kategori Deteksi:** 
  1. `Organic Waste` (Sampah Organik)
  2. `Paper Waste` (Sampah Kertas / Karton)
  3. `Plastic Waste` (Sampah Plastik)
* **Ukuran Input:** Citra RGB dimensi `224 x 224 x 3` piksel.

### 2. Evaluasi Hasil Pengujian (150 Data Uji)
* **Akurasi Testing:** **100.00%** (Target minimal: 80.00% - **TERPENUHI**)
* **Precision / Recall / F1-Score:** 1.00 untuk seluruh kategori
* **Confusion Matrix:** Tersimpan di [`backend/ml/reports/confusion_matrix.png`](ml/reports/confusion_matrix.png)
* **Metrics Detail:** Tersimpan di [`backend/ml/reports/metrics.json`](ml/reports/metrics.json)

### 3. Melatih Ulang Model
Jika ingin melakukan pelatihan ulang model dari dataset lokal:
```bash
python backend/ml/train.py
```
Skrip ini akan memuat 600 gambar latih, menerapkan *Data Augmentation*, mengeksekusi pelatihan 12 epoch, mengevaluasi 150 gambar uji, dan menyimpan model terbaru ke `backend/ml/saved_models/waste_classifier.keras`.

