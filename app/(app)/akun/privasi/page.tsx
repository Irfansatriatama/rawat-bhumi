import { Lock } from "lucide-react";
import { AppHeader } from "@/components/ui/app-header";
import { LegalDoc, type DocSection } from "@/components/akun/legal-doc";

const SECTIONS: DocSection[] = [
  { title: "Data yang kami kumpulkan", body: "Kami mengumpulkan data akun (nama, email, nomor HP), alamat penjemputan, serta catatan setoran sampah dan poin kamu untuk menjalankan layanan." },
  { title: "Cara kami menggunakan data", body: "Data dipakai untuk menjadwalkan penjemputan, menghitung dampak lingkungan dan poin, serta mengirim notifikasi terkait layanan. Kami tidak menjual data pribadimu." },
  { title: "Berbagi dengan pihak ketiga", body: "Data terbatas dibagikan ke kurir dan mitra hilir hanya sejauh diperlukan untuk penjemputan dan pengolahan sampah, sesuai prinsip kebutuhan minimum." },
  { title: "Keamanan", body: "Password disimpan dalam bentuk terenkripsi dan akses ke data dibatasi berbasis izin. Kamu dapat mengubah password kapan saja di menu Keamanan Akun." },
  { title: "Hak kamu", body: "Kamu berhak mengakses, memperbarui, atau meminta penghapusan data pribadimu dengan menghubungi tim kami melalui menu Hubungi Kami." },
];

export default function PrivasiPage() {
  return (
    <div>
      <AppHeader title="Kebijakan Privasi" subtitle="Bagaimana kami menjaga datamu" icon={Lock} />
      <LegalDoc
        intro="Privasi kamu penting bagi kami. Kebijakan ini menjelaskan data apa yang kami kumpulkan dan bagaimana kami menggunakannya."
        sections={SECTIONS}
        updated="25 Juni 2026"
      />
    </div>
  );
}
