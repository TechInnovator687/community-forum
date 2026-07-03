import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { z } from "zod";

const rootEnvPath = fileURLToPath(new URL("../../../.env", import.meta.url));

config({ path: rootEnvPath });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SERVER_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url()
});

export const env = envSchema.parse(process.env);
export type ServerEnv = z.infer<typeof envSchema>;
