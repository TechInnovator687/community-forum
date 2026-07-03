import { readFileSync } from "node:fs";
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
