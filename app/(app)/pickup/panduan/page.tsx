import Link from "next/link";
import {
  Package, Trash2, ClipboardCheck, Clock, Check, X, Lightbulb,
  Leaf, Recycle, TriangleAlert, GraduationCap, ChevronRight, CalendarDays,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { PickupHeader } from "@/components/app/pickup-header";

export default function PanduanPickupPage() {
  return (
    <div className="bg-brand-tint">
      <PickupHeader />

      <div className="space-y-3.5 p-4">
        {/* ===== INTRO ===== */}
        <section className="relative overflow-hidden rounded-[26px] p-5 text-white [box-shadow:var(--shadow-soft)] app-header">
          <ClipboardCheck className="pointer-events-none absolute -right-4 -top-3 text-white/10" size={120} strokeWidth={1.1} />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-lime">Panduan Pickup</p>
            <h2 className="mt-2 text-[22px] font-bold leading-tight tracking-tight">Siapkan sampahmu dengan benar</h2>
            <p className="mt-2 text-sm text-white/80">
              Empat langkah singkat agar penjemputan berjalan lancar dan sampahmu terdata akurat.
            </p>
          </div>
        </section>

        {/* ===== LANGKAH RINGKAS (jump links) ===== */}
        <Card className="p-4">
          <div className="grid grid-cols-4 gap-2">
            <Jump href="#kategori" icon={Package} n={1} text="Pilah kategori" />
            <Jump href="#wadah" icon={Trash2} n={2} text="Wadah tertutup" />
            <Jump href="#lokasi" icon={ClipboardCheck} n={3} text="Lokasi mudah" />
            <Jump href="#jadwal" icon={Clock} n={4} text="Sesuai jadwal" />
          </div>
        </Card>

        {/* ===== 1. PILAH KATEGORI ===== */}
        <Step id="kategori" n={1} icon={Package} title="Pisahkan sampah sesuai kategori">
          <p className="text-[13px] leading-relaxed text-gray-600">
            Pemilahan dari rumah adalah kunci. Gunakan empat kategori berikut agar tiap sampah masuk ke jalur olah yang tepat.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <Kategori icon={Leaf} color="text-brand-600" bg="bg-brand-soft" label="Organik" hint="Sisa makanan, daun, kulit buah" />
            <Kategori icon={Recycle} color="text-sky-600" bg="bg-sky-50" label="Anorganik" hint="Plastik, kertas, kaleng, botol" />
            <Kategori icon={Trash2} color="text-slate-500" bg="bg-slate-100" label="Residu" hint="Popok, puntung, styrofoam" />
            <Kategori icon={TriangleAlert} color="text-brand-amber" bg="bg-amber-50" label="B3 & E-Waste" hint="Baterai, lampu, elektronik" />
          </div>
          <Tips items={[
            "Bilas & keringkan wadah bekas makanan/minuman sebelum dipilah.",
            "Pipihkan kardus dan botol agar hemat tempat.",
          ]} />
        </Step>

        {/* ===== 2. WADAH TERTUTUP ===== */}
        <Step id="wadah" n={2} icon={Trash2} title="Gunakan kantong atau wadah tertutup">
          <p className="text-[13px] leading-relaxed text-gray-600">
            Wadah tertutup mencegah bau, lalat, dan sampah tercecer saat dibawa kurir.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2">
            <DoDont ok text="Pakai kantong/ember terpisah per kategori dan ikat rapat." />
            <DoDont ok text="Beri label sederhana bila wadahnya mirip." />
            <DoDont text="Hindari menumpuk sampah basah tanpa penutup." />
            <DoDont text="Jangan campur B3 (baterai/lampu) dengan sampah lain." />
          </div>
        </Step>

        {/* ===== 3. LOKASI MUDAH ===== */}
        <Step id="lokasi" n={3} icon={ClipboardCheck} title="Letakkan di lokasi yang mudah diakses">
          <p className="text-[13px] leading-relaxed text-gray-600">
            Tempatkan sampah di titik yang gampang dijangkau kurir agar penjemputan cepat.
          </p>
          <Tips items={[
            "Taruh di depan rumah/pagar 15 menit sebelum jam pickup.",
            "Pastikan tidak menghalangi jalan atau kendaraan tetangga.",
            "Tambahkan catatan lokasi (mis. \"pagar hitam\") di aplikasi.",
            "Jika rumah kosong, titipkan di titik aman yang sudah disepakati.",
          ]} />
        </Step>

        {/* ===== 4. SESUAI JADWAL ===== */}
        <Step id="jadwal" n={4} icon={Clock} title="Pastikan sesuai jadwal pickup">
          <p className="text-[13px] leading-relaxed text-gray-600">
            Konfirmasi kehadiran agar kurir tahu rumahmu perlu dijemput. Pickup mengikuti jadwal RT-mu.
          </p>
          <Tips items={[
            "Konfirmasi kehadiran sebelum pukul 20.00 di malam sebelum pickup.",
            "Cek jadwal mingguan RT-mu di halaman Jadwal.",
            "Pantau status kurir secara langsung di halaman Tracking.",
          ]} />
          <Link
            href="/pickup/jadwal"
            className="press mt-3 flex items-center justify-center gap-2 rounded-xl bg-brand-dark py-3 text-sm font-semibold text-white"
          >
            <CalendarDays size={16} /> Lihat Jadwal Pickup
          </Link>
        </Step>

        {/* ===== PELAJARI LEBIH LANJUT ===== */}
        <Link href="/belajar" className="press block">
          <Card className="flex items-center gap-3 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft">
              <GraduationCap size={22} className="text-brand-600" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-dark">Pelajari lebih lanjut</p>
              <p className="text-xs text-gray-500">Materi memilah & mengolah sampah di pusat Belajar.</p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-gray-300" />
          </Card>
        </Link>
      </div>
    </div>
  );
}

/* ---------- sub-komponen ---------- */

function Jump({ href, icon: Icon, n, text }: { href: string; icon: LucideIcon; n: number; text: string }) {
  return (
    <Link href={href} className="press flex flex-col items-center text-center">
      <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft">
        <Icon size={24} strokeWidth={1.9} className="text-brand-600" />
        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand-dark text-[10px] font-bold text-white">
          {n}
        </span>
      </span>
      <p className="mt-1.5 text-[10.5px] font-medium leading-tight text-gray-600">{text}</p>
    </Link>
  );
}

function Step({
  id, n, icon: Icon, title, children,
}: {
  id: string; n: number; icon: LucideIcon; title: string; children: React.ReactNode;
}) {
  return (
    <Card id={id} className="scroll-mt-24 p-4">
      <div className="flex items-start gap-3">
        <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft">
          <Icon size={22} strokeWidth={2} className="text-brand-600" />
          <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand-dark text-[10px] font-bold text-white">
            {n}
          </span>
        </span>
        <h3 className="mt-1 flex-1 text-[15px] font-bold leading-tight text-brand-dark">{title}</h3>
      </div>
      <div className="mt-3">{children}</div>
    </Card>
  );
}

function Kategori({ icon: Icon, color, bg, label, hint }: { icon: LucideIcon; color: string; bg: string; label: string; hint: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl bg-brand-tint/60 p-3">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${bg}`}>
        <Icon size={18} strokeWidth={2} className={color} />
      </span>
      <div className="min-w-0">
        <p className={`text-sm font-bold ${color}`}>{label}</p>
        <p className="mt-0.5 text-[11px] leading-tight text-gray-500">{hint}</p>
      </div>
    </div>
  );
}

function DoDont({ ok, text }: { ok?: boolean; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${ok ? "bg-brand-soft text-brand-600" : "bg-red-50 text-brand-red"}`}>
        {ok ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
      </span>
      <p className="text-[13px] leading-relaxed text-gray-600">{text}</p>
    </div>
  );
}

function Tips({ items }: { items: string[] }) {
  return (
    <div className="mt-3 rounded-2xl bg-brand-tint/60 p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-brand-600">
        <Lightbulb size={13} /> Tips
      </p>
      <ul className="mt-2 space-y-1.5">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-2 text-[13px] leading-relaxed text-gray-600">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" /> {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
