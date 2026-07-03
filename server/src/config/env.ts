import { resolve } from "node:path";
import { config } from "dotenv";
import { z } from "zod";

// Resolved from the working directory (always `server/`, whether running via
// tsx in dev, the bundled dist/ output, or tests) rather than import.meta.url
// so this keeps working regardless of how deeply nested the running file is.
const rootEnvPath = resolve(process.cwd(), "../.env");

config({ path: rootEnvPath });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SERVER_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url()
});

export const env = envSchema.parse(process.env);
export type ServerEnv = z.infer<typeof envSchema>;
