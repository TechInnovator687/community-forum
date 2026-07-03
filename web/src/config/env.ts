import { z } from "zod";

const clientEnvSchema = z.object({
  // Not currently read anywhere in the app (no canonical-URL/metadata usage
  // yet), so it's optional rather than a hard requirement on every
  // deployment target.
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(["en", "es"]).default("en")
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE
});
