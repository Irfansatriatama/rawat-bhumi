import { GoogleGenerativeAI } from "@google/generative-ai";

// NOTE: GEMINI_API_KEY masih "dummy" sampai key asli siap. Saat dummy,
// scanWaste() mengembalikan hasil contoh agar UI tetap bisa dikembangkan.
const isDummy = process.env.GEMINI_API_KEY === "dummy" || !process.env.GEMINI_API_KEY;
const genAI = isDummy ? null : new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type WasteScanResult = {
  kategori: "ORGANIK" | "ANORGANIK" | "RESIDU" | "B3";
  material: string;
  caraPilah: string;
  nilaiEkonomiPerKg: string;
  tipsSimpan: string;
};

export async function scanWaste(imageBase64: string): Promise<WasteScanResult> {
  if (isDummy || !genAI) {
    return {
      kategori: "ANORGANIK",
      material: "Botol plastik PET (contoh — Gemini belum diaktifkan)",
      caraPilah: "Bilas, keringkan, pisahkan dari tutup.",
      nilaiEkonomiPerKg: "Rp 2.000–4.000/kg",
      tipsSimpan: "Remukkan untuk hemat ruang sebelum pickup.",
    };
  }
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Kamu asisten pengelolaan sampah Indonesia. Identifikasi sampah pada gambar.
Jawab HANYA JSON valid dengan field: kategori (ORGANIK|ANORGANIK|RESIDU|B3), material, caraPilah, nilaiEkonomiPerKg, tipsSimpan. Bahasa Indonesia.`;
  const result = await model.generateContent([
    prompt,
    { inlineData: { data: imageBase64, mimeType: "image/jpeg" } },
  ]);
  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text) as WasteScanResult;
}

export async function chatEdukasi(message: string, context?: string): Promise<string> {
  if (isDummy || !genAI) {
    return `Terima kasih atas pertanyaanmu: "${message}". (Mode contoh — Gemini belum diaktifkan.) ` +
      `Tips umum: pisahkan organik, anorganik, residu, dan B3 sejak dari rumah agar mudah diolah ke jalur hilir masing-masing.`;
  }
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Kamu asisten edukasi pengelolaan sampah Rawat Bhumi. Jawab singkat, ramah, Bahasa Indonesia.
${context ? `Konteks materi:\n${context}\n` : ""}Pertanyaan: ${message}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export type EsgData = {
  period: string;
  totalWeightKg: number;
  organikKg: number;
  anorganikKg: number;
  residuKg: number;
  co2ReducedKg: number;
  activeKK: number;
  revenueTotal: number;
};

export async function esgNarrative(d: EsgData): Promise<string> {
  if (isDummy || !genAI) {
    return (
      `Selama periode ${d.period}, ekosistem Rawat Bhumi di RT 14 RW 01 Jagakarsa mengelola ` +
      `${d.totalWeightKg.toFixed(1)} kg sampah terpilah dari ${d.activeKK} KK aktif — ` +
      `${d.organikKg.toFixed(1)} kg organik diolah menjadi maggot BSF & pupuk, ` +
      `${d.anorganikKg.toFixed(1)} kg anorganik dicacah untuk daur ulang. ` +
      `Estimasi emisi yang dicegah ~${d.co2ReducedKg.toFixed(1)} kg CO₂e. ` +
      `Pendapatan sirkular Rp ${d.revenueTotal.toLocaleString("id-ID")} menegaskan model mandiri secara finansial. ` +
      `(Ringkasan contoh — aktifkan Gemini untuk narasi penuh.)`
    );
  }
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const prompt = `Buat paragraf ringkasan eksekutif laporan ESG (Bahasa Indonesia, ~120 kata) untuk Yayasan Astra Honda Motor dari data berikut: ${JSON.stringify(d)}. Tekankan dampak Environmental, Social, Governance.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}
