import "dotenv/config";
import { Client } from "pg";

const emails = ["joko.k@rawatbhumi.id", "siti.w@rawatbhumi.id", "budi.test@rawatbhumi.id"];
const c = new Client({ connectionString: process.env.DIRECT_URL });
await c.connect();
for (const email of emails) {
  const u = await c.query('select id from "user" where email=$1', [email]);
  if (!u.rows.length) continue;
  const uid = u.rows[0].id;
  const p = await c.query('select id from user_profiles where "userId"=$1', [uid]);
  const pid = p.rows[0]?.id;
  if (pid) {
    await c.query('delete from user_permission_overrides where "userId"=$1', [pid]);
    await c.query('delete from ksatria_profiles where "userId"=$1', [pid]);
    await c.query('delete from subscription_payments where "subscriptionId" in (select id from subscriptions where "userId"=$1)', [pid]);
    await c.query('delete from subscriptions where "userId"=$1', [pid]);
    await c.query('delete from point_histories where "userId"=$1', [pid]);
    await c.query('delete from pickup_requests where "userId"=$1', [pid]);
    await c.query('delete from waste_records where "userId"=$1', [pid]);
    await c.query("delete from user_profiles where id=$1", [pid]);
  }
  await c.query('delete from session where "userId"=$1', [uid]);
  await c.query('delete from account where "userId"=$1', [uid]);
  await c.query('delete from "user" where id=$1', [uid]);
  console.log("cleaned", email);
}
await c.end();
