import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"]
  },
  resolve: {
    alias: {
      "@server": new URL("./src", import.meta.url).pathname,
      "@community-forum/shared": new URL("../shared/src/index.ts", import.meta.url).pathname
    }
  }
});
