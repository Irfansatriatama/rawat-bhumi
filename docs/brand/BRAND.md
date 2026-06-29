# Rawat Bhumi — Brand & Product Reference

Dokumen penghubung antara **aset brand resmi** (folder `GPS_IDENTITAS` / company profile) dan
**pengerjaan aplikasi** di repo ini. Sumber asli: `D:\Download\Rawat-Bhumi`
(file master `.ai` 300 MB & `.tif` tidak di-commit — hanya turunan web di sini).

> Tagline resmi: **"Ubah Pola Pikir, Rawat Bhumi Hingga Hilir"**
> Misi: sistem pengelolaan sampah terintegrasi menuju Zero Waste & masa depan berkelanjutan.

---

## 1. Aset logo (di repo)

| File | Isi | Pakai untuk |
|------|-----|-------------|
| `public/brand/logo-full.png` | Lockup berwarna **+ tagline** | Splash, materi marketing, cover |
| `public/brand/logo-lockup.png` | Lockup berwarna (tanpa tagline) | Header lebar, login |
| `public/brand/logo-white.png` | Lockup **putih** (reverse) | Di atas background gelap/foto |
| `public/brand/emblem.png` | **Emblem kotak** (rosette, transparan) | Avatar, sumber ikon |
| `public/logo-rawat-bhumi.png` | Lockup 760px (dipakai kode header Beranda & Ksatria) | — |
| `public/icons/icon-192/512/512-maskable.png` | Ikon PWA (dari emblem) | `app/manifest.ts` |
| `app/icon.png`, `app/apple-icon.png` | Favicon + apple touch (App Router) | otomatis Next.js |

> Placeholder lama (`favicon.ico` default Next, ikon PWA placeholder, dan `logo-rawat-bhumi.png`
> 434×158 hasil generate) **sudah diganti** dengan aset brand resmi.

**Komponen logo:** `components/brand/logo-mark.tsx` kini memakai **emblem resmi** (`/brand/emblem.png`):
- `LogoMark` — emblem berwarna (untuk latar **terang**, mis. splash/onboarding).
- `LogoTile` — emblem di atas **tile putih membulat** (untuk latar **gelap**, mis. header/login) —
  emblem berwarna kurang kontras langsung di atas teal gelap, jadi dibungkus tile putih (look app-icon).
- `LogoLockup` — emblem + wordmark "Rawat Bhumi".

---

## 2. Palet warna

Token yang sudah dipakai produk ada di `app/globals.css` (`--color-brand*`) dan sudah selaras
dengan logo. Warna emblem resmi (hasil sampling) sebagai acuan:

| Peran | Hex (perkiraan dari logo) | Token CSS terdekat |
|-------|---------------------------|--------------------|
| Hijau lime (pojok kanan-atas) | `#A0CC44` | `--color-brand-lime` |
| Hijau daun | `#329C5A` / `#22B24C` | `--color-brand-600` |
| Teal | `#179D89` | — |
| Teal gelap (header/judul) | `#0F5D4D` | `--color-brand-dark` |
| Teal paling gelap (gradient) | `#0A3F34` | `--color-brand-deep` |
| Wordmark navy-teal | `#0D4A57` | (dekat `brand-dark`) |
| Latar halaman | `#F3F8F4` | `--color-brand-tint` |

Emblem = gradient hijau-lime → teal (diagonal). Wordmark = teal-navy solid.

---

## 3. Nilai & kontak

- **Nilai:** Berkelanjutan · Integritas · Inovasi · Kolaborasi · Peduli.
- **Alamat:** Jl. Raya Jagakarsa No.51A, RT.14/RW.1, Jagakarsa, Jakarta Selatan 12620.
- **Kontak:** +62 21 7888 9990 · halo@rawatbhumi.id · www.rawatbhumi.id

---

## 4. Visi 8 kategori sampah vs 4 kategori pilot

Brand memvisikan **8 kategori** (lihat `program.jpg`). Skema/kode pilot menyederhanakan ke
**4 makro-kategori** (`WASTE_CATEGORY` di `lib/prisma-enums.ts`). Pemetaannya:

| # | Kategori visi (8) | Metode → Hasil | Makro pilot (4) |
|---|-------------------|----------------|-----------------|
| 1 | Organik Basah (sisa makanan, sayur, buah) | Kompos / Maggot → pupuk, protein | **ORGANIK** |
| 2 | Organik Kering (daun, ranting, sekam) | Biomassa pellet → energi | **ORGANIK** |
| 3 | Anorganik Plastik (botol, gelas, kemasan) | Cacah → biji plastik | **ANORGANIK** |
| 4 | Plastik Multilayer (sachet) | Press → triplek daur ulang | **ANORGANIK** |
| 5 | B3 / Limbah Berbahaya (baterai, lampu, cat, obat) | Pengelola berizin | **B3** |
| 6 | Residu Kotor (tisu, popok, styrofoam) | Pirolisis → energi | **RESIDU** |
| 7 | Organik Gula (air nira, molase) | Fermentasi → biofuel | (ORGANIK) |
| 8 | Minyak Jelantah | Transesterifikasi → biodiesel | (ANORGANIK/khusus) |

