import { USER_ROLE } from "./prisma-enums";

// Daftar permission (di-seed ke PermissionDef). Tambah di sini saat fitur baru.
export const PERMISSIONS = {
  PICKUP_VIEW: { key: "pickup.view", group: "pickup", description: "Lihat jadwal & data pickup" },
  PICKUP_CREATE: { key: "pickup.create", group: "pickup", description: "Buat jadwal pickup" },
  PICKUP_ASSIGN: { key: "pickup.assign", group: "pickup", description: "Assign Ksatria ke jadwal" },
  WASTE_CREATE: { key: "waste_record.create", group: "waste", description: "Input timbangan (Ksatria)" },
  WASTE_CREATE_MANUAL: { key: "waste_record.create_manual", group: "waste", description: "Input timbangan manual (Admin)" },
  HILIR_DELIVERY_CREATE: { key: "hilir.delivery.create", group: "hilir", description: "Catat distribusi hilir" },
  HILIR_REVENUE_VIEW: { key: "hilir.revenue.view", group: "hilir", description: "Lihat revenue/biaya hilir" },
  USER_MANAGE: { key: "user.manage", group: "user", description: "Kelola warga & ksatria" },
  REPORT_ESG_GENERATE: { key: "report.esg.generate", group: "report", description: "Generate laporan ESG" },
  SUBSCRIPTION_MANAGE: { key: "subscription.manage", group: "finance", description: "Kelola iuran & verifikasi pembayaran" },
  CONTENT_MANAGE: { key: "content.manage", group: "content", description: "Kelola konten edukasi & pengumuman" },
  ROLE_MANAGE: { key: "role.manage", group: "admin", description: "Kelola permission/PBAC" },
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]["key"];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
const KEY = (p: { key: string }) => p.key;

// TEMPLATE: izin default per role. Bisa ditimpa per-user lewat UserPermissionOverride.
export const ROLE_TEMPLATE: Record<string, string[]> = {
  [USER_ROLE.SUPER_ADMIN]: ALL_PERMISSIONS.map(KEY),
  [USER_ROLE.ADMIN_KELURAHAN]: [
    PERMISSIONS.PICKUP_VIEW,
    PERMISSIONS.PICKUP_CREATE,
    PERMISSIONS.PICKUP_ASSIGN,
    PERMISSIONS.WASTE_CREATE_MANUAL,
    PERMISSIONS.HILIR_DELIVERY_CREATE,
    PERMISSIONS.HILIR_REVENUE_VIEW,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.REPORT_ESG_GENERATE,
    PERMISSIONS.SUBSCRIPTION_MANAGE,
    PERMISSIONS.CONTENT_MANAGE,
  ].map(KEY),
  [USER_ROLE.ADMIN_RT]: [
    PERMISSIONS.PICKUP_VIEW,
    PERMISSIONS.PICKUP_CREATE,
    PERMISSIONS.WASTE_CREATE_MANUAL,
    PERMISSIONS.SUBSCRIPTION_MANAGE,
  ].map(KEY),
  [USER_ROLE.KSATRIA_BHUMI]: [PERMISSIONS.PICKUP_VIEW, PERMISSIONS.WASTE_CREATE].map(KEY),
  [USER_ROLE.WARGA]: [PERMISSIONS.PICKUP_VIEW].map(KEY),
};
