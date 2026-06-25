import "dotenv/config";
import { Client } from "pg";

const c = new Client({ connectionString: process.env.DIRECT_URL });
await c.connect();
const arg = process.argv[2];
if (!arg) {
  const r = await c.query("select id from rts limit 1");
  process.stdout.write(r.rows[0]?.id ?? "");
} else {
  const r = await c.query('select id from ksatria_profiles where "userId"=$1', [arg]);
  process.stdout.write(r.rows[0]?.id ?? "");
}
await c.end();
