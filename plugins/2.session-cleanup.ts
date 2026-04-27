import { lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { definePlugin } from "nitro";
import { Pool } from "pg";

import { session } from "../src/integrations/drizzle/schema";

const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000;

async function deleteExpiredSessions(db: ReturnType<typeof drizzle>) {
  try {
    await db.delete(session).where(lt(session.expiresAt, new Date()));
  } catch (error) {
    console.error({ err: error }, "Session cleanup failed");
  }
}

export default definePlugin(async (nitro) => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return;

  const pool = new Pool({ connectionString });
  const db = drizzle({ client: pool });

  await deleteExpiredSessions(db);
  const interval = setInterval(() => {
    void deleteExpiredSessions(db);
  }, CLEANUP_INTERVAL_MS);

  nitro.hooks.hook("close", async () => {
    clearInterval(interval);
    await pool.end();
  });
});
