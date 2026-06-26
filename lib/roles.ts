import { USER_ROLE } from "./prisma-enums";

// Helper murni (boleh diimpor dari client maupun server) — tanpa next/headers.
export const ADMIN_ROLE_LIST: string[] = [
  USER_ROLE.SUPER_ADMIN,
  USER_ROLE.ADMIN_KELURAHAN,
  USER_ROLE.ADMIN_RT,
];

export function homeForRole(role: string): string {
  if (ADMIN_ROLE_LIST.includes(role)) return "/admin/dashboard";
  if (role === USER_ROLE.KSATRIA_BHUMI) return "/ksatria/beranda";
  return "/beranda";
}
