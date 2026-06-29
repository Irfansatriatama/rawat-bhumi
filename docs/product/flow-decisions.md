# Keputusan Alur Kanonik — Rawat Bhumi (Pilot RT 14)

Status: **disepakati 2026-06-29**. Dokumen ini jadi **sumber kebenaran alur** saat ada
konflik antara 3 sumber: User Journey resmi (`docs/brand/user-journey.jpg`),
dokumen pilot (user flow v3 + sitemap), dan kode.

**Prinsip:** user flow v3 = kebenaran **MVP**; User Journey resmi = **north-star v2**.
MVP disiplin (ala Apple), hemat biaya API/SMS, fokus komunitas RT + Pak RT.

> **Update 2026-06-29:** diputuskan **semua 5 item dinaikkan ke MVP fungsional** (bukan sekadar
> placeholder) karena akan **dites langsung** — termasuk Sertifikat (generate), Onboarding self-serve,
> dan Founding Member. **OTP pakai dev/test mode** (kode tampil di layar/log, nol biaya, swappable ke
> SMS/WA asli lewat env). Tabel di bawah = rencana awal; status implementasi aktual ada di bagian "Progres".

---

## Ringkasan keputusan

| # | Topik | Keputusan | Target |
|---|-------|-----------|--------|
| 1 | Quality Gate berskor | **BANGUN** (versi lite) di alur konfirmasi pickup | **MVP** |
| 2 | Track / Perjalanan sampah | **PERTAHANKAN** versi data-driven komunitas (bukan tracking per-warga manual) | MVP (sudah ada) |
| 3 | Sertifikat | Generasi = **v1.5**; placeholder/empty-state di Akun = MVP | v1.5 |
| 4 | Onboarding self-serve + Founding Member | **v1.5** (pilot tetap admin-provision); stub murah sekarang | v1.5 |

---

## 1. Quality Gate berskor → BANGUN (MVP, lite)

**Kenapa:** ini fondasi **WSSPR** (North Star) dan jantung **Learning Loop** (moat).
Tanpa skor self-assessment, tak ada leading indicator sebelum verifikasi Ksatria.
Sudah diminta eksplisit ("standar kelayakan pickup").

**Scope MVP (minimal, jangan over-engineer):**
- Di alur **konfirmasi pickup** ([components/app/pickup-hero-actions.tsx](../../components/app/pickup-hero-actions.tsx)):
  sebelum kirim `POST /api/pickup-requests`, tampilkan **checklist radio Belum/Sudah** untuk
  4 kategori (Organik / Anorganik / Residu / B3) → hitung **skor kesiapan otomatis**:
  `≥75% Siap · 50–74% Cukup · <50% Perlu belajar`.
- Nama UI = **"Cek Kesiapan Sampah"** (istilah "Quality Gate" hanya untuk dokumen internal).
- Pickup **tidak pernah ditolak**; skor < standar → tetap jalan + nudge edukasi (Learning Loop).
- Reuse `DailySortLog` (tap kategori di Beranda) sebagai sumber/awalan checklist.
- Simpan skor self-assessment di `PickupRequest` (tambah kolom, mis. `readinessScore Int?`).

**Ditunda ke v1.5:** verifikasi skor oleh Ksatria + skor final gabungan
(perlu kolom skor di `WasteRecord` — saat ini belum ada).

## 2. Track / Perjalanan sampah → PERTAHANKAN (data-driven komunitas)

**Kenapa:** memberi payoff emosional visi resmi ("sampahku jadi apa") **tanpa** beban
operator. Pilot doc dulu menghapus Track karena takut operator burnout update manual per-warga —
tapi implementasi sekarang **diturunkan dari setoran warga + arus hilir komunitas**
([lib/journey.ts](../../lib/journey.ts)), jadi **tidak ada update manual per-warga**. Itu jalan tengah yang benar.

**Aturan:**
- "Perjalanan sampah" tetap **derived/agregat** — jangan pernah jadi status manual per-warga.
- Halaman [/pickup/tracking](../../app/(app)/pickup/tracking/page.tsx): **sederhanakan ke tahap status**
  (Dijadwalkan → Dijemput → Diolah → Bermanfaat). **Tidak** ada peta live ala Gojek
  (sesuai keputusan pilot "tracking realtime tidak perlu").

