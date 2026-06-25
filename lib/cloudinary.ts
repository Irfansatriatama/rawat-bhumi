import { v2 as cloudinary } from "cloudinary";

// NOTE: kredensial masih "dummy" di .env sampai akun Cloudinary asli siap.
// Adapter tipis ini menjaga pemanggil tetap stabil saat di-swap nanti.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isDummy = process.env.CLOUDINARY_CLOUD_NAME === "dummy" || !process.env.CLOUDINARY_CLOUD_NAME;

type PickupPhotoType = "before" | "after" | "weight";

export async function uploadPickupPhoto(base64: string, pickupId: string, type: PickupPhotoType) {
  if (isDummy) return `https://dummy.local/rawatbhumi/pickups/${pickupId}/${type}.jpg`;
  const res = await cloudinary.uploader.upload(base64, {
    folder: `rawatbhumi/pickups/${pickupId}`,
    public_id: type,
    transformation: [{ width: 800, quality: "auto" }],
  });
  return res.secure_url;
}

export async function uploadAvatar(base64: string, profileId: string) {
  // Cloudinary belum siap → simpan data URL terkompresi (dari klien) apa adanya.
  // Aman untuk avatar kecil (≈256px), dan langsung bisa dipakai sebagai <img src>.
  if (isDummy) return base64;
  const res = await cloudinary.uploader.upload(base64, {
    folder: `rawatbhumi/avatars`,
    public_id: profileId,
    overwrite: true,
    transformation: [{ width: 256, height: 256, crop: "fill", gravity: "face", quality: "auto" }],
  });
  return res.secure_url;
}

export async function uploadDeliveryReceipt(base64: string, deliveryId: string) {
  if (isDummy) return `https://dummy.local/rawatbhumi/deliveries/${deliveryId}.jpg`;
  const res = await cloudinary.uploader.upload(base64, {
    folder: `rawatbhumi/deliveries`,
    public_id: deliveryId,
    transformation: [{ width: 800, quality: "auto" }],
  });
  return res.secure_url;
}

export { cloudinary };
