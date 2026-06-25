import { WasteScanner } from "@/components/app/waste-scanner";

export default function ScannerPage() {
  return (
    <div>
      <header className="bg-brand-dark px-5 pb-6 pt-8 text-white">
        <h1 className="text-xl font-semibold">Scan Sampah</h1>
        <p className="mt-1 text-sm text-white/70">Foto sampahmu, AI bantu kenali kategorinya</p>
      </header>
      <div className="p-5">
        <WasteScanner />
      </div>
    </div>
  );
}
