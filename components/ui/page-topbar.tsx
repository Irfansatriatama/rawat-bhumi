import Link from "next/link";
import { Bell } from "lucide-react";

/** Topbar putih sederhana: judul + lonceng notifikasi. */
export function PageTopbar({ title, unread = 0 }: { title: string; unread?: number }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-dark/5 bg-white/90 px-5 py-4 backdrop-blur-lg">
      <h1 className="text-xl font-bold tracking-tight text-brand-dark">{title}</h1>
      <Link href="/akun" className="press relative grid h-10 w-10 place-items-center rounded-full bg-brand-tint">
        <Bell size={18} className="text-brand-dark" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>
    </header>
  );
}
