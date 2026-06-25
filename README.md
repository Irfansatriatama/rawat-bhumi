# Rawat Bhumi — Platform Digital Sirkular

Monorepo Next.js (App Router) untuk pilot **RT 14 RW 01 Jagakarsa**. Tiga surface via Route Groups: **(admin)** dashboard web, **(app)** PWA warga, **(ksatria)** PWA operator. Siklus penuh: Onboarding → Pickup → Timbang → Hilir 4 jalur → Revenue & ESG. Blueprint lengkap: `rawat-bhumi-it-plan-v2.md` (folder home).

## Stack
Next.js 16 · Prisma 7 (+ `@prisma/adapter-pg`, Supabase) · Better Auth · PBAC · PWA native (Web Push) · Gemini AI · Cloudinary.

> Baca **AGENTS.md** dulu — gotcha Next 16 (`proxy.ts`), Prisma 7 (config + adapter), aturan skema (no enum/FK) + PBAC.

## Setup & jalanin
```bash
npm install
# VAPID & DB sudah dikonfigurasi di .env; DB sudah migrate + seed.
npm run dev                 # http://localhost:3000
# Web Push butuh HTTPS saat dev: npx next dev --experimental-https
```

### Akun
- **Admin**: `admin@rawatbhumi.id` / `AdminRawat#2026` (SUPER_ADMIN) → `/admin/dashboard`
- Warga & Ksatria dibuat lewat **Admin → Warga & Ksatria** (akun + password sementara).

### Scripts
| Script | Fungsi |
|---|---|
| `npm run dev` / `build` | dev / production build |
| `npm run db:migrate` / `db:seed` / `db:studio` | Prisma migrate / seed / studio |
| `node scripts/create-admin.ts` (via tsx) | buat admin |
| `node scripts/reset-data.mjs` | reset data transaksional (sisakan seed + admin) |
| `node scripts/gen-icons.mjs` | regen ikon PWA placeholder |

## Fitur (semua build hijau + smoke test ✅)

**Admin web** (`/admin`)
- Dashboard KPI (KK, sampah/minggu, CO₂, pickup) — angka real dari DB
- Pickup: buat jadwal + assign Ksatria
- Timbangan: input manual → poin & CO₂ otomatis
- Hilir & Revenue: 4 jalur (validasi routing kategori↔partner) + ledger revenue/biaya
- Warga & Ksatria: CRUD + buat akun
- Iuran: generate tagihan, verifikasi tunai (QRIS dummy auto-lunas)
- Konten Edukasi & Pengumuman (CMS)
- Laporan ESG: generate data + narasi Gemini per periode
- Pengaturan PBAC: template role + override per-user (Grant/Deny)

**PWA Warga** (`/beranda`, `/pickup`, `/belajar`, `/komunitas`, `/akun`)
- Beranda ringkasan, jadwal pickup + konfirmasi hadir, riwayat setor
- Belajar + **Scan Sampah (Gemini)**, leaderboard RT + tantangan
- Poin & reward (tukar), iuran & pembayaran (QRIS/tunai), aktifkan Web Push

**PWA Ksatria** (`/ksatria`)
- Tugas hari ini, rute pickup, input timbang per-KK, estimasi penghasilan

**Sistem**
- Auth Better Auth + role via `customSession`; **PBAC** (`requirePermission`)
- Web Push native; notifikasi + push saat pickup selesai
- Cron (Vercel `vercel.json`): reminder pickup, hitung community stats, gaji Ksatria — di-guard `CRON_SECRET`

## Masih DUMMY (adapter siap swap di `.env`)
Cloudinary, Gemini AI, Payment QRIS, Notif WA/SMS. Semua jalan dalam mode dummy.

## Angka bisnis (default, ubah di `lib/business-rules.ts`)
Poin 10/pickup + 1 per 100 g organik · CO₂ (placeholder IPCC) organik 1.0 / anorganik 1.5 · Ksatria Rp 2.000/pickup + Rp 200/kg · Iuran Rp 50.000/KK.

## Yang perlu kamu sediakan untuk produksi
Ikon PWA asli (`public/icons/`), API asli (Cloudinary/Gemini/QRIS/WA), `CRON_SECRET` & `BETTER_AUTH_SECRET` produksi, domain.
