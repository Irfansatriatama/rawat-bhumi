"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { updateAvatar, removeAvatar } from "@/app/(app)/akun/actions";

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}

export function AvatarUploader({
  initialUrl,
  name,
}: {
  initialUrl: string | null;
  name: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initials = name.split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase() || "?";

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // izinkan pilih file sama lagi
    if (!file) return;
    setError(null);
    setBusy("upload");
    try {
      const compressed = await imageCompression(file, {
        maxWidthOrHeight: 256,
        maxSizeMB: 0.2,
        useWebWorker: true,
        fileType: "image/jpeg",
      });
      const dataUrl = await readAsDataUrl(compressed);
      const res = await updateAvatar({ image: dataUrl });
      if (res.success) {
        setUrl(res.url ?? dataUrl);
        router.refresh();
      } else {
        setError(res.error ?? "Gagal mengunggah");
      }
    } catch {
      setError("Gagal memproses gambar");
    } finally {
      setBusy(null);
    }
  }

  async function onRemove() {
    setError(null);
    setBusy("remove");
    try {
      await removeAvatar();
      setUrl(null);
      router.refresh();
    } catch {
      setError("Gagal menghapus foto");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={name} className="h-24 w-24 rounded-full object-cover ring-4 ring-brand-soft" />
        ) : (
          <span className="grid h-24 w-24 place-items-center rounded-full bg-brand-dark text-2xl font-bold text-white ring-4 ring-brand-soft">
            {initials}
          </span>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy !== null}
          aria-label="Ubah foto profil"
          className="press absolute -bottom-0.5 -right-0.5 grid h-9 w-9 place-items-center rounded-full bg-brand-dark text-white ring-4 ring-white disabled:opacity-60"
        >
          {busy === "upload" ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
        </button>

        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy !== null}
        className="press mt-3 text-sm font-semibold text-brand-600 disabled:opacity-60"
      >
        {url ? "Ganti foto profil" : "Tambah foto profil"}
      </button>

      {url && (
        <button
          type="button"
          onClick={onRemove}
          disabled={busy !== null}
          className="press mt-1 flex items-center gap-1 text-xs font-medium text-brand-red disabled:opacity-60"
        >
          {busy === "remove" ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          Hapus foto
        </button>
      )}

      {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-brand-red">{error}</p>}
    </div>
  );
}
