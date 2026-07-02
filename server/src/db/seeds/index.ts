import { sql } from "../client";

try {
  console.log("Seed infrastructure ready. No seed data has been defined.");
} finally {
  await sql.end();
}
