import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"]
  },
  resolve: {
    alias: [
      {
        find: "@community-forum/shared/constants",
        replacement: fileURLToPath(new URL("../shared/src/constants/index.ts", import.meta.url))
      },
      {
        find: /^@community-forum\/shared\/(.*)$/,
        replacement: fileURLToPath(new URL("../shared/src/$1", import.meta.url))
      },
      {
        find: "@community-forum/shared",
        replacement: fileURLToPath(new URL("../shared/src/index.ts", import.meta.url))
      },
      {
        find: /^@\/(.*)$/,
        replacement: fileURLToPath(new URL("./src/$1", import.meta.url))
      }
    ]
  }
});
