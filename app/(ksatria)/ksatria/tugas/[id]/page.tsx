import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft, MapPin, Phone, MessageCircle, Navigation,
  ClipboardList, NotebookPen, CalendarDays, User,
} from "lucide-react";
import { getKsatriaProfile, getTaskDetail } from "@/lib/ksatria";
import { tanggal } from "@/lib/format";
import { Card } from "@/components/ui/primitives";
import { TaskWorkflow } from "@/components/ksatria/task-workflow";

export default async function TugasDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kp = await getKsatriaProfile();
  if (!kp) return <p className="p-4 text-sm text-gray-500">Bukan akun Ksatria.</p>;

  const t = await getTaskDetail(id, kp.id);
  if (!t) notFound();

  const wilayah = `RT ${t.rt} / RW ${t.rw}, Kel. ${t.kelurahan}, ${t.kota}`;
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(t.address)}&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.address)}`;
  const waLink = t.phone ? `https://wa.me/${t.phone.replace(/[^0-9]/g, "").replace(/^0/, "62")}` : null;

  return (
    <div className="space-y-3.5 p-4">
      {/* Kembali */}
      <Link href="/ksatria/tugas" className="press inline-flex items-center gap-1 text-sm font-medium text-brand-dark">
        <ChevronLeft size={18} /> Daftar Tugas
      </Link>

      {/* ===== MAP ===== */}
      <Card className="overflow-hidden p-0">
        <div className="relative h-52 w-full bg-brand-soft">
          <iframe
            title={`Peta ${t.name}`}
            src={mapsEmbed}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="press flex items-center justify-center gap-1.5 border-t border-brand-dark/5 py-3 text-sm font-semibold text-brand-600"
        >
          <Navigation size={15} /> Buka di Google Maps
        </a>
      </Card>

      {/* ===== INFO RUMAH ===== */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-soft">
            <User size={22} className="text-brand-600" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-brand-dark">{t.name}</p>
            <p className="text-xs text-gray-500">Warga · RT {t.rt}</p>
          </div>
        </div>

        <div className="mt-3 space-y-3 border-t border-brand-dark/5 pt-3">
          <Row icon={MapPin} title="Alamat Pickup" value={`${t.address}\n${wilayah}`} />
          <Row icon={CalendarDays} title="Jadwal" value={`${tanggal(t.date)} · ${t.timeSlot} WIB`} />
          {t.instruction && <Row icon={ClipboardList} title="Instruksi Lokasi" value={t.instruction} />}
          {t.notes && <Row icon={NotebookPen} title="Catatan untuk Kurir" value={t.notes} />}
        </div>

        {/* Telepon & Pesan */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {t.phone ? (
            <a href={`tel:${t.phone}`} className="press flex items-center justify-center gap-2 rounded-2xl bg-brand-dark py-3 text-sm font-semibold text-white">
              <Phone size={16} /> Telepon
            </a>
          ) : (
            <span className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-gray-400">
              <Phone size={16} /> Telepon
            </span>
          )}
          {waLink ? (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="press flex items-center justify-center gap-2 rounded-2xl bg-brand-soft py-3 text-sm font-semibold text-brand-600">
              <MessageCircle size={16} /> Kirim Pesan
            </a>
          ) : (
            <span className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-gray-400">
              <MessageCircle size={16} /> Kirim Pesan
            </span>
          )}
        </div>
      </Card>

      {/* ===== STATUS + TIMBANG ===== */}
      <TaskWorkflow
        requestId={t.id}
        initialStatus={t.status}
        completedKg={t.wasteRecord ? t.wasteRecord.totalGrams / 1000 : undefined}
        completedPoints={t.wasteRecord?.pointsEarned}
      />
    </div>
  );
}

function Row({ icon: Icon, title, value }: { icon: typeof MapPin; title: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={18} className="mt-0.5 shrink-0 text-brand-600" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-brand-dark">{title}</p>
        <p className="mt-0.5 whitespace-pre-line text-[13px] leading-relaxed text-gray-500">{value}</p>
      </div>
    </div>
  );
}
