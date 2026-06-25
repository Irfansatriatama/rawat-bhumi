import { redirect } from "next/navigation";
import { getSession } from "./session";
import { USER_ROLE } from "./prisma-enums";
import { homeForRole, ADMIN_ROLE_LIST } from "./roles";

/** Server-component guard: pastikan login + role termasuk `roles`. */
export async function requireRole(roles: string[]) {
  const session = await getSession();
  if (!session) redirect("/login");
  const role = (session.user as { role?: string }).role ?? USER_ROLE.WARGA;
  if (!roles.includes(role)) redirect(homeForRole(role));
  return { session, role };
}

export { homeForRole, ADMIN_ROLE_LIST };
