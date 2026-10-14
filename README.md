# Rotanami 🌱
**Aplikasi Manajemen Petak Kebun, Riwayat Tanam, Perencana Rotasi Tanaman, dan Kesehatan Tanah**

Rotanami adalah aplikasi berbahasa Indonesia yang dirancang untuk membantu pekebun rumahan, pengelola kebun komunitas, dan petani skala kecil merawat petak tanah, mencatat kronologi budidaya, merencanakan rotasi tanaman berbasis aturan botani, serta memantau hasil uji tanah secara berkala.

> *Catatan:* Nama “Rotanami” adalah nama kerja orisinal untuk proyek ini dan tidak mengklaim merek dagang atau nama komersial pihak ketiga. Desain visual dan identitas dibuat secara orisinal dengan palet warna terinspirasi dari alam, daun, dan tanah.

---

## Daftar Isi
1. [Prinsip Produk & Desain](#prinsip-produk--desain)
2. [Fitur Utama](#fitur-utama)
3. [Logika Mesin Rotasi Tanaman (Rule Engine)](#logika-mesin-rotasi-tanaman-rule-engine)
4. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
5. [Persyaratan Sistem & Variabel Lingkungan](#persyaratan-sistem--variabel-lingkungan)
6. [Panduan Instalasi & Menjalankan Aplikasi](#panduan-instalasi--menjalankan-aplikasi)
7. [Struktur Database & Skema](#struktur-database--skema)
8. [Akun & Data Contoh (Demo Data)](#akun--data-contoh-demo-data)
9. [Batasan & Catatan MVP](#batasan--catatan-mvp)
10. [Widget Trakteer & Kode Sumber Terbuka](#widget-trakteer--kode-sumber-terbuka)
11. [Lisensi & Atribusi](#lisensi--atribusi)

---

## Prinsip Produk & Desain

- **Bahasa Indonesia Baku & Ramah:** Seluruh antarmuka, label, notifikasi toast, dialog konfirmasi, dan panduan disajikan dalam bahasa Indonesia yang mudah dipahami pekebun pemula.
- **Transparansi Agronomi:** Tidak memberikan rekomendasi seolah-olah vonis mutlak. Setiap saran rotasi dilengkapi alasan ilmiah, manfaat pemutus hama, serapan hara, dan batasan data.
- **Kejujuran Data Tanah:** Tidak mengarang angka hasil uji tanah jika belum diisi oleh pengguna. Hasil uji tanah bersifat referensi umum dan tidak menggantikan uji laboratorium resmi.
- **Mobile-First & Responsif:** Antarmuka dioptimalkan untuk ponsel di kebun dengan navigasi bawah (*bottom bar*) yang mudah dijangkau satu tangan serta nyaman diakses pada tablet dan desktop.
- **Pencegahan Kehilangan Data:** Penghapusan petak dilindungi dengan dialog konfirmasi khusus untuk mencegah kehilangan riwayat penanaman secara tidak disengaja.

---

## Fitur Utama

### 1. Dashboard Kebun
- Salam ramah sesuai waktu dan penanda kebun aktif dengan label *"Data contoh"*.
- Metrik ringkas: Total Petak, Petak Sedang Ditanami, Rencana Rotasi Musim Ini, dan Tugas Tertunda.
- Kartu petak dengan status tanaman saat ini, jenis tanah, dan pH terakhir.
- Daftar aktivitas & pengingat tugas dengan centang langsung selesai.
- Tombol aksi cepat: *Tambah Petak*, *Catat Tanaman*, dan *Rencana Rotasi*.

### 2. Kebun & Petak (Plots)
- Buat dan kelola beberapa petak/bedeng (luas, satuan luas, jenis tanah, paparan sinar matahari, catatan).
- Filter status petak: Aktif atau Istirahat (diberakan).
- Halaman detail petak dengan 4 tab:
  - **Ringkasan:** Info fisik, status tanaman aktif, rencana rotasi, dan tindakan cepat.
  - **Riwayat Tanam:** Kronologi tanaman dari yang terbaru, status tanam/panen, jumlah hasil, dan catatan.
  - **Kesehatan Tanah:** Riwayat pengukuran pH, status N-P-K, bahan organik, metode uji, dan grafik tren pH.
  - **Observasi Lapangan:** Rekam temuan hama, gejala penyakit, pertumbuhan, atau cuaca ekstrem beserta tindakan penanganannya.
- Penghapusan petak dilindungi dengan dialog konfirmasi sadar.

### 3. Katalog Tanaman & Botani (Crops Catalog)
- Katalog tanaman pangan lokal (Tomat, Cabai Rawit, Kacang Panjang, Buncis, Pakcoy, Caisim, Mentimun, Jagung Manis, Wortel, Kangkung, Bayam, Bawang Merah, Kemangi, dll.).
- Pencarian *real-time* dan filter berdasarkan keluarga botani, kategori hara (*Pemakan Berat*, *Pemakan Sedang*, *Pemakan Ringan*, *Penyubur Nitrogen*), dan penanda *Tanaman Penutup Tanah*.
- Info lengkap: nama ilmiah, hari hingga panen, jarak tanam, tanaman pendamping baik (*companion*), tanaman yang dihindari (*antagonist*), serta panduan budidaya.
- Formulir penambahan tanaman baru ke katalog pribadi.

### 4. Perencana Rotasi Tanaman (Rotation Planner)
- Pilih petak kebun dan tentukan target musim tanam.
- Analisis otomatis riwayat petak:
  - Rekomendasi Utama dengan badge strategi.
  - Alternatif tanaman lain yang aman ditanam.
  - **Peringatan Tanaman yang Dihindari:** Memberikan tanda bahaya dan alasan ilmiah bila tanaman berasal dari keluarga yang sama atau terdapat riwayat hama/penyakit tanah (seperti layu bakteri pada Solanaceae).
  - Rincian transparansi aturan dan batasan data.
- Formulir penyimpanan rencana rotasi (bisa menerima rekomendasi atau memilih tanaman secara manual).
- Kelola status rencana: Draf, Disetujui, Diterapkan, atau Dibatalkan.

### 5. Jadwal & Pengingat Aktivitas (Calendar & Tasks)
- Daftar agenda kerja kebun: penanaman, pemanenan, pemupukan, uji tanah, dan pemeliharaan.
- Filter tugas: Semua, Belum Selesai, Selesai, dan per kategori.
- Centang langsung tugas selesai.
- Pengingat bersifat agenda internal aplikasi tanpa spam email/push notification eksternal.

### 6. Catatan Kesehatan Tanah & Grafik Tren
- Pemantauan pH tanah terhadap batas ideal sayuran (pH 6.0 - 7.0).
- Grafik interaktif Recharts untuk melihat dinamika pH dari waktu ke waktu.
- Filter per petak kebun.

### 7. Ekspor Data (CSV)
- Ekspor CSV Riwayat Penanaman (kompatibel Excel & Google Sheets dengan UTF-8 BOM).
- Ekspor CSV Hasil Uji Tanah.

---

## Logika Mesin Rotasi Tanaman (Rule Engine)

Modul evaluasi rotasi (`src/lib/rotation-engine.ts`) bekerja secara transparan dengan 5 aturan utama:

1. **Aturan Pemutus Keluarga Botani:**
   Menolak atau memberi penalti berat bagi tanaman dari keluarga botani yang sama secara beruntun (contoh: *Solanaceae* $\rightarrow$ *Solanaceae*) untuk memutus siklus hidup hama spesifik dan patogen tular-tanah.
2. **Siklus 4-Tahap Kebutuhan Hara:**
   - Setelah tanaman **Pemakan Berat** (*Heavy Feeder* seperti Tomat, Terung, Jagung): disarankan tanaman **Penyubur Nitrogen** (*Legum* seperti Kacang Panjang, Buncis) atau tanaman penutup tanah untuk memulihkan cadangan hara.
   - Setelah tanaman **Penyubur Nitrogen**: tanah kaya residu N bintil akar, disarankan tanaman sayuran daun **Pemakan Sedang** (*Brassicaceae* seperti Pakcoy, Caisim) yang rakus menyerap N.
   - Setelah tanaman **Pemakan Sedang**: disarankan tanaman akar/umbi **Pemakan Ringan** (*Apiaceae* seperti Wortel) yang menembus lapisan tanah lebih dalam.
   - Siklus berulang kembali setelah penambahan kompos.
3. **Penyaring Riwayat Observasi Lapangan:**
   Bila tercatat riwayat gejala penyakit tular-tanah (seperti *layu bakteri*, *fusarium*, *kutu kebul*), tanaman inang rentan akan secara otomatis dimasukkan ke daftar tanaman yang harus dihindari selama 2-3 musim.
4. **Pemberian Catatan Petak Perintis:**
   Jika petak belum memiliki riwayat tanaman, sistem menampilkan saran tanaman perintis penyubur tanah dan memberikan opsi pemilihan manual yang fleksibel.

Unit test untuk mesin rotasi tersedia dan dapat dijalankan dengan `npx vitest run`.

---

## Teknologi yang Digunakan

- **Frontend & Server:** Next.js (App Router, React 19, TypeScript).
- **Styling:** Tailwind CSS (skema warna alami `#2D5A27`, `#D97736`, `#FBF9F5`).
- **Database:** PostgreSQL (kompatibel dengan Neon PostgreSQL).
- **ORM & Migrasi:** Drizzle ORM (`drizzle-kit`).
- **Validasi Input:** Zod.
- **Ikon:** Lucide React.
- **Grafik:** Recharts.
- **Pengujian:** Vitest.

---

## Persyaratan Sistem & Variabel Lingkungan

Pastikan Node.js v18+ atau v20+ sudah terpasang.

Salin file `.env.example` ke `.env`:
```bash
cp .env.example .env
```

Isi konfigurasi database:
```env
DATABASE_URL="postgresql://username:password@ep-sample-pooler.region.neon.tech/app_db?sslmode=require"
NODE_ENV="development"
PORT="3000"
```

---

## Panduan Instalasi & Menjalankan Aplikasi

### 1. Pasang Dependensi
```bash
npm install
```

### 2. Terapkan Skema Database ke PostgreSQL / Neon
```bash
npx drizzle-kit push
```

### 3. Isi Data Awal / Data Contoh (Seeding)
```bash
npx tsx src/db/seed.ts
```

### 4. Jalankan Unit Test (Vitest)
```bash
npx vitest run
```

### 5. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser pada: `http://localhost:3000`

### 6. Membangun Versi Produksi
```bash
npm run build
npm run start
```

---

## Struktur Database & Skema

- `users`: Identitas pekebun dan preferensi.
- `farms`: Profil kebun (nama, lokasi, zona waktu, penanda demo).
- `farm_members`: Keanggotaan dan peran pengelola kebun.
- `plots`: Data petak/bedeng (nama, luas, satuan, jenis tanah, paparan sinar, status).
- `plant_families`: Daftar keluarga botani dan kelompok rotasi.
- `crops`: Katalog tanaman lengkap dengan kebutuhan hara, masa panen, tanaman pendamping, dan panduan.
- `seasons`: Musim tanam pada kebun.
- `plantings`: Rekam jejak kronologis penanaman, tanggal tanam/panen, status, dan hasil panen.
- `soil_tests`: Catatan hasil uji tanah per petak (pH, N, P, K, bahan organik, metode uji).
- `observations`: Observasi lapangan (hama, penyakit, pertumbuhan, cuaca).
- `rotation_plans`: Rencana rotasi yang tersimpan beserta justifikasi terstruktur.
- `tasks`: Tugas dan pengingat pemeliharaan kebun.

---

## Akun & Data Contoh (Demo Data)

Secara bawaan, aplikasi dilengkapi data contoh percontohan:
- **Pekebun:** Budi Santoso (`budi.santoso@rotanami.id`)
- **Kebun:** Kebun Mandiri Cipagalo (Data contoh)
- **Petak:** Bedeng A (Solanaceae & Legum), Bedeng B (Sereal & Daun), Bedeng C (Sayur Cepat), Petak D (Pekarangan Depan).
- **Katalog:** 17 varietas tanaman pangan tropis Indonesia lengkap dengan data keluarga botani.

*Catatan:* Anda dapat memuat ulang data contoh atau membuat kebun kosong baru kapan saja melalui menu **Pengaturan**.

---

## Batasan & Catatan MVP

1. **Pengingat:** Pengingat aktivitas beroperasi sebagai agenda di dalam aplikasi (*in-app agenda*) dan tidak mengirim email/SMS/push notification pihak ketiga.
2. **Koneksi Database:** Gunakan connection string Neon PostgreSQL dengan format `sslmode=require` pada production.
3. **Ekspor Dokumen:** Format ekspor yang didukung secara penuh dan teruji adalah format **CSV** dengan standar UTF-8.

---

## Widget Trakteer & Kode Sumber Terbuka

### Widget Trakteer (Dukungan Pengembang)
- Tombol melayang (*floating button*) khas Trakteer di sudut kanan bawah layar dengan tulisan *"Web app ini gratis & bebas iklan. Kopi kecil, server tetap jalan"*.
- Saat diklik, sebuah dialog muncul **tanpa berpindah halaman** berisi:
  - Pilihan nominal traktiran mulai dari **Rp6.000** dan kelipatannya (Rp6.000, Rp12.000, Rp18.000, Rp24.000, Rp36.000, Rp60.000).
  - **Kode QR yang dibuat langsung di dalam aplikasi** (pustaka `qrcode`, tanpa memanggil layanan QR eksternal) yang menunjuk ke [trakteer.id/perpus_opera](https://trakteer.id/perpus_opera/).
  - Tombol *Salin Tautan* dan *Buka Trakteer* sebagai alternatif.
- Traktiran bersifat sukarela, tidak mengunci fitur apa pun, dan aplikasi tidak menyimpan data pembayaran.
- Semua pengaturan widget (tautan tujuan, daftar nominal) berada di satu tempat: `src/components/TrakteerWidget.tsx`.

### Unduh Kode Sumber
- Tombol **"Unduh Source Code (.zip)"** tersedia di dalam dialog Trakteer dan mengunduh berkas `public/rotanami-source.zip`.
- Arsip berisi seluruh kode sumber aplikasi (tanpa `node_modules`, `.git`, `.kilo`, dan `.env`).
- Buat ulang arsip setiap kali ada perubahan kode sebelum deploy:
  ```bash
  npm run pack-source
  ```

---

## Lisensi & Atribusi

Proyek ini diterbitkan sebagai **perangkat lunak open source** dan bebas digunakan, dipelajari, disalin, dan dikembangkan oleh siapa saja.

**Open Source oleh MZF - 2026**

Pengembang: **MZF** (2026) · Rotanami 🌱 — Aplikasi Manajemen Petak Kebun, Riwayat Tanam, Rotasi Tanaman, dan Kesehatan Tanah.

Dukungan pengembangan dapat disalurkan melalui Trakteer: [https://trakteer.id/perpus_opera/](https://trakteer.id/perpus_opera/)

