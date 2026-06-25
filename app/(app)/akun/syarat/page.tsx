import { FileText } from "lucide-react";
import { AppHeader } from "@/components/ui/app-header";
import { LegalDoc, type DocSection } from "@/components/akun/legal-doc";

const SECTIONS: DocSection[] = [
  { title: "Penggunaan layanan", body: "Dengan memakai Rawat Bhumi, kamu setuju memilah sampah sesuai kategori (organik, anorganik, residu, B3) dan menyiapkannya pada waktu penjemputan yang dijadwalkan." },
  { title: "Akun", body: "Kamu bertanggung jawab menjaga kerahasiaan akun dan seluruh aktivitas yang terjadi di dalamnya. Beri tahu kami bila ada akses yang tidak sah." },
  { title: "Poin & reward", body: "Poin diberikan atas setoran sampah terverifikasi dan partisipasi tantangan. Poin tidak dapat diuangkan dan dapat disesuaikan bila ditemukan penyalahgunaan." },
  { title: "Iuran & pembayaran", body: "Langganan ditagih sesuai paket yang dipilih. Keterlambatan pembayaran dapat menyebabkan penundaan layanan penjemputan." },
  { title: "Perubahan ketentuan", body: "Kami dapat memperbarui syarat ini dari waktu ke waktu. Perubahan penting akan diberitahukan melalui aplikasi." },
];

export default function SyaratPage() {
  return (
    <div>
      <AppHeader title="Syarat & Ketentuan" subtitle="Aturan penggunaan layanan" icon={FileText} />
      <LegalDoc
        intro="Mohon baca ketentuan berikut sebelum menggunakan layanan Rawat Bhumi."
        sections={SECTIONS}
        updated="25 Juni 2026"
      />
    </div>
  );
}
