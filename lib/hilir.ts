import { CATEGORY_TO_PARTNER } from "./prisma-enums";

/**
 * Validasi routing 4 jalur hilir: kategori sampah harus cocok dengan tipe partner.
 * Mencegah B3 nyasar ke jalur maggot/cacah/pirolisis.
 */
export function isValidDeliveryRouting(category: string, partnerType: string): boolean {
  return CATEGORY_TO_PARTNER[category] === partnerType;
}

export function assertValidDeliveryRouting(category: string, partnerType: string) {
  if (!isValidDeliveryRouting(category, partnerType)) {
    throw new Response(
      `Routing hilir tidak valid: kategori ${category} tidak boleh ke partner tipe ${partnerType}`,
      { status: 422 }
    );
  }
}
