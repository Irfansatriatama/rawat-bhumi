import { HelpCircle, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
import { AppHeader } from "@/components/ui/app-header";
import { Card } from "@/components/ui/primitives";
import { FaqAccordion, type Faq } from "@/components/akun/faq-accordion";

const FAQS: Faq[] = [
  { q: "Bagaimana cara setor sampah?", a: "Pisahkan sampah jadi organik, anorganik, residu, dan B3. Saat jadwal pickup tiba, konfirmasi kehadiran di menu Pickup, lalu letakkan sampah terpilah di titik penjemputan." },
  { q: "Kapan jadwal penjemputan saya?", a: "Jadwal pickup mengikuti RT kamu dan tampil di halaman Beranda serta menu Pickup. Kamu akan dapat notifikasi sebelum kurir datang." },
  { q: "Bagaimana poin dihitung?", a: "Poin didapat dari setiap kilogram sampah terpilah yang berhasil dijemput, plus bonus tantangan komunitas. Poin bisa ditukar di menu Poin & Reward." },
  { q: "Apa itu sampah B3?", a: "B3 adalah Bahan Berbahaya dan Beracun, seperti baterai, lampu, dan elektronik bekas. Jangan dicampur sampah biasa; pisahkan agar ditangani mitra berizin." },
  { q: "Bagaimana cara membayar iuran?", a: "Buka menu Pembayaran & Tagihan di Akun. Kamu bisa melihat tagihan aktif dan riwayat pembayaran langganan." },
];

export default function BantuanPage() {
  return (
    <div>
      <AppHeader title="Pusat Bantuan" subtitle="Pertanyaan yang sering ditanyakan" icon={HelpCircle} />
      <div className="space-y-4 p-5">
        <Card className="px-4 py-1">
          <FaqAccordion items={FAQS} />
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft">
            <MessageCircleQuestion size={22} className="text-brand-600" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-dark">Masih butuh bantuan?</p>
            <p className="text-xs text-gray-500">Tim kami siap membantu kamu.</p>
          </div>
          <Link href="/akun/kontak" className="press rounded-xl bg-brand-dark px-4 py-2.5 text-xs font-semibold text-white">
            Hubungi
          </Link>
        </Card>
      </div>
    </div>
  );
}
