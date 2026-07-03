import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const workspaceRoot = fileURLToPath(new URL("../", import.meta.url));
const rootEnvPath = fileURLToPath(new URL("../.env", import.meta.url));
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

loadRootEnv();

const nextConfig: NextConfig = {
  outputFileTracingRoot: workspaceRoot,
  reactStrictMode: true,
  typedRoutes: true,
  transpilePackages: ["@community-forum/shared"]
};

export default withNextIntl(nextConfig);

function loadRootEnv() {
  // The root .env is a local-dev convenience shared across the monorepo and
  // is gitignored, so it never exists on Vercel/Render — those platforms
  // inject real env vars into process.env directly. Skip silently instead
  // of crashing the build when there's nothing to load.
  if (!existsSync(rootEnvPath)) {
    return;
  }

  const entries = readFileSync(rootEnvPath, "utf8")
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  for (const entry of entries) {
    const separatorIndex = entry.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = entry.slice(0, separatorIndex).trim();
    const value = entry.slice(separatorIndex + 1).trim();

    process.env[key] ??= stripQuotes(value);
  }
}

function stripQuotes(value: string) {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
