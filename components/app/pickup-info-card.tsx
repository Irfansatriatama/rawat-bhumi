"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin, ClipboardList, AlarmClock, NotebookPen,
  ChevronRight, Pencil, Check, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { Spinner } from "@/components/ui/loading";
import { updatePickupInfo } from "@/app/(app)/pickup/actions";

const field =
  "w-full rounded-xl border border-brand-dark/10 bg-white px-3 py-2.5 text-[13px] text-brand-dark outline-none focus:border-brand-600";

export type PickupInfo = {
  address: string;
  instruction: string;
  note: string;
};

/**
 * Kartu "Informasi Pickup" — view + edit inline (ketuk pensil).
 * Default-nya dari profil/alamat warga; tersimpan ke UserProfile dan
 * tersinkron ke pickup yang sedang berjalan agar terlihat Ksatria.
 */
export function PickupInfoCard({
  info,
  wilayah,
  jadwalLabel,
}: {
  info: PickupInfo;
  wilayah: string;
  jadwalLabel: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [state, setState] = useState<"idle" | "saving">("idle");
  const [form, setForm] = useState(info);

  function startEdit() {
    setForm(info);
    setEditing(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    const res = await updatePickupInfo(form);
    setState("idle");
    if (res.success) {
      setEditing(false);
      router.refresh();
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[12px] font-bold uppercase tracking-wide text-brand-dark">Informasi Pickup</h3>
        {editing ? (
          <button onClick={() => setEditing(false)} className="press text-gray-400" aria-label="Batal">
            <X size={16} />
          </button>
        ) : (
          <button onClick={startEdit} className="press text-brand-600" aria-label="Ubah informasi pickup">
            <Pencil size={16} />
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={save} className="mt-3 space-y-3.5">
          <Field label="Alamat Pickup" icon={MapPin}>
            <textarea
              className={`${field} min-h-16 resize-none`}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Jl. ... No. ..., RT / RW, patokan rumah"
            />
            <p className="mt-1 text-[11px] text-gray-400">{wilayah}</p>
          </Field>

          <Field label="Instruksi Lokasi" icon={ClipboardList}>
            <input
              className={field}
              value={form.instruction}
              onChange={(e) => setForm({ ...form, instruction: e.target.value })}
              placeholder="mis. Depan rumah, pagar hitam"
            />
          </Field>

          <Field label="Catatan untuk Kurir" icon={NotebookPen}>
            <textarea
              className={`${field} min-h-16 resize-none`}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="mis. Sampah di depan pagar sebelah kanan rumah 🙏"
            />
            <p className="mt-1 text-[11px] text-gray-400">Catatan ini dilihat kurir saat penjemputan.</p>
          </Field>

          <button
            type="submit"
            disabled={state === "saving"}
            className="press flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {state === "saving" ? <Spinner size={15} /> : <Check size={15} strokeWidth={3} />}
            {state === "saving" ? "Menyimpan…" : "Simpan informasi"}
          </button>
        </form>
      ) : (
        <>
          <div className="mt-3 flex items-start gap-3">
            <MapPin size={20} className="mt-0.5 shrink-0 text-brand-600" />
            <div>
              <p className="text-sm font-semibold text-brand-dark">Alamat Pickup</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-gray-500">
                {info.address || "Belum diatur — ketuk pensil untuk menambah"}
                <br />
                {wilayah}
              </p>
            </div>
          </div>

          <div className="mt-1 divide-y divide-brand-dark/5 border-t border-brand-dark/5">
            <InfoRow icon={ClipboardList} title="Instruksi Lokasi" value={info.instruction || "Belum diatur"} />
            <InfoRow icon={AlarmClock} title="Jadwal Pickup" value={jadwalLabel} href="/pickup/jadwal" />
            <InfoRow icon={NotebookPen} title="Catatan untuk Kurir" value={info.note || "Belum diatur"} />
          </div>
        </>
      )}
    </Card>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand-dark">
        <Icon size={14} className="text-brand-600" /> {label}
      </label>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, title, value, href }: { icon: LucideIcon; title: string; value: string; href?: string }) {
  const inner = (
    <>
      <Icon size={20} className="shrink-0 text-brand-600" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brand-dark">{title}</p>
        <p className="truncate text-[13px] text-gray-500">{value}</p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-gray-300" />
    </>
  );
  return href ? (
    <Link href={href} className="press flex items-center gap-3 py-3">{inner}</Link>
  ) : (
    <div className="flex items-center gap-3 py-3">{inner}</div>
  );
}