> Untuk pilot tetap 4 kategori. 8 kategori = roadmap saat ekosistem mitra hilir matang.

---

## 5. Segmen & persona (5)

Selaras dengan `SUBSCRIPTION_PLAN`. Detail di `user-persona.jpg`.

| # | Segmen | Persona | Core value | Pain utama |
|---|--------|---------|-----------|------------|
| 1 | Rumah Tangga | Sari, 34 (IRT, Tangsel) | **Praktis** | Sampah dapur cepat bau, bingung memilah |
| 2 | Ketua RT / Komplek | Budi, 42 (BSD) | **Tertib** | Pengelolaan mahal, sulit koordinasi & lapor |
| 3 | Kafe/Restoran/UMKM | Rina, 38 (Jaksel) | **Konsisten** | Sampah makanan besar, vendor tak konsisten |
| 4 | Pemerintah/Dinas LH | Novi, 51 (kota tier-2) | **Terukur** | TPA overload, tak ada data real-time |
| 5 | ESG/Industri/Korporasi | Dimas, 45 (CSR manager) | **Akuntabel** | Data limbah tak valid, impact sulit diukur |

App memang menyapa **"Hai, Sari!"** sesuai persona utama pilot (Rumah Tangga).
Pilot RT 14 fokus segmen 1–2 (Rumah Tangga + Ketua RT).

---

## 6. Alur program (6 langkah) & user journey (7 fase)

**Program (operasional):** Pemilahan di Sumber → Penjemputan → Penimbangan & Pencatatan →
Pemilahan & Sorting Center → Pengelolaan oleh Mitra → Sertifikasi & Laporan Dampak.

**User journey (aplikasi):** Awareness → Join Community → Participation (memilah) →
Pickup & Weighing → Sorting & Processing → Reward & Impact → Report & Certificate.
(Lihat `user-journey.jpg` — termasuk mockup layar in-app resmi.)

**Pricing penjemputan:** Rp **25.000 – 150.000 / bulan** (sesuai volume & lokasi).

---

## 7. Ekosistem mitra hilir (untuk modul `Partner`/`WasteDelivery`)

Nama mitra contoh dari materi resmi — referensi mengisi data `Partner`:

| Jalur | Mitra contoh |
|-------|--------------|
| Pengelolaan Organik | Maggot Nusantara, Kompos Indonesia |
| Daur Ulang Plastik | Ecoplas, PlasticPay |
| Biomassa & Energi | Bio Energi Nusantara, Biomassa Nusantara |
| Minyak Jelantah & Biofuel | Jjelantahku, BioDiesel Indonesia |
| E-Waste & B3 | E-Waste Connect, Wastec |
| Pirolisis & Energi | PYRO Nusantara, Energy Recovery |
| Sertifikasi & ESG | Mutu International, Climate Partner |

---

## 8. Catatan scope pilot (status terbaru)

- **AI scanner warga** & **payment in-app**: **DI-HOLD** — implementasi belum siap, dibahas terpisah.
  (Kode `app/(app)/belajar/scanner`, `api/gemini/*`, `api/payments/*`, `akun/pembayaran` tetap ada
  tapi belum diaktifkan sebagai jalur pilot.)
- **Sertifikat** & **Track My Waste**: ada di visi brand (journey fase 5–7) namun belum/disederhanakan
  di build pilot — lihat analisis gap.
- AI tetap dipakai di sisi **operator** untuk **laporan ESG bulanan** (`lib/esg.ts`).

---

## 9. Indeks file referensi

- `program.jpg` — infografik program (6 langkah, 8 kategori, pricing, mitra).
- `user-journey.jpg` — 7 fase + mockup layar in-app + ekosistem.
- `user-persona.jpg` — 5 persona + prioritas nilai.
- `matrix-gap.jpg` — matriks GAP vs kompetitor.
- `moodboard.jpg` — arah visual.
- `brand-guideline.pdf` — GSP (Graphic Standard) resmi.
- `company-profile.pdf` — profil perusahaan.
- `product/*.jpg` — foto nyata (Ksatria seragam, timbangan, gerobak, gudang, pilah sampah, reward, ESG, motor) untuk social proof / konten Belajar.
