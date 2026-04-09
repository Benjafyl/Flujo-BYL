import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import pg from "pg";

const { Client } = pg;

const target = process.argv[2];
const mode = process.argv[3] ?? "execute";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

if (!target) {
  console.error("Usage: node scripts/run-sql.mjs <sql-file-or-query> [execute|query]");
  process.exit(1);
}

const sql =
  mode === "query"
    ? target
    : readFileSync(resolve(process.cwd(), target), "utf8");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

try {
  await client.connect();
  const result = await client.query(sql);

  if (mode === "query") {
    console.log(JSON.stringify(result.rows, null, 2));
  } else {
    console.log(`SQL executed successfully. Command: ${result.command ?? "MULTI"}`);
  }
} finally {
  await client.end();
}
