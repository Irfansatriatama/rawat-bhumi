// Reset data transaksional ke kondisi pristine (sisakan wilayah, partner,
// permission_defs, dan akun admin). Berguna setelah smoke test.
import "dotenv/config";
import { Client } from "pg";

const c = new Client({ connectionString: process.env.DIRECT_URL });
await c.connect();

const txTables = [
  "notifications", "push_subscriptions", "point_histories", "waste_records",
  "pickup_requests", "pickup_schedules", "revenue_entries", "waste_deliveries",
  "subscription_payments", "subscriptions", "ksatria_earnings", "community_stats",
  "esg_reports", "reward_redemptions", "challenge_participations", "user_permission_overrides",
  "ksatria_profiles",
];
for (const t of txTables) await c.query(`DELETE FROM ${t}`);

// Hapus user non-admin (test warga/ksatria) beserta akun Better Auth-nya.
const profs = await c.query("select id, \"userId\" from user_profiles where role <> 'SUPER_ADMIN'");
for (const p of profs.rows) {
  await c.query("delete from user_profiles where id=$1", [p.id]);
  await c.query('delete from session where "userId"=$1', [p.userId]);
  await c.query('delete from account where "userId"=$1', [p.userId]);
  await c.query('delete from "user" where id=$1', [p.userId]);
}
console.log("Reset selesai. Tersisa: wilayah, partner, permission_defs, akun admin.");
await c.end();