## 3. Sertifikat → v1.5 (placeholder MVP)

**Kenapa:** artefak emosional + shareable (acquisition loop) + bukti ESG. Tapi hanya terbit
**akhir bulan** → tak memblokir minggu-1 pilot. Data (kg, CO₂) + generator ESG operator
([lib/esg.ts](../../lib/esg.ts)) sudah ada, jadi reuse nanti.

**MVP sekarang:** entry point + empty-state di **Akun → Sertifikat**:
"Sertifikat dampakmu akan terbit akhir bulan pertama." (+ notif saat terbit).
**v1.5:** generate sertifikat per-warga (PDF/image) dari agregat bulanan.

## 4. Onboarding self-serve + Founding Member → v1.5

**Kenapa:** pilot RT 14 **admin-provision** (operator input daftar warga — sesuai UJM operator).
Self-serve butuh **OTP SMS = biaya** + kompleksitas yang tak perlu untuk satu RT.
**Founding Member** baru relevan saat ekspansi ke RT baru.

**MVP sekarang (stub murah):**
- Tetap admin-provision (login email/no-HP yang dibuat operator).
- Tambah **layar "Selamat datang di komunitas"** sesudah login pertama (jadwal pickup, Ketua RT,
  Ksatria, WA operator) — membangun trust, biaya kecil.
- Sediakan **state provisional** di Home (`UserProfile.isProvisional`) sebagai placeholder.

**v1.5:** registrasi mandiri + OTP + pilih paket + tutorial; flow Founding Member + referral +
progress X/50 KK + Aktivasi Wilayah oleh Ketua RT (dipakai saat scaling keluar RT 14).

---

## Catatan scope inversion (dirapikan)

Sudah terlanjur dibangun melebihi pilot doc — **diputuskan dipertahankan**, dianggap aset:
- **Tantangan (Challenge) & Ranking RT** di Komunitas → biarkan (gamifikasi ringan, sudah jalan).
- **AI scanner warga & payment in-app** → **HOLD/low-priority**, route dibiarkan sebagai "place"
  untuk pengembangan nanti (lihat `docs/brand/BRAND.md` §8).

## Progres implementasi (MVP fungsional)

- [x] **Cek Kesiapan Sampah (skor)** — bottom-sheet checklist 4 kategori → skor (≥75/50–74/<50) →
  konfirmasi (`POST /api/pickup-requests` + `PickupRequest.readinessScore`). Nudge edukasi bila < siap.
  ⚠️ **Butuh migrasi DB** (kolom baru) — lihat catatan di bawah.
- [x] **Tracking → tahap status** — hapus peta simulasi/ETA-menit/dot live; ganti status hero jujur.
- [ ] Sertifikat (generate) · [ ] Onboarding self-serve + OTP dev-mode · [ ] Founding Member.

### ⚠️ Migrasi wajib sebelum deploy
Kode `Cek Kesiapan` memakai kolom baru `PickupRequest.readinessScore`. **Jalankan dulu** di mesin lokal:

```
npx prisma migrate dev --name add_readiness_score   # tambahkan --skip-seed bila tak ingin reseed
```

Karena DB Supabase dipakai bersama (lokal & Vercel), kolom langsung tersedia di prod setelah migrasi.
**Push kode setelah migrasi** agar halaman Pickup tidak error di prod.

## Backlog turunan (urutan saran)
1. (MVP) Cek Kesiapan Sampah berskor di konfirmasi pickup + kolom `readinessScore`.
2. (MVP) Sederhanakan halaman tracking ke tahap status; placeholder Sertifikat di Akun.
3. (MVP) Layar "Selamat datang di komunitas" + state provisional Home.
4. (v1.5) Generate Sertifikat bulanan; verifikasi skor Ksatria + skor final.
5. (v1.5) Onboarding self-serve + Founding Member + Aktivasi Wilayah.
