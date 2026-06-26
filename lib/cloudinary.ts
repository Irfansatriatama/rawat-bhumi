import { v2 as cloudinary, type UploadApiOptions } from "cloudinary";

// Kredensial dari env. Saat masih "dummy" / kosong → mode offline (kembalikan
// URL placeholder atau data URL apa adanya) supaya fitur tetap jalan tanpa Cloudinary.
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

const isDummy = !cloudName || cloudName === "dummy" || !apiKey || !apiSecret;

type PickupPhotoType = "before" | "after" | "weight";

/**
 * Bungkus upload Cloudinary dengan logging error yang jelas.
 * Error asli Cloudinary (mis. "Invalid Signature" = API secret salah) dicatat
 * ke server log supaya bisa didiagnosis, lalu dilempar ulang ke pemanggil.
 */
async function doUpload(base64: string, opts: UploadApiOptions): Promise<string> {
  try {
    const res = await cloudinary.uploader.upload(base64, opts);
    return res.secure_url;
  } catch (e) {
    const err = e as { message?: string; http_code?: number };
    console.error(
      `[cloudinary] upload gagal (cloud=${cloudName}, http=${err.http_code}): ${err.message}` +
        (err.http_code === 401
          ? " — kemungkinan CLOUDINARY_API_SECRET/API_KEY tidak cocok dengan CLOUDINARY_CLOUD_NAME."
          : ""),
    );
    throw e;
  }
}

export async function uploadPickupPhoto(base64: string, pickupId: string, type: PickupPhotoType) {
  if (isDummy) return `https://dummy.local/rawatbhumi/pickups/${pickupId}/${type}.jpg`;
  return doUpload(base64, {
    folder: `rawatbhumi/pickups/${pickupId}`,
    public_id: type,
    transformation: [{ width: 800, quality: "auto" }],
  });
}

export async function uploadAvatar(base64: string, profileId: string) {
  // Mode dummy → simpan data URL terkompresi (dari klien) apa adanya.
  if (isDummy) return base64;
  try {
    return await doUpload(base64, {
      folder: `rawatbhumi/avatars`,
      public_id: profileId,
      overwrite: true,
      transformation: [{ width: 256, height: 256, crop: "fill", gravity: "face", quality: "auto" }],
    });
  } catch {
    // Avatar kecil (≈256px) aman disimpan sebagai data URL → fitur tetap jalan
    // meski Cloudinary bermasalah (kredensial salah / jaringan). Jangan gagalkan UX.
    console.warn("[cloudinary] fallback avatar ke data URL karena upload gagal.");
    return base64;
  }
}

export async function uploadDeliveryReceipt(base64: string, deliveryId: string) {
  if (isDummy) return `https://dummy.local/rawatbhumi/deliveries/${deliveryId}.jpg`;
  return doUpload(base64, {
    folder: `rawatbhumi/deliveries`,
    public_id: deliveryId,
    transformation: [{ width: 800, quality: "auto" }],
  });
}

export { cloudinary };
