import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7: konfigurasi CLI (migrate/introspect/seed) di sini.
// `datasource.url` dipakai oleh `prisma migrate dev` — pakai DIRECT_URL
// (koneksi langsung 5432, bukan pooler pgbouncer).
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
