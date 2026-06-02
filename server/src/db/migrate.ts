import { pool } from "./pool";
import fs from "fs";
import path from "path";

// Resolve schema.sql from src/db/ (works both in ts-node and compiled dist/)
const SCHEMA_SQL = [
  path.join(__dirname, "schema.sql"),                        // dist/db/ (compiled)
  path.join(__dirname, "../../src/db/schema.sql"),           // running from dist/, schema is in src/
  path.join(__dirname, "../../../src/db/schema.sql"),
].find((p) => fs.existsSync(p)) ?? path.join(__dirname, "schema.sql");

export async function runMigration() {
  const client = await pool.connect();
  try {
    console.log("🗃️  Running database migration...");
    const sql = fs.readFileSync(SCHEMA_SQL, "utf-8");
    await client.query(sql);
    console.log("✅  Migration complete.");
  } catch (err) {
    console.error("❌  Migration failed:", err);
    throw err;
  } finally {
    client.release();
  }
}

// Allow direct execution: ts-node src/db/migrate.ts
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
